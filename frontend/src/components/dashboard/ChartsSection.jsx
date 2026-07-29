import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts'

const COLORS = ['#2563EB', '#8B5CF6', '#22C55E']

export default function ChartsSection({ charts }) {
  if (!charts) return null

  const configs = [
    {
      title: 'Répartition des élèves', subtitle: 'Par filière',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={charts.studentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
              {charts.studentDistribution.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      ),
      legend: charts.studentDistribution,
    },
    {
      title: 'Notes par trimestre', subtitle: 'Moyenne, Max, Min',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={charts.gradesByTrimester} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }} />
            <Bar dataKey="Moyenne" fill="#2563EB" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Max" fill="#22C55E" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Min" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Moyennes par classe', subtitle: 'Toutes filières',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={charts.averagesByClass} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 20]} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={55} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }} formatter={(v) => [`${v}/20`, 'Moyenne']} />
            <Bar dataKey="moyenne" radius={[0, 6, 6, 0]}>
              {charts.averagesByClass.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#8B5CF6' : '#A78BFA'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Répartition des enseignants', subtitle: 'Par filière',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={charts.teacherDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
              {charts.teacherDistribution.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      ),
      legend: charts.teacherDistribution,
    },
    {
      title: 'Progression académique', subtitle: 'Moyenne générale et notes validées',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={charts.academicProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }} />
            <Area type="monotone" dataKey="moyenne" stroke="#2563EB" fill="url(#cm)" strokeWidth={2} name="Moyenne" />
            <Area type="monotone" dataKey="Validé" stroke="#22C55E" fill="url(#cv)" strokeWidth={2} name="Validées" />
            <defs>
              <linearGradient id="cm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
              <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Bulletins générés', subtitle: 'Évolution mensuelle',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={charts.reportCardsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }} />
            <Line type="monotone" dataKey="bulletins" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ]

  return (
    <div className="mb-4 lg:mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-text-primary">Statistiques & Graphiques</h2>
          <p className="text-sm text-text-muted">Données réelles de l'année {charts.academicProgress?.[0]?.month ? 'en cours' : ''}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((cfg, i) => (
          <motion.div
            key={cfg.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            className="bg-card border border-border rounded-3xl p-4 lg:p-6 card-hover-effect"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{cfg.title}</h3>
                <p className="text-xs text-text-muted">{cfg.subtitle}</p>
              </div>
            </div>
            {cfg.chart}
            {cfg.legend && (
              <div className="flex items-center justify-center gap-6 mt-4">
                {cfg.legend.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color || COLORS[cfg.legend.indexOf(item)] }} />
                    <span className="text-xs text-text-muted">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
