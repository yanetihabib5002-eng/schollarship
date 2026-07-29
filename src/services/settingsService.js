const { db } = require('../config/firebase');
const { NotFoundError } = require('../utils/errors');
const { createAuditLog } = require('../utils/audit');

const COLLECTION = 'settings';
const DOC_ID = 'global';

async function get() {
  const snap = await db().collection(COLLECTION).doc(DOC_ID).get();
  if (!snap.exists) {
    return {
      schoolName: '',
      schoolAddress: '',
      schoolPhone: '',
      schoolEmail: '',
      schoolLogo: '',
      academicYear: '',
      principalName: '',
      principalTitle: '',
    };
  }
  return snap.data();
}

async function update(data, actorId) {
  const ref = db().collection(COLLECTION).doc(DOC_ID);
  const snap = await ref.get();
  const now = new Date().toISOString();

  const payload = {
    ...data,
    updatedAt: now,
    updatedBy: actorId || 'system',
  };

  if (!snap.exists) {
    payload.createdAt = now;
    await ref.set(payload);
  } else {
    await ref.update(payload);
  }

  await createAuditLog({
    action: 'UPDATE_SETTINGS',
    actorId: actorId || 'system',
    actorRole: 'admin',
    targetType: 'settings',
    targetId: DOC_ID,
    details: { updated: Object.keys(data) },
  });

  return { id: DOC_ID, ...payload };
}

module.exports = { get, update };
