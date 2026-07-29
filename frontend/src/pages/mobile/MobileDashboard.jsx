import { motion } from 'framer-motion'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import {
  Loader2, Users, GraduationCap, BookOpen, TrendingUp,
  Bell, Activity, School, ArrowRight, UserPlus, ClipboardList,
  FileText, BarChart3, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, Zap
} from 'lucide-react'

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function MobileDashboard() {
  const { overview, activities, alerts, loading, error } = useDashboard()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
        <p className="text-sm text-text-muted">Chargement du tableau de bord...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <p className="text-danger font-semibold mb-1 text-center">Erreur de chargement</p>
        <p className="text-sm text-text-muted text-center">{error.message}</p>
      </div>
    )
  }

  const stats = [
    { label: 'Élèves', value: overview?.totalStudents || 0, icon: GraduationCap, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Enseignants', value: overview?.totalTeachers || 0, icon: Users, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Classes', value: overview?.totalClasses || 0, icon: BookOpen, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Moy. générale', value: overview?.overallAverage ? overview.overallAverage.toFixed(1) : '—', icon: TrendingUp, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
  ]

  const quickActions = [
    { label: 'Ajouter élève', icon: UserPlus, path: '/admin/students', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Saisir notes', icon: ClipboardList, path: '/admin/grades', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Bulletins', icon: FileText, path: '/admin/report-cards', color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Statistiques', icon: BarChart3, path: '/admin/statistics', color: 'text-emerald-500 bg-emerald-500/10' },
  ]

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const highAlerts = alerts?.filter(a => a.severity === 'high')?.length || 0

  return (
    <motion.div className="pb-2" {...stagger}>
      <motion.div {...fadeUp} className="relative overflow-hidden bg-gradient-to-br from-[#3B6FF6] to-[#2952CC] px-5 pt-6 pb-8 mx-4 mt-4 rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-medium mb-1">{dateStr}</p>
          <h1 className="text-xl font-bold text-white mb-1">
            {greeting}, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-white/50 text-xs">Bienvenue sur votre tableau de bord</p>
        </div>
        {highAlerts > 0 && (
          <div className="relative z-10 mt-4 flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
            <AlertTriangle size={16} className="text-yellow-300 flex-shrink-0" />
            <p className="text-white text-xs font-medium">
              {highAlerts} alerte{highAlerts > 1 ? 's' : ''} critique{highAlerts > 1 ? 's' : ''} à traiter
            </p>
          </div>
        )}
      </motion.div>

      <motion.div {...fadeUp} className="grid grid-cols-2 gap-3 px-4 mt-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bg} rounded-full -translate-y-1/3 translate-x-1/3`} />
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 relative`}>
                <Icon size={18} className={`text-${stat.color.split(' ')[0].replace('from-', '').replace('-500', '')}`} />
              </div>
              <p className="text-xl font-bold text-text-primary relative">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5 relative">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div {...fadeUp} className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text-primary">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1.5 p-3 bg-card border border-border rounded-2xl active:scale-95 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-medium text-text-muted text-center leading-tight">{action.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {alerts && alerts.length > 0 && (
        <motion.div {...fadeUp} className="px-4 mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-danger/10 flex items-center justify-center">
                  <Bell size={12} className="text-danger" />
                </div>
                <span className="text-sm font-semibold text-text-primary">Alertes</span>
              </div>
              {highAlerts > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/10 text-danger">
                  {highAlerts} critique{highAlerts > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="divide-y divide-border">
              {alerts.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'high' ? 'bg-danger/10' : 'bg-amber-500/10'
                  }`}>
                    {alert.severity === 'high'
                      ? <AlertTriangle size={12} className="text-danger" />
                      : <Bell size={12} className="text-amber-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary">{alert.title}</p>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">{alert.description}</p>
                  </div>
                  {alert.severity === 'high' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/10 text-danger flex-shrink-0 self-center">!</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activities && activities.length > 0 && (
        <motion.div {...fadeUp} className="px-4 mt-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity size={15} className="text-primary" />
                </div>
                <span className="text-base font-bold text-text-primary">Activités</span>
              </div>
              <span className="text-xs text-text-muted font-medium">{activities.length} événement{activities.length > 1 ? 's' : ''}</span>
            </div>
            <div className="relative pl-5 border-l-2 border-border space-y-5 max-h-64 overflow-y-auto">
              {activities.slice(0, 10).map((act, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                  <p className="text-sm font-semibold text-text-primary">{act.description || act.title}</p>
                  <p className="text-xs text-text-muted mt-1">{act.date || act.time || ''}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {(!activities || activities.length === 0) && (!alerts || alerts.length === 0) && (
        <motion.div {...fadeUp} className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <School size={28} className="text-primary/40" />
          </div>
          <p className="text-sm text-text-muted">Bienvenue sur votre espace de gestion</p>
          <p className="text-xs text-text-muted/60 mt-1">Commencez par ajouter des élèves et des classes</p>
        </motion.div>
      )}

      <div className="h-4" />
    </motion.div>
  )
}
