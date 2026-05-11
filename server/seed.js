/**
 * IFS v2.0 — Master Seed Script
 * Creates 50 students, 2 HODs, 1 admin (Indian names), 
 * feedback forms, reviews, and review answers
 * 
 * Usage: node seed.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ============================================
// Indian Student Names (50)
// ============================================
const studentNames = [
  'Aarav Sharma', 'Aditi Patel', 'Aditya Gupta', 'Ananya Verma', 'Arjun Singh',
  'Avni Mehta', 'Chirag Thakur', 'Deepa Iyer', 'Dhruv Agarwal', 'Diya Nair',
  'Gaurav Mishra', 'Harini Reddy', 'Harsh Tiwari', 'Ishita Saxena', 'Jai Prakash Yadav',
  'Kavya Bhatt', 'Krish Joshi', 'Lavanya Das', 'Manav Chauhan', 'Megha Srivastava',
  'Naman Dubey', 'Neha Pandey', 'Nikhil Rathore', 'Pallavi Jha', 'Pranav Kumar',
  'Priyanka Kumari', 'Rahul Dixit', 'Riya Chopra', 'Rohan Malhotra', 'Sakshi Bhatia',
  'Samar Kapoor', 'Shreya Kulkarni', 'Shubham Ojha', 'Simran Kaur', 'Sneha Goyal',
  'Sohail Khan', 'Swati Rawat', 'Tanvi Deshmukh', 'Tushar Bansal', 'Urvashi Rajput',
  'Varun Sethi', 'Vidya Mohan', 'Vikas Chaudhary', 'Yash Trivedi', 'Zara Sheikh',
  'Ankit Dwivedi', 'Bhavna Pillai', 'Chetan Hegde', 'Divya Menon', 'Esha Khanna',
]

// Distribute students across courses
const courseDistribution = [
  { courseName: 'B.Tech CSE', count: 15 },
  { courseName: 'B.Pharma', count: 6 },
  { courseName: 'BA LLB', count: 5 },
  { courseName: 'BSc PCM', count: 4 },
  { courseName: 'BA Psychology Hons', count: 4 },
  { courseName: 'B.Tech Biotechnology', count: 3 },
  { courseName: 'BBA LLB', count: 3 },
  { courseName: 'BA Economics Hons', count: 3 },
  { courseName: 'BA English Hons', count: 2 },
  { courseName: 'BSc Hons Chemistry', count: 2 },
  { courseName: 'BSc ZBC', count: 2 },
  { courseName: 'B.Com LLB', count: 1 },
]

const hodProfiles = [
  { name: 'Dr. Rajendra Prasad Mishra', email: 'rajendra.mishra@invertis.org', dept: 'Computer Science & Engineering', password: 'hod@cse2024' },
  { name: 'Dr. Sunanda Kumari Joshi', email: 'sunanda.joshi@invertis.org', dept: 'Pharmacy', password: 'hod@pharma2024' },
]

const adminProfile = {
  name: 'Prof. Hari Mohan Saxena', email: 'admin@invertis.org', password: 'admin@ifs2024',
}

const batchYears = ['2022', '2023', '2024', '2025']

const feedbackTexts = [
  'The teaching methodology was excellent. The trainer explained every concept with real-world examples that made it easy to understand.',
  'Very knowledgeable faculty. However, the pace of teaching could be slightly slower for complex topics.',
  'The practical sessions were well-organized and helped reinforce theoretical concepts effectively.',
  'Good communication skills and approachable nature. Always available for doubt-clearing sessions after class.',
  'The course content was well-structured. Assignments were relevant and helped in deeper understanding.',
  'Faculty needs to use more visual aids and interactive teaching methods to keep students engaged.',
  'Outstanding dedication towards student welfare. The trainer goes above and beyond to help struggling students.',
  'The lab sessions were highly productive. Equipment availability and guidance were commendable.',
  'Would appreciate more industry-relevant case studies and guest lectures from professionals.',
  'The examination pattern was fair and covered all important topics discussed during lectures.',
  'Excellent use of technology in teaching. The digital resources shared were very helpful for self-study.',
  'The trainer maintained perfect discipline while keeping the classroom environment friendly and open.',
  'More emphasis needed on practical applications. Theory-heavy sessions can become monotonous.',
  'Very inspiring faculty member. Motivates students to think critically and explore beyond textbooks.',
  'The group activities and presentations organized by the trainer enhanced our communication skills.',
]

// ============================================
// Main Seed Function
// ============================================
async function seed() {
  console.log('🌱 Starting IFS v2.0 seed process...\n')

  // 1. Fetch existing courses
  console.log('📚 Fetching courses...')
  const { data: courses, error: courseErr } = await supabase.from('courses').select('*')
  if (courseErr) { console.error('❌ Failed to fetch courses:', courseErr.message); return }
  console.log(`   Found ${courses.length} courses`)

  const courseMap = {}
  courses.forEach(c => { courseMap[c.course_name] = c.id })

  // 2. Fetch existing trainers
  console.log('👩‍🏫 Fetching trainers...')
  const { data: trainers, error: trainerErr } = await supabase.from('trainers').select('*')
  if (trainerErr) { console.error('❌ Failed to fetch trainers:', trainerErr.message); return }
  console.log(`   Found ${trainers.length} trainers`)

  if (trainers.length === 0) {
    console.error('❌ No trainers found! Run seed_trainers.sql first.')
    return
  }

  // 3. Fetch subjects for feedback forms
  console.log('📖 Fetching subjects...')
  const { data: subjects, error: subErr } = await supabase.from('subjects').select('*')
  if (subErr) { console.error('❌ Failed to fetch subjects:', subErr.message); return }
  console.log(`   Found ${subjects.length} subjects`)

  // 4. Create Admin user
  console.log('\n🔐 Creating Admin...')
  const adminId = await createUser(adminProfile.email, adminProfile.password, {
    role: 'admin', full_name: adminProfile.name, email: adminProfile.email,
  })
  if (adminId) console.log(`   ✅ Admin: ${adminProfile.name} (${adminProfile.email})`)

  // 5. Create HOD users
  console.log('\n🎓 Creating HODs...')
  const hodIds = []
  for (const hod of hodProfiles) {
    const id = await createUser(hod.email, hod.password, {
      role: 'hod', full_name: hod.name, email: hod.email, department: hod.dept,
    })
    if (id) {
      hodIds.push(id)
      console.log(`   ✅ HOD: ${hod.name} (${hod.email})`)
    }
  }

  // 6. Create 50 Student users
  console.log('\n👨‍🎓 Creating 50 Students...')
  const studentIds = []
  let studentIdx = 0

  for (const dist of courseDistribution) {
    const courseId = courseMap[dist.courseName]
    if (!courseId) { console.warn(`   ⚠️ Course not found: ${dist.courseName}`); continue }

    for (let i = 0; i < dist.count && studentIdx < 50; i++) {
      const name = studentNames[studentIdx]
      const email = name.toLowerCase().replace(/\s+/g, '.') + '@invertis.org'
      const batch = batchYears[studentIdx % batchYears.length]
      const password = 'student@2024'

      const id = await createUser(email, password, {
        role: 'student', full_name: name, email, course_id: courseId, batch_year: batch,
      })
      if (id) {
        studentIds.push({ id, courseId, name })
        if (studentIdx % 10 === 0 || studentIdx === 49) {
          console.log(`   ✅ ${studentIdx + 1}/50 — ${name}`)
        }
      }
      studentIdx++
    }
  }
  console.log(`   Created ${studentIds.length} students total`)

  // 7. Create Feedback Forms (one per course-trainer-subject combo, ~15 forms)
  console.log('\n📝 Creating Feedback Forms...')
  const publisherId = adminId || hodIds[0]
  if (!publisherId) { console.error('❌ No publisher found!'); return }

  const formData = []
  const usedCourses = new Set()

  // Create 1-2 forms per course
  for (const dist of courseDistribution) {
    const courseId = courseMap[dist.courseName]
    if (!courseId) continue

    // Find subjects for this course
    const courseSubjects = subjects.filter(s => s.course_name === dist.courseName).slice(0, 2)
    if (courseSubjects.length === 0) continue

    // Get random trainers from matching department
    const course = courses.find(c => c.course_name === dist.courseName)
    const deptTrainers = trainers.filter(t => t.department === course?.department)
    const fallbackTrainers = trainers.slice(0, 3)
    const availableTrainers = deptTrainers.length > 0 ? deptTrainers : fallbackTrainers

    for (let j = 0; j < Math.min(courseSubjects.length, 2); j++) {
      const sub = courseSubjects[j]
      const trainer = availableTrainers[j % availableTrainers.length]

      formData.push({
        course_id: courseId,
        trainer_id: trainer.id,
        subject_name: sub.subject_name,
        subject_code: sub.subject_code,
        status: Math.random() > 0.2 ? 'active' : 'closed',
        published_by: publisherId,
      })
    }
  }

  const { data: forms, error: formErr } = await supabase.from('feedback_forms').insert(formData).select()
  if (formErr) { console.error('❌ Failed to create forms:', formErr.message); return }
  console.log(`   ✅ Created ${forms.length} feedback forms`)

  // 8. Create Reviews (each student reviews 2-4 forms from their course)
  console.log('\n⭐ Creating Reviews & Ratings...')
  let reviewCount = 0
  let answerCount = 0

  for (const student of studentIds) {
    // Find forms for this student's course
    const studentForms = forms.filter(f => f.course_id === student.courseId && f.status === 'active')
    // Also add some cross-course forms for variety
    const otherForms = forms.filter(f => f.course_id !== student.courseId && f.status === 'active').slice(0, 1)
    const formsToReview = [...studentForms, ...otherForms].slice(0, 3)

    for (const form of formsToReview) {
      const writtenFeedback = feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)]

      const { data: review, error: revErr } = await supabase.from('reviews').insert({
        form_id: form.id,
        student_id: student.id,
        written_feedback: writtenFeedback,
      }).select().single()

      if (revErr) {
        // Skip duplicates silently
        if (revErr.code === '23505') continue
        continue
      }

      reviewCount++

      // Create 10 rating answers
      const answers = []
      for (let q = 1; q <= 10; q++) {
        // Realistic bell-curve ratings: mostly 4-6, occasionally 2-3 or 7
        const baseRating = 4 + Math.floor(Math.random() * 3) // 4-6
        const variance = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -2) : 0
        const rating = Math.max(1, Math.min(7, baseRating + variance))

        answers.push({
          review_id: review.id,
          question_id: `q${q}`,
          rating_value: rating,
        })
      }

      const { error: ansErr } = await supabase.from('review_answers').insert(answers)
      if (!ansErr) answerCount += 10
    }
  }

  console.log(`   ✅ Created ${reviewCount} reviews with ${answerCount} rating answers`)

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 SEED COMPLETE!')
  console.log('='.repeat(50))
  console.log(`   Admin:     1 (${adminProfile.email} / ${adminProfile.password})`)
  console.log(`   HODs:      ${hodIds.length}`)
  hodProfiles.forEach(h => console.log(`              ${h.email} / ${h.password}`))
  console.log(`   Students:  ${studentIds.length} (password: student@2024)`)
  console.log(`   Forms:     ${forms.length}`)
  console.log(`   Reviews:   ${reviewCount}`)
  console.log(`   Ratings:   ${answerCount}`)
  console.log('='.repeat(50))
}

async function createUser(email, password, profileData) {
  try {
    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    })

    if (authErr) {
      if (authErr.message?.includes('already been registered')) {
        // User exists, try to find their ID
        const { data: users } = await supabase.auth.admin.listUsers()
        const existing = users?.users?.find(u => u.email === email)
        return existing?.id || null
      }
      console.error(`   ❌ Auth error for ${email}: ${authErr.message}`)
      return null
    }

    const userId = authData.user.id

    // Create profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      ...profileData,
    })

    if (profileErr) {
      console.error(`   ❌ Profile error for ${email}: ${profileErr.message}`)
      return null
    }

    return userId
  } catch (err) {
    console.error(`   ❌ Error creating ${email}: ${err.message}`)
    return null
  }
}

seed().catch(console.error)
