import { motion } from 'framer-motion'
import { AlertTriangle, Clock, FileWarning, Database, X, CheckCircle } from 'lucide-react'

const alertIcons = { period_closing: Clock, missing_grades: FileWarning, report_pending: AlertTriangle, backup: Database }

export default function AlertsSection({ alerts }) {
  if (!alerts || alerts.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-3xl p-4 lg:p-6 card-hover-effect">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Alertes intelligentes</h3>
          <p className="text-xs text-text-muted">Points d'attention importants</p>
        </div>
        {alerts.some(a => a.severity === 'high') && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger">
            {alerts.filter(a => a.severity === 'high').length} critique{alerts.filter(a => a.severity === 'high').length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = alertIcons[alert.type] || AlertTriangle
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="group relative flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-sm"
              style={{ background: `${alert.bg}60` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: alert.bg }}>
                <Icon size={18} style={{ color: alert.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{alert.title}</p>
                  {alert.severity === 'high' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-danger/10 text-danger">URGENT</span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{alert.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
