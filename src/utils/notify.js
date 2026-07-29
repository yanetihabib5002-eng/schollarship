const { db } = require('../config/firebase');

const MAX_NOTIFICATIONS = 10;

async function createNotification({ title, message, type }) {
  const snap = await db().collection('notifications').get();
  if (snap.size >= MAX_NOTIFICATIONS) return null;

  const now = new Date().toISOString();
  const ref = await db().collection('notifications').add({
    title,
    message,
    type: type || 'info',
    read: false,
    createdAt: now,
    createdBy: 'system',
  });
  return { id: ref.id };
}

module.exports = { createNotification };
