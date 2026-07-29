import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubjects, useSubject, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../../hooks/useSubjects'
import { Plus, X, AlertCircle, Loader2, BookOpen, GraduationCap, Scale, Pencil, Trash2, ChevronRight } from 'lucide-react'

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

export default function MobileSubjects() {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: subjects, isLoading, error } = useSubjects()
  const createMutation = useCreateSubject()
  const updateMutation = useUpdateSubject()
  const deleteMutation = useDeleteSubject()

  const subjectList = subjects || []

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Matières</h1>
          <p className="text-xs text-text-muted mt-0.5">{subjectList.length} matière{subjectList.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditId(null); setShowForm(true) }}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-btn active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
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
      ) : subjectList.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">Aucune matière</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjectList.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary">{s.code}</span>
                    <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Scale size={10} /> Coef: {s.defaultCoefficient}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${streamColors[s.stream] || 'bg-bg text-text-muted'}`}>
                      <GraduationCap size={10} />
                      {streams[s.stream] || s.stream}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setEditId(s.id); setShowForm(true) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <SubjectFormSheet
            editId={editId}
            onClose={() => { setShowForm(false); setEditId(null) }}
            createMutation={createMutation}
            updateMutation={updateMutation}
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

function SubjectFormSheet({ editId, onClose, createMutation, updateMutation }) {
  const { data: subjectData, isLoading: loadingSubject } = useSubject(editId)
  const [form, setForm] = useState({
    name: '', code: '', defaultCoefficient: 1, stream: 'general_francophone',
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

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
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
      } else {
        await createMutation.mutateAsync(form)
      }
      onClose()
    } catch (err) {
      setErrors({ submit: err.response?.data?.error?.message || err.message })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

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
          <h2 className="text-base font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} une matière</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-bg text-text-muted"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.submit && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
              <span className="text-sm text-danger">{errors.submit}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nom</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Mathématiques"
                className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.name ? 'border-danger' : 'border-border'}`} />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Code</label>
              <input name="code" value={form.code} onChange={handleChange} placeholder="MATH"
                className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.code ? 'border-danger' : 'border-border'}`} />
              {errors.code && <p className="text-xs text-danger">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Coefficient</label>
              <input name="defaultCoefficient" type="number" min="1" value={form.defaultCoefficient} onChange={handleChange}
                className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.defaultCoefficient ? 'border-danger' : 'border-border'}`} />
              {errors.defaultCoefficient && <p className="text-xs text-danger">{errors.defaultCoefficient}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Filière</label>
              <select name="stream" value={form.stream} onChange={handleChange}
                className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="general_francophone">Francophone</option>
                <option value="anglophone">Anglophone</option>
                <option value="technique">Technique</option>
                <option value="all">Toutes filières</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isPending}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-btn active:scale-[0.98]">
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {editId ? 'Enregistrer' : 'Ajouter'}
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
          <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cette matière ?</h2>
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
