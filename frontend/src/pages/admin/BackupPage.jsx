import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackups, useCreateBackup, useRestoreBackup } from '../../hooks/useBackup'
import { Download, RotateCcw, Plus, AlertCircle, Loader2, Database, CheckCircle2, X, Clock, HardDrive } from 'lucide-react'

export default function BackupPage() {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Sauvegarde</h1>
          <p className="text-sm text-text-muted mt-1">{list.length} sauvegarde{list.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleCreate} disabled={createMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-btn active:scale-[0.98] disabled:opacity-50">
          {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Effectuer une sauvegarde
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 text-danger rounded-2xl p-5">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm opacity-80">{error.message}</p>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20">
          <Database size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">Aucune sauvegarde pour le moment</p>
          <button onClick={handleCreate} disabled={createMutation.isPending}
            className="mt-4 text-primary text-sm font-medium hover:underline">
            Créer une sauvegarde
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-4 lg:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Database size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{b.id}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(b.createdAt)}</span>
                      <span className="flex items-center gap-1"><HardDrive size={12} /> {b.size}</span>
                      <span>{b.collections?.length || 0} collections</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/api/v1/backup/${b.id}/download`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-bg border border-border rounded-xl text-xs font-medium text-text-primary hover:bg-border transition-all">
                    <Download size={14} /> Télécharger
                  </a>
                  <button onClick={() => setRestoreId(b.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-100 transition-all">
                    <RotateCcw size={14} /> Restaurer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {restoreId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setRestoreId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <RotateCcw size={28} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">Restaurer cette sauvegarde ?</h2>
              <p className="text-sm text-text-muted mb-6">Toutes les données actuelles seront remplacées par celles de la sauvegarde. Cette action est irréversible.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setRestoreId(null)} className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">Annuler</button>
                <button onClick={handleRestore} disabled={restoreMutation.isPending}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {restoreMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Restaurer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
            >
              {result.type === 'error' ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={28} className="text-danger" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary mb-1">Erreur</h2>
                  <p className="text-sm text-text-muted mb-5">{result.message}</p>
                </>
              ) : result.type === 'create' ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-success" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary mb-1">Sauvegarde créée</h2>
                  <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left text-sm text-text-muted space-y-1">
                    <p><HardDrive size={14} className="inline mr-1.5" /> Taille : <strong className="text-text-primary">{result.data.size}</strong></p>
                    <p><Database size={14} className="inline mr-1.5" /> Collections : <strong className="text-text-primary">{result.data.collections?.length || 0}</strong></p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-success" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary mb-1">Restauration terminée</h2>
                  <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left text-sm text-text-muted space-y-1">
                    {result.data.restoredCollections?.map((r, i) => (
                      <p key={i}><Database size={14} className="inline mr-1.5" /> {r.collection} : <strong className="text-text-primary">{r.documents}</strong> docs</p>
                    ))}
                  </div>
                </>
              )}
              <button onClick={() => setResult(null)} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
