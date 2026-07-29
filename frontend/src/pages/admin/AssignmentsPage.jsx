import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssignments, useCreateMultipleAssignments, useDeleteAssignment } from '../../hooks/useAssignments'
import { useTeachers } from '../../hooks/useTeachers'
import { useClasses } from '../../hooks/useClasses'
import { useSubjects } from '../../hooks/useSubjects'
import { Plus, Trash2, X, AlertCircle, Loader2, UserCheck, BookCheck, GraduationCap, BookOpen, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AssignmentsPage() {
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [createdAssignment, setCreatedAssignment] = useState(null)

  const params = {}
  if (filterTeacher) params.teacherId = filterTeacher
  if (filterClass) params.classId = filterClass
  if (filterSubject) params.subjectId = filterSubject

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Affectations</h1>
          <p className="text-sm text-text-muted mt-1">{assignmentList.length} affectation{assignmentList.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-btn active:scale-[0.98]">
          <Plus size={16} /> Nouvelle affectation
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <Filter size={14} /> Filtres :
        </div>
        <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Tous les enseignants</option>
          {teacherList.map((t) => (
            <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>
          ))}
        </select>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Toutes les classes</option>
          {classList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Toutes les matières</option>
          {subjectList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
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
      ) : assignmentList.length === 0 ? (
        <div className="text-center py-20">
          <BookCheck size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">Aucune affectation pour le moment</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-primary text-sm font-medium hover:underline">Affecter un enseignant</button>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {assignmentList.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="space-y-2">
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
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${a.isActive !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {a.isActive !== false ? 'Actif' : 'Inactif'}
                  </span>
                  <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── DESKTOP TABLE (>= lg) ── */}
          <div className="hidden lg:block bg-card border border-border rounded-2xl lg:rounded-3xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Enseignant</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Classe</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Matière</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Année scolaire</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Statut</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assignmentList.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-text-primary">{a.teacherName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-amber-500 flex-shrink-0" />
                          <span className="text-sm text-text-primary">{a.className}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-text-muted">{a.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-text-muted">{a.schoolYear}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${a.isActive !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {a.isActive !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showForm && (
          <CreateAssignmentModal
            teachers={teacherList}
            classes={classList}
            subjects={subjectList}
            mutation={createMutation}
            onClose={() => setShowForm(false)}
            onCreated={(a) => { setCreatedAssignment(a); setShowForm(false) }}
          />
        )}
        {deleteId && (
          <DeleteConfirmModal
            id={deleteId}
            onClose={() => setDeleteId(null)}
            mutation={deleteMutation}
          />
        )}
        {createdAssignment && (
          <AssignmentCreatedModal
            assignment={createdAssignment}
            onClose={() => setCreatedAssignment(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CreateAssignmentModal({ teachers, classes, subjects, mutation, onClose, onCreated }) {
  const [form, setForm] = useState({ teacherId: '', classIds: [], subjectIds: [], schoolYear: '2026-2027' })
  const [errors, setErrors] = useState({})

  const toggleArray = (field, value) => {
    setForm((prev) => {
      const arr = prev[field]
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      return { ...prev, [field]: next }
    })
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.teacherId) errs.teacherId = 'Enseignant requis'
    if (!form.classIds.length) errs.classIds = 'Au moins une classe requise'
    if (!form.subjectIds.length) errs.subjectIds = 'Au moins une matière requise'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      const result = await mutation.mutateAsync({
        teacherId: form.teacherId,
        classIds: form.classIds,
        subjectIds: form.subjectIds,
        schoolYear: form.schoolYear,
      })
      onCreated(result)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error?.message || err.message })
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
            <h2 className="text-lg font-bold text-text-primary">Nouvelle affectation</h2>
            <p className="text-sm text-text-muted mt-0.5">Assigner un enseignant à plusieurs classes et matières</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="flex items-start gap-2.5 bg-danger/5 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Enseignant</label>
            <select name="teacherId" value={form.teacherId} onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}
              className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.teacherId ? 'border-danger' : 'border-border'}`}>
              <option value="">Sélectionner un enseignant...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.lastName} {t.firstName} ({t.matricule})</option>
              ))}
            </select>
            {errors.teacherId && <p className="text-xs text-danger">{errors.teacherId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">
              Classes <span className="text-text-muted font-normal">({form.classIds.length} sélectionnée{form.classIds.length > 1 ? 's' : ''})</span>
            </label>
            <div className={`max-h-40 overflow-y-auto border rounded-xl bg-bg p-1 ${errors.classIds ? 'border-danger' : 'border-border'}`}>
              {classes.map((c) => {
                const checked = form.classIds.includes(c.id)
                return (
                  <button type="button" key={c.id} onClick={() => toggleArray('classIds', c.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${checked ? 'bg-primary/10 text-primary font-medium' : 'text-text-primary hover:bg-bg/80'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
                      {checked && <span className="text-white text-[10px] font-bold">&#10003;</span>}
                    </div>
                    {c.name} - {c.fullName}
                  </button>
                )
              })}
            </div>
            {errors.classIds && <p className="text-xs text-danger">{errors.classIds}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">
              Matières <span className="text-text-muted font-normal">({form.subjectIds.length} sélectionnée{form.subjectIds.length > 1 ? 's' : ''})</span>
            </label>
            <div className={`max-h-40 overflow-y-auto border rounded-xl bg-bg p-1 ${errors.subjectIds ? 'border-danger' : 'border-border'}`}>
              {subjects.map((s) => {
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
            <label className="block text-sm font-medium text-text-primary">Année scolaire</label>
            <select name="schoolYear" value={form.schoolYear} onChange={(e) => setForm((p) => ({ ...p, schoolYear: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 shadow-btn">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {mutation.isPending ? 'Création...' : `Affecter (${form.classIds.length * form.subjectIds.length || 0})`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function DeleteConfirmModal({ id, onClose, mutation }) {
  const handleDelete = async () => {
    try { await mutation.mutateAsync(id); onClose() }
    catch (err) { console.error(err) }
  }
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-danger" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cette affectation ?</h2>
        <p className="text-sm text-text-muted mb-6">L'enseignant ne sera plus assigné à cette classe pour cette matière.</p>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">Annuler</button>
          <button onClick={handleDelete} disabled={mutation.isPending} className="flex-1 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />} Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AssignmentCreatedModal({ assignment, onClose }) {
  const created = assignment?.created || (assignment ? [assignment] : [])
  const errors = assignment?.errors || []
  const teacherName = created[0]?.teacherName || ''
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
          <BookCheck size={28} className="text-success" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Affectation{created.length > 1 ? 's' : ''} créée{created.length > 1 ? 's' : ''}</h2>
        <p className="text-sm text-text-muted mb-4">
          {created.length} affectation{created.length > 1 ? 's' : ''} pour <strong className="text-text-primary">{teacherName}</strong>
        </p>
        {errors.length > 0 && (
          <div className="bg-danger/5 border border-danger/20 text-danger text-xs rounded-xl px-3 py-2 mb-4">
            {errors.length} échec{errors.length > 1 ? 's' : ''} (doublons ignorés)
          </div>
        )}
        <button onClick={onClose} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
