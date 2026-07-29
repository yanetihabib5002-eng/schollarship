const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { db } = require('../config/firebase');
const { AuthError, ForbiddenError, ConflictError, NotFoundError } = require('../utils/errors');
const { revokeToken } = require('../middleware/auth');
const { createAuditLog } = require('../utils/audit');
const { sendForgotPasswordEmail } = require('./emailService');

const SALT_ROUNDS = 12;

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, teacherId: user.teacherId || null, email: user.email || null },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, type: 'refresh' },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function login(identifier, password) {
  let userDoc = null;
  let userData = null;

  const usersRef = db().collection('users');
  const emailSnap = await usersRef.where('email', '==', identifier).where('deletedAt', '==', null).limit(1).get();

  if (!emailSnap.empty) {
    const d = emailSnap.docs[0];
    userDoc = d;
    userData = { id: d.id, ...d.data() };
  } else {
    const teachersRef = db().collection('teachers');
    const matSnap = await teachersRef.where('matricule', '==', identifier).where('deletedAt', '==', null).limit(1).get();

    if (!matSnap.empty) {
      const teacher = { id: matSnap.docs[0].id, ...matSnap.docs[0].data() };
      const userSnap = await usersRef.where('teacherId', '==', teacher.id).where('deletedAt', '==', null).limit(1).get();

      if (!userSnap.empty) {
        const d = userSnap.docs[0];
        userDoc = d;
        userData = { id: d.id, ...d.data() };
      }
    }
  }

  if (!userData) {
    throw new AuthError('INVALID_CREDENTIALS', 'Identifiant ou mot de passe incorrect');
  }

  if (userData.isActive === false) {
    throw new ForbiddenError('Compte désactivé. Contactez l\'administrateur.');
  }

  const valid = await verifyPassword(password, userData.passwordHash);
  if (!valid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Identifiant ou mot de passe incorrect');
  }

  const accessToken = generateAccessToken(userData);
  const refreshToken = generateRefreshToken(userData);

  await createAuditLog({
    action: 'LOGIN',
    actorId: userData.id,
    actorRole: userData.role,
    targetType: 'user',
    targetId: userData.id,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
    user: {
      id: userData.id,
      role: userData.role,
      email: userData.email,
      teacherId: userData.teacherId || null,
    },
  };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch {
    throw new AuthError('INVALID_REFRESH_TOKEN', 'Refresh token invalide ou expiré');
  }

  if (payload.type !== 'refresh') {
    throw new AuthError('INVALID_REFRESH_TOKEN', 'Type de token incorrect');
  }

  const snap = await db().collection('users').doc(payload.sub).get();
  if (!snap.exists) {
    throw new AuthError('INVALID_REFRESH_TOKEN', 'Utilisateur introuvable');
  }

  const userData = { id: snap.id, ...snap.data() };
  if (userData.deletedAt || userData.isActive === false) {
    throw new ForbiddenError('Compte désactivé ou supprimé');
  }

  const newAccessToken = generateAccessToken(userData);
  const newRefreshToken = generateRefreshToken(userData);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600,
    user: {
      id: userData.id,
      role: userData.role,
      email: userData.email,
      teacherId: userData.teacherId || null,
    },
  };
}

async function logout(accessToken, refreshToken) {
  revokeToken(accessToken);
  revokeToken(refreshToken);
  return { message: 'Déconnexion réussie' };
}

async function changePassword(userId, oldPassword, newPassword) {
  const snap = await db().collection('users').doc(userId).get();
  if (!snap.exists) {
    throw new AuthError('USER_NOT_FOUND', 'Utilisateur introuvable');
  }

  const userData = { id: snap.id, ...snap.data() };

  const valid = await verifyPassword(oldPassword, userData.passwordHash);
  if (!valid) {
    throw new AuthError('WRONG_PASSWORD', 'Ancien mot de passe incorrect');
  }

  const newHash = await hashPassword(newPassword);
  await db().collection('users').doc(userId).update({
    passwordHash: newHash,
    updatedAt: new Date().toISOString(),
  });

  await createAuditLog({
    action: 'CHANGE_PASSWORD',
    actorId: userId,
    actorRole: userData.role,
    targetType: 'user',
    targetId: userId,
  });

  return { message: 'Mot de passe modifié avec succès' };
}

async function forgotPassword(identifier) {
  let userDoc = null;
  let userData = null;

  const usersRef = db().collection('users');
  const emailSnap = await usersRef.where('email', '==', identifier).where('deletedAt', '==', null).limit(1).get();

  if (!emailSnap.empty) {
    const d = emailSnap.docs[0];
    userDoc = d;
    userData = { id: d.id, ...d.data() };
  } else {
    const teachersRef = db().collection('teachers');
    const matSnap = await teachersRef.where('matricule', '==', identifier).where('deletedAt', '==', null).limit(1).get();

    if (!matSnap.empty) {
      const teacher = { id: matSnap.docs[0].id, ...matSnap.docs[0].data() };
      const userSnap = await usersRef.where('teacherId', '==', teacher.id).where('deletedAt', '==', null).limit(1).get();
      if (!userSnap.empty) {
        const d = userSnap.docs[0];
        userDoc = d;
        userData = { id: d.id, ...d.data() };
      }
    }
  }

  if (!userData) {
    throw new NotFoundError('Aucun compte trouvé avec cet identifiant');
  }

  const tempPassword = Math.random().toString(36).slice(2, 10) + '1A';
  const passwordHash = await hashPassword(tempPassword);
  await userDoc.ref.update({ passwordHash, mustChangePassword: true, updatedAt: new Date().toISOString() });

  let teacherName = null;
  if (userData.teacherId) {
    const teacherSnap = await db().collection('teachers').doc(userData.teacherId).get();
    if (teacherSnap.exists) {
      const t = teacherSnap.data();
      teacherName = `${t.firstName || ''} ${t.lastName || ''}`.trim() || null;
    }
  }

  let emailSent = false;
  if (userData.email) {
    try {
      await sendForgotPasswordEmail(userData.email, tempPassword, teacherName);
      emailSent = true;
    } catch (err) {
      console.error('[EMAIL] Échec envoi mot de passe oublié :', err.message);
    }
  }

  await createAuditLog({
    action: 'FORGOT_PASSWORD',
    actorId: userData.id,
    actorRole: userData.role || 'unknown',
    targetType: 'user',
    targetId: userData.id,
    details: { identifier },
  });

  return {
    id: userData.id,
    role: userData.role,
    email: userData.email || null,
    temporaryPassword: tempPassword,
    emailSent,
    message: emailSent
      ? 'Mot de passe temporaire envoyé par email.'
      : 'Mot de passe réinitialisé. Notez le mot de passe temporaire ci-dessous.',
  };
}

module.exports = { login, refresh, logout, changePassword, hashPassword, generateAccessToken, forgotPassword };
