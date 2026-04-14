import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon, FiBell, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiSettings, FiGrid, FiMessageSquare } from 'react-icons/fi'
import { GiCook } from 'react-icons/gi'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { dark, toggleDark } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false) }

  const getDashboardPath = () => {
    if (user?.role === 'seeker') return '/dashboard'
    if (user?.role === 'recruiter') return '/recruiter'
    return '/admin'
  }

  const navLinks = [
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 glass border-b border-gold-200/30 dark:border-charcoal-700/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-maroon-600 rounded-xl flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
              <GiCook className="text-white text-lg" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-gradient">HotelJobs</span>
              <span className="text-xs text-gold-600 dark:text-gold-400 block leading-none">.com</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-charcoal-700 dark:text-gray-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors text-charcoal-600 dark:text-gray-300">
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold-50 dark:bg-charcoal-700 border border-gold-200 dark:border-charcoal-600 hover:border-gold-400 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-charcoal-700 dark:text-gray-200 max-w-[100px] truncate">{user?.name}</span>
                  <FiChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 card rounded-xl overflow-hidden z-50 border border-gray-100 dark:border-charcoal-600">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-charcoal-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-charcoal-800 dark:text-white capitalize">{user?.role}</p>
                      </div>
                      <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gold-50 dark:hover:bg-charcoal-700 transition-colors">
                        <FiGrid size={15} /> Dashboard
                      </Link>
                      <Link to="/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gold-50 dark:hover:bg-charcoal-700 transition-colors">
                        <FiMessageSquare size={15} /> Messages
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <FiLogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/auth?tab=register" className="btn-primary text-sm">Post a Job</Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100 dark:border-charcoal-700 py-3 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gold-50 dark:hover:bg-charcoal-700 transition-colors">
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 flex items-center gap-2">
                <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors">
                  {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>
                {isAuthenticated ? (
                  <><Link to={getDashboardPath()} onClick={() => setMobileOpen(false)} className="btn-outline text-sm flex-1 text-center">Dashboard</Link>
                  <button onClick={handleLogout} className="btn-ghost text-sm text-red-500">Logout</button></>
                ) : (
                  <><Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">Sign In</Link>
                  <Link to="/auth?tab=register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm">Register</Link></>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
