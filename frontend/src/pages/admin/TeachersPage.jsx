import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeachers, useTeacher, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, useToggleTeacherActive } from '../../hooks/useTeachers'
import { Plus, Search, Pencil, Trash2, X, AlertCircle, Loader2, ChevronLeft, ChevronRight, UserPlus, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react'

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [createdTeacher, setCreatedTeacher] = useState(null)

  const { data, isLoading, error } = useTeachers({ page, pageSize: 20, search })
  const createMutation = useCreateTeacher()
  const updateMutation = useUpdateTeacher()
  const deleteMutation = useDeleteTeacher()
  const toggleMutation = useToggleTeacherActive()

  const teachers = data?.data || []
  const meta = data?.meta || { total: 0, page: 1, pageSize: 20 }

  const openCreate = () => { setEditId(null); setModal('form') }
  const openEdit = (id) => { setEditId(id); setModal('form') }
  const closeModal = () => { setModal(null); setEditId(null) }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Enseignants</h1>
          <p className="text-sm text-text-muted mt-1">
            {meta.total} enseignant{meta.total > 1 ? 's' : ''} · Page {meta.page}/{Math.ceil(meta.total / meta.pageSize) || 1}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-btn active:scale-[0.98]">
          <UserPlus size={16} /> Ajouter
        </button>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom, matricule ou email..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </form>

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
      ) : teachers.length === 0 ? (
        <div className="text-center py-20">
          <UserPlus size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-sm">{search ? 'Aucun résultat pour cette recherche' : 'Aucun enseignant pour le moment'}</p>
          {!search && (
            <button onClick={openCreate} className="mt-4 text-primary text-sm font-medium hover:underline">Ajouter un enseignant</button>
          )}
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            {teachers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{t.lastName} {t.firstName}</p>
                    <p className="text-xs font-mono text-primary mt-0.5">{t.matricule}</p>
                  </div>
                  <button
                    onClick={() => toggleMutation.mutate(t.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${
                      t.isActive !== false
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {t.isActive !== false ? 'Actif' : 'Inactif'}
                  </button>
                </div>
                <div className="space-y-1 text-xs text-text-muted mb-3">
                  {t.email && <p className="truncate">📧 {t.email}</p>}
                  {t.phone && <p>📱 {t.phone}</p>}
                  {t.specialty && <p>🎓 {t.specialty}</p>}
                </div>
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
                  <button onClick={() => openEdit(t.id)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
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
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Matricule</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Nom & Prénom</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Email</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Téléphone</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Spécialité</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Statut</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teachers.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-semibold text-primary">{t.matricule}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text-primary">{t.lastName} {t.firstName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-muted">{t.email || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-muted">{t.phone || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-muted">{t.specialty || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleMutation.mutate(t.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            t.isActive !== false
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-danger/10 text-danger hover:bg-danger/20'
                          }`}
                        >
                          {t.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {t.isActive !== false ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(t.id)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.total > meta.pageSize && (
              <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-t border-border">
                <span className="text-xs text-text-muted">
                  Page {meta.page} sur {Math.ceil(meta.total / meta.pageSize)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={meta.page <= 1}
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={meta.page >= Math.ceil(meta.total / meta.pageSize)}
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── MOBILE PAGINATION ── */}
          {meta.total > meta.pageSize && (
            <div className="flex lg:hidden items-center justify-between px-4 py-3 bg-card border border-border rounded-2xl">
              <span className="text-xs text-text-muted">
                Page {meta.page} sur {Math.ceil(meta.total / meta.pageSize)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={meta.page >= Math.ceil(meta.total / meta.pageSize)}
                  className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {modal === 'form' && (
          <TeacherFormModal
            editId={editId}
            onClose={closeModal}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onCreated={(teacher) => setCreatedTeacher(teacher)}
          />
        )}
        {deleteId && (
          <DeleteConfirmModal
            id={deleteId}
            onClose={() => setDeleteId(null)}
            mutation={deleteMutation}
          />
        )}
        {createdTeacher && (
          <TeacherCreatedModal
            teacher={createdTeacher}
            onClose={() => setCreatedTeacher(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TeacherFormModal({ editId, onClose, createMutation, updateMutation, onCreated }) {
  const { data: teacherData, isLoading: loadingTeacher } = useTeacher(editId)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
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

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
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
        {loadingTeacher && editId ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
        <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{editId ? 'Modifier' : 'Ajouter'} un enseignant</h2>
            <p className="text-sm text-text-muted mt-0.5">
              {editId ? 'Modifier les informations' : 'Nouvel enseignant dans le système'}
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
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dupont"
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.lastName ? 'border-danger' : 'border-border'}`}
              />
              {errors.lastName && <p className="text-xs text-danger">{errors.lastName}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Prénom</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jean"
                className={`w-full px-3.5 py-2.5 text-sm bg-bg border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.firstName ? 'border-danger' : 'border-border'}`}
              />
              {errors.firstName && <p className="text-xs text-danger">{errors.firstName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jean.dupont@email.com"
              className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Téléphone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+237 6XX XXX XXX"
                className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Spécialité</label>
              <input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Mathématiques"
                className="w-full px-3.5 py-2.5 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 shadow-btn"
            >
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
    try {
      await mutation.mutateAsync(id)
      onClose()
    } catch (err) {
      console.error(err)
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-danger" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-2">Supprimer cet enseignant ?</h2>
        <p className="text-sm text-text-muted mb-6">Cette action est irréversible. L'enseignant sera désactivé du système.</p>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-bg border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border transition-all">
            Annuler
          </button>
          <button onClick={handleDelete} disabled={mutation.isPending} className="flex-1 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function TeacherCreatedModal({ teacher, onClose }) {
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
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl lg:rounded-3xl w-full max-w-sm p-4 lg:p-6 shadow-premium-lg text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-success" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Enseignant créé</h2>
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

        <p className="text-xs text-text-muted mb-4">Transmettez ces informations à l'enseignant. Il pourra se connecter et changer son mot de passe.</p>

        <button onClick={onClose} className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all">
          J'ai noté
        </button>
      </motion.div>
    </motion.div>
  )
}