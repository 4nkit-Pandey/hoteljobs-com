import { useState } from 'react'
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const ROLES = ['Chef', 'Sous Chef', 'Waiter', 'Waitress', 'Hotel Manager', 'General Manager', 'Housekeeping', 'Front Desk', 'Receptionist', 'Bartender', 'Concierge', 'F&B Manager', 'Kitchen Staff', 'Banquet Manager', 'Spa Therapist', 'Event Manager', 'Hospitality Executive']
const LOCATIONS = ['Mumbai', 'Delhi', 'Bengaluru', 'Goa', 'Jaipur', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Udaipur', 'Gurugram', 'Kochi']
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship']
const EXPERIENCE = [{ label: 'Fresher (0-1 yr)', min: 0, max: 1 }, { label: '1-3 years', min: 1, max: 3 }, { label: '3-5 years', min: 3, max: 5 }, { label: '5-10 years', min: 5, max: 10 }, { label: '10+ years', min: 10, max: 99 }]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 dark:border-charcoal-700 pb-4 mb-4">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full group mb-3">
        <span className="text-sm font-semibold text-charcoal-800 dark:text-white">{title}</span>
        {open ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{children}</motion.div>}
      </AnimatePresence>
    </div>
  )
}

export default function JobFilters({ filters, onChange, onClear }) {
  const toggle = (key, val) => {
    const current = filters[key] || []
    const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
    onChange({ ...filters, [key]: updated })
  }

  const activeCount = Object.values(filters).flat().filter(Boolean).length

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FiFilter size={16} className="text-gold-500" />
          <span className="font-semibold text-charcoal-800 dark:text-white">Filters</span>
          {activeCount > 0 && <span className="badge badge-gold text-[11px]">{activeCount}</span>}
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-maroon-600 dark:text-maroon-400 hover:underline flex items-center gap-1">
            <FiX size={12} /> Clear all
          </button>
        )}
      </div>

      <FilterSection title="Job Role">
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
          {ROLES.map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer hover:bg-gold-50 dark:hover:bg-charcoal-700 px-2 py-1 rounded-lg transition-colors">
              <input type="checkbox" checked={(filters.roles || []).includes(r)} onChange={() => toggle('roles', r)}
                className="w-3.5 h-3.5 accent-gold-500 rounded" />
              <span className="text-xs text-charcoal-700 dark:text-gray-300">{r}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
          {LOCATIONS.map(loc => (
            <label key={loc} className="flex items-center gap-2 cursor-pointer hover:bg-gold-50 dark:hover:bg-charcoal-700 px-2 py-1 rounded-lg transition-colors">
              <input type="checkbox" checked={(filters.locations || []).includes(loc)} onChange={() => toggle('locations', loc)}
                className="w-3.5 h-3.5 accent-gold-500" />
              <span className="text-xs text-charcoal-700 dark:text-gray-300">{loc}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Job Type">
        <div className="space-y-1.5">
          {JOB_TYPES.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer hover:bg-gold-50 dark:hover:bg-charcoal-700 px-2 py-1 rounded-lg transition-colors">
              <input type="checkbox" checked={(filters.jobTypes || []).includes(t)} onChange={() => toggle('jobTypes', t)}
                className="w-3.5 h-3.5 accent-gold-500" />
              <span className="text-xs capitalize text-charcoal-700 dark:text-gray-300">{t}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Experience">
        <div className="space-y-1.5">
          {EXPERIENCE.map(exp => (
            <label key={exp.label} className="flex items-center gap-2 cursor-pointer hover:bg-gold-50 dark:hover:bg-charcoal-700 px-2 py-1 rounded-lg transition-colors">
              <input type="radio" name="experience" checked={filters.expMin === exp.min && filters.expMax === exp.max}
                onChange={() => onChange({ ...filters, expMin: exp.min, expMax: exp.max })}
                className="w-3.5 h-3.5 accent-gold-500" />
              <span className="text-xs text-charcoal-700 dark:text-gray-300">{exp.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Salary Range (Monthly)" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min ₹" value={filters.salaryMin || ''} onChange={e => onChange({ ...filters, salaryMin: e.target.value })}
              className="input-field text-xs py-2" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="number" placeholder="Max ₹" value={filters.salaryMax || ''} onChange={e => onChange({ ...filters, salaryMax: e.target.value })}
              className="input-field text-xs py-2" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['10K', 10000], ['25K', 25000], ['50K', 50000], ['1L', 100000]].map(([label, val]) => (
              <button key={label} onClick={() => onChange({ ...filters, salaryMin: val })}
                className="px-2 py-1 text-[11px] border border-gray-200 dark:border-charcoal-600 rounded-lg hover:border-gold-400 hover:text-gold-600 transition-colors">
                {label}+
              </button>
            ))}
          </div>
        </div>
      </FilterSection>
    </div>
  )
}
