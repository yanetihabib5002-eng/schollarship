import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeachers, useTeacher, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, useToggleTeacherActive } from '../../hooks/useTeachers'
import { Plus, Search, X, AlertCircle, Loader2, UserPlus, ChevronRight, Mail, Phone, Pencil, Trash2, ToggleLeft, ToggleRight, Check, Copy } from 'lucide-react'

export default function MobileTeachers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [createdTeacher, setCreatedTeacher] = useState(null)

  const { data, isLoading, error } = useTeachers({ page, pageSize: 50, search })
  const createMutation = useCreateTeacher()
  const updateMutation = useUpdateTeacher()
  const deleteMutation = useDeleteTeacher()
  const toggleMutation = useToggleTeacherActive()

  const teachers = data?.data || []
  const meta = data?.meta || { total: 0, page: 1, pageSize: 50 }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Enseignants</h1>
          <p className="text-xs text-text-muted mt-0.5">{meta.total} enseignant{meta.total > 1 ? 's' : ''}</p>
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
          placeholder="Rechercher un enseignant..."
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
      ) : teachers.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus size={36} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">{search ? 'Aucun résultat' : 'Aucun enseignant'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {teachers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{t.lastName} {t.firstName}</p>
                    <button
                      onClick={() => toggleMutation.mutate(t.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                        t.isActive !== false
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {t.isActive !== false ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-primary mt-0.5">{t.matricule}</p>
                </div>
                <button
                  onClick={() => { setEditId(t.id); setShowForm(true) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                {t.email && <span className="flex items-center gap-1"><Mail size={12} />{t.email}</span>}
                {t.phone && <span className="flex items-center gap-1"><Phone size={12} />{t.phone}</span>}
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
          <TeacherFormSheet
            editId={editId}
            onClose={() => { setShowForm(false); setEditId(null) }}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onCreated={(t) => setCreatedTeacher(t)}
          />
        )}
        {createdTeacher && (
          <TeacherCreatedSheet
            teacher={createdTeacher}
            onClose={() => setCreatedTeacher(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TeacherFormSheet({ editId, onClose, createMutation, updateMutation, onCreated }) {
  const { data: teacherData, isLoading: loadingTeacher } = useTeacher(editId)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', specialty: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (teacherData) {
      setForm({
        firstName: teacherData.firstName || '',
        lastName: teacherData.lastName || '',
        email: teacherData.email || '',
        phone: teacherData.phone || '',
        specialty: teacherData.specialty || '',
      })
    }
  }, [teacherData])

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
        const result = await createMutation.mutateAsync(form)
        onCreated?.(result)
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
          <h2 className="text-base font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} un enseignant</h2>
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
            <label className="text-sm font-medium text-text-primary">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jean.dupont@email.com"
              className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Téléphone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+237 6XX XXX XXX"
              className="w-full px-4 py-3 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Spécialité</label>
            <input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Mathématiques"
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

function TeacherCreatedSheet({ teacher, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(teacher.temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <h2 className="text-base font-bold text-text-primary">Enseignant créé</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-bg text-text-muted">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-success" />
          </div>
          <p className="text-sm text-text-muted mb-5">
            Matricule : <span className="font-mono font-semibold text-primary">{teacher.matricule}</span>
          </p>
          <div className="bg-bg border border-border rounded-xl p-4 mb-5 text-left">
            <p className="text-xs text-text-muted mb-2">Mot de passe temporaire</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono font-semibold text-text-primary break-all select-all">
                {teacher.temporaryPassword}
              </code>
              <button onClick={handleCopy} className="flex-shrink-0 p-2 rounded-lg hover:bg-border transition-all text-text-muted hover:text-primary">
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-text-muted mb-4">Transmettez ces informations à l'enseignant.</p>
          <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">
            OK
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
