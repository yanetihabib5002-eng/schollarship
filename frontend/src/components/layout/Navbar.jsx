import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, Moon, Sun, User, Settings, LogOut,
  ChevronDown, School, X, Menu, Trash2, Loader2,
  Info, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react'
import { useNotifications, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications'
import { useUnreadCount } from '../../hooks/useNotifications'

const schoolYears = ['2025-2026', '2024-2025', '2023-2024']

const severityIcon = { high: AlertTriangle, medium: Bell, low: Bell }

export default function Navbar({ sidebarCollapsed, onToggleMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [schoolYear, setSchoolYear] = useState(schoolYears[0])
  const [yearOpen, setYearOpen] = useState(false)
  const [notifWasOpen, setNotifWasOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const yearRef = useRef(null)

  const { data: notifications = [] } = useNotifications()
  const unreadCount = useUnreadCount()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotif = useDeleteNotification()

  useEffect(() => {
    if (notifOpen && !notifWasOpen) {
      setNotifWasOpen(true)
      markAllAsRead.mutate()
    }
    if (!notifOpen) {
      setNotifWasOpen(false)
    }
  }, [notifOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (yearRef.current && !yearRef.current.contains(e.target)) setYearOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/admin/students?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const isAdmin = user?.role === 'admin'

  const typeIcon = { info: Info, warning: AlertTriangle, success: CheckCircle2, deadline: Clock }
  const typeColor = { info: 'text-primary bg-primary/10', warning: 'text-amber-500 bg-amber-500/10', success: 'text-success bg-success/10', deadline: 'text-danger bg-danger/10' }

  return (
    <header
      className={`fixed top-0 right-0 z-40 h-[64px] lg:h-[90px] glass flex items-center justify-between px-3 lg:px-8 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:left-[80px]' : 'lg:left-[320px]'
      } left-0`}
    >
      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={onToggleMobile}
          className="lg:hidden w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl bg-bg border border-border text-text-muted hover:text-text-primary transition-all"
          aria-label="Menu"
        >
          <Menu size={18} />
        </button>
        <form onSubmit={handleSearch} className="hidden lg:block relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un élève..."
            className="w-72 pl-10 pr-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="relative" ref={yearRef}>
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-bg border border-border rounded-xl text-sm text-text-secondary hover:border-primary/30 transition-all duration-200"
          >
            <School size={14} className="text-primary" />
            <span className="font-medium hidden sm:inline">{schoolYear}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${yearOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {yearOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="fixed inset-x-4 top-[100px] w-auto sm:absolute sm:right-0 sm:w-48 sm:mt-2 bg-card border border-border rounded-xl shadow-premium py-1 z-50"
              >
                {schoolYears.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setSchoolYear(y); setYearOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      y === schoolYear ? 'text-primary bg-primary/5 font-medium' : 'text-text-secondary hover:bg-bg'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl bg-bg border border-border text-text-muted hover:text-text-primary hover:border-primary/30 transition-all duration-200"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl bg-bg border border-border text-text-muted hover:text-text-primary hover:border-primary/30 transition-all duration-200"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-danger/30">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="fixed inset-x-4 top-[100px] w-auto sm:absolute sm:right-0 sm:w-80 sm:mt-2 bg-card border border-border rounded-2xl shadow-premium overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">
                    Notifications {notifications.length > 0 && <span className="text-text-muted font-normal">({notifications.length})</span>}
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={24} className="mx-auto text-text-muted mb-2" />
                      <p className="text-sm text-text-muted">Aucune notification</p>
                      <p className="text-xs text-text-muted/60 mt-1">Les notifications apparaîtront ici</p>
                    </div>
                  ) : (
                    notifications.map((notif, i) => {
                      const Icon = typeIcon[notif.type] || Bell
                      const colorClasses = typeColor[notif.type] || 'text-text-muted bg-bg'
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 p-4 transition-colors border-b border-border/50 last:border-0 ${
                            !notif.read ? 'bg-primary/[0.02]' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-text-muted/60 mt-1">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => deleteNotif.mutate(notif.id)}
                              className="p-1.5 rounded-lg text-text-muted/40 hover:text-danger hover:bg-danger/5 transition-all flex-shrink-0 self-start"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
                {notifications.length >= 10 && (
                  <div className="p-3 border-t border-border bg-amber-500/5">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center font-medium">
                      Maximum 10 notifications atteint. Supprimez les anciennes pour en ajouter.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl hover:bg-bg transition-all duration-200 border border-transparent hover:border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text-primary leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-xs text-text-muted capitalize">{user?.role || 'admin'}</p>
            </div>
            <ChevronDown size={14} className="text-text-muted hidden sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="fixed inset-x-4 top-[100px] w-auto sm:absolute sm:right-0 sm:w-56 sm:mt-2 bg-card border border-border rounded-xl shadow-premium py-1 z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">{user?.name || 'Administrateur'}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/admin/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg transition-colors"
                >
                  <User size={16} /> Mon profil
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/admin/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg transition-colors"
                >
                  <Settings size={16} /> Paramètres
                </button>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}