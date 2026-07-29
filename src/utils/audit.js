const { db } = require('../config/firebase');

async function createAuditLog({ action, actorId, actorRole, targetType, targetId, details, ipAddress }) {
  try {
    const log = {
      action,
      actorId,
      actorRole,
      targetType,
      targetId,
      details: details || {},
      ipAddress: ipAddress || null,
      timestamp: new Date().toISOString(),
    };
    await db().collection('auditLogs').add(log);
  } catch (error) {
    console.error('[AUDIT] Erreur d\'écriture :', error.message);
  }
}

module.exports = { createAuditLog };
