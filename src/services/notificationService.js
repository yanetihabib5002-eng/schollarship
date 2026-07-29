const { db } = require('../config/firebase');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');

const COLLECTION = 'notifications';

const MAX_NOTIFICATIONS = 10;

async function list(query = {}) {
  const { unread } = query;
  let ref = db().collection(COLLECTION).orderBy('createdAt', 'desc').limit(MAX_NOTIFICATIONS);
  const snap = await ref.get();
  const results = [];
  for (const d of snap.docs) {
    const data = d.data();
    if (unread === 'true' && data.read) continue;
    results.push({ id: d.id, ...data });
  }
  return results;
}

async function create({ title, message, type, createdBy }) {
  if (!title || !message) throw new BadRequestError('Titre et message requis');

  const snap = await db().collection(COLLECTION).get();
  if (snap.size >= MAX_NOTIFICATIONS) {
    throw new BadRequestError(
      `Maximum ${MAX_NOTIFICATIONS} notifications atteint. Veuillez en supprimer avant d'en ajouter.`
    );
  }

  const now = new Date().toISOString();
  const doc = { title, message, type: type || 'info', read: false, createdAt: now, createdBy };
  const ref = await db().collection(COLLECTION).add(doc);

  await createAuditLog({
    action: 'CREATE_NOTIFICATION',
    actorId: createdBy,
    actorRole: 'admin',
    targetType: 'notification',
    targetId: ref.id,
    details: { title },
  });

  return { id: ref.id, ...doc };
}

async function markAsRead(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Notification introuvable');
  await db().collection(COLLECTION).doc(id).update({ read: true });
  return { id };
}

async function markAllAsRead() {
  const snap = await db().collection(COLLECTION).where('read', '==', false).get();
  const batch = db().batch();
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
  return { count: snap.size };
}

async function remove(id) {
  const snap = await db().collection(COLLECTION).doc(id).get();
  if (!snap.exists) throw new NotFoundError('Notification introuvable');
  await db().collection(COLLECTION).doc(id).delete();
  return { id };
}

module.exports = { list, create, markAsRead, markAllAsRead, remove, MAX_NOTIFICATIONS };
