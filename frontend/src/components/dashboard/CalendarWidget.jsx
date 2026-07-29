import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Edit, Users } from 'lucide-react'

const iconMap = { CheckCircle, Edit, Calendar, Clock, Users }

export default function CalendarWidget({ calendar }) {
  if (!calendar || calendar.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-4 lg:p-6">
        <p className="text-text-muted text-sm">Aucun événement</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-4 lg:p-6 card-hover-effect">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Calendrier scolaire</h3>
          <p className="text-xs text-text-muted">Périodes et événements</p>
        </div>
        <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Tout voir</span>
      </div>

      <div className="space-y-3">
        {calendar.map((event, i) => {
          const Icon = iconMap[event.icon] || Calendar
          return (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-bg transition-all duration-200 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-border bg-card">
                <span className="text-[10px] font-semibold text-text-muted uppercase">{event.month || ''}</span>
                <span className="text-lg font-bold text-text-primary">{event.monthDay || '—'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{event.label}</p>
                <p className="text-xs text-text-muted capitalize">{event.type}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: event.bg }}>
                <Icon size={16} style={{ color: event.color }} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
