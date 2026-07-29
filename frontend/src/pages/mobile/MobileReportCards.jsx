import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReportCards, useGenerateReportCards, useDeleteReportCard } from '../../hooks/useReportCards'
import { useClasses } from '../../hooks/useClasses'
import { downloadPdf } from '../../services/reportCardService'
import { Loader2, FileText, Download, AlertCircle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react'

export default function MobileReportCards() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTrimester, setSelectedTrimester] = useState(1)
  const [selectedYear, setSelectedYear] = useState('2025-2026')

  const { data: classes } = useClasses()
  const { data: reportCards, isLoading } = useReportCards({
    classId: selectedClass || undefined,
    trimester: selectedTrimester,
    schoolYear: selectedYear,
  })
  const [deleteId, setDeleteId] = useState(null)
  const generateMutation = useGenerateReportCards()
  const deleteMutation = useDeleteReportCard()

  const canGenerate = selectedClass && selectedTrimester && selectedYear && !generateMutation.isPending

  const handleGenerate = async () => {
    if (!canGenerate) return
    try {
      await generateMutation.mutateAsync({ classId: selectedClass, trimester: selectedTrimester, schoolYear: selectedYear })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-4 pb-8">
      <h1 className="text-xl font-bold text-text-primary mb-4">Bulletins</h1>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3 mb-5">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Classe</option>
          {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          {[1, 2, 3].map(t => (
            <button key={t} onClick={() => setSelectedTrimester(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedTrimester === t
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-bg border border-border text-text-muted'
              }`}>
              T{t}
            </button>
          ))}
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
          className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          {['2024-2025', '2025-2026', '2026-2027'].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-btn active:scale-[0.98]"
        >
          {generateMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Génération...</>
          ) : (
            <><RefreshCw size={16} /> Générer les bulletins</>
          )}
        </button>
      </div>

      {generateMutation.isSuccess && (
        <div className="bg-success/10 border border-success/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success font-medium">{generateMutation.data.generated} bulletin(s) généré(s)</p>
        </div>
      )}

      {generateMutation.isError && (
        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{generateMutation.error?.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : reportCards && reportCards.length > 0 ? (
        <div className="space-y-2">
          {reportCards.map((rc, i) => (
            <motion.div
              key={rc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{rc.studentName || rc.studentId}</p>
                <p className="text-xs text-text-muted">Moyenne: {rc.average ? `${rc.average.toFixed(2)}` : '—'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => downloadPdf(rc.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary active:scale-95 transition-all">
                  <Download size={16} />
                </button>
                <button onClick={() => setDeleteId(rc.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-danger/10 text-danger active:scale-95 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : selectedClass ? (
        <div className="text-center py-16">
          <FileText size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">Aucun bulletin généré</p>
          <p className="text-xs text-text-muted mt-1">Cliquez sur "Générer" pour créer les bulletins</p>
        </div>
      ) : null}

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-5 text-center"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-danger" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer ce bulletin ?</h2>
              <p className="text-sm text-text-muted mb-6">Cette action est irréversible.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
                  Annuler
                </button>
                <button onClick={async () => { try { await deleteMutation.mutateAsync(deleteId); setDeleteId(null) } catch {} }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 bg-danger text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
