import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Users, School, FileText, BookOpen } from 'lucide-react'

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function HeroSection({ overview }) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const stats = [
    { label: 'Élèves', value: overview.totalStudents, icon: GraduationCap, color: '#2563EB' },
    { label: 'Enseignants', value: overview.totalTeachers, icon: Users, color: '#8B5CF6' },
    { label: 'Classes', value: overview.totalClasses, icon: School, color: '#22C55E' },
    { label: 'Matières', value: overview.totalSubjects, icon: BookOpen, color: '#F59E0B' },
    { label: 'Bulletins', value: overview.totalReportCards, icon: FileText, color: '#8B5CF6' },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-3xl bg-gradient-to-br from-[#16223f] via-[#101B34] to-[#0b1226] p-4 md:p-8 mb-4 lg:mb-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)] hidden md:block" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl hidden lg:block" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple/5 rounded-full blur-3xl hidden lg:block" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-white/60 text-sm mb-2">{dateStr} · <Clock /></p>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-2">
                Bienvenue Administrateur
              </h1>
              <p className="text-white/70 text-sm lg:text-lg">Gestion Scolaire</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 lg:mt-0"
          >
            <div className="glass-dark rounded-xl px-4 py-2 md:px-6 md:py-4 inline-flex items-center gap-3">
              <School size={20} className="text-primary" />
              <div>
                <p className="text-white/50 text-xs">Année scolaire</p>
                <p className="text-white font-semibold">{overview.currentSchoolYear}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="glass-dark rounded-xl p-3 md:p-5 card-hover-effect"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value ?? 0}</p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
