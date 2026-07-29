import { motion } from 'framer-motion'
import { Users, GraduationCap, School, BookOpen, TrendingUp, Award } from 'lucide-react'

export default function StatisticsCards({ overview }) {
  const cards = [
    { label: 'Élèves', value: overview.totalStudents, icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Enseignants', value: overview.totalTeachers, icon: Users, color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'Classes', value: overview.totalClasses, icon: School, color: '#22C55E', bg: '#DCFCE7' },
    { label: 'Matières', value: overview.totalSubjects, icon: BookOpen, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Moyenne générale', value: overview.overallAverage, icon: TrendingUp, color: '#3B82F6', bg: '#DBEAFE', suffix: '/20' },
    { label: 'Taux de réussite', value: overview.passRate, icon: Award, color: '#EF4444', bg: '#FEE2E2', suffix: '%' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-5 mb-4 lg:mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * i }}
          className="bg-card border border-border rounded-3xl p-3 lg:p-5 card-hover-effect group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: card.bg }}>
              <card.icon size={22} style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-text-primary mb-1">
            {card.value}{card.suffix || ''}
          </p>
          <p className="text-sm text-text-muted">{card.label}</p>
          <div className="mt-3 h-1.5 bg-bg rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((card.value / (card.label === 'Taux de réussite' ? 100 : overview.totalStudents || 1)) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}80)` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
