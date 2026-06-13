/**
 * CampusConnect — Full Service Category System (Client)
 *
 * 18 categories with Lucide icon names, hex colors, descriptions,
 * and exhaustive subcategory lists.
 */

export const CATEGORIES = [
  {
    id: 'ACADEMIC_TUTORING',
    name: 'Academic & Tutoring',
    icon: 'BookOpen',
    color: '#4F46E5',
    description: 'Get help with coursework, exam prep, and academic support from fellow students.',
    subcategories: [
      'Course Tutoring', 'Assignment Help', 'Exam Prep', 'Thesis Help',
      'Language Lessons', 'Study Group Facilitation', 'Past Exam Question Banks',
      'Note-Taking Services', 'Academic Appeal Letter Writing',
    ],
  },
  {
    id: 'FOOD_CATERING',
    name: 'Food & Catering',
    icon: 'UtensilsCrossed',
    color: '#EF4444',
    description: 'Delicious home-cooked meals, snacks, and catering services on campus.',
    subcategories: [
      'Home-Cooked Meals', 'Snacks & Baking', 'Drinks', 'Meal Prep',
      'Late-Night Delivery', 'Dietary-Specific Meals (Vegan/Halal/Keto)',
      'Bulk Weekly Meal Prep', 'Shawarma & Street Food', 'Small Event Catering',
    ],
  },
  {
    id: 'BEAUTY_GROOMING',
    name: 'Beauty & Grooming',
    icon: 'Sparkles',
    color: '#EC4899',
    description: 'Look your best with barbing, braiding, makeup, skincare, and more.',
    subcategories: [
      'Barbing & Haircuts', 'Hairdressing', 'Makeup', 'Braiding & Locs',
      'Nail Art', 'Skincare', 'Eyebrow Threading', 'Waxing',
      'Hair Dyeing & Coloring', 'Facial Treatments',
    ],
  },
  {
    id: 'TECH_DIGITAL',
    name: 'Tech & Digital',
    icon: 'Monitor',
    color: '#0EA5E9',
    description: 'Software, web design, graphic design, video editing, and digital services.',
    subcategories: [
      'Software Development', 'Web Design', 'Graphic Design', 'Video Editing',
      'Photo Editing', 'Social Media Management', 'Data Analysis',
      'Podcast Editing', '3D Printing Services', 'App Development Tutoring',
    ],
  },
  {
    id: 'FASHION_CLOTHING',
    name: 'Fashion & Clothing',
    icon: 'Scissors',
    color: '#F97316',
    description: 'Tailoring, laundry, dry cleaning, and custom fashion services.',
    subcategories: [
      'Tailoring', 'Dry Cleaning', 'Laundry', 'Shoe Cleaning',
      'Fabric Sourcing', 'Thrift Flipping & Upcycling',
      'Embroidery & Custom Patches', 'Formal Wear Rental',
      'Costume & Cultural Attire Design',
    ],
  },
  {
    id: 'HOME_REPAIR',
    name: 'Home & Repair',
    icon: 'Wrench',
    color: '#84CC16',
    description: 'Electrical fixes, plumbing, furniture repair, and room maintenance.',
    subcategories: [
      'Electrical Fixes', 'Plumbing', 'Furniture Repair', 'Painting',
      'Cleaning Services', 'Shelf & Curtain Installation',
      'Phone Holder & Mount Fitting', 'Appliance Repairs', 'Lock & Key Services',
    ],
  },
  {
    id: 'HEALTH_WELLNESS',
    name: 'Health & Wellness',
    icon: 'Heart',
    color: '#10B981',
    description: 'Fitness coaching, mental wellness, nutrition, and health support.',
    subcategories: [
      'Fitness Coaching', 'Yoga', 'Mental Wellness Support', 'Nutrition Advice',
      'Medication Reminders', 'Peer Mental Health Support Groups',
      'Period Care Packages', 'Stress & Anxiety Coaching',
      'Health Accountability Partnerships',
    ],
  },
  {
    id: 'CREATIVE_ARTS',
    name: 'Creative Arts',
    icon: 'Palette',
    color: '#8B5CF6',
    description: 'Photography, videography, music, murals, and all things creative.',
    subcategories: [
      'Photography', 'Videography', 'Music Lessons', 'Event MC',
      'Mural & Wall Art', 'Jingle & Song Composition', 'Stop-Motion Animation',
      'Beat Making', 'Caricature & Portrait Drawing', 'Spoken Word Coaching',
    ],
  },
  {
    id: 'LOGISTICS_ERRANDS',
    name: 'Logistics & Errands',
    icon: 'Truck',
    color: '#F59E0B',
    description: 'Delivery, shopping runs, printing, queue standing, and errands.',
    subcategories: [
      'Delivery', 'Shopping Runs', 'Printing & Binding', 'Photocopy Runs',
      'Queue Standing Services (Admin/Bank Lines)', 'Form Submission Runs',
      'Airport & Park Pickup', 'Bank & Post Office Errands', 'Grocery Runs',
    ],
  },
  {
    id: 'SPIRITUAL_CULTURAL',
    name: 'Spiritual & Cultural',
    icon: 'Globe',
    color: '#6366F1',
    description: 'Event planning, cultural exchange, religious tutoring, and community services.',
    subcategories: [
      'Event Planning', 'Cultural Group Services', 'Religious Tutoring',
      'Language Exchange Programs', 'Cultural Attire Rental',
      'Traditional Food Catering', 'Cultural Event Hosting',
      'Religious Study Groups',
    ],
  },
  {
    id: 'WRITING_HELP',
    name: 'Writing Help',
    icon: 'PenLine',
    color: '#6366F1',
    description: 'Essay writing, proofreading, CVs, translation, and professional writing.',
    subcategories: [
      'Essay & Report Writing', 'Proofreading & Editing',
      'CV & Cover Letter Writing', 'Thesis Formatting', 'Translation',
      'Transcription', 'Business Plan Writing', 'Speech Writing',
      'Grant Report Writing', 'Petition Writing',
    ],
  },
  {
    id: 'PHONE_LAPTOP_REPAIR',
    name: 'Phone & Laptop Repair',
    icon: 'Cpu',
    color: '#0EA5E9',
    description: 'Screen repair, data recovery, virus removal, and tech accessories.',
    subcategories: [
      'Phone Screen Repair', 'Battery Replacement', 'Laptop Repairs',
      'Data Recovery', 'Software Installation', 'Virus Removal',
      'Accessories Sales', 'Smartwatch Repair', 'Headphone Repair',
      'Charging Port Cleaning',
    ],
  },
  {
    id: 'RESEARCH_STUDY_HELP',
    name: 'Research & Study Help',
    icon: 'BarChart2',
    color: '#10B981',
    description: 'SPSS, R, Python analysis, survey creation, and research support.',
    subcategories: [
      'SPSS Analysis', 'R & Python Analysis', 'Survey Creation',
      'Data Entry & Cleaning', 'Research Proposal Writing', 'Literature Review',
      'Plagiarism Checking', 'Citation Formatting', 'Lab Report Writing',
      'Focus Group Facilitation', 'Academic Poster Design',
    ],
  },
  {
    id: 'SPORTS_FITNESS',
    name: 'Sports & Fitness',
    icon: 'Activity',
    color: '#EF4444',
    description: 'Coaching, training, equipment rental, and sports photography.',
    subcategories: [
      'Football Coaching', 'Basketball Coaching', 'Table Tennis Training',
      'Swimming Lessons', 'Gym & Weight Training', 'Running Coaching',
      'Martial Arts', 'Yoga', 'Sports Equipment Rental',
      'Sports Photography', 'Team Kit Coordination',
    ],
  },
  {
    id: 'HOUSING_CAMPUS_LIFE',
    name: 'Housing & Campus Life',
    icon: 'Home',
    color: '#F59E0B',
    description: 'Room hunting, campus tours, cleaning, furniture, and campus life help.',
    subcategories: [
      'Help Finding a Room', 'Roommate Search', 'Campus Tour', 'Room Setup',
      'Room Cleaning', 'Furniture Rental', 'Luggage Moving', 'Internet Setup',
      'Shared Grocery Runs', 'Noise Complaint Mediation',
    ],
  },
  {
    id: 'PRINTING_MEDIA',
    name: 'Printing & Media Services',
    icon: 'Printer',
    color: '#EC4899',
    description: 'Document printing, binding, posters, passport photos, and custom merch.',
    subcategories: [
      'Document Printing', 'Thesis Binding', 'Poster & Banner Printing',
      'Passport Photos', 'Photocopying', 'Lamination',
      'Custom T-Shirt Printing', 'Flyer Design',
      'Merchandise Printing for Clubs', 'Photo Booth Setup',
    ],
  },
  {
    id: 'BUY_SELL_RENT',
    name: 'Buy, Sell & Rent',
    icon: 'ShoppingBag',
    color: '#84CC16',
    description: 'Used textbooks, stationery, phones, furniture, and item rentals.',
    subcategories: [
      'Used Textbooks', 'Lecture Notes', 'Stationery', 'Second-Hand Clothes',
      'Used Phones & Laptops', 'Lab Equipment', 'Room Furniture',
      'Farm Produce', 'Event Tickets', 'Item Rentals',
      'Academic Software License Sharing', 'Scientific Calculator Rental',
      'Formal Wear Rental',
    ],
  },
  {
    id: 'CAREER_SELF_GROWTH',
    name: 'Career & Self Growth',
    icon: 'Briefcase',
    color: '#8B5CF6',
    description: 'Internships, interview coaching, mentoring, and professional development.',
    subcategories: [
      'Job & Internship Help', 'Interview Coaching', 'LinkedIn Setup',
      'Entrepreneurship Mentoring', 'Financial Literacy',
      'Public Speaking Coaching', 'Scholarship Help', 'Study Skills Coaching',
      'Sign Language Lessons', 'Professional Headshot Sessions',
      'Networking Event Organization', 'Alumni Connection Services',
    ],
  },
];

export const FACULTIES = [
  'Faculty of Administration', 'Faculty of Agriculture', 'Faculty of Allied Health Sciences',
  'Faculty of Arts', 'Faculty of Basic Clinical Sciences', 'Faculty of Basic Medical Sciences',
  'Faculty of Clinical Sciences', 'Faculty of Dental Surgery', 'Faculty of Education',
  'Faculty of Engineering', 'Faculty of Environmental Design', 'Faculty of Law',
  'Faculty of Life Sciences', 'Faculty of Management Sciences', 'Faculty of Pharmaceutical Sciences',
  'Faculty of Physical Sciences', 'Faculty of Social Sciences', 'Faculty of Veterinary Medicine',
  'Staff',
];

export const LEVELS = ['100L', '200L', '300L', '400L', '500L', 'Postgraduate', 'Staff'];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];
