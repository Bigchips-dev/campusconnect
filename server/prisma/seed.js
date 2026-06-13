const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { CATEGORIES } = require('../src/data/categories');
const { VIRTUAL_ELIGIBLE_CATEGORIES } = require('../src/config/virtualCategories');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── 1. Seed Categories & Subcategories ─────────────────────────
  console.log('📂 Seeding categories...');
  let totalSubs = 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];

    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        description: cat.description,
        isVirtualEligible: VIRTUAL_ELIGIBLE_CATEGORIES.includes(cat.id),
        sortOrder: i + 1,
      },
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        description: cat.description,
        isVirtualEligible: VIRTUAL_ELIGIBLE_CATEGORIES.includes(cat.id),
        sortOrder: i + 1,
      },
    });

    // Delete existing subcategories and re-create for this category
    await prisma.subcategory.deleteMany({ where: { categoryId: cat.id } });

    for (let j = 0; j < cat.subcategories.length; j++) {
      await prisma.subcategory.create({
        data: {
          name: cat.subcategories[j],
          categoryId: cat.id,
          sortOrder: j + 1,
        },
      });
      totalSubs++;
    }

    console.log(`   ✅ ${cat.name} — ${cat.subcategories.length} subcategories`);
  }

  console.log(`\n   📊 Total: ${CATEGORIES.length} categories, ${totalSubs} subcategories\n`);

  // ─── 2. Seed Demo Users ─────────────────────────────────────────
  console.log('👤 Seeding demo users...');
  const password = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@university.edu' },
    update: {},
    create: {
      email: 'alice@university.edu',
      passwordHash: password,
      firstName: 'Alice',
      lastName: 'Johnson',
      university: 'State University',
      phone: '+2348001234567',
      gender: 'female',
      faculty: 'Faculty of Engineering',
      level: '400L',
      activeRoles: ['PROVIDER', 'SEEKER'],
      onboardingComplete: true,
      onboardingStep: 4,
      emailVerified: true,
      interests: ['ACADEMIC_TUTORING', 'TECH_DIGITAL', 'CAREER_SELF_GROWTH'],
      bio: 'Computer Science student passionate about tutoring and web development.',
    },
  });
  console.log('   ✅ Alice Johnson (Provider + Seeker)');

  const bob = await prisma.user.upsert({
    where: { email: 'bob@university.edu' },
    update: {},
    create: {
      email: 'bob@university.edu',
      passwordHash: password,
      firstName: 'Bob',
      lastName: 'Smith',
      university: 'State University',
      phone: '+2348007654321',
      gender: 'male',
      faculty: 'Faculty of Arts',
      level: '300L',
      activeRoles: ['PROVIDER'],
      onboardingComplete: true,
      onboardingStep: 4,
      emailVerified: true,
      bio: 'Professional photographer, videographer, and graphic designer.',
    },
  });
  console.log('   ✅ Bob Smith (Provider)');

  const carol = await prisma.user.upsert({
    where: { email: 'carol@university.edu' },
    update: {},
    create: {
      email: 'carol@university.edu',
      passwordHash: password,
      firstName: 'Carol',
      lastName: 'Williams',
      university: 'State University',
      phone: '+2348009876543',
      gender: 'female',
      faculty: 'Faculty of Social Sciences',
      level: '200L',
      activeRoles: ['SEEKER'],
      onboardingComplete: true,
      onboardingStep: 4,
      emailVerified: true,
      interests: ['CREATIVE_ARTS', 'FOOD_CATERING', 'BEAUTY_GROOMING', 'HOUSING_CAMPUS_LIFE'],
      bio: 'Looking for services to make campus life easier!',
    },
  });
  console.log('   ✅ Carol Williams (Seeker)\n');

  // ─── 3. Seed Provider Skills ────────────────────────────────────
  console.log('🛠️  Seeding provider skills...');
  await prisma.providerSkill.deleteMany({
    where: { userId: { in: [alice.id, bob.id] } },
  });

  await prisma.providerSkill.createMany({
    data: [
      { userId: alice.id, category: 'ACADEMIC_TUTORING', subcategory: 'Course Tutoring', description: 'Help with calculus, linear algebra, and discrete math.', pricingType: 'HOURLY', experience: 2 },
      { userId: alice.id, category: 'ACADEMIC_TUTORING', subcategory: 'Exam Prep', description: 'Intensive exam preparation sessions with practice problems.', pricingType: 'FIXED', experience: 2 },
      { userId: alice.id, category: 'TECH_DIGITAL', subcategory: 'Web Design', description: 'React and Node.js web applications for projects and portfolios.', pricingType: 'FIXED', experience: 3 },
      { userId: bob.id, category: 'CREATIVE_ARTS', subcategory: 'Photography', description: 'Professional event and portrait photography.', pricingType: 'FIXED', experience: 4 },
      { userId: bob.id, category: 'CREATIVE_ARTS', subcategory: 'Videography', description: 'Event videography with professional editing.', pricingType: 'FIXED', experience: 3 },
      { userId: bob.id, category: 'TECH_DIGITAL', subcategory: 'Graphic Design', description: 'Modern logo design, branding, and social media graphics.', pricingType: 'FIXED', experience: 3 },
    ],
  });
  console.log('   ✅ 6 provider skills seeded\n');

  // ─── 4. Seed Sample Services ────────────────────────────────────
  console.log('📦 Seeding sample services...');

  // Delete existing services for demo users to avoid duplicates
  await prisma.service.deleteMany({
    where: { providerId: { in: [alice.id, bob.id] } },
  });

  await prisma.service.createMany({
    data: [
      {
        title: 'Calculus & Linear Algebra Tutoring',
        description: 'One-on-one tutoring sessions for MTH 201 and MTH 301. Clear explanations with practice problems and past question walkthroughs.',
        category: 'ACADEMIC_TUTORING', price: 3000, pricingType: 'HOURLY', providerId: alice.id,
      },
      {
        title: 'React & Node.js Web Development',
        description: 'Custom web applications built with modern technologies. Portfolio projects, academic projects, and startup MVPs welcome.',
        category: 'TECH_DIGITAL', price: 5000, pricingType: 'HOURLY', providerId: alice.id,
      },
      {
        title: 'Professional Event Photography',
        description: 'Full event coverage including edited photos delivered within 48 hours. Covers birthday parties, department events, and ceremonies.',
        category: 'CREATIVE_ARTS', price: 25000, pricingType: 'FIXED', providerId: bob.id,
      },
      {
        title: 'Modern Logo & Brand Design',
        description: 'Professional logo design with 3 concepts, unlimited revisions, full source files, and social media kit.',
        category: 'TECH_DIGITAL', price: 15000, pricingType: 'FIXED', providerId: bob.id,
      },
      {
        title: 'Exam Prep Crash Course',
        description: 'Intensive 3-session exam prep package for engineering and science courses. Includes summarized notes and practice tests.',
        category: 'ACADEMIC_TUTORING', price: 8000, pricingType: 'FIXED', providerId: alice.id,
      },
      {
        title: 'Event Videography Package',
        description: 'Full event videography with professional editing, color grading, and music. Delivered within 72 hours.',
        category: 'CREATIVE_ARTS', price: 35000, pricingType: 'FIXED', providerId: bob.id,
      },
    ],
  });
  console.log('   ✅ 6 sample services seeded\n');

  // ─── Summary ────────────────────────────────────────────────────
  const catCount = await prisma.category.count();
  const subCount = await prisma.subcategory.count();
  const userCount = await prisma.user.count();
  const serviceCount = await prisma.service.count();
  const skillCount = await prisma.providerSkill.count();

  console.log('═══════════════════════════════════════');
  console.log(`  📂 ${catCount} categories`);
  console.log(`  📋 ${subCount} subcategories`);
  console.log(`  👤 ${userCount} users`);
  console.log(`  📦 ${serviceCount} services`);
  console.log(`  🛠️  ${skillCount} provider skills`);
  console.log('═══════════════════════════════════════');
  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
