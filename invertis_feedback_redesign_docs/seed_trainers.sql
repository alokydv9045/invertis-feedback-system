-- =====================================================
-- SEED: 20 Indian Trainers (across departments)
-- Run AFTER setup_schema.sql and seed_courses_subjects.sql
-- =====================================================

INSERT INTO trainers (trainer_name, department) VALUES
  -- Computer Science & Engineering (5)
  ('Dr. Rajesh Kumar Sharma', 'Computer Science & Engineering'),
  ('Prof. Sunita Devi Gupta', 'Computer Science & Engineering'),
  ('Dr. Amit Prakash Verma', 'Computer Science & Engineering'),
  ('Prof. Kavita Singh Rathore', 'Computer Science & Engineering'),
  ('Dr. Vikram Narayan Joshi', 'Computer Science & Engineering'),
  -- Pharmacy (3)
  ('Dr. Priya Mehta Agarwal', 'Pharmacy'),
  ('Prof. Ravi Shankar Tiwari', 'Pharmacy'),
  ('Dr. Neelam Kumari Yadav', 'Pharmacy'),
  -- Law (3)
  ('Prof. Akhilesh Mohan Pandey', 'Law'),
  ('Dr. Shalini Dixit Mishra', 'Law'),
  ('Prof. Manoj Kumar Srivastava', 'Law'),
  -- Biotechnology (2)
  ('Dr. Deepika Rani Chauhan', 'Biotechnology'),
  ('Prof. Suresh Chandra Nair', 'Biotechnology'),
  -- Sciences (3)
  ('Dr. Arvind Kumar Patel', 'Sciences'),
  ('Prof. Anita Bala Saxena', 'Sciences'),
  ('Dr. Ramesh Prasad Dubey', 'Sciences'),
  -- Arts & Humanities (4)
  ('Prof. Meenakshi Kumari Das', 'Arts & Humanities'),
  ('Dr. Sanjay Rajan Iyer', 'Arts & Humanities'),
  ('Prof. Geeta Devi Bhatt', 'Arts & Humanities'),
  ('Dr. Prakash Chandra Jha', 'Arts & Humanities')
ON CONFLICT DO NOTHING;
