import { motion } from 'framer-motion'
import { ArrowUpRight, GraduationCap, School, Users } from 'lucide-react'

const streamConfig = {
  general_francophone: { name: 'Général', color: '#2563EB', bg: '#EFF6FF', icon: GraduationCap },
  technique: { name: 'Technique', color: '#8B5CF6', bg: '#EDE9FE', icon: School },
  anglophone: { name: 'Anglophone', color: '#22C55E', bg: '#DCFCE7', icon: Users },
}

export default function FiliereSection({ overview }) {
  if (!overview?.byStream) return null

  const filieres = Object.entries(overview.byStream).map(([key, data]) => {
    const config = streamConfig[key] || streamConfig.general_francophone
    return { key, ...config, stats: data, students: data.students || 0 }
  })

  return (
    <div className="mb-4 lg:mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Filières</h2>
          <p className="text-sm text-text-muted">Aperçu par filière d'enseignement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filieres.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            className="bg-card border border-border rounded-3xl p-4 lg:p-6 card-hover-effect group"
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`} style={{ background: `${f.color}15` }}>
                <f.icon size={26} style={{ color: f.color }} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${f.color}15`, color: f.color }}>
                {f.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-2xl font-bold text-text-primary">{f.stats.students}</p>
                <p className="text-xs text-text-muted">Élèves</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{f.stats.classes}</p>
                <p className="text-xs text-text-muted">Classes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{f.stats.teachers}</p>
                <p className="text-xs text-text-muted">Enseignants</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{overview.overallAverage || '—'}</p>
                <p className="text-xs text-text-muted">Moy. générale</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-muted">Remplissage</span>
                <span className="font-semibold" style={{ color: f.color }}>
                  {overview.totalClasses ? Math.round((f.stats.classes / overview.totalClasses) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overview.totalClasses ? (f.stats.classes / overview.totalClasses) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}80)` }}
                />
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: `${f.color}10`, color: f.color }}
            >
              Voir plus <ArrowUpRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
