import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'
import { Loader2, Save, AlertCircle, CheckCircle2, School, MapPin, Phone, Mail, User, Building } from 'lucide-react'

export default function MobileSettings() {
  const { data: settings, isLoading, error } = useSettings()
  const updateMutation = useUpdateSettings()

  const [form, setForm] = useState({
    schoolName: '', schoolAddress: '', schoolPhone: '', schoolEmail: '',
    schoolLogo: '', principalName: '', principalTitle: '',
  })

  useEffect(() => {
    if (settings) {
      setForm({
        schoolName: settings.schoolName || '',
        schoolAddress: settings.schoolAddress || '',
        schoolPhone: settings.schoolPhone || '',
        schoolEmail: settings.schoolEmail || '',
        schoolLogo: settings.schoolLogo || '',
        principalName: settings.principalName || '',
        principalTitle: settings.principalTitle || '',
      })
    }
  }, [settings])

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    try { await updateMutation.mutateAsync(form) }
    catch (err) { console.error(err) }
  }

  const fields = [
    { key: 'schoolName', label: "Nom de l'école", icon: School, placeholder: 'École Nationale' },
    { key: 'schoolAddress', label: 'Adresse', icon: MapPin, placeholder: '123 Avenue' },
    { key: 'schoolPhone', label: 'Téléphone', icon: Phone, placeholder: '+225 01 02 03 04' },
    { key: 'schoolEmail', label: 'Email', icon: Mail, placeholder: 'contact@ecole.ci' },
    { key: 'principalName', label: 'Nom du Directeur', icon: User, placeholder: 'Dr. Kouamé Jean' },
    { key: 'principalTitle', label: 'Titre du Directeur', icon: Building, placeholder: 'Directeur Général' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 text-danger rounded-2xl p-4 m-4">
        <AlertCircle size={18} />
        <div>
          <p className="font-medium text-sm">Erreur</p>
          <p className="text-xs opacity-80">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Paramètres</h1>
          <p className="text-xs text-text-muted mt-0.5">Configuration de l'établissement</p>
        </div>
        <button onClick={handleSave} disabled={updateMutation.isPending}
          className="h-10 px-4 flex items-center gap-1.5 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-hover transition-all disabled:opacity-50 shadow-btn">
          {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer
        </button>
      </div>

      {updateMutation.isSuccess && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success rounded-xl px-4 py-3 mb-4 text-xs">
          <CheckCircle2 size={14} /> Paramètres enregistrés
        </div>
      )}
      {updateMutation.isError && (
        <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 text-danger rounded-xl px-4 py-3 mb-4 text-xs">
          <AlertCircle size={14} /> {updateMutation.error?.message || 'Erreur'}
        </div>
      )}

      <div className="space-y-3">
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="bg-card border border-border rounded-2xl p-4">
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              <Icon size={14} className="inline mr-1 text-primary" />
              {label}
            </label>
            <input type="text" value={form[key]} onChange={handleChange(key)} placeholder={placeholder}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        ))}
        <div className="bg-card border border-border rounded-2xl p-4">
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            <Mail size={14} className="inline mr-1 text-primary" />
            Logo (URL)
          </label>
          <input type="text" value={form.schoolLogo} onChange={handleChange('schoolLogo')} placeholder="https://ecole.ci/logo.png"
            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
      </div>
    </div>
  )
}
