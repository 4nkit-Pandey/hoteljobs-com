import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiSliders, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import JobCard from '../components/jobs/JobCard'
import JobFilters from '../components/jobs/JobFilters'
import SkeletonLoader from '../components/common/SkeletonLoader'
import api from '../services/api'

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Salary: High to Low', value: 'salary-high' },
  { label: 'Salary: Low to High', value: 'salary-low' },
]

export default function JobListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState('latest')
  const [filters, setFilters] = useState({ roles: [], locations: [], jobTypes: [], expMin: undefined, expMax: undefined, salaryMin: '', salaryMax: '' })
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (sort) params.set('sort', sort)
      if (filters.roles.length === 1) params.set('role', filters.roles[0])
      if (filters.locations.length === 1) params.set('location', filters.locations[0])
      if (filters.jobTypes.length === 1) params.set('jobType', filters.jobTypes[0])
      if (filters.expMin !== undefined) params.set('experienceMin', filters.expMin)
      if (filters.expMax !== undefined) params.set('experienceMax', filters.expMax)
      if (filters.salaryMin) params.set('salaryMin', filters.salaryMin)
      if (filters.salaryMax) params.set('salaryMax', filters.salaryMax)
      params.set('page', page)
      params.set('limit', 12)
      const { data } = await api.get(`/jobs?${params}`)
      setJobs(data.data)
      setPagination(data.pagination)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs(1) }, [search, sort, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs(1)
  }

  const clearFilters = () => {
    setFilters({ roles: [], locations: [], jobTypes: [], expMin: undefined, expMax: undefined, salaryMin: '', salaryMax: '' })
    setSearch('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, companies, roles..."
              className="input-field pl-11" />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
          <button type="button" onClick={() => setShowMobileFilters(true)} className="md:hidden btn-outline px-4">
            <FiSliders size={16} />
          </button>
        </form>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <JobFilters filters={filters} onChange={setFilters} onClear={clearFilters} />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <motion.div className="relative ml-auto w-80 max-w-full bg-white dark:bg-charcoal-900 h-full overflow-y-auto p-4"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Filters</span>
                  <button onClick={() => setShowMobileFilters(false)}><FiX size={20} /></button>
                </div>
                <JobFilters filters={filters} onChange={setFilters} onClear={clearFilters} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Listings */}
        <div className="flex-1 min-w-0">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-lg font-semibold text-charcoal-800 dark:text-white">
                {loading ? '...' : `${pagination.total.toLocaleString()} jobs found`}
              </h1>
              {search && <p className="text-sm text-gray-500">Results for "<span className="text-gold-600">{search}</span>"</p>}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field w-auto text-sm py-2">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <SkeletonLoader count={12} type="job" />
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-charcoal-700 dark:text-gray-300 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => fetchJobs(pagination.page - 1)} disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-charcoal-600 disabled:opacity-40 hover:bg-gold-50 dark:hover:bg-charcoal-700 transition-colors">
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i
                if (p > pagination.pages) return null
                return (
                  <button key={p} onClick={() => fetchJobs(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === pagination.page ? 'bg-gold-500 text-white' : 'border border-gray-200 dark:border-charcoal-600 hover:bg-gold-50 dark:hover:bg-charcoal-700'}`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => fetchJobs(pagination.page + 1)} disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg border border-gray-200 dark:border-charcoal-600 disabled:opacity-40 hover:bg-gold-50 dark:hover:bg-charcoal-700 transition-colors">
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
