import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudents, useStudent, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../../hooks/useStudents'
import { Plus, Search, X, AlertCircle, Loader2, UserPlus, Pencil, Trash2, ChevronRight, Mail, Phone, Check, Copy } from 'lucide-react'

export default function MobileStudents() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading, error } = useStudents({ page, pageSize: 50, search })
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()
  const deleteMutation = useDeleteStudent()

  const students = data?.data || []
  const meta = data?.meta || { total: 0, page: 1, pageSize: 50 }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Élèves</h1>
          <p className="text-xs text-text-muted mt-0.5">{meta.total} élève{meta.total > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditId(null); setShowForm(true) }}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-btn active:scale-95 transition-all"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Rechercher un élève..."
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
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
      ) : students.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">{search ? 'Aucun résultat' : 'Aucun élève'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{s.lastName} {s.firstName}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      s.gender === 'M' ? 'text-primary bg-primary/5' : 'text-purple bg-purple/5'
                    }`}>
                      {s.gender === 'M' ? 'M' : 'F'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-primary mt-0.5">{s.studentCode}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                    <span>{s.className || '—'}</span>
                    {s.parentName && <span>{s.parentName}</span>}
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

          {meta.total > meta.pageSize && (
            <div className="flex items-center justify-between px-2 py-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm font-medium text-primary disabled:opacity-30"
              >
                Précédent
              </button>
              <span className="text-xs text-text-muted">Page {page}/{Math.ceil(meta.total / meta.pageSize)}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(meta.total / meta.pageSize)}
                className="text-sm font-medium text-primary disabled:opacity-30"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <StudentFormSheet
            editId={editId}
            onClose={() => { setShowForm(false); setEditId(null) }}
            createMutation={createMutation}
            updateMutation={updateMutation}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StudentFormSheet({ editId, onClose, createMutation, updateMutation }) {
  const { data: studentData, isLoading: loadingStudent } = useStudent(editId)
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'M',
    parentName: '', parentPhone: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (studentData) {
      setForm({
        firstName: studentData.firstName || '',
        lastName: studentData.lastName || '',
        gender: studentData.gender || 'M',
        parentName: studentData.parentName || '',
        parentPhone: studentData.parentPhone || '',
      })
    }
  }, [studentData])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
    if (!form.lastName.trim()) errs.lastName = 'Nom requis'
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} un élève</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-bg text-text-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.submit && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
              <span className="text-sm text-danger">{errors.submit}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nom</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dupont"
              className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.lastName ? 'border-danger' : 'border-border'}`} />
            {errors.lastName && <p className="text-xs text-danger">{errors.lastName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Prénom</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jean"
              className={`w-full px-4 py-3 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.firstName ? 'border-danger' : 'border-border'}`} />
            {errors.firstName && <p className="text-xs text-danger">{errors.firstName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Genre</label>
            <select name="gender" value={form.gender} onChange={handleChange}
              className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Parent / Tuteur</label>
            <input name="parentName" value={form.parentName} onChange={handleChange} placeholder="Nom du parent"
              className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Téléphone parent</label>
            <input name="parentPhone" value={form.parentPhone} onChange={handleChange} placeholder="+237 6XX XXX XXX"
              className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
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
