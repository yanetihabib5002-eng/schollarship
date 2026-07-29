import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubjects, useSubject, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../../hooks/useSubjects'
import { Plus, Pencil, Trash2, X, AlertCircle, Loader2, BookOpen, Hash, GraduationCap, Scale } from 'lucide-react'

const streams = {
  general_francophone: 'Francophone',
  anglophone: 'Anglophone',
  technique: 'Technique',
  all: 'Toutes filières',
}

const streamColors = {
  general_francophone: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  anglophone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  technique: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  all: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function SubjectsPage() {
  const [modal, setModal] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [createdSubject, setCreatedSubject] = useState(null)

  const { data: subjects, isLoading, error } = useSubjects()
  const createMutation = useCreateSubject()
  const updateMutation = useUpdateSubject()
  const deleteMutation = useDeleteSubject()

  const openCreate = () => { setEditId(null); setModal('form') }
  const openEdit = (id) => { setEditId(id); setModal('form') }
  const closeModal = () => { setModal(null); setEditId(null) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Matières</h1>
          <p className="text-sm text-text-muted mt-1">
            {subjects?.length || 0} matière{(subjects?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-btn active:scale-[0.98]">
          <Plus size={16} /> Ajouter
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
      ) : !subjects || subjects.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">Aucune matière pour le moment</p>
          <button onClick={openCreate} className="mt-4 text-primary text-sm font-medium hover:underline">Ajouter une matière</button>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {subjects.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      <span className="font-mono text-primary">{s.code}</span> — {s.name}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${streamColors[s.stream] || 'bg-bg text-text-muted'}`}>
                    <GraduationCap size={12} />
                    {streams[s.stream] || s.stream}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  Coefficient : <span className="font-semibold text-text-primary">{s.defaultCoefficient}</span>
                </div>
                <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-border/50">
                  <button onClick={() => openEdit(s.id)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
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
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Code</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Matière</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Coefficient</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Filière</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subjects.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-semibold text-primary">{s.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text-primary">{s.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                          <Scale size={14} /> {s.defaultCoefficient}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${streamColors[s.stream] || 'bg-bg text-text-muted'}`}>
                          <GraduationCap size={12} />
                          {streams[s.stream] || s.stream}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s.id)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
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
        {modal === 'form' && (
          <SubjectFormModal
            editId={editId}
            onClose={closeModal}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onCreated={(subj) => setCreatedSubject(subj)}
          />
        )}
        {deleteId && (
          <DeleteConfirmModal
            id={deleteId}
            onClose={() => setDeleteId(null)}
            mutation={deleteMutation}
          />
        )}
        {createdSubject && (
          <SubjectCreatedModal
            subject={createdSubject}
            onClose={() => setCreatedSubject(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SubjectFormModal({ editId, onClose, createMutation, updateMutation, onCreated }) {
  const { data: subjectData, isLoading: loadingSubject } = useSubject(editId)
  const [form, setForm] = useState({
    name: '',
    code: '',
    defaultCoefficient: 1,
    stream: 'general_francophone',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (subjectData) {
      setForm({
        name: subjectData.name || '',
        code: subjectData.code || '',
        defaultCoefficient: subjectData.defaultCoefficient || 1,
        stream: subjectData.stream || 'general_francophone',
      })
    }
  }, [subjectData])

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nom requis'
    if (!form.code.trim()) errs.code = 'Code requis'
    if (!form.defaultCoefficient || form.defaultCoefficient < 1) errs.defaultCoefficient = 'Coefficient >= 1'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...form })
        onClose()
      } else {
        const result = await createMutation.mutateAsync(form)
        onCreated?.(result)
        onClose()
      }
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
        {loadingSubject && editId ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
        <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} une matière</h2>
            <p className="text-sm text-text-muted mt-0.5">
              {editId ? 'Modifier les informations' : 'Nouvelle matière dans le système'}
            </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Nom</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Mathématiques"
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.name ? 'border-danger' : 'border-border'}`} />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Code</label>
              <input name="code" value={form.code} onChange={handleChange} placeholder="MATH"
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.code ? 'border-danger' : 'border-border'}`} />
              {errors.code && <p className="text-xs text-danger">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Coefficient par défaut</label>
              <input name="defaultCoefficient" type="number" min="1" value={form.defaultCoefficient} onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.defaultCoefficient ? 'border-danger' : 'border-border'}`} />
              {errors.defaultCoefficient && <p className="text-xs text-danger">{errors.defaultCoefficient}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Filière</label>
              <select name="stream" value={form.stream} onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="general_francophone">Francophone</option>
                <option value="anglophone">Anglophone</option>
                <option value="technique">Technique</option>
                <option value="all">Toutes filières</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
              Annuler
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 shadow-btn">
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {editId ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
        </>
        )}
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
        <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cette matière ?</h2>
        <p className="text-sm text-text-muted mb-6">Cette action est irréversible. Les notes liées ne seront pas supprimées.</p>
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

function SubjectCreatedModal({ subject, onClose }) {
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
          <BookOpen size={28} className="text-success" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Matière créée</h2>
        <p className="text-sm text-text-muted mb-5">
          <span className="font-semibold text-text-primary">{subject.name}</span>
        </p>
        <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left text-sm text-text-muted">
          <p>Code : <strong className="text-text-primary font-mono">{subject.code}</strong></p>
          <p>Coefficient : <strong className="text-text-primary">{subject.defaultCoefficient}</strong></p>
          <p>Filière : <strong className="text-text-primary">{streams[subject.stream] || subject.stream}</strong></p>
        </div>
        <button onClick={onClose} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
