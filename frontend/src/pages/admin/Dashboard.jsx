import { motion } from 'framer-motion'
import { useDashboard } from '../../hooks/useDashboard'
import HeroSection from '../../components/dashboard/HeroSection'
import StatisticsCards from '../../components/dashboard/StatisticsCards'
import ChartsSection from '../../components/dashboard/ChartsSection'
import FiliereSection from '../../components/dashboard/FiliereSection'
import ActivitiesTimeline from '../../components/dashboard/ActivitiesTimeline'
import AlertsSection from '../../components/dashboard/AlertsSection'
import QuickActions from '../../components/dashboard/QuickActions'
import CalendarWidget from '../../components/dashboard/CalendarWidget'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { overview, charts, activities, alerts, calendar, loading, error } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-muted text-sm">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="text-center bg-danger/5 border border-danger/20 rounded-3xl p-8 max-w-md">
          <p className="text-danger font-semibold text-lg mb-2">Erreur de chargement</p>
          <p className="text-text-muted text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection overview={overview} />
      <StatisticsCards overview={overview} />
      <ChartsSection charts={charts} />
      <FiliereSection overview={overview} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-8">
        <div className="lg:col-span-2">
          <ActivitiesTimeline activities={activities} />
        </div>
        <div className="space-y-6">
          <AlertsSection alerts={alerts} />
          <QuickActions />
          <CalendarWidget calendar={calendar} />
        </div>
      </div>
    </motion.div>
  )
}
