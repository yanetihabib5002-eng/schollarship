import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus, GraduationCap, School, BookOpen, FileText, CheckSquare,
  FileDown, FileSpreadsheet, Database
} from 'lucide-react'

const actions = [
  { label: 'Ajouter un enseignant', icon: UserPlus, path: '/admin/teachers', color: '#2563EB', gradient: 'from-primary to-primary/80' },
  { label: 'Ajouter un élève', icon: GraduationCap, path: '/admin/students', color: '#8B5CF6', gradient: 'from-purple to-purple/80' },
  { label: 'Ajouter une classe', icon: School, path: '/admin/classes', color: '#22C55E', gradient: 'from-success to-success/80' },
  { label: 'Ajouter une matière', icon: BookOpen, path: '/admin/subjects', color: '#F59E0B', gradient: 'from-warning to-warning/80' },
  { label: 'Générer les bulletins', icon: FileText, path: '/admin/report-cards', color: '#3B82F6', gradient: 'from-secondary to-secondary/80' },
  { label: 'Valider les notes', icon: CheckSquare, path: '/admin/grades/validation', color: '#EF4444', gradient: 'from-danger to-danger/80' },
  { label: 'Export PDF', icon: FileDown, path: '#', color: '#020617', gradient: 'from-dark to-dark/80' },
  { label: 'Export Excel', icon: FileSpreadsheet, path: '#', color: '#22C55E', gradient: 'from-green-600 to-green-500' },
  { label: 'Sauvegarder', icon: Database, path: '/admin/backup', color: '#64748B', gradient: 'from-slate-500 to-slate-400' },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="bg-card border border-border rounded-3xl p-4 lg:p-6 card-hover-effect">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Actions rapides</h3>
          <p className="text-xs text-text-muted">Tâches fréquentes en un clic</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.03 * i }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <action.icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-medium text-white leading-tight">{action.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
