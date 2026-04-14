import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiUsers, FiGlobe, FiArrowLeft } from 'react-icons/fi'
import JobCard from '../components/jobs/JobCard'
import api from '../services/api'

export default function CompanyProfilePage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/recruiters/company/${id}`).then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <div className="skeleton h-48 rounded-2xl" /><div className="skeleton h-32 rounded-2xl" />
    </div>
  )
  if (!data) return <div className="text-center py-20 text-gray-400">Company not found</div>

  const { company, jobs } = data

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/jobs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600 mb-6">
        <FiArrowLeft size={16} /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 dark:from-charcoal-700 dark:to-charcoal-600 flex items-center justify-center text-5xl border border-gold-200 dark:border-charcoal-600 flex-shrink-0">
            {company.companyLogo || '🏨'}
          </div>
          <div className="flex-1">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white">{company.companyName}</h1>
              {company.verified && <span className="badge badge-gold">✓ Verified</span>}
            </div>
            <p className="text-maroon-600 dark:text-maroon-400 font-medium mt-1">{company.industry}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {company.location && <span className="flex items-center gap-1"><FiMapPin size={13} className="text-gold-500" />{company.location}</span>}
              {company.size && <span className="flex items-center gap-1"><FiUsers size={13} className="text-gold-500" />{company.size} employees</span>}
              {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gold-600"><FiGlobe size={13} className="text-gold-500" />{company.website}</a>}
            </div>
          </div>
        </div>
        {company.description && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-charcoal-700">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{company.description}</p>
          </div>
        )}
        {company.benefits?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-charcoal-700 dark:text-gray-200 mb-2">Benefits</p>
            <div className="flex flex-wrap gap-2">
              {company.benefits.map(b => <span key={b} className="badge badge-green text-[11px]">✓ {b}</span>)}
            </div>
          </div>
        )}
      </motion.div>

      <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white mb-4">
        Open Positions <span className="text-gold-500">({jobs.length})</span>
      </h2>
      {jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No open positions at the moment</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
        </div>
      )}
    </div>
  )
}
