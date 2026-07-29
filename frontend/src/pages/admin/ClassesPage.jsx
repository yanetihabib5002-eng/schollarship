import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClasses, useClass, useCreateClass, useUpdateClass, useDeleteClass } from '../../hooks/useClasses'
import { Plus, Pencil, Trash2, X, AlertCircle, Loader2, ChevronLeft, ChevronRight, Layers, GraduationCap, Hash } from 'lucide-react'

const streams = {
  general_francophone: 'Francophone',
  anglophone: 'Anglophone',
  technique: 'Technique',
}

const streamColors = {
  general_francophone: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  anglophone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  technique: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function ClassesPage() {
  const [modal, setModal] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [createdClass, setCreatedClass] = useState(null)

  const { data: classes, isLoading, error } = useClasses()
  const createMutation = useCreateClass()
  const updateMutation = useUpdateClass()
  const deleteMutation = useDeleteClass()

  const openCreate = () => { setEditId(null); setModal('form') }
  const openEdit = (id) => { setEditId(id); setModal('form') }
  const closeModal = () => { setModal(null); setEditId(null) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Classes</h1>
          <p className="text-sm text-text-muted mt-1">
            {classes?.length || 0} classe{(classes?.length || 0) > 1 ? 's' : ''}
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
      ) : !classes || classes.length === 0 ? (
        <div className="text-center py-20">
          <Layers size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">Aucune classe pour le moment</p>
          <button onClick={openCreate} className="mt-4 text-primary text-sm font-medium hover:underline">Ajouter une classe</button>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {classes
              .slice()
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-muted">Ordre {c.order}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${streamColors[c.stream] || 'bg-bg text-text-muted'}`}>
                    <GraduationCap size={12} />
                    {streams[c.stream] || c.stream}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
                  <button onClick={() => openEdit(c.id)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
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
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Ordre</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Nom</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Nom complet</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Niveau</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Filière</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {classes
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-text-muted">{c.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-text-primary">{c.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-muted">{c.fullName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-primary">{c.level}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${streamColors[c.stream] || 'bg-bg text-text-muted'}`}>
                          <GraduationCap size={12} />
                          {streams[c.stream] || c.stream}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(c.id)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
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
          <ClassFormModal
            editId={editId}
            onClose={closeModal}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onCreated={(cls) => setCreatedClass(cls)}
          />
        )}
        {deleteId && (
          <DeleteConfirmModal
            id={deleteId}
            onClose={() => setDeleteId(null)}
            mutation={deleteMutation}
          />
        )}
        {createdClass && (
          <ClassCreatedModal
            cls={createdClass}
            onClose={() => setCreatedClass(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ClassFormModal({ editId, onClose, createMutation, updateMutation, onCreated }) {
  const { data: classData, isLoading: loadingClass } = useClass(editId)
  const [form, setForm] = useState({
    name: '',
    level: '',
    stream: 'general_francophone',
    fullName: '',
    order: 1,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (classData) {
      setForm({
        name: classData.name || '',
        level: classData.level || '',
        stream: classData.stream || 'general_francophone',
        fullName: classData.fullName || '',
        order: classData.order || 1,
      })
    }
  }, [classData])

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
    if (!form.level.trim()) errs.level = 'Niveau requis'
    if (!form.fullName.trim()) errs.fullName = 'Nom complet requis'
    if (!form.order || form.order < 1) errs.order = 'Ordre valide requis'
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
        {loadingClass && editId ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
        <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} une classe</h2>
            <p className="text-sm text-text-muted mt-0.5">
              {editId ? 'Modifier les informations' : 'Nouvelle classe dans le système'}
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
              <label className="block text-sm font-medium text-text-primary">Nom court</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="6e A"
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.name ? 'border-danger' : 'border-border'}`} />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Niveau</label>
              <select name="level" value={form.level} onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Sélectionner...</option>
                <option value="6e">6e</option>
                <option value="5e">5e</option>
                <option value="4e">4e</option>
                <option value="3e">3e</option>
                <option value="2nde">2nde</option>
                <option value="1ere">1ère</option>
                <option value="Tle">Tle</option>
              </select>
              {errors.level && <p className="text-xs text-danger">{errors.level}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Nom complet</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="6ème A - Francophone"
              className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.fullName ? 'border-danger' : 'border-border'}`} />
            {errors.fullName && <p className="text-xs text-danger">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Filière</label>
              <select name="stream" value={form.stream} onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="general_francophone">Francophone</option>
                <option value="anglophone">Anglophone</option>
                <option value="technique">Technique</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Ordre</label>
              <input name="order" type="number" min="1" value={form.order} onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.order ? 'border-danger' : 'border-border'}`} />
              {errors.order && <p className="text-xs text-danger">{errors.order}</p>}
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
        <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cette classe ?</h2>
        <p className="text-sm text-text-muted mb-6">Cette action est irréversible. Les élèves liés ne seront pas supprimés.</p>
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

function ClassCreatedModal({ cls, onClose }) {
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
          <Layers size={28} className="text-success" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Classe créée</h2>
        <p className="text-sm text-text-muted mb-5">
          <span className="font-semibold text-text-primary">{cls.fullName || cls.name}</span>
        </p>
        <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left text-sm text-text-muted">
          <p>Niveau : <strong className="text-text-primary">{cls.level}</strong></p>
          <p>Filière : <strong className="text-text-primary">{streams[cls.stream] || cls.stream}</strong></p>
          <p>Ordre : <strong className="text-text-primary">{cls.order}</strong></p>
        </div>
        <button onClick={onClose} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
