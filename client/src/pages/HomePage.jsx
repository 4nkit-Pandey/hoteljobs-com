import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMapPin, FiBriefcase, FiArrowRight, FiTrendingUp, FiUsers, FiStar, FiZap, FiX, FiChevronRight } from 'react-icons/fi'
import { GiCook, GiBroom, GiSecurityGate, GiElectric } from 'react-icons/gi'
import { MdHotel, MdRestaurant, MdSpa, MdAccountBalance, MdBuild, MdLocalGroceryStore, MdSell, MdCampaign, MdPeople } from 'react-icons/md'
import { RiKnifeLine } from 'react-icons/ri'
import JobCard from '../components/jobs/JobCard'
import SkeletonLoader from '../components/common/SkeletonLoader'
import api from '../services/api'

// Department → job position mapping
const DEPT_JOBS = {
  'F&B Service': [
    'F&B Director', 'Corporate F&B Manager', 'F&B Manager', 'Asst. F&B Manager',
    'Restaurant Manager', 'Asst. Restaurant Manager', 'F&B Executive', 'Senior Captain',
    'Captain', 'Trainee Captain', 'Sr. Steward', 'Steward', 'Asst. Steward',
    'Trainee Steward', 'Job Trainee', 'G.R.E.', 'Asst. G.R.E.', 'Trainee G.R.E.',
  ],
  'F&B Production': [
    'Corporate Chef', 'Executive Chef', 'Sous Chef', 'C.D.P.',
    'Commis', 'Helper', 'Job Trainee', 'Kitchen Stewarding',
  ],
  'Front Office': [
    'Corporate Manager', 'Front Office Manager', 'Asst. Front Office Manager',
    'Sr. Receptionist', 'Receptionist', 'Asst. Receptionist', 'Job Trainee',
    'Bell Boy', 'Lobby Manager', 'Asst. Lobby Manager',
    'Room Sales Manager', 'Asst. Room Sales Manager',
  ],
  'Hotel Management': [
    'General Manager', 'Hotel Manager', 'Operations Manager',
    'Revenue Manager', 'Guest Relations Manager', 'Banquet Manager',
    'Event Manager', 'Hospitality Executive',
  ],
  'Accounts': [
    'C.A.', 'Revenue Manager', 'Account Manager', 'Asst. Account Manager',
    'Account Executive', 'Purchase Manager', 'Asst. Purchase Manager',
    'Purchase Executive', 'Cashier',
  ],
  'Maintenance': [
    'Maintenance Manager', 'Engineer', 'Plumber', 'Mason',
    'Painter', 'Helper', 'Job Trainee',
  ],
  'Sales': [
    'Sales Manager', 'Asst. Sales Manager', 'Sales Executive',
    'Sales Coordinator', 'Corporate Sales Manager', 'Key Account Manager',
  ],
  'Marketing': [
    'Marketing Manager', 'Asst. Marketing Manager', 'Marketing Executive',
    'Digital Marketing Executive', 'Brand Manager', 'PR Manager',
  ],
  'Purchase': [
    'Purchase Manager', 'Asst. Purchase Manager', 'Purchase Executive',
    'Store Manager', 'Store Keeper', 'Inventory Executive',
  ],
  'Daily Basis / Casual': [
    'Daily Wage Worker', 'Casual Staff', 'Part-Time Helper',
    'Temporary Cook', 'Housekeeping Casual', 'Event Casual Staff',
  ],
  'Service': [
    'Service Manager', 'Service Executive', 'Service Supervisor',
    'Guest Service Associate', 'Customer Service Executive',
  ],
  'Cook': [
    'Head Cook', 'Cook', 'Assistant Cook', 'Breakfast Cook',
    'Tandoor Cook', 'Chinese Cook', 'Continental Cook', 'Helper',
  ],
  'Housekeeping': [
    'Housekeeping Manager', 'Housekeeping Executive', 'Supervisor',
    'Room Attendant', 'Job Trainee', 'Gardener',
  ],
  'Electrician': [
    'Chief Electrician', 'Electrician', 'Asst. Electrician',
    'AC Technician', 'Helper', 'Job Trainee',
  ],
  'Security': [
    'C.S.O.', 'Security Manager', 'Security Supervisor', 'Security Guard',
    'Doorman', 'P.S.O.', 'Bouncer', 'Gunman',
  ],
  'Spa & Wellness': [
    'Spa Manager', 'Spa Therapist', 'Massage Therapist',
    'Beauty Therapist', 'Yoga Instructor', 'Wellness Executive',
  ],
}

const CATEGORIES = [
  { icon: MdRestaurant, label: 'F&B Service', color: 'from-green-400 to-emerald-600' },
  { icon: RiKnifeLine, label: 'F&B Production', color: 'from-orange-400 to-red-500' },
  { icon: FiBriefcase, label: 'Front Office', color: 'from-purple-400 to-violet-600' },
  { icon: MdHotel, label: 'Hotel Management', color: 'from-yellow-500 to-amber-600' },
  { icon: MdAccountBalance, label: 'Accounts', color: 'from-blue-400 to-indigo-600' },
  { icon: MdBuild, label: 'Maintenance', color: 'from-slate-400 to-slate-600' },
  { icon: MdSell, label: 'Sales', color: 'from-teal-400 to-cyan-600' },
  { icon: MdCampaign, label: 'Marketing', color: 'from-pink-400 to-fuchsia-600' },
  { icon: MdLocalGroceryStore, label: 'Purchase', color: 'from-lime-400 to-green-600' },
  { icon: MdPeople, label: 'Daily Basis / Casual', color: 'from-rose-400 to-red-600' },
  { icon: MdRestaurant, label: 'Service', color: 'from-sky-400 to-blue-600' },
  { icon: GiCook, label: 'Cook', color: 'from-amber-400 to-orange-600' },
  { icon: GiBroom, label: 'Housekeeping', color: 'from-cyan-400 to-blue-500' },
  { icon: GiElectric, label: 'Electrician', color: 'from-yellow-400 to-yellow-600' },
  { icon: GiSecurityGate, label: 'Security', color: 'from-red-600 to-rose-800' },
  { icon: MdSpa, label: 'Spa & Wellness', color: 'from-pink-300 to-rose-500' },
]

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Executive Chef', company: 'Taj Hotels', text: 'Found my dream job at Taj Hotels within 2 weeks of signing up. The platform understood exactly what I was looking for.', rating: 5, avatar: '👨‍🍳' },
  { name: 'Priya Patel', role: 'Hotel Manager', company: 'Marriott India', text: 'As a recruiter, I filled 8 positions in one month. The quality of candidates on HotelJobs.com is exceptional.', rating: 5, avatar: '👩‍💼' },
  { name: 'Vikram Singh', role: 'F&B Manager', company: 'Oberoi Hotels', text: 'Switched from a 5-star in Jaipur to an even better role in Goa. Salary jumped 40%. Highly recommended!', rating: 5, avatar: '👨‍💼' },
]

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/jobs/featured'),
      api.get('/recruiters/top-companies'),
    ]).then(([jobsRes, companiesRes]) => {
      setFeaturedJobs(jobsRes.data.data)
      setCompanies(companiesRes.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-900 via-maroon-900 to-charcoal-900 py-24 px-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-maroon-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 badge badge-gold mb-4 text-sm px-4 py-1.5">
              <FiTrendingUp size={14} /> India's #1 Hospitality Job Portal
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your Dream<br />
              <span className="text-gradient">Hospitality Career</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Connect with top hotels, resorts, and restaurants across India. 5,000+ jobs in Chef, Management, F&B, Housekeeping and more.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-charcoal-800 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4">
              <FiSearch size={20} className="text-gold-500 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Job title, role, keyword..." className="flex-1 py-3 bg-transparent text-charcoal-800 dark:text-white placeholder-gray-400 focus:outline-none text-sm" />
            </div>
            <div className="w-px bg-gray-200 dark:bg-charcoal-600 hidden md:block" />
            <div className="flex-1 flex items-center gap-3 px-4">
              <FiMapPin size={20} className="text-maroon-500 flex-shrink-0" />
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="City, State..." className="flex-1 py-3 bg-transparent text-charcoal-800 dark:text-white placeholder-gray-400 focus:outline-none text-sm" />
            </div>
            <button type="submit" className="btn-primary px-8 whitespace-nowrap flex items-center gap-2">
              <FiSearch size={16} /> Search Jobs
            </button>
          </motion.form>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-gray-400 text-sm">Popular:</span>
            {['Chef', 'Hotel Manager', 'Receptionist', 'Bartender', 'Goa', 'Mumbai'].map(tag => (
              <button key={tag} onClick={() => navigate(`/jobs?search=${tag}`)}
                className="px-3 py-1 text-xs text-gray-300 hover:text-gold-400 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="bg-white dark:bg-charcoal-900 py-10 border-b border-gray-100 dark:border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Active Jobs', value: 5280, suffix: '+', icon: '🏢' },
            { label: 'Companies Hiring', value: 850, suffix: '+', icon: '🏨' },
            { label: 'Job Seekers', value: 48000, suffix: '+', icon: '👥' },
            { label: 'Successful Placements', value: 12500, suffix: '+', icon: '🎉' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-bold font-display text-gradient">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="section-title">Browse by Category</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Select a department to explore job positions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button key={cat.label} onClick={() => setSelectedDept(cat.label)}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }} className="group card p-5 text-center cursor-pointer">
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                <cat.icon size={26} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm text-charcoal-800 dark:text-white leading-tight">{cat.label}</h3>
              <p className="text-xs text-gold-500 mt-1.5 flex items-center justify-center gap-1">View positions <FiChevronRight size={10} /></p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Department Jobs Modal */}
      <AnimatePresence>
        {selectedDept && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDept(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-charcoal-800 dark:text-white">{selectedDept}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select a position to search jobs</p>
                </div>
                <button onClick={() => setSelectedDept(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors">
                  <FiX size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(DEPT_JOBS[selectedDept] || []).map((position, idx) => (
                  <motion.button
                    key={position}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => { navigate(`/jobs?search=${encodeURIComponent(position)}`); setSelectedDept(null) }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 dark:border-charcoal-700 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-all group text-left"
                  >
                    <span className="text-sm font-medium text-charcoal-700 dark:text-gray-200 group-hover:text-gold-600">{position}</span>
                    <FiChevronRight size={14} className="text-gray-400 group-hover:text-gold-500 transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => { navigate(`/jobs?search=${encodeURIComponent(selectedDept)}`); setSelectedDept(null) }}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
              >
                <FiSearch size={14} /> View All {selectedDept} Jobs
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-cream-50 dark:bg-charcoal-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Jobs</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Hand-picked opportunities from top properties</p>
            </div>
            <button onClick={() => navigate('/jobs')} className="btn-outline flex items-center gap-2 text-sm">
              View All <FiArrowRight size={14} />
            </button>
          </div>
          {loading ? <SkeletonLoader count={6} type="job" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {featuredJobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="section-title">Top Companies Hiring</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Work with India's most prestigious hotel brands</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(companies.length ? companies : Array(12).fill(null)).map((company, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }} className="card p-4 text-center cursor-pointer group" onClick={() => company && navigate(`/company/${company._id}`)}>
              <div className="text-3xl mb-2">{company?.companyLogo || '🏨'}</div>
              <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-200 leading-tight">{company?.companyName || '...'}</p>
              {company && <p className="text-[10px] text-gold-600 mt-1">{company.jobCount || 0} jobs</p>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gradient-to-br from-charcoal-900 to-maroon-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Success Stories</h2>
            <p className="text-gray-400 mt-2">Hear from people who found their dream jobs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gold-400">{t.role} · {t.company}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex mt-4">
                  {Array.from({ length: t.rating }).map((_, j) => <FiStar key={j} size={14} className="text-gold-400 fill-gold-400" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Take the Next Step?</h2>
            <p className="text-gold-100 mb-8">Join 48,000+ hospitality professionals already on HotelJobs.com</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/auth?tab=register')} className="px-8 py-3 bg-white text-gold-600 font-bold rounded-xl hover:bg-gold-50 transition-all hover:-translate-y-1 shadow-lg">
                Create Free Account
              </button>
              <button onClick={() => navigate('/jobs')} className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Browse Jobs <FiArrowRight className="inline ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
