import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'
import { Loader2, Save, AlertCircle, CheckCircle2, School, MapPin, Phone, Mail, User, Building } from 'lucide-react'

export default function SettingsPage() {
  const { data: settings, isLoading, error } = useSettings()
  const updateMutation = useUpdateSettings()

  const [form, setForm] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolLogo: '',
    principalName: '',
    principalTitle: '',
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
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form)
    } catch (err) {
      console.error(err)
    }
  }

  const fields = [
    { key: 'schoolName', label: "Nom de l'école", icon: School, placeholder: 'Ex: École Nationale Supérieure' },
    { key: 'schoolAddress', label: 'Adresse', icon: MapPin, placeholder: 'Ex: 123 Avenue de la République' },
    { key: 'schoolPhone', label: 'Téléphone', icon: Phone, placeholder: 'Ex: +225 01 02 03 04 05' },
    { key: 'schoolEmail', label: 'Email', icon: Mail, placeholder: 'Ex: contact@ecole.ci' },
    { key: 'principalName', label: 'Nom du Directeur', icon: User, placeholder: 'Ex: Dr. Kouamé Jean' },
    { key: 'principalTitle', label: 'Titre du Directeur', icon: Building, placeholder: 'Ex: Directeur Général' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 text-danger rounded-2xl p-5">
        <AlertCircle size={20} />
        <div>
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm opacity-80">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Paramètres</h1>
          <p className="text-sm text-text-muted mt-1">Configuration générale de l'établissement</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-btn active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Enregistrer
        </button>
      </div>

      {updateMutation.isSuccess && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success rounded-2xl p-4 mb-6">
          <CheckCircle2 size={20} />
          <p className="font-medium">Paramètres enregistrés avec succès</p>
        </div>
      )}

      {updateMutation.isError && (
        <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 text-danger rounded-2xl p-4 mb-6">
          <AlertCircle size={20} />
          <p className="font-medium">{updateMutation.error?.message || 'Erreur lors de l\'enregistrement'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="bg-surface rounded-2xl border border-border p-4 lg:p-5">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Icon size={16} className="inline mr-1.5 text-primary" />
              {label}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={handleChange(key)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 bg-surface rounded-2xl border border-border p-4 lg:p-5">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          <Mail size={16} className="inline mr-1.5 text-primary" />
          Logo de l'école (URL)
        </label>
        <input
          type="text"
          value={form.schoolLogo}
          onChange={handleChange('schoolLogo')}
          placeholder="Ex: https://ecole.ci/logo.png"
          className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
    </motion.div>
  )
}
