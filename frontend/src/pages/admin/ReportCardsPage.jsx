import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReportCards, useGenerateReportCards, useDeleteReportCard } from '../../hooks/useReportCards'
import { useClasses } from '../../hooks/useClasses'
import { downloadPdf } from '../../services/reportCardService'
import { Loader2, FileText, Download, AlertCircle, GraduationCap, Calendar, CheckCircle2, Trash2, X } from 'lucide-react'

const trimesters = [
  { value: 1, label: '1er Trimestre' },
  { value: 2, label: '2ème Trimestre' },
  { value: 3, label: '3ème Trimestre' },
]

const schoolYears = ['2024-2025', '2025-2026', '2026-2027']

export default function ReportCardsPage() {
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

  const classList = classes || []
  const reportList = reportCards || []

  const canGenerate = selectedClass && selectedTrimester && selectedYear && !generateMutation.isPending

  const handleGenerate = async () => {
    if (!canGenerate) return
    try {
      await generateMutation.mutateAsync({
        classId: selectedClass,
        trimester: selectedTrimester,
        schoolYear: selectedYear,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownload = (id) => {
    downloadPdf(id)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Bulletins</h1>
          <p className="text-sm text-text-muted mt-1">
            {reportList.length} bulletin{reportList.length > 1 ? 's' : ''} généré{reportList.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {generateMutation.isSuccess && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success rounded-2xl p-4 mb-6">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-medium">Bulletins générés avec succès</p>
            <p className="text-sm opacity-80">{generateMutation.data.generated} bulletin{generateMutation.data.generated > 1 ? 's' : ''} créé{generateMutation.data.generated > 1 ? 's' : ''} pour {generateMutation.data.className}</p>
          </div>
        </div>
      )}

      {generateMutation.isError && (
        <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 text-danger rounded-2xl p-4 mb-6">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Erreur de génération</p>
            <p className="text-sm opacity-80">{generateMutation.error?.message}</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border p-4 lg:p-5 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <GraduationCap size={14} className="inline mr-1" /> Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">Toutes les classes</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <Calendar size={14} className="inline mr-1" /> Trimestre
            </label>
            <select
              value={selectedTrimester}
              onChange={(e) => setSelectedTrimester(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {trimesters.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <Calendar size={14} className="inline mr-1" /> Année scolaire
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {schoolYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-btn active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {generateMutation.isPending ? 'Génération...' : 'Générer les bulletins'}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : reportList.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg flex items-center justify-center">
            <FileText size={28} className="text-text-muted" />
          </div>
          <p className="text-text-muted font-medium">Aucun bulletin généré</p>
          <p className="text-text-muted text-sm mt-1">Sélectionnez une classe, un trimestre et cliquez sur "Générer les bulletins"</p>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {reportList.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                        {r.studentName ? r.studentName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <p className="text-sm font-medium text-text-primary truncate">{r.studentName || 'Inconnu'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                  <span>{trimesters.find((t) => t.value === r.trimester)?.label || `Trimestre ${r.trimester}`}</span>
                  <span>{r.generatedAt ? new Date(r.generatedAt).toLocaleDateString('fr-FR') : '-'}</span>
                </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      r.isSent
                        ? 'bg-success/10 text-success'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {r.isSent ? 'Envoyé' : 'Non envoyé'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDownload(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all">
                        <Download size={12} /> PDF
                      </button>
                      <button onClick={() => setDeleteId(r.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>

          {/* ── DESKTOP TABLE (>= lg) ── */}
          <div className="hidden lg:block bg-surface rounded-2xl border border-border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Élève</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Trimestre</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Généré le</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Statut</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportList.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {r.studentName ? r.studentName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{r.studentName || 'Inconnu'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-text-secondary">{trimesters.find((t) => t.value === r.trimester)?.label || `Trimestre ${r.trimester}`}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-text-secondary">
                          {r.generatedAt ? new Date(r.generatedAt).toLocaleDateString('fr-FR') : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          r.isSent
                            ? 'bg-success/10 text-success'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {r.isSent ? 'Envoyé' : 'Non envoyé'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDownload(r.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all">
                            <Download size={14} /> PDF
                          </button>
                          <button onClick={() => setDeleteId(r.id)}
                            className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-danger" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer ce bulletin ?</h2>
              <p className="text-sm text-text-muted mb-6">Cette action est irréversible.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
                  Annuler
                </button>
                <button onClick={async () => { try { await deleteMutation.mutateAsync(deleteId); setDeleteId(null) } catch {} }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
