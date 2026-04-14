import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiMapPin, FiBriefcase, FiClock, FiBookmark, FiZap, FiTrendingUp } from 'react-icons/fi'
import { GiCook } from 'react-icons/gi'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

const roleColors = {
  'Chef': 'bg-orange-100 text-orange-700', 'Sous Chef': 'bg-amber-100 text-amber-700',
  'Waiter': 'bg-blue-100 text-blue-700', 'Waitress': 'bg-purple-100 text-purple-700',
  'Hotel Manager': 'bg-green-100 text-green-700', 'General Manager': 'bg-emerald-100 text-emerald-700',
  'Housekeeping': 'bg-pink-100 text-pink-700', 'Front Desk': 'bg-cyan-100 text-cyan-700',
  'Bartender': 'bg-yellow-100 text-yellow-700', 'Concierge': 'bg-indigo-100 text-indigo-700',
  'F&B Manager': 'bg-red-100 text-red-700', 'Banquet Manager': 'bg-teal-100 text-teal-700',
}

function formatSalary(min, max) {
  const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`
  if (!min && !max) return 'Not disclosed'
  if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`
  return `${fmt(min || max)}/mo`
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days/7)} week${Math.floor(days/7) > 1 ? 's' : ''} ago`
}

export default function JobCard({ job, index = 0, onSaved }) {
  const { user, isAuthenticated } = useAuth()
  const [saved, setSaved] = useState(false)
  const [applying, setApplying] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please login to save jobs'); return }
    try {
      const { data } = await api.post(`/seekers/saved-jobs/${job._id}`)
      setSaved(data.saved)
      toast.success(data.message)
      if (onSaved) onSaved()
    } catch { toast.error('Failed to save job') }
  }

  const handleEasyApply = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please login to apply'); return }
    if (user?.role !== 'seeker') { toast.error('Only job seekers can apply'); return }
    setApplying(true)
    try {
      await api.post(`/jobs/${job._id}/apply`, { coverLetter: '' })
      toast.success('Applied successfully! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally { setApplying(false) }
  }

  const colorClass = roleColors[job.role] || 'bg-gold-100 text-gold-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/jobs/${job._id}`} className="block">
        <div className="card p-5 group cursor-pointer h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 dark:from-charcoal-700 dark:to-charcoal-600 flex items-center justify-center text-2xl flex-shrink-0 border border-gold-200 dark:border-charcoal-600">
                {job.companyLogo || '🏨'}
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-800 dark:text-white text-sm line-clamp-1 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{job.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {job.featured && (
                <span className="badge badge-gold text-[10px]">
                  <FiTrendingUp size={9} /> Featured
                </span>
              )}
              <button onClick={handleSave} className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'text-gray-400 hover:text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-900/20'}`}>
                <FiBookmark size={15} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`badge text-[11px] ${colorClass}`}>{job.role}</span>
            <span className="badge badge-blue text-[11px]">{job.jobType}</span>
            {job.easyApply && <span className="badge bg-green-100 text-green-700 text-[11px]"><FiZap size={9} /> Easy Apply</span>}
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FiMapPin size={12} /> <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FiBriefcase size={12} /> <span>{job.experienceMin}–{job.experienceMax} yrs exp</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FiClock size={12} /> <span>{timeAgo(job.postedAt)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-charcoal-700">
            <div>
              <p className="text-sm font-semibold text-gold-600 dark:text-gold-400">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              <p className="text-[11px] text-gray-400">{job.openings} opening{job.openings > 1 ? 's' : ''}</p>
            </div>
            {job.easyApply ? (
              <button onClick={handleEasyApply} disabled={applying}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-300 text-white text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5">
                <FiZap size={12} /> {applying ? 'Applying...' : 'Easy Apply'}
              </button>
            ) : (
              <span className="px-3 py-1.5 text-xs font-medium text-gold-600 border border-gold-300 rounded-lg group-hover:bg-gold-50 transition-colors">View Job</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
