import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGrades, useBatchUpsertGrades, useSubmitGrade, useReopenGrade } from '../../hooks/useGrades'
import { useStudents } from '../../hooks/useStudents'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { usePeriods } from '../../hooks/usePeriods'
import api from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Loader2, Save, Send, RotateCcw, CheckCircle2, Clock, XCircle, FileEdit, Plus, X, Calendar } from 'lucide-react'

const statusStyles = {
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  validated: 'bg-success/10 text-success',
  reopened: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const statusLabels = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  validated: 'Validé',
  reopened: 'Réouvert',
}

export default function GradesPage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [gradeValues, setGradeValues] = useState({})
  const [saveStatus, setSaveStatus] = useState(null)
  const [showPeriodModal, setShowPeriodModal] = useState(false)

  const qc = useQueryClient()
  const { data: classes } = useClasses()
  const { data: subjects } = useSubjects()
  const { data: periods, isLoading: loadingPeriods } = usePeriods({ schoolYear: '2025-2026' })
  const { data: students } = useStudents({ classId: selectedClass || undefined, pageSize: 100 })
  const gradesQuery = useGrades({
    classId: selectedClass || undefined,
    subjectId: selectedSubject || undefined,
    periodId: selectedPeriod || undefined,
  })
  const batchMutation = useBatchUpsertGrades()
  const submitMutation = useSubmitGrade()
  const reopenMutation = useReopenGrade()

  const classList = classes || []
  const subjectList = subjects || []
  const periodList = periods || []
  const studentList = students?.data || []
  const gradeList = gradesQuery.data || []
  const noPeriods = !loadingPeriods && periodList.length === 0

  const gradeMap = {}
  gradeList.forEach((g) => { gradeMap[g.studentId] = g })

  useEffect(() => {
    if (gradeList.length > 0) {
      const vals = {}
      gradeList.forEach((g) => { vals[g.studentId] = g.value })
      setGradeValues(vals)
    } else {
      setGradeValues({})
    }
  }, [gradeList])

  const handleGradeChange = (studentId, value) => {
    const num = parseFloat(value)
    if (value === '' || (num >= 0 && num <= 20)) {
      setGradeValues((prev) => ({ ...prev, [studentId]: value }))
    }
  }

  const handleSave = async (statusAfter = 'draft') => {
    if (!selectedClass || !selectedSubject || !selectedPeriod) return
    setSaveStatus('saving')
    try {
      const grades = studentList
        .filter((s) => gradeValues[s.id] !== undefined && gradeValues[s.id] !== '')
        .map((s) => ({ studentId: s.id, value: parseFloat(gradeValues[s.id]) }))

      if (grades.length === 0) { setSaveStatus('empty'); return }

      await batchMutation.mutateAsync({
        classId: selectedClass,
        subjectId: selectedSubject,
        periodId: selectedPeriod,
        grades,
      })

      if (statusAfter === 'submitted') {
        const newGrades = await gradesQuery.refetch()
        const existing = newGrades.data || []
        for (const g of existing) {
          if (g.status === 'draft') {
            try { await submitMutation.mutateAsync(g.id) } catch {}
          }
        }
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      setSaveStatus('error')
      console.error(err)
    }
  }

  const handleReopen = async (gradeId) => {
    try { await reopenMutation.mutateAsync(gradeId) }
    catch (err) { console.error(err) }
  }

  const ready = selectedClass && selectedSubject && selectedPeriod

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Saisie des notes</h1>
          <p className="text-sm text-text-muted mt-1">
            {ready ? `${studentList.length} élève${studentList.length > 1 ? 's' : ''}` : 'Sélectionnez une classe, une matière et une période'}
          </p>
        </div>
        <button onClick={() => setShowPeriodModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
          <Calendar size={15} /> Gérer les périodes
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 lg:p-5 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Classe</label>
            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setGradeValues({}) }}
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">Sélectionner...</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.fullName}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Matière</label>
            <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setGradeValues({}) }}
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">Sélectionner...</option>
              {subjectList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Période</label>
            <select value={selectedPeriod} onChange={(e) => { setSelectedPeriod(e.target.value); setGradeValues({}) }}
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">{loadingPeriods ? 'Chargement...' : noPeriods ? 'Aucune période' : 'Sélectionner...'}</option>
              {periodList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.monthName} {p.schoolYear} · T{p.trimester} {p.isOpenForGrades ? '🔓' : '🔒'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className="flex items-center gap-2.5 bg-success/5 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-6">
          <CheckCircle2 size={16} /> Notes enregistrées avec succès
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2.5 bg-danger/5 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-6">
          <XCircle size={16} /> Erreur lors de l'enregistrement
        </div>
      )}
      {saveStatus === 'empty' && (
        <div className="flex items-center gap-2.5 bg-amber/5 border border-amber/20 text-amber-600 text-sm rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} /> Aucune note à enregistrer
        </div>
      )}

      {!ready ? (
        <div className="text-center py-20">
          <FileEdit size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">
            {noPeriods
              ? 'Aucune période scolaire trouvée. Cliquez sur "Gérer les périodes" pour en créer.'
              : 'Sélectionnez une classe, une matière et une période pour commencer'}
          </p>
        </div>
      ) : gradesQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {studentList.map((s, i) => {
              const grade = gradeMap[s.id]
              const status = grade?.status || 'draft'
              const isEditable = status === 'draft' || status === 'reopened'
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{s.lastName} {s.firstName}</p>
                      <p className="text-xs text-text-muted font-mono">{s.studentCode}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={gradeValues[s.id] ?? ''}
                        onChange={(e) => handleGradeChange(s.id, e.target.value)}
                        disabled={!isEditable}
                        className={`w-18 text-center px-2 py-1.5 text-sm font-semibold bg-bg border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all
                          ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}
                          ${gradeValues[s.id] !== undefined && gradeValues[s.id] !== ''
                            ? (parseFloat(gradeValues[s.id]) >= 10
                              ? 'border-success/30 text-success'
                              : 'border-danger/30 text-danger')
                            : 'border-border text-text-primary'}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {grade ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || ''}`}>
                          {status === 'validated' && <CheckCircle2 size={12} />}
                          {status === 'submitted' && <Clock size={12} />}
                          {status === 'reopened' && <RotateCcw size={12} />}
                          {status === 'draft' && <FileEdit size={12} />}
                          {statusLabels[status] || status}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">Nouveau</span>
                      )}
                    </div>
                    <div>
                      {grade?.status === 'validated' && (
                        <button onClick={() => handleReopen(grade.id)} disabled={reopenMutation.isPending}
                          className="p-1.5 rounded-lg text-text-muted hover:text-purple hover:bg-purple/5 transition-all disabled:opacity-50"
                          title="Réouvrir">
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── DESKTOP TABLE (>= lg) ── */}
          <div className="hidden lg:block bg-card border border-border rounded-2xl lg:rounded-3xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 w-12">#</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Élève</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 w-28">Note /20</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 w-28">Statut</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {studentList.map((s, i) => {
                    const grade = gradeMap[s.id]
                    const status = grade?.status || 'draft'
                    const isEditable = status === 'draft' || status === 'reopened'
                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-bg/50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm text-text-muted">{i + 1}</td>
                        <td className="px-6 py-3">
                          <span className="text-sm font-medium text-text-primary">{s.lastName} {s.firstName}</span>
                          <span className="text-xs text-text-muted ml-2 font-mono">{s.studentCode}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={gradeValues[s.id] ?? ''}
                            onChange={(e) => handleGradeChange(s.id, e.target.value)}
                            disabled={!isEditable}
                            className={`w-20 text-center px-3 py-2 text-sm font-semibold bg-bg border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all
                              ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}
                              ${gradeValues[s.id] !== undefined && gradeValues[s.id] !== ''
                                ? (parseFloat(gradeValues[s.id]) >= 10
                                  ? 'border-success/30 text-success'
                                  : 'border-danger/30 text-danger')
                                : 'border-border text-text-primary'}`}
                          />
                        </td>
                        <td className="px-6 py-3 text-center">
                          {grade ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || ''}`}>
                              {status === 'validated' && <CheckCircle2 size={12} />}
                              {status === 'submitted' && <Clock size={12} />}
                              {status === 'reopened' && <RotateCcw size={12} />}
                              {status === 'draft' && <FileEdit size={12} />}
                              {statusLabels[status] || status}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">Nouveau</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {grade?.status === 'validated' && (
                            <button onClick={() => handleReopen(grade.id)} disabled={reopenMutation.isPending}
                              className="p-1.5 rounded-lg text-text-muted hover:text-purple hover:bg-purple/5 transition-all disabled:opacity-50"
                              title="Réouvrir">
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 flex-wrap">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 size={14} className="animate-spin" /> Enregistrement...
              </span>
            )}
            <button onClick={() => handleSave('draft')} disabled={batchMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all disabled:opacity-50">
              <Save size={15} /> Enregistrer brouillons
            </button>
            <button onClick={() => handleSave('submitted')} disabled={batchMutation.isPending || submitMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 shadow-btn">
              <Send size={15} /> Enregistrer & soumettre
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {showPeriodModal && (
          <PeriodManagerModal
            periods={periodList}
            onClose={() => setShowPeriodModal(false)}
            onCreated={() => { qc.invalidateQueries({ queryKey: ['periods'] }) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const trimesterMonths = {
  1: [9, 10, 11],
  2: [12, 1, 2],
  3: [3, 4, 5],
}

const monthNames = {
  9: 'Septembre', 10: 'Octobre', 11: 'Novembre',
  12: 'Décembre', 1: 'Janvier', 2: 'Février',
  3: 'Mars', 4: 'Avril', 5: 'Mai',
}

function PeriodManagerModal({ periods, onClose, onCreated }) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [seedMessage, setSeedMessage] = useState('')

  const handleSeedPeriods = async () => {
    setCreating(true)
    setError('')
    setSeedMessage('')
    try {
      let created = 0
      for (const [tri, months] of Object.entries(trimesterMonths)) {
        for (const month of months) {
          const exists = periods.some((p) => p.month === month && p.schoolYear === '2025-2026')
          if (exists) continue
          const year = month >= 9 ? 2025 : 2026
          const nextMonth = month === 12 ? 1 : month + 1
          const nextYear = month === 12 ? year + 1 : year
          await api.post('/periods', {
            schoolYear: '2025-2026',
            month,
            monthName: monthNames[month] || `Mois ${month}`,
            trimester: parseInt(tri),
            startDate: `${year}-${String(month).padStart(2, '0')}-01`,
            endDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
          })
          created++
        }
      }
      if (created > 0) {
        setSeedMessage(`${created} période${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} avec succès`)
        onCreated()
      } else {
        setSeedMessage('Toutes les périodes existent déjà')
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleOpen = async (id, currentState) => {
    try {
      await api.patch(`/periods/${id}/toggle-open`)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-lg p-4 lg:p-6 shadow-premium-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Gestion des périodes</h2>
            <p className="text-sm text-text-muted mt-0.5">{periods.length} période{periods.length > 1 ? 's' : ''} · 2025-2026</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-all">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-danger/5 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}
        {seedMessage && (
          <div className="flex items-center gap-2.5 bg-success/5 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 size={16} /> {seedMessage}
          </div>
        )}

        <button onClick={handleSeedPeriods} disabled={creating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 mb-5 shadow-btn">
          {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          {periods.length === 0 ? 'Créer toutes les périodes (Septembre à Mai)' : 'Compléter les périodes manquantes'}
        </button>

        {periods.length > 0 && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {periods
              .slice()
              .sort((a, b) => a.month - b.month)
              .map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-bg border border-border rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-text-primary">{p.monthName} {p.schoolYear}</span>
                  <span className="text-xs text-text-muted ml-2">T{p.trimester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.isValidated ? 'bg-success/10 text-success' : p.isOpenForGrades ? 'bg-amber-100 text-amber-700' : 'bg-bg text-text-muted border border-border'}`}>
                    {p.isValidated ? 'Validé' : p.isOpenForGrades ? 'Ouvert' : 'Fermé'}
                  </span>
                  {!p.isValidated && (
                    <button onClick={() => handleToggleOpen(p.id, p.isOpenForGrades)}
                      className="text-xs text-primary hover:underline">
                      {p.isOpenForGrades ? 'Fermer' : 'Ouvrir'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="w-full mt-5 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
