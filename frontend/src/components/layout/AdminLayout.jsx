import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Navbar sidebarCollapsed={sidebarCollapsed} onToggleMobile={toggleMobile} />
      <main
        className={`pt-[64px] lg:pt-[90px] min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[320px]'
        }`}
      >
        <div className="p-3 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
