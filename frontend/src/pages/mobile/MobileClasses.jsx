import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClasses, useClass, useCreateClass, useUpdateClass, useDeleteClass } from '../../hooks/useClasses'
import { Plus, Search, X, AlertCircle, Loader2, Layers, GraduationCap, Pencil, Trash2, ChevronRight } from 'lucide-react'

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

export default function MobileClasses() {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: classes, isLoading, error } = useClasses()
  const createMutation = useCreateClass()
  const updateMutation = useUpdateClass()
  const deleteMutation = useDeleteClass()

  const classList = (classes || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Classes</h1>
          <p className="text-xs text-text-muted mt-0.5">{classList.length} classe{classList.length > 1 ? 's' : ''}</p>
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
      ) : classList.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">Aucune classe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {classList.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${streamColors[c.stream] || 'bg-bg text-text-muted'}`}>
                      <GraduationCap size={10} />
                      {streams[c.stream] || c.stream}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{c.fullName}</p>
                </div>
                <button
                  onClick={() => { setEditId(c.id); setShowForm(true) }}
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
          <ClassFormSheet
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

function ClassFormSheet({ editId, onClose, createMutation, updateMutation }) {
  const { data: classData, isLoading: loadingClass } = useClass(editId)
  const [form, setForm] = useState({
    name: '', level: '', stream: 'general_francophone', fullName: '', order: 1,
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

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nom requis'
    if (!form.level.trim()) errs.level = 'Niveau requis'
    if (!form.fullName.trim()) errs.fullName = 'Nom complet requis'
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
          <h2 className="text-base font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} une classe</h2>
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
              <label className="text-sm font-medium text-text-primary">Nom court</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="6e A"
                className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.name ? 'border-danger' : 'border-border'}`} />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Niveau</label>
              <select name="level" value={form.level} onChange={handleChange}
                className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">...</option>
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
            <label className="text-sm font-medium text-text-primary">Nom complet</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="6ème A - Francophone"
              className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.fullName ? 'border-danger' : 'border-border'}`} />
            {errors.fullName && <p className="text-xs text-danger">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Filière</label>
              <select name="stream" value={form.stream} onChange={handleChange}
                className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="general_francophone">Francophone</option>
                <option value="anglophone">Anglophone</option>
                <option value="technique">Technique</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Ordre</label>
              <input name="order" type="number" min="1" value={form.order} onChange={handleChange}
                className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.order ? 'border-danger' : 'border-border'}`} />
              {errors.order && <p className="text-xs text-danger">{errors.order}</p>}
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
          <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cette classe ?</h2>
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
