import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGrades, useBatchUpsertGrades, useSubmitGrade } from '../../hooks/useGrades'
import { useStudents } from '../../hooks/useStudents'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { usePeriods } from '../../hooks/usePeriods'
import { Loader2, AlertCircle, Save, Send, ChevronDown, CheckCircle2 } from 'lucide-react'

export default function MobileGrades() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [gradeValues, setGradeValues] = useState({})
  const [saveStatus, setSaveStatus] = useState(null)

  const { data: classes } = useClasses()
  const { data: subjects } = useSubjects()
  const { data: periods } = usePeriods({ schoolYear: '2025-2026' })
  const { data: studentsData } = useStudents({ classId: selectedClass || undefined, pageSize: 200 })
  const { data: gradeList, isLoading } = useGrades({
    classId: selectedClass || undefined,
    subjectId: selectedSubject || undefined,
    periodId: selectedPeriod || undefined,
  })
  const batchMutation = useBatchUpsertGrades()
  const submitMutation = useSubmitGrade()

  const studentList = studentsData?.data || []
  const gradeMap = {}
  ;(gradeList || []).forEach(g => { gradeMap[g.studentId] = g })

  useEffect(() => {
    if (gradeList && gradeList.length > 0) {
      const vals = {}
      gradeList.forEach(g => { vals[g.studentId] = g.value })
      setGradeValues(vals)
    }
  }, [gradeList])

  const handleGradeChange = (studentId, value) => {
    const num = parseFloat(value)
    if (value === '' || (num >= 0 && num <= 20)) {
      setGradeValues(prev => ({ ...prev, [studentId]: value }))
    }
  }

  const handleSave = async (submit = false) => {
    if (!selectedClass || !selectedSubject || !selectedPeriod) return
    setSaveStatus('saving')
    try {
      const grades = studentList
        .filter(s => gradeValues[s.id] !== undefined && gradeValues[s.id] !== '')
        .map(s => ({ studentId: s.id, value: parseFloat(gradeValues[s.id]) }))
      if (grades.length === 0) { setSaveStatus('empty'); return }
      await batchMutation.mutateAsync({ classId: selectedClass, subjectId: selectedSubject, periodId: selectedPeriod, grades })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      setSaveStatus('error')
    }
  }

  return (
    <div className="p-4 pb-8">
      <h1 className="text-xl font-bold text-text-primary mb-4">Notes</h1>

      <div className="space-y-3 mb-5">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Classe</option>
          {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Matière</option>
          {(subjects || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Période</option>
          {(periods || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {!selectedClass || !selectedSubject || !selectedPeriod ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-muted">Sélectionnez une classe, matière et période</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : studentList.length === 0 ? (
        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 text-center">
          <AlertCircle size={20} className="mx-auto text-danger mb-2" />
          <p className="text-sm text-danger font-medium">Aucun élève dans cette classe</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {studentList.map((s, i) => {
              const existing = gradeMap[s.id]
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">{s.lastName} {s.firstName}</p>
                      <p className="text-xs text-text-muted mt-0.5">{s.studentCode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={gradeValues[s.id] ?? ''}
                        onChange={e => handleGradeChange(s.id, e.target.value)}
                        placeholder="—"
                        className="w-16 h-10 text-center text-sm font-semibold bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-text-muted w-4">/20</span>
                    </div>
                  </div>
                  {existing && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        existing.status === 'validated' ? 'bg-success/10 text-success' :
                        existing.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        existing.status === 'draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-bg text-text-muted'
                      }`}>
                        {existing.status === 'validated' ? 'Validé' :
                         existing.status === 'submitted' ? 'Soumis' :
                         existing.status === 'draft' ? 'Brouillon' : existing.status}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success rounded-xl px-4 py-3 mb-4">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">Notes enregistrées</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-danger">Erreur lors de l'enregistrement</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => handleSave(false)}
              disabled={batchMutation.isPending}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-btn active:scale-[0.98]">
              {batchMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer
            </button>
          </div>
        </>
      )}
    </div>
  )
}
