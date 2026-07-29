const { db } = require('../config/firebase');
const { createAuditLog } = require('../utils/audit');

const BACKUP_COLLECTIONS = [
  'users', 'teachers', 'students', 'classes', 'subjects',
  'coefficients', 'assignments', 'periods', 'grades',
  'reportCards', 'honorRolls', 'settings', 'auditLogs',
];

async function createBackup() {
  const backup = {};

  for (const col of BACKUP_COLLECTIONS) {
    const snap = await db().collection(col).get();
    backup[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `bkp-${timestamp}`;
  const json = JSON.stringify(backup, null, 2);
  const sizeInMB = (Buffer.byteLength(json, 'utf8') / (1024 * 1024)).toFixed(2);

  const ref = db().collection('backups').doc(backupId);
  await ref.set({
    id: backupId,
    data: backup,
    createdAt: new Date().toISOString(),
    size: `${sizeInMB} MB`,
    collections: BACKUP_COLLECTIONS,
  });

  await createAuditLog({
    action: 'CREATE_BACKUP',
    actorId: 'system', actorRole: 'admin',
    targetType: 'backup', targetId: backupId,
    details: { size: `${sizeInMB} MB`, collections: BACKUP_COLLECTIONS.length },
  });

  return {
    backupId,
    fileUrl: `/api/v1/backup/${backupId}/download`,
    size: `${sizeInMB} MB`,
    collections: BACKUP_COLLECTIONS,
    message: 'Sauvegarde terminée avec succès',
  };
}

async function restore(backupId) {
  const snap = await db().collection('backups').doc(backupId).get();
  if (!snap.exists) throw new Error('Sauvegarde introuvable');

  const backup = snap.data().data;
  const restored = [];
  const batchSize = 500;

  for (const [col, docs] of Object.entries(backup)) {
    let count = 0;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db().batch();
      const chunk = docs.slice(i, i + batchSize);
      for (const doc of chunk) {
        const ref = db().collection(col).doc(doc.id);
        batch.set(ref, doc, { merge: true });
        count++;
      }
      await batch.commit();
    }
    restored.push({ collection: col, documents: count });
  }

  await createAuditLog({
    action: 'RESTORE_BACKUP',
    actorId: 'system', actorRole: 'admin',
    targetType: 'backup', targetId: backupId,
    details: { restored },
  });

  return {
    restoredCollections: restored,
    message: 'Restauration terminée. Redémarrez l\'application si des données critiques ont changé.',
  };
}

async function downloadBackup(backupId) {
  const snap = await db().collection('backups').doc(backupId).get();
  if (!snap.exists) throw new Error('Sauvegarde introuvable');
  return { id: backupId, ...snap.data() };
}

async function listBackups() {
  const snap = await db().collection('backups').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => {
    const { data, ...meta } = d.data();
    return { id: d.id, ...meta };
  });
}

module.exports = { createBackup, restore, downloadBackup, listBackups };
