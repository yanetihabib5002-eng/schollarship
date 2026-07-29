import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGrades, useValidateBatch, useReopenGrade, useValidateGrade } from '../../hooks/useGrades'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { usePeriods } from '../../hooks/usePeriods'
import api from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2, RotateCcw, AlertCircle, FileCheck, Clock, Filter, Calendar, Plus, X } from 'lucide-react'

export default function GradeValidationPage() {
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
      setSuccessMsg(validateMutation.data?.message || 'Notes validees avec succes')
      const t = setTimeout(function () { setSuccessMsg('') }, 5000)
      return function () { clearTimeout(t) }
    }
  }, [validateMutation.isSuccess, validateMutation.data])

  const selectedPeriodData = periodList.find(function (p) { return p.id === selectedPeriod })

  const handleValidate = async function () {
    if (!selectedPeriod) return
    try {
      await validateMutation.mutateAsync({
        periodId: selectedPeriod,
        classId: selectedClass,
        subjectId: selectedSubject,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleValidateSelected = async function () {
    for (const id of selectedIds) {
      try { await validateSingleMutation.mutateAsync(id) }
      catch (err) { console.error(err) }
    }
    setSelectedIds([])
  }

  const toggleSelect = function (id) {
    setSelectedIds(function (prev) {
      return prev.includes(id) ? prev.filter(function (x) { return x !== id }) : [...prev, id]
    })
  }

  const toggleSelectAll = function () {
    if (selectedIds.length === gradeList.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(gradeList.map(function (g) { return g.id }))
    }
  }

  const handleReopen = async function (id) {
    try { await reopenMutation.mutateAsync(id) }
    catch (err) { console.error(err) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Validation des notes</h1>
          <p className="text-sm text-text-muted mt-1">
            {gradeList.length + ' note' + (gradeList.length > 1 ? 's' : '') + ' en attente'}
            {selectedPeriod && selectedPeriodData ? ' pour ' + selectedPeriodData.monthName : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedPeriod && gradeList.length > 0 && (
            <button onClick={handleValidate} disabled={validateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-btn">
              {validateMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <FileCheck size={15} />}{'Valider tout (' + gradeList.length + ')'}
            </button>
          )}
          {selectedIds.length > 0 && (
            <button onClick={handleValidateSelected} disabled={validateSingleMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 shadow-btn">
              {validateSingleMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <FileCheck size={15} />}{'Valider selection (' + selectedIds.length + ')'}
            </button>
          )}
          <button onClick={function () { setShowPeriodModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
            <Calendar size={15} /> Periodes
          </button>
        </div>
      </div>

      {!selectedPeriod && (
        <div className="bg-amber/5 border border-amber/20 text-amber-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          Selectionne d'abord une periode (filtre) pour valider les notes
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 lg:p-5 mb-4 lg:mb-6">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
          <Filter size={14} /> Filtres
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select value={selectedPeriod} onChange={function (e) { setSelectedPeriod(e.target.value) }}
            className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="">{loadingPeriods ? 'Chargement...' : periodList.length === 0 ? 'Aucune periode' : 'Toutes les periodes'}</option>
            {periodList.map(function (p) {
              return (
                <option key={p.id} value={p.id}>{p.monthName} {p.schoolYear} - T{p.trimester}</option>
              )
            })}
          </select>
          <select value={selectedClass} onChange={function (e) { setSelectedClass(e.target.value) }}
            className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="">Toutes les classes</option>
            {classList.map(function (c) {
              return <option key={c.id} value={c.id}>{c.name}</option>
            })}
          </select>
          <select value={selectedSubject} onChange={function (e) { setSelectedSubject(e.target.value) }}
            className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="">Toutes les matieres</option>
            {subjectList.map(function (s) {
              return <option key={s.id} value={s.id}>{s.name}</option>
            })}
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 bg-success/5 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-6">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {validateMutation.isError && (
        <div className="flex items-center gap-2.5 bg-danger/5 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-6">
          <XCircle size={16} /> {validateMutation.error?.response?.data?.error?.message || 'Erreur de validation'}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : gradeList.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">Aucune note en attente de validation</p>
          <p className="text-xs text-text-muted mt-1">
            {selectedPeriod
              ? 'Toutes les notes de cette periode sont deja validees'
              : 'Selectionne une periode ou soumets d abord des notes depuis la page Notes'}
          </p>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {gradeList.map(function (g, i) {
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <input type="checkbox" checked={selectedIds.includes(g.id)}
                        onChange={function () { toggleSelect(g.id) }}
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
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Clock size={12} /> Soumis
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={function () { validateSingleMutation.mutate(g.id) }} disabled={validateSingleMutation.isPending}
                        className="p-2 rounded-lg text-text-muted hover:text-success hover:bg-success/5 transition-all disabled:opacity-50" title="Valider">
                        <FileCheck size={15} />
                      </button>
                      <button onClick={function () { handleReopen(g.id) }} disabled={reopenMutation.isPending}
                        className="p-2 rounded-lg text-text-muted hover:text-purple hover:bg-purple/5 transition-all disabled:opacity-50" title="Reouvrir">
                        <RotateCcw size={15} />
                      </button>
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
                    <th className="w-10 px-4 py-4">
                      <input type="checkbox" checked={selectedIds.length === gradeList.length && gradeList.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer" />
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Eleve</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Classe</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Matiere</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Note</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Coeff.</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Periode</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Statut</th>
                    <th className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gradeList.map(function (g, i) {
                    return (
                      <motion.tr
                        key={g.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-bg/50 transition-colors"
                      >
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={selectedIds.includes(g.id)}
                            onChange={function () { toggleSelect(g.id) }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer" />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-text-primary">{g.studentName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-muted">{g.className}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-muted">{g.subjectName}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={'text-lg font-bold ' + (g.value >= 10 ? 'text-success' : 'text-danger')}>
                            {g.value}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-text-muted">{'x' + g.coefficient}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-muted">{g.monthName} {g.schoolYear}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            <Clock size={12} /> Soumis
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={function () { validateSingleMutation.mutate(g.id) }} disabled={validateSingleMutation.isPending}
                              className="p-2 rounded-lg text-text-muted hover:text-success hover:bg-success/5 transition-all disabled:opacity-50" title="Valider">
                              <FileCheck size={15} />
                            </button>
                            <button onClick={function () { handleReopen(g.id) }} disabled={reopenMutation.isPending}
                              className="p-2 rounded-lg text-text-muted hover:text-purple hover:bg-purple/5 transition-all disabled:opacity-50" title="Reouvrir">
                              <RotateCcw size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showPeriodModal && (
        <PeriodManagerModal
          periods={periodList}
          onClose={function () { setShowPeriodModal(false) }}
          onCreated={function () { qc.invalidateQueries({ queryKey: ['periods'] }) }}
        />
      )}
    </motion.div>
  )
}

var trimesterMonths = { 1: [9, 10, 11], 2: [12, 1, 2], 3: [3, 4, 5] }
var monthNames = {
  9: 'Septembre', 10: 'Octobre', 11: 'Novembre',
  12: 'Decembre', 1: 'Janvier', 2: 'Fevrier',
  3: 'Mars', 4: 'Avril', 5: 'Mai',
}

function PeriodManagerModal({ periods, onClose, onCreated }) {
  var _a = useState(false), creating = _a[0], setCreating = _a[1]
  var _b = useState(''), error = _b[0], setError = _b[1]
  var _c = useState(''), seedMessage = _c[0], setSeedMessage = _c[1]

  var handleSeedPeriods = async function () {
    setCreating(true)
    setError('')
    setSeedMessage('')
    try {
      var created = 0
      for (var _i = 0, _d = Object.entries(trimesterMonths); _i < _d.length; _i++) {
        var _e = _d[_i], tri = _e[0], months = _e[1]
        for (var _f = 0; _f < months.length; _f++) {
          var month = months[_f]
          var exists = periods.some(function (p) { return p.month === month && p.schoolYear === '2025-2026' })
          if (exists) continue
          var year = month >= 9 ? 2025 : 2026
          var nextMonth = month === 12 ? 1 : month + 1
          var nextYear = month === 12 ? year + 1 : year
          await api.post('/periods', {
            schoolYear: '2025-2026',
            month: month,
            monthName: monthNames[month] || 'Mois',
            trimester: parseInt(tri),
            startDate: String(year) + '-' + String(month).padStart(2, '0') + '-01',
            endDate: String(nextYear) + '-' + String(nextMonth).padStart(2, '0') + '-01',
          })
          created++
        }
      }
      if (created > 0) {
        setSeedMessage(String(created) + ' periode' + (created > 1 ? 's' : '') + ' creee' + (created > 1 ? 's' : '') + ' avec succes')
        onCreated()
      } else {
        setSeedMessage('Toutes les periodes existent deja')
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
    } finally {
      setCreating(false)
    }
  }

  var handleToggleOpen = async function (id) {
    try {
      await api.patch('/periods/' + id + '/toggle-open')
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
        onClick={function (e) { e.stopPropagation() }}
        className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-lg p-4 lg:p-6 shadow-premium-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Gestion des periodes</h2>
            <p className="text-sm text-text-muted mt-0.5">{String(periods.length) + ' periode' + (periods.length > 1 ? 's' : '') + ' - 2025-2026'}</p>
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
          {periods.length === 0 ? 'Creer toutes les periodes (Septembre a Mai)' : 'Completer les periodes manquantes'}
        </button>

        {periods.length > 0 && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {periods.slice().sort(function (a, b) { return a.month - b.month }).map(function (p) {
              return (
                <div key={p.id} className="flex items-center justify-between bg-bg border border-border rounded-xl px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{p.monthName} {p.schoolYear}</span>
                    <span className="text-xs text-text-muted ml-2">{'T' + p.trimester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (p.isValidated ? 'bg-success/10 text-success' : p.isOpenForGrades ? 'bg-amber-100 text-amber-700' : 'bg-bg text-text-muted border border-border')}>
                      {p.isValidated ? 'Valide' : p.isOpenForGrades ? 'Ouvert' : 'Ferme'}
                    </span>
                    {!p.isValidated && (
                      <button onClick={function () { handleToggleOpen(p.id) }}
                        className="text-xs text-primary hover:underline">
                        {p.isOpenForGrades ? 'Fermer' : 'Ouvrir'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onClose} className="w-full mt-5 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
