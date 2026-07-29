import { motion } from 'framer-motion'
import {
  UserPlus, CheckCircle, FileText, Database, LogIn, School,
  Edit, Shield, AlertTriangle, Clock, GraduationCap, Award
} from 'lucide-react'

const actionMap = {
  LOGIN: { icon: LogIn, color: '#2563EB', bg: '#EFF6FF', label: 'Connexion' },
  LOGOUT: { icon: LogIn, color: '#64748B', bg: '#F1F5F9', label: 'Déconnexion' },
  CREATE_TEACHER: { icon: UserPlus, color: '#8B5CF6', bg: '#EDE9FE', label: 'Enseignant créé' },
  UPDATE_TEACHER: { icon: UserPlus, color: '#3B82F6', bg: '#DBEAFE', label: 'Enseignant modifié' },
  DELETE_TEACHER: { icon: UserPlus, color: '#EF4444', bg: '#FEE2E2', label: 'Enseignant supprimé' },
  CREATE_STUDENT: { icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF', label: 'Élève créé' },
  UPDATE_STUDENT: { icon: GraduationCap, color: '#3B82F6', bg: '#DBEAFE', label: 'Élève modifié' },
  DELETE_STUDENT: { icon: GraduationCap, color: '#EF4444', bg: '#FEE2E2', label: 'Élève supprimé' },
  SUBMIT_GRADES: { icon: CheckCircle, color: '#22C55E', bg: '#DCFCE7', label: 'Notes soumises' },
  VALIDATE_GRADES: { icon: CheckCircle, color: '#22C55E', bg: '#DCFCE7', label: 'Notes validées' },
  REOPEN_GRADES: { icon: Edit, color: '#F59E0B', bg: '#FEF3C7', label: 'Notes réouvertes' },
  GENERATE_REPORT_CARD: { icon: FileText, color: '#8B5CF6', bg: '#EDE9FE', label: 'Bulletin généré' },
  GENERATE_HONOR_ROLL: { icon: Award, color: '#F59E0B', bg: '#FEF3C7', label: "Tableau d'honneur" },
  OPEN_PERIOD: { icon: Clock, color: '#22C55E', bg: '#DCFCE7', label: 'Période ouverte' },
  CLOSE_PERIOD: { icon: Clock, color: '#F59E0B', bg: '#FEF3C7', label: 'Période fermée' },
  VALIDATE_PERIOD: { icon: CheckCircle, color: '#2563EB', bg: '#EFF6FF', label: 'Période validée' },
  CREATE_CLASS: { icon: School, color: '#22C55E', bg: '#DCFCE7', label: 'Classe créée' },
  CREATE_BACKUP: { icon: Database, color: '#2563EB', bg: '#EFF6FF', label: 'Sauvegarde effectuée' },
  RESTORE_BACKUP: { icon: Database, color: '#F59E0B', bg: '#FEF3C7', label: 'Restauration effectuée' },
  CHANGE_PASSWORD: { icon: Shield, color: '#3B82F6', bg: '#DBEAFE', label: 'Mot de passe changé' },
  STUDENTS_COUNT: { icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF', label: 'Total élèves' },
  CLASSES_COUNT: { icon: School, color: '#22C55E', bg: '#DCFCE7', label: 'Total classes' },
  GRADES_COUNT: { icon: CheckCircle, color: '#3B82F6', bg: '#DBEAFE', label: 'Total notes' },
}

export default function ActivitiesTimeline({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-4 lg:p-6">
        <p className="text-text-muted text-sm">Aucune activité récente</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-4 lg:p-6 card-hover-effect">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Activités récentes</h3>
          <p className="text-xs text-text-muted">Dernières actions sur la plateforme</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-border" />
        <div className="space-y-0">
          {activities.map((act, i) => {
            const cfg = actionMap[act.action] || { icon: AlertTriangle, color: '#64748B', bg: '#F1F5F9', label: act.action }
            const Icon = cfg.icon
            return (
              <motion.div
                key={act.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="relative flex items-start gap-4 pb-6 last:pb-0"
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-text-primary">{cfg.label}</p>
                  <p className="text-xs text-text-muted">
                    {act.details?.count ? `${act.details.count} élément(s)` : act.details?.name || act.details?.monthName || ''}
                  </p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0 pt-1">{act.timeAgo || 'Récemment'}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
