import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../store/authStore'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, BookMarked,
  Link2, ClipboardList, CheckSquare, FileText, BarChart3,
  Database, Settings, LogOut, ChevronLeft, ChevronRight, X,
  School, GraduationCap as GraduationIcon
} from 'lucide-react'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/teachers', label: 'Enseignants', icon: Users },
  { path: '/admin/students', label: 'Élèves', icon: GraduationCap },
  { path: '/admin/classes', label: 'Classes', icon: School },
  { path: '/admin/subjects', label: 'Matières', icon: BookOpen },
  { path: '/admin/assignments', label: 'Affectations', icon: Link2 },
  { path: '/admin/grades', label: 'Notes', icon: ClipboardList },
  { path: '/admin/grades/validation', label: 'Validation des notes', icon: CheckSquare },
  { path: '/admin/report-cards', label: 'Bulletins', icon: FileText },
  { path: '/admin/statistics', label: 'Statistiques', icon: BarChart3 },
  { path: '/admin/backup', label: 'Sauvegarde', icon: Database },
  { path: '/admin/settings', label: 'Paramètres', icon: Settings },
]

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false)
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={closeMobile}
        />
      )}
      <div
        className={`h-screen fixed left-0 top-0 z-50 flex flex-col bg-sidebar overflow-hidden transition-all duration-300 ${
          mobileOpen
            ? 'translate-x-0 w-[280px]'
            : '-translate-x-full w-[280px] lg:translate-x-0 lg:!w-[320px]'
        } ${collapsed && !mobileOpen ? 'lg:!w-[80px]' : ''}`}
      >
      <div className="flex items-center gap-3 px-5 h-[64px] lg:h-[90px] border-b border-white/5 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
          <GraduationIcon size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {(!collapsed || mobileOpen) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden flex-1"
            >
              <p className="text-white font-semibold text-sm whitespace-nowrap">Gestion Scolaire</p>
              <p className="text-white/40 text-xs whitespace-nowrap">Administration</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={closeMobile}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-premium">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer mb-1" onClick={() => { handleLogout(); closeMobile() }}>
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full py-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
    </>
  )
}
