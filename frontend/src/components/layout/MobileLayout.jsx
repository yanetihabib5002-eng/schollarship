import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useAuth } from '../../store/authStore'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, GraduationCap, ClipboardList, FileText,
  MoreHorizontal, X, Users, BookOpen, School, Link2, BarChart3,
  Settings, LogOut, ChevronRight, Bell, Trash2
} from 'lucide-react'
import { useNotifications, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications'
import { useUnreadCount } from '../../hooks/useNotifications'

const tabs = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Élèves', icon: GraduationCap },
  { path: '/admin/grades', label: 'Notes', icon: ClipboardList },
  { path: '/admin/report-cards', label: 'Bulletins', icon: FileText },
  { path: 'more', label: 'Plus', icon: MoreHorizontal },
]

const moreItems = [
  { path: '/admin/teachers', label: 'Enseignants', icon: Users },
  { path: '/admin/classes', label: 'Classes', icon: School },
  { path: '/admin/subjects', label: 'Matières', icon: BookOpen },
  { path: '/admin/assignments', label: 'Affectations', icon: Link2 },
  { path: '/admin/grades/validation', label: 'Validation', icon: ClipboardList },
  { path: '/admin/statistics', label: 'Statistiques', icon: BarChart3 },
  { path: '/admin/settings', label: 'Paramètres', icon: Settings },
]

const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)'

export default function MobileLayout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = useUnreadCount()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotif = useDeleteNotification()
  const { data: notifications = [] } = useNotifications()
  const isAdmin = user?.role === 'admin'

  const isActive = (path) => {
    if (path === '/admin/grades') return location.pathname.startsWith('/admin/grades')
    return location.pathname === path
  }

  const handleTabPress = (tab) => {
    if (tab.path === 'more') {
      setMoreOpen(true)
    } else {
      navigate(tab.path)
    }
  }

  const handleMoreNav = (path) => {
    setMoreOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg pb-safe">
      <main className="pb-[72px]" style={{ paddingBottom: `calc(72px + ${safeAreaBottom})` }}>
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#3B6FF6] flex items-center justify-around px-2"
        style={{ paddingBottom: safeAreaBottom, height: `calc(56px + ${safeAreaBottom})` }}
      >
        <LayoutGroup>
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            const Icon = tab.icon
            return (
            <button
              key={tab.label}
              onClick={() => handleTabPress(tab)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all min-w-0 flex-1 ${
                active ? 'text-white' : 'text-white/65'
              }`}
            >
              {active && tab.path !== 'more' && (
                <motion.div
                  layoutId="mobile-tab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.path === 'more' ? (
                <>
                  <div className="relative">
                    <Icon size={24} strokeWidth={3} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold leading-tight">{tab.label}</span>
                </>
              ) : (
                <>
                  <Icon size={24} strokeWidth={3} />
                  <span className="text-[11px] font-semibold leading-tight">{tab.label}</span>
                </>
              )}
            </button>
            )
          })}
        </LayoutGroup>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
              style={{ paddingBottom: safeAreaBottom }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-base font-bold text-text-primary">Navigation</h2>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-bg text-text-muted"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-3 py-2 space-y-0.5">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  const active = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleMoreNav(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:bg-bg'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight size={16} className="text-text-muted" />
                    </button>
                  )
                })}
              </div>

              {/* ── NOTIFICATIONS SECTION ── */}
              <div className="px-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text-primary">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/10 text-danger">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllAsRead.mutate()} className="text-[11px] text-primary font-medium">
                      Tout lu
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-text-muted">Aucune notification</p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto px-2 space-y-0.5">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-bg/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{notif.title}</p>
                          <p className="text-[10px] text-text-muted truncate">{notif.message}</p>
                        </div>
                        {isAdmin && (
                          <button onClick={() => deleteNotif.mutate(notif.id)}
                            className="p-1 rounded text-text-muted/40 hover:text-danger flex-shrink-0">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <p className="text-[10px] text-text-muted text-center py-1">+{notifications.length - 5} autres</p>
                    )}
                  </div>
                )}
                {notifications.length >= 10 && (
                  <div className="px-4 py-2">
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 text-center font-medium">
                      Max 10 notif. Supprimez les anciennes.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-3 py-3 border-t border-border mt-2">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
