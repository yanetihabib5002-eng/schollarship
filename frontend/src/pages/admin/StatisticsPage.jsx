import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOverview, useClassTrimesterStats } from '../../hooks/useStatistics'
import { useClasses } from '../../hooks/useClasses'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Loader2, AlertCircle, Users, GraduationCap, School, BookOpen,
  ClipboardCheck, CheckCircle2, BarChart3, Award, TrendingUp, TrendingDown,
} from 'lucide-react'

const trimesters = [
  { value: 1, label: '1er Trimestre' },
  { value: 2, label: '2ème Trimestre' },
  { value: 3, label: '3ème Trimestre' },
]

const PIE_COLORS = ['#3B6FF6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function StatisticsPage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTrimester, setSelectedTrimester] = useState(1)

  const { data: classes } = useClasses()
  const { data: overview, isLoading: loadingOverview } = useOverview()
  const { data: classStats, isLoading: loadingStats } = useClassTrimesterStats(
    selectedClass || undefined,
    selectedTrimester,
  )

  const classList = classes || []
  const ranking = classStats?.ranking || []

  const overviewCards = overview
    ? [
        { label: 'Élèves', value: overview.totalStudents, icon: GraduationCap, color: '#3B6FF6', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Enseignants', value: overview.totalTeachers, icon: Users, color: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Classes', value: overview.totalClasses, icon: School, color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Matières', value: overview.totalSubjects, icon: BookOpen, color: '#8B5CF6', bg: 'bg-purple-50 dark:bg-purple-900/20' },
      ]
    : []

  const gradePieData = overview
    ? [
        { name: 'Soumises', value: overview.gradesSubmitted },
        { name: 'Validées', value: overview.gradesValidated },
        { name: 'Brouillons', value: Math.max(0, (overview.gradesSubmitted + overview.gradesValidated) || 0) },
      ]
    : []

  const distributionData = ranking.length > 0
    ? [
        { name: '≥ 16', count: ranking.filter((s) => s.average >= 16).length, fill: '#10B981' },
        { name: '14-16', count: ranking.filter((s) => s.average >= 14 && s.average < 16).length, fill: '#3B6FF6' },
        { name: '12-14', count: ranking.filter((s) => s.average >= 12 && s.average < 14).length, fill: '#F59E0B' },
        { name: '10-12', count: ranking.filter((s) => s.average >= 10 && s.average < 12).length, fill: '#F97316' },
        { name: '< 10', count: ranking.filter((s) => s.average < 10).length, fill: '#EF4444' },
      ]
    : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Statistiques</h1>
          <p className="text-sm text-text-muted mt-1">Indicateurs et performances</p>
        </div>
      </div>

      {loadingOverview ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {overviewCards.map((card) => (
              <div key={card.label} className="bg-surface rounded-2xl border border-border p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                <p className="text-sm text-text-muted mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-surface rounded-2xl border border-border p-4 lg:p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">État des notes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gradePieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {gradePieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {ranking.length > 0 && (
              <div className="bg-surface rounded-2xl border border-border p-4 lg:p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Distribution des moyennes</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {distributionData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      <div className="bg-surface rounded-2xl border border-border p-4 lg:p-5 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <School size={14} className="inline mr-1" /> Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">Sélectionnez une classe</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <BarChart3 size={14} className="inline mr-1" /> Trimestre
            </label>
            <select
              value={selectedTrimester}
              onChange={(e) => setSelectedTrimester(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {trimesters.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            {classStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-bg rounded-xl p-3 text-center">
                  <p className="text-xs text-text-muted">Moy. classe</p>
                  <p className="text-lg font-bold text-text-primary">{classStats.classAverage.toFixed(2)}</p>
                </div>
                <div className="bg-bg rounded-xl p-3 text-center">
                  <p className="text-xs text-text-muted">Meilleure</p>
                  <p className="text-lg font-bold text-success">{classStats.bestAverage.toFixed(2)}</p>
                </div>
                <div className="bg-bg rounded-xl p-3 text-center">
                  <p className="text-xs text-text-muted">Moins bonne</p>
                  <p className="text-lg font-bold text-danger">{classStats.worstAverage.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loadingStats ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : ranking.length > 0 ? (
        <>
          {/* ── MOBILE CARDS (< lg) ── */}
          <div className="lg:hidden space-y-3 mb-6">
            <div className="bg-card border border-border rounded-2xl p-4 mb-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Classement — {classStats?.className} ({trimesters.find((t) => t.value === selectedTrimester)?.label})
              </h3>
              <p className="text-xs text-text-muted mt-1">{ranking.length} élèves</p>
            </div>
            {ranking.map((s, i) => {
              const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : ''
              const mentionColor = s.average >= 16 ? 'text-success' : s.average >= 14 ? 'text-primary' : s.average >= 12 ? 'text-amber-500' : s.average >= 10 ? 'text-orange-500' : 'text-danger'
              const mention = s.average >= 16 ? 'Excellent' : s.average >= 14 ? 'Très Bien' : s.average >= 12 ? 'Bien' : s.average >= 10 ? 'Passable' : 'Insuffisant'
              return (
                <motion.div
                  key={s.studentId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-lg font-bold text-text-primary flex-shrink-0 w-8 text-center">{medal || s.rank}</span>
                      <span className="text-sm font-medium text-text-primary truncate">{s.studentName}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-text-primary">{s.average.toFixed(2)}</p>
                      <p className={`text-xs font-semibold ${mentionColor}`}>{mention}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── DESKTOP TABLE (>= lg) ── */}
          <div className="hidden lg:block bg-surface rounded-2xl border border-border overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                Classement — {classStats?.className} ({trimesters.find((t) => t.value === selectedTrimester)?.label})
              </h3>
              <span className="text-xs text-text-muted">{ranking.length} élèves</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4 w-16">Rang</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Élève</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Moyenne</th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Mention</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((s) => {
                    const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : ''
                    const mentionColor = s.average >= 16 ? 'text-success' : s.average >= 14 ? 'text-primary' : s.average >= 12 ? 'text-amber-500' : s.average >= 10 ? 'text-orange-500' : 'text-danger'
                    return (
                      <tr key={s.studentId} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-sm font-bold text-text-primary">{medal || s.rank}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-text-primary">{s.studentName}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-bold text-text-primary">{s.average.toFixed(2)}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-sm font-semibold ${mentionColor}`}>
                            {s.average >= 16 ? 'Excellent' : s.average >= 14 ? 'Très Bien' : s.average >= 12 ? 'Bien' : s.average >= 10 ? 'Passable' : 'Insuffisant'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : selectedClass ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-bg flex items-center justify-center">
            <BarChart3 size={24} className="text-text-muted" />
          </div>
          <p className="text-text-muted font-medium">Aucune donnée pour cette classe</p>
          <p className="text-text-muted text-sm mt-1">Les notes n'ont peut-être pas encore été saisies</p>
        </div>
      ) : null}
    </motion.div>
  )
}
