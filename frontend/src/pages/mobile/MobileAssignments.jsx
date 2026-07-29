import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssignments, useCreateMultipleAssignments, useDeleteAssignment } from '../../hooks/useAssignments'
import { useTeachers } from '../../hooks/useTeachers'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { Plus, X, AlertCircle, Loader2, UserCheck, BookCheck, GraduationCap, BookOpen, Trash2, Filter } from 'lucide-react'

export default function MobileAssignments() {
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const params = {}
  if (filterTeacher) params.teacherId = filterTeacher
  if (filterClass) params.classId = filterClass

  const { data: assignments, isLoading, error } = useAssignments(params)
  const { data: teachers } = useTeachers({ pageSize: 200 })
  const { data: classes } = useClasses()
  const { data: subjects } = useSubjects()
  const createMutation = useCreateMultipleAssignments()
  const deleteMutation = useDeleteAssignment()

  const teacherList = teachers?.data || teachers || []
  const classList = classes || []
  const subjectList = subjects || []
  const assignmentList = assignments || []

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Affectations</h1>
          <p className="text-xs text-text-muted mt-0.5">{assignmentList.length} affectation{assignmentList.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-btn active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter size={14} className="text-text-muted flex-shrink-0" />
        <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all flex-shrink-0">
          <option value="">Tous profs</option>
          {teacherList.map((t) => (
            <option key={t.id} value={t.id}>{t.lastName}</option>
          ))}
        </select>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all flex-shrink-0">
          <option value="">Toutes classes</option>
          {classList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
      ) : assignmentList.length === 0 ? (
        <div className="text-center py-16">
          <BookCheck size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">Aucune affectation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {assignmentList.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-primary">{a.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-text-primary">{a.className}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-text-muted">{a.subjectName}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${a.isActive !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {a.isActive !== false ? 'Actif' : 'Inactif'}
                </span>
                <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CreateAssignmentSheet
            teachers={teacherList}
            classes={classList}
            subjects={subjectList}
            mutation={createMutation}
            onClose={() => setShowForm(false)}
          />
        )}
        {deleteId && (
          <DeleteConfirmSheet
            id={deleteId}
            onClose={() => setDeleteId(null)}
            mutation={deleteMutation}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CreateAssignmentSheet({ teachers, classes, subjects, mutation, onClose }) {
  const [form, setForm] = useState({ teacherId: '', classIds: [], subjectIds: [], schoolYear: '2026-2027' })
  const [errors, setErrors] = useState({})

  const toggleArray = (field, value) => {
    setForm(prev => {
      const arr = prev[field]
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      return { ...prev, [field]: next }
    })
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.teacherId) errs.teacherId = 'Enseignant requis'
    if (!form.classIds.length) errs.classIds = 'Au moins une classe'
    if (!form.subjectIds.length) errs.subjectIds = 'Au moins une matière'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    try {
      await mutation.mutateAsync({
        teacherId: form.teacherId,
        classIds: form.classIds,
        subjectIds: form.subjectIds,
        schoolYear: form.schoolYear,
      })
      onClose()
    } catch (err) {
      setErrors({ submit: err.response?.data?.error?.message || err.message })
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
          <h2 className="text-base font-bold text-text-primary">Nouvelle affectation</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-bg text-text-muted"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.submit && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
              <span className="text-sm text-danger">{errors.submit}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Enseignant</label>
            <select value={form.teacherId} onChange={(e) => setForm(p => ({ ...p, teacherId: e.target.value }))}
              className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.teacherId ? 'border-danger' : 'border-border'}`}>
              <option value="">Sélectionner...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>
              ))}
            </select>
            {errors.teacherId && <p className="text-xs text-danger">{errors.teacherId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">
              Classes ({form.classIds.length})
            </label>
            <div className={`max-h-36 overflow-y-auto border rounded-xl bg-bg p-1 ${errors.classIds ? 'border-danger' : 'border-border'}`}>
              {classes.map(c => {
                const checked = form.classIds.includes(c.id)
                return (
                  <button type="button" key={c.id} onClick={() => toggleArray('classIds', c.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${checked ? 'bg-primary/10 text-primary font-medium' : 'text-text-primary hover:bg-bg/80'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
                      {checked && <span className="text-white text-[10px] font-bold">&#10003;</span>}
                    </div>
                    {c.name}
                  </button>
                )
              })}
            </div>
            {errors.classIds && <p className="text-xs text-danger">{errors.classIds}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">
              Matières ({form.subjectIds.length})
            </label>
            <div className={`max-h-36 overflow-y-auto border rounded-xl bg-bg p-1 ${errors.subjectIds ? 'border-danger' : 'border-border'}`}>
              {subjects.map(s => {
                const checked = form.subjectIds.includes(s.id)
                return (
                  <button type="button" key={s.id} onClick={() => toggleArray('subjectIds', s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${checked ? 'bg-primary/10 text-primary font-medium' : 'text-text-primary hover:bg-bg/80'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
                      {checked && <span className="text-white text-[10px] font-bold">&#10003;</span>}
                    </div>
                    {s.name} ({s.code})
                  </button>
                )
              })}
            </div>
            {errors.subjectIds && <p className="text-xs text-danger">{errors.subjectIds}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Année scolaire</label>
            <select value={form.schoolYear} onChange={(e) => setForm(p => ({ ...p, schoolYear: e.target.value }))}
              className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-btn active:scale-[0.98]">
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Affecter ({form.classIds.length * form.subjectIds.length || 0})
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function DeleteConfirmSheet({ id, onClose, mutation }) {
  const handleDelete = async () => {
    try { await mutation.mutateAsync(id); onClose() }
    catch (err) { console.error(err) }
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
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-danger" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cette affectation ?</h2>
          <p className="text-sm text-text-muted mb-6">Action irréversible.</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">Annuler</button>
            <button onClick={handleDelete} disabled={mutation.isPending} className="flex-1 py-3 bg-danger text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />} Supprimer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
