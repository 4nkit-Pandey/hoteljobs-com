require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SeekerProfile = require('../models/SeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');

const companies = [
  { name: 'Taj Hotels', logo: '🏨', location: 'Mumbai', desc: 'India\'s finest luxury hotel chain with iconic properties across the globe.', size: '500+', verified: true },
  { name: 'Oberoi Hotels', logo: '⭐', location: 'Delhi', desc: 'Award-winning luxury hotels and resorts delivering exceptional experiences.', size: '201-500', verified: true },
  { name: 'ITC Hotels', logo: '🌟', location: 'Kolkata', desc: 'Responsible luxury hotel chain known for green practices.', size: '500+', verified: true },
  { name: 'Leela Palaces', logo: '👑', location: 'Bengaluru', desc: 'Ultra-luxury palace hotels redefining Indian hospitality.', size: '201-500', verified: true },
  { name: 'Marriott India', logo: '🏢', location: 'Mumbai', desc: 'Global hospitality leader with multiple brands across India.', size: '500+', verified: true },
  { name: 'Hyatt India', logo: '🌐', location: 'Delhi', desc: 'World-class hospitality with authentic experiences.', size: '201-500', verified: true },
  { name: 'Radisson Hotels', logo: '🔵', location: 'Gurugram', desc: 'Upper upscale hotel brand delivering memorable moments.', size: '201-500', verified: true },
  { name: 'Lemon Tree Hotels', logo: '🍋', location: 'Delhi', desc: 'India\'s largest mid-priced hotel chain for value seekers.', size: '500+', verified: true },
  { name: 'Trident Hotels', logo: '🔱', location: 'Mumbai', desc: 'Five-star luxury hotels with contemporary Indian design.', size: '51-200', verified: true },
  { name: 'Vivanta by Taj', logo: '💎', location: 'Goa', desc: 'Sophisticated upscale hotel brand by Taj Group.', size: '201-500', verified: true },
  { name: 'JW Marriott', logo: '✨', location: 'Pune', desc: 'Luxury hotels offering refined service and elegant spaces.', size: '201-500', verified: true },
  { name: 'The Park Hotels', logo: '🎭', location: 'Chennai', desc: 'Boutique luxury hotels with art and design focus.', size: '51-200', verified: true }
];

const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Goa', 'Jaipur', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Udaipur', 'Gurugram', 'Chandigarh', 'Kochi', 'Shimla', 'Agra'];
const roles = ['Chef', 'Sous Chef', 'Waiter', 'Waitress', 'Hotel Manager', 'General Manager', 'Housekeeping', 'Front Desk', 'Receptionist', 'Bartender', 'Concierge', 'Room Service', 'F&B Manager', 'Kitchen Staff', 'Banquet Manager', 'Spa Therapist', 'Event Manager', 'Hospitality Executive'];

const skillSets = {
  'Chef': ['Indian Cuisine', 'Continental Cooking', 'Menu Planning', 'Food Safety', 'Kitchen Management', 'HACCP'],
  'Sous Chef': ['French Cuisine', 'Italian Cuisine', 'Food Plating', 'Inventory Management', 'Team Leadership'],
  'Waiter': ['Customer Service', 'Table Setting', 'Wine Knowledge', 'POS Systems', 'English Communication'],
  'Waitress': ['Customer Service', 'Table Setting', 'Multi-tasking', 'POS Systems', 'Hindi Communication'],
  'Hotel Manager': ['Revenue Management', 'Staff Management', 'Budget Planning', 'Guest Relations', 'Opera PMS', 'Leadership'],
  'General Manager': ['P&L Management', 'Strategic Planning', 'Revenue Optimization', 'Team Building', 'Brand Standards'],
  'Housekeeping': ['Room Cleaning', 'Laundry Management', 'Inventory Control', 'Quality Standards', 'Time Management'],
  'Front Desk': ['Check-in/Check-out', 'Reservation Systems', 'Customer Service', 'Opera PMS', 'Communication Skills'],
  'Receptionist': ['Multi-line Phones', 'Guest Relations', 'MS Office', 'Booking Systems', 'Bilingual'],
  'Bartender': ['Mixology', 'Wine Service', 'Inventory Management', 'Customer Engagement', 'Bar Setup'],
  'Concierge': ['Local Knowledge', 'Travel Planning', 'VIP Services', 'Communication', 'Problem Solving'],
  'Room Service': ['Food Service', 'Order Management', 'Tray Setup', 'Guest Interaction', 'Timing'],
  'F&B Manager': ['Menu Engineering', 'Cost Control', 'Staff Training', 'Event Planning', 'Quality Control'],
  'Kitchen Staff': ['Food Preparation', 'Kitchen Hygiene', 'Equipment Handling', 'Team Work', 'Speed'],
  'Banquet Manager': ['Event Coordination', 'Client Relations', 'Staff Scheduling', 'Budget Management', 'Setup Planning'],
  'Spa Therapist': ['Massage Therapy', 'Aromatherapy', 'Customer Care', 'Product Knowledge', 'Wellness'],
  'Event Manager': ['Event Planning', 'Vendor Management', 'Budget Control', 'Client Liaison', 'Creativity'],
  'Hospitality Executive': ['Guest Relations', 'CRM', 'Revenue Management', 'Digital Marketing', 'Analytics']
};

const jobDescriptions = {
  'Chef': 'We are looking for an experienced Chef to join our culinary team. You will be responsible for preparing high-quality meals, managing kitchen operations, and creating innovative menus that delight our guests.',
  'Sous Chef': 'Seeking a talented Sous Chef to support kitchen operations. You will assist the Head Chef with menu development, supervise kitchen staff, and ensure consistent food quality.',
  'Waiter': 'Join our food & beverage team as a Waiter. You will provide exceptional table service, manage guest orders, and ensure a memorable dining experience.',
  'Hotel Manager': 'We need an experienced Hotel Manager to oversee daily operations, manage staff, ensure guest satisfaction, and drive revenue growth for the property.',
  'General Manager': 'Looking for a dynamic General Manager to lead all hotel operations. You will set strategic direction, manage P&L, and ensure brand standards are upheld.',
  'Housekeeping': 'We need detail-oriented Housekeeping staff to maintain the highest standards of cleanliness and presentation across our rooms and public areas.',
  'Front Desk': 'Seeking a professional Front Desk Associate to manage check-ins, respond to guest queries, and ensure smooth front office operations.',
  'Bartender': 'Join our bar team as a skilled Bartender. Create signature cocktails, maintain bar inventory, and deliver exceptional guest experiences.'
};

function getRandomSalary(role) {
  const ranges = {
    'Chef': [25000, 65000], 'Sous Chef': [20000, 50000], 'Waiter': [12000, 25000], 'Waitress': [12000, 25000],
    'Hotel Manager': [45000, 120000], 'General Manager': [80000, 200000], 'Housekeeping': [10000, 22000],
    'Front Desk': [15000, 35000], 'Receptionist': [12000, 30000], 'Bartender': [15000, 40000],
    'Concierge': [18000, 35000], 'Room Service': [10000, 22000], 'F&B Manager': [35000, 80000],
    'Kitchen Staff': [10000, 20000], 'Banquet Manager': [30000, 65000], 'Spa Therapist': [15000, 35000],
    'Event Manager': [30000, 70000], 'Hospitality Executive': [25000, 55000]
  };
  const [min, max] = ranges[role] || [15000, 40000];
  const salaryMin = Math.round((min + Math.random() * (max - min) * 0.4) / 1000) * 1000;
  const salaryMax = Math.round((salaryMin + Math.random() * (max - salaryMin)) / 1000) * 1000;
  return { salaryMin, salaryMax };
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await SeekerProfile.deleteMany({});
    await RecruiterProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({ name: 'Admin', email: 'admin@hoteljobs.com', password: 'admin123', role: 'admin', phone: '9999999999' });
    console.log('Admin created: admin@hoteljobs.com / admin123');

    // Create recruiters
    const recruiterUsers = [];
    const recruiterProfiles = [];
    for (const company of companies) {
      const user = await User.create({
        name: `${company.name} HR`, email: `hr@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'recruiter123', role: 'recruiter', phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`
      });
      const profile = await RecruiterProfile.create({
        userId: user._id, companyName: company.name, companyLogo: company.logo,
        description: company.desc, location: company.location, size: company.size,
        verified: company.verified, industry: 'Hospitality',
        website: `https://www.${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        benefits: ['Health Insurance', 'Meals Included', 'Staff Accommodation', 'Career Growth', 'Training Programs']
      });
      recruiterUsers.push(user);
      recruiterProfiles.push(profile);
    }
    console.log(`Created ${recruiterUsers.length} recruiter accounts`);

    // Create jobs
    const jobs = [];
    for (let i = 0; i < 60; i++) {
      const companyIdx = i % companies.length;
      const role = roles[Math.floor(Math.random() * roles.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const { salaryMin, salaryMax } = getRandomSalary(role);
      const skills = skillSets[role] || ['Customer Service', 'Communication', 'Team Work'];
      const expMin = Math.floor(Math.random() * 5);
      const expMax = expMin + 1 + Math.floor(Math.random() * 5);
      const desc = jobDescriptions[role] || `We are looking for a skilled ${role} to join our team at ${companies[companyIdx].name}. Excellent opportunity for career growth in the hospitality industry.`;

      const job = await Job.create({
        recruiterId: recruiterUsers[companyIdx]._id,
        companyName: companies[companyIdx].name,
        companyLogo: companies[companyIdx].logo,
        title: `${role} - ${companies[companyIdx].name}`,
        description: `${desc}\n\nAbout ${companies[companyIdx].name}:\n${companies[companyIdx].desc}\n\nThis is a fantastic opportunity to advance your career in the hospitality industry at one of India's premier hotel brands.`,
        role, location: city, city, state: getState(city),
        salaryMin, salaryMax, salaryPeriod: 'monthly',
        experienceMin: expMin, experienceMax: expMax,
        skills, requirements: [`Minimum ${expMin} years experience`, 'Excellent communication skills', 'Relevant degree/certification preferred', 'Willingness to work in shifts'],
        benefits: ['Health Insurance', 'Meals', 'Staff Accommodation', 'Annual Bonus', 'Training'],
        jobType: Math.random() > 0.85 ? 'part-time' : 'full-time',
        shift: ['day', 'night', 'rotational', 'flexible'][Math.floor(Math.random() * 4)],
        openings: 1 + Math.floor(Math.random() * 5),
        status: 'approved',
        featured: i < 8,
        easyApply: Math.random() > 0.3,
        views: Math.floor(Math.random() * 500),
        applicationCount: Math.floor(Math.random() * 30),
        postedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      jobs.push(job);
    }
    console.log(`Created ${jobs.length} job listings`);

    // Create seekers
    const seekerNames = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh', 'Anjali Reddy', 'Ravi Shekhar', 'Meera Iyer', 'Sunil Verma', 'Kavya Nair', 'Arjun Das', 'Pooja Mehta', 'Kiran Joshi', 'Deepika Rao', 'Rajesh Menon', 'Nisha Agarwal', 'Mohit Chauhan', 'Shruti Kapoor', 'Vishal Tiwari', 'Ananya Pillai'];
    for (const name of seekerNames) {
      const email = name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com';
      const user = await User.create({ name, email, password: 'seeker123', role: 'seeker', phone: `97${Math.floor(10000000 + Math.random() * 90000000)}` });
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      await SeekerProfile.create({
        userId: user._id, headline: `Experienced ${randomRole}`,
        summary: `Passionate hospitality professional with experience in ${randomRole.toLowerCase()} roles. Looking for growth opportunities in premium hotels.`,
        skills: skillSets[randomRole] || ['Customer Service', 'Communication'],
        location: randomCity, preferredLocations: [randomCity, cities[Math.floor(Math.random() * cities.length)]],
        expectedSalary: getRandomSalary(randomRole),
        languages: ['English', 'Hindi'], totalExperience: 1 + Math.floor(Math.random() * 10),
        preferredRoles: [randomRole], profileCompletion: 40 + Math.floor(Math.random() * 50),
        experience: [{ title: randomRole, company: companies[Math.floor(Math.random() * companies.length)].name, location: randomCity, from: new Date(2020, 0), current: true, description: `Working as ${randomRole}` }],
        education: [{ degree: 'Hotel Management', institution: 'IHM ' + randomCity, year: 2018 + Math.floor(Math.random() * 4), field: 'Hospitality' }]
      });
    }
    console.log(`Created ${seekerNames.length} seeker accounts`);
    console.log('\n✅ Seed complete!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@hoteljobs.com / admin123');
    console.log('Recruiter: hr@tajhotels.com / recruiter123');
    console.log('Seeker: rahul.sharma@gmail.com / seeker123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

function getState(city) {
  const map = { Mumbai: 'Maharashtra', Delhi: 'Delhi', Bengaluru: 'Karnataka', Goa: 'Goa', Jaipur: 'Rajasthan', Kolkata: 'West Bengal', Chennai: 'Tamil Nadu', Hyderabad: 'Telangana', Pune: 'Maharashtra', Udaipur: 'Rajasthan', Gurugram: 'Haryana', Chandigarh: 'Chandigarh', Kochi: 'Kerala', Shimla: 'Himachal Pradesh', Agra: 'Uttar Pradesh' };
  return map[city] || '';
}

seed();
