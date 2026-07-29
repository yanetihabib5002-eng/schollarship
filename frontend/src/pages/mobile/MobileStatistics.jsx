import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useDashboard } from '../../hooks/useDashboard'
import { useOverview } from '../../hooks/useStatistics'
import { useClasses } from '../../hooks/useClasses'
import { useClassTrimesterStats } from '../../hooks/useStatistics'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import {
  Loader2, Users, GraduationCap, School, BookOpen,
  TrendingUp, Award, CheckCircle2, Clock, BarChart3,
  Target, ArrowUp, ArrowDown, Percent, ChevronDown, Eye, EyeOff
} from 'lucide-react'

const COLORS = ['#3B6FF6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444']
const trimesters = [1, 2, 3]
const RADIAN = Math.PI / 180

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = outerRadius + 20
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#64748B" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export default function MobileStatistics() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTrimester, setSelectedTrimester] = useState(1)

  const { overview: dashOverview, charts, loading: loadingDash } = useDashboard()
  const { data: overview, isLoading: loadingOverview } = useOverview()
  const { data: classes } = useClasses()
  const { data: classStats, isLoading: loadingStats } = useClassTrimesterStats(
    selectedClass || undefined,
    selectedTrimester,
  )

  const ranking = classStats?.ranking || []
  const totalGrades = (overview?.gradesSubmitted || 0) + (overview?.gradesValidated || 0)

  const mentionData = ranking.length > 0
    ? (() => {
        const total = ranking.length
        const cats = [
          { label: '≥ 16', count: ranking.filter(s => s.average >= 16).length, color: '#22C55E' },
          { label: '14-16', count: ranking.filter(s => s.average >= 14 && s.average < 16).length, color: '#3B6FF6' },
          { label: '12-14', count: ranking.filter(s => s.average >= 12 && s.average < 14).length, color: '#F59E0B' },
          { label: '10-12', count: ranking.filter(s => s.average >= 10 && s.average < 12).length, color: '#F97316' },
          { label: '< 10', count: ranking.filter(s => s.average < 10).length, color: '#EF4444' },
        ]
        return cats.map(c => ({ ...c, pct: total ? Math.round(c.count / total * 100) : 0 }))
      })()
    : []

  const loading = loadingDash || loadingOverview
  const overviewCards = dashOverview
    ? [
        { label: 'Élèves', value: dashOverview.totalStudents, icon: GraduationCap, color: '#3B6FF6' },
        { label: 'Enseignants', value: dashOverview.totalTeachers, icon: Users, color: '#8B5CF6' },
        { label: 'Classes', value: dashOverview.totalClasses, icon: School, color: '#22C55E' },
        { label: 'Matières', value: dashOverview.totalSubjects, icon: BookOpen, color: '#F59E0B' },
        { label: 'Moy. générale', value: dashOverview.overallAverage, icon: TrendingUp, color: '#3B82F6', suffix: '/20' },
        { label: 'Réussite', value: dashOverview.passRate, icon: Award, color: '#EF4444', suffix: '%' },
      ]
    : []

  return (
    <div className="p-4 pb-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
          <BarChart3 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Statistiques complètes</h1>
          <p className="text-xs text-text-muted">Tous les indicateurs de l'établissement</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ── 6 CARTES RÉCAP ── */}
          <div className="grid grid-cols-2 gap-3">
            {overviewCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                      <Icon size={18} style={{ color: card.color }} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-text-primary">{card.value}{card.suffix || ''}</p>
                  <p className="text-xs text-text-muted mt-0.5">{card.label}</p>
                </motion.div>
              )
            })}
          </div>

          {/* ── ÉTAT DES NOTES (barres %) ── */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">État des notes</span>
              <span className="text-[10px] text-text-muted ml-auto">{totalGrades} notes</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Validées', value: overview?.gradesValidated || 0, color: '#22C55E' },
                { label: 'Soumises', value: overview?.gradesSubmitted || 0, color: '#F59E0B' },
              ].map((item) => {
                const pct = totalGrades ? Math.round(item.value / totalGrades * 100) : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">{item.label}</span>
                      <span className="text-xs font-semibold text-text-primary">{item.value} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── GRAPHIQUES ── */}
          {charts && (
            <>
              {/* Répartition élèves */}
              {charts.studentDistribution?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Élèves par filière</p>
                      <p className="text-[10px] text-text-muted">Répartition</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={charts.studentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                        {charts.studentDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    {charts.studentDistribution.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-[10px] text-text-muted">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes par trimestre */}
              {charts.gradesByTrimester?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-sm font-semibold text-text-primary mb-3">Notes par trimestre</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={charts.gradesByTrimester} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 20]} />
                      <Tooltip />
                      <Bar dataKey="Moyenne" fill="#3B6FF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Max" fill="#22C55E" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Min" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Moyennes par classe */}
              {charts.averagesByClass?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-sm font-semibold text-text-primary mb-3">Moyennes par classe</p>
                  <ResponsiveContainer width="100%" height={Math.max(140, charts.averagesByClass.length * 32)}>
                    <BarChart data={charts.averagesByClass} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 20]} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip formatter={(v) => [`${v}/20`]} />
                      <Bar dataKey="moyenne" radius={[0, 4, 4, 0]}>
                        {charts.averagesByClass.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#8B5CF6' : '#A78BFA'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Progression académique */}
              {charts.academicProgress?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-sm font-semibold text-text-primary mb-3">Progression académique</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={charts.academicProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="moyenne" stroke="#3B6FF6" fill="url(#cm)" strokeWidth={2} name="Moyenne" />
                      <Area type="monotone" dataKey="Validé" stroke="#22C55E" fill="url(#cv)" strokeWidth={2} name="Validées" />
                      <defs>
                        <linearGradient id="cm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B6FF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B6FF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bulletins générés */}
              {charts.reportCardsData?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-sm font-semibold text-text-primary mb-3">Bulletins générés</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={charts.reportCardsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bulletins" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* ── CLASSEMENT PAR CLASSE ── */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">Classement par classe</span>
            </div>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">Sélectionner une classe</option>
              {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2">
              {trimesters.map(t => (
                <button key={t} onClick={() => setSelectedTrimester(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedTrimester === t
                      ? 'bg-primary text-white shadow-btn'
                      : 'bg-bg border border-border text-text-muted'
                  }`}>T{t}</button>
              ))}
            </div>
          </div>

          {!selectedClass ? (
            <div className="text-center py-10">
              <Award size={32} className="mx-auto text-text-muted mb-2" />
              <p className="text-sm text-text-muted">Choisissez une classe</p>
            </div>
          ) : loadingStats ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : ranking.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-text-muted">Aucune donnée pour ce trimestre</p>
            </div>
          ) : (
            <>
              {classStats && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-card border border-border rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-text-muted mb-1">Moy. classe</p>
                    <p className="text-lg font-bold text-text-primary">{classStats.classAverage?.toFixed(2)}</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-text-muted mb-1">Meilleure</p>
                    <div className="flex items-center justify-center gap-1">
                      <ArrowUp size={14} className="text-success" />
                      <p className="text-lg font-bold text-success">{classStats.bestAverage?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-text-muted mb-1">Moins bonne</p>
                    <div className="flex items-center justify-center gap-1">
                      <ArrowDown size={14} className="text-danger" />
                      <p className="text-lg font-bold text-danger">{classStats.worstAverage?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {mentionData.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text-primary">Distribution</span>
                    <span className="text-[10px] text-text-muted ml-auto">{ranking.length} él.</span>
                  </div>
                  <div className="space-y-2">
                    {mentionData.map(m => (
                      <div key={m.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: m.color }}>{m.label}</span>
                          <span className="text-xs text-text-muted">{m.count} ({m.pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.pct}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full" style={{ background: m.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {ranking.map((s, i) => (
                  <motion.div
                    key={s.studentId}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.012 }}
                    className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-base">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-xs font-bold text-text-muted">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{s.studentName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{s.average?.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
