import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGrades, useValidateBatch, useReopenGrade, useValidateGrade } from '../../hooks/useGrades'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { usePeriods } from '../../hooks/usePeriods'
import api from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2, RotateCcw, AlertCircle, FileCheck, Clock, Filter, Calendar, Plus, X } from 'lucide-react'

export default function MobileGradeValidation() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const qc = useQueryClient()
  const { data: classes } = useClasses()
  const { data: subjects } = useSubjects()
  const { data: periods, isLoading: loadingPeriods } = usePeriods({ schoolYear: '2025-2026' })
  const { data: grades, isLoading } = useGrades({
    status: 'submitted',
    classId: selectedClass || undefined,
    subjectId: selectedSubject || undefined,
    periodId: selectedPeriod || undefined,
  })
  const validateMutation = useValidateBatch()
  const validateSingleMutation = useValidateGrade()
  const reopenMutation = useReopenGrade()

  const classList = classes || []
  const subjectList = subjects || []
  const periodList = periods || []
  const gradeList = grades || []

  useEffect(() => {
    if (validateMutation.isSuccess) {
      setSuccessMsg(validateMutation.data?.message || 'Notes validées avec succès')
      const t = setTimeout(() => setSuccessMsg(''), 5000)
      return () => clearTimeout(t)
    }
  }, [validateMutation.isSuccess, validateMutation.data])

  const handleValidate = async () => {
    if (!selectedPeriod) return
    try {
      await validateMutation.mutateAsync({
        periodId: selectedPeriod,
        classId: selectedClass || undefined,
        subjectId: selectedSubject || undefined,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleValidateSelected = async () => {
    for (const id of selectedIds) {
      try { await validateSingleMutation.mutateAsync(id) }
      catch (err) { console.error(err) }
    }
    setSelectedIds([])
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleReopen = async (id) => {
    try { await reopenMutation.mutateAsync(id) }
    catch (err) { console.error(err) }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Validation</h1>
          <p className="text-xs text-text-muted mt-0.5">{gradeList.length} note{gradeList.length > 1 ? 's' : ''} en attente</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedPeriod && gradeList.length > 0 && (
            <button onClick={handleValidate} disabled={validateMutation.isPending}
              className="h-10 px-4 flex items-center gap-1.5 bg-success text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-btn">
              {validateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
              Tout valider
            </button>
          )}
          <button onClick={() => setShowPeriodModal(true)}
            className="h-10 px-3 flex items-center gap-1.5 bg-bg border border-border text-text-primary rounded-xl text-xs font-medium hover:bg-border transition-all">
            <Calendar size={14} /> Périodes
          </button>
        </div>
      </div>

      {!selectedPeriod && (
        <div className="bg-amber/5 border border-amber/20 text-amber-600 text-xs rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <AlertCircle size={14} />
          Sélectionne d'abord une période
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
          <Filter size={12} /> Filtres
        </div>
        <div className="space-y-2">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="">{loadingPeriods ? 'Chargement...' : 'Toutes les périodes'}</option>
            {periodList.map(p => (
              <option key={p.id} value={p.id}>{p.monthName} {p.schoolYear} - T{p.trimester}</option>
            ))}
          </select>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="">Toutes les classes</option>
            {classList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="">Toutes les matières</option>
            {subjectList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-success/5 border border-success/20 text-success text-xs rounded-xl px-4 py-3 mb-4">
          <CheckCircle2 size={14} /> {successMsg}
        </div>
      )}
      {validateMutation.isError && (
        <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 text-danger text-xs rounded-xl px-4 py-3 mb-4">
          <XCircle size={14} /> {validateMutation.error?.response?.data?.error?.message || 'Erreur'}
        </div>
      )}

      {selectedIds.length > 0 && (
        <button onClick={handleValidateSelected} disabled={validateSingleMutation.isPending}
          className="w-full mb-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-btn">
          {validateSingleMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
          Valider ({selectedIds.length})
        </button>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : gradeList.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">Aucune note en attente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gradeList.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <input type="checkbox" checked={selectedIds.includes(g.id)}
                    onChange={() => toggleSelect(g.id)}
                    className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary/20 cursor-pointer flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{g.studentName}</p>
                    <p className="text-xs text-text-muted">{g.className} · {g.subjectName}</p>
                  </div>
                </div>
                <span className={'text-lg font-bold flex-shrink-0 ' + (g.value >= 10 ? 'text-success' : 'text-danger')}>
                  {g.value}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Clock size={10} /> Soumis
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => validateSingleMutation.mutate(g.id)} disabled={validateSingleMutation.isPending}
                    className="p-2 rounded-lg text-text-muted hover:text-success hover:bg-success/5 transition-all disabled:opacity-50" title="Valider">
                    <FileCheck size={15} />
                  </button>
                  <button onClick={() => handleReopen(g.id)} disabled={reopenMutation.isPending}
                    className="p-2 rounded-lg text-text-muted hover:text-purple hover:bg-purple/5 transition-all disabled:opacity-50" title="Réouvrir">
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPeriodModal && (
          <PeriodManagerSheet
            periods={periodList}
            onClose={() => setShowPeriodModal(false)}
            onCreated={() => qc.invalidateQueries({ queryKey: ['periods'] })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const trimesterMonths = { 1: [9, 10, 11], 2: [12, 1, 2], 3: [3, 4, 5] }
const monthNames = {
  9: 'Septembre', 10: 'Octobre', 11: 'Novembre',
  12: 'Décembre', 1: 'Janvier', 2: 'Février',
  3: 'Mars', 4: 'Avril', 5: 'Mai',
}

function PeriodManagerSheet({ periods, onClose, onCreated }) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [seedMessage, setSeedMessage] = useState('')

  const handleSeedPeriods = async () => {
    setCreating(true); setError(''); setSeedMessage('')
    try {
      let created = 0
      for (const [tri, months] of Object.entries(trimesterMonths)) {
        for (const month of months) {
          const exists = periods.some(p => p.month === month && p.schoolYear === '2025-2026')
          if (exists) continue
          const year = month >= 9 ? 2025 : 2026
          const nextMonth = month === 12 ? 1 : month + 1
          const nextYear = month === 12 ? year + 1 : year
          await api.post('/periods', {
            schoolYear: '2025-2026',
            month, monthName: monthNames[month] || 'Mois',
            trimester: parseInt(tri),
            startDate: `${year}-${String(month).padStart(2, '0')}-01`,
            endDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
          })
          created++
        }
      }
      if (created > 0) {
        setSeedMessage(`${created} période${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}`)
        onCreated()
      } else {
        setSeedMessage('Toutes les périodes existent déjà')
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
    } finally { setCreating(false) }
  }

  const handleToggleOpen = async (id) => {
    try {
      await api.patch(`/periods/${id}/toggle-open`)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-bold text-text-primary">Périodes</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-bg text-text-muted"><X size={18} /></button>
        </div>
        <div className="p-5">
          {error && (
            <div className="bg-danger/5 border border-danger/20 text-danger text-xs rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}
          {seedMessage && (
            <div className="bg-success/5 border border-success/20 text-success text-xs rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} /> {seedMessage}
            </div>
          )}

          <button onClick={handleSeedPeriods} disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 mb-5 shadow-btn">
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {periods.length === 0 ? 'Créer toutes les périodes' : 'Compléter les périodes'}
          </button>

          {periods.length > 0 && (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {periods.slice().sort((a, b) => a.month - b.month).map(p => (
                <div key={p.id} className="flex items-center justify-between bg-bg border border-border rounded-xl px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{p.monthName} {p.schoolYear}</span>
                    <span className="text-xs text-text-muted ml-2">T{p.trimester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.isValidated ? 'bg-success/10 text-success' : p.isOpenForGrades ? 'bg-amber-100 text-amber-700' : 'bg-bg text-text-muted border border-border'}`}>
                      {p.isValidated ? 'Validé' : p.isOpenForGrades ? 'Ouvert' : 'Fermé'}
                    </span>
                    {!p.isValidated && (
                      <button onClick={() => handleToggleOpen(p.id)} className="text-xs text-primary hover:underline">
                        {p.isOpenForGrades ? 'Fermer' : 'Ouvrir'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} className="w-full mt-5 py-3 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
