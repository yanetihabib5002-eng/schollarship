import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackups, useCreateBackup, useRestoreBackup } from '../../hooks/useBackup'
import { Download, RotateCcw, Plus, AlertCircle, Loader2, Database, CheckCircle2, X, Clock, HardDrive } from 'lucide-react'

export default function MobileBackup() {
  const { data: backups, isLoading, error } = useBackups()
  const createMutation = useCreateBackup()
  const restoreMutation = useRestoreBackup()
  const [restoreId, setRestoreId] = useState(null)
  const [result, setResult] = useState(null)

  const list = backups || []

  const handleCreate = async () => {
    try {
      const res = await createMutation.mutateAsync()
      setResult({ type: 'create', data: res })
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.error?.message || err.message })
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      const res = await restoreMutation.mutateAsync(restoreId)
      setResult({ type: 'restore', data: res })
      setRestoreId(null)
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.error?.message || err.message })
    }
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sauvegarde</h1>
          <p className="text-xs text-text-muted mt-0.5">{list.length} sauvegarde{list.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleCreate} disabled={createMutation.isPending}
          className="h-10 px-4 flex items-center gap-1.5 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-hover transition-all disabled:opacity-50 shadow-btn">
          {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Sauvegarder
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error.message}</p>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <Database size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">Aucune sauvegarde</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Database size={16} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-text-primary truncate">{b.id}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(b.createdAt)}</span>
                    <span className="flex items-center gap-1"><HardDrive size={10} /> {b.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/api/v1/backup/${b.id}/download`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-bg border border-border rounded-xl text-xs font-medium text-text-primary hover:bg-border transition-all">
                  <Download size={12} /> Télécharger
                </a>
                <button onClick={() => setRestoreId(b.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-100 transition-all">
                  <RotateCcw size={12} /> Restaurer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {restoreId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setRestoreId(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-5"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw size={28} className="text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-2">Restaurer ?</h2>
                <p className="text-sm text-text-muted mb-6">Toutes les données seront remplacées. Action irréversible.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRestoreId(null)} className="flex-1 py-3 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">Annuler</button>
                  <button onClick={handleRestore} disabled={restoreMutation.isPending}
                    className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {restoreMutation.isPending && <Loader2 size={14} className="animate-spin" />} Restaurer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-5"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              {result.type === 'error' ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={28} className="text-danger" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary mb-1">Erreur</h2>
                  <p className="text-sm text-text-muted mb-6">{result.message}</p>
                </div>
              ) : result.type === 'create' ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-success" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary mb-1">Sauvegarde créée</h2>
                  <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left text-sm text-text-muted space-y-1">
                    <p><HardDrive size={14} className="inline mr-1.5" /> Taille : <strong className="text-text-primary">{result.data.size}</strong></p>
                    <p><Database size={14} className="inline mr-1.5" /> Collections : <strong className="text-text-primary">{result.data.collections?.length || 0}</strong></p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-success" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary mb-1">Restauration terminée</h2>
                  <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left text-sm text-text-muted space-y-1">
                    {result.data.restoredCollections?.map((r, i) => (
                      <p key={i}><Database size={14} className="inline mr-1.5" /> {r.collection} : <strong className="text-text-primary">{r.documents}</strong> docs</p>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setResult(null)} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
