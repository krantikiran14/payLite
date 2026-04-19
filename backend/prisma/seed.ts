// ─── PayLite Database Seed ──────────────────────────────────────────────────
// Seeds: 1 demo user, 5 employees, April 2026 attendance, 2 bonus events
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PayLite database...');

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for seeding');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── 1. Create demo user in Supabase Auth ──
  const demoEmail = 'demo@paylite.in';
  const demoPassword = 'demo1234';

  // Check if user already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingDemo = existingUsers?.users?.find(u => u.email === demoEmail);

  let userId: string;

  if (existingDemo) {
    userId = existingDemo.id;
    console.log(`  ✓ Demo user already exists: ${userId}. Resetting password...`);
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: demoPassword,
      user_metadata: { name: 'Demo Owner', companyName: 'PayLite Demo Company' },
    });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { name: 'Demo Owner', companyName: 'PayLite Demo Company' },
    });

    if (error) {
      console.error('❌ Failed to create demo user:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`  ✓ Created demo user: ${userId}`);
  }

  // ── 2. Create User record in our DB ──
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: demoEmail,
      name: 'Demo Owner',
      companyName: 'PayLite Demo Company',
    },
  });
  console.log('  ✓ User record synced');

  // ── 3. Create 5 sample employees ──
  const employeeData = [
    { name: 'Aarav Kumar', role: 'Manager', basicSalary: 45000, hra: 18000, pfEnabled: true, esiEnabled: false, joiningDate: new Date('2024-03-01') },
    { name: 'Priya Sharma', role: 'Developer', basicSalary: 35000, hra: 14000, pfEnabled: true, esiEnabled: false, joiningDate: new Date('2024-06-15') },
    { name: 'Rahul Patel', role: 'Designer', basicSalary: 30000, hra: 12000, pfEnabled: true, esiEnabled: false, joiningDate: new Date('2025-01-10') },
    { name: 'Sneha Gupta', role: 'Accountant', basicSalary: 28000, hra: 11200, pfEnabled: true, esiEnabled: false, joiningDate: new Date('2025-04-01') },
    { name: 'Vikram Singh', role: 'Support', basicSalary: 15000, hra: 6000, pfEnabled: true, esiEnabled: true, joiningDate: new Date('2025-09-01') },
  ];

  // Delete existing seed data for this user
  await prisma.payslip.deleteMany({ where: { payrollRun: { userId } } });
  await prisma.payrollRun.deleteMany({ where: { userId } });
  await prisma.bonusEvent.deleteMany({ where: { employee: { userId } } });
  await prisma.attendanceLog.deleteMany({ where: { employee: { userId } } });
  await prisma.employee.deleteMany({ where: { userId } });

  const employees = [];
  for (const emp of employeeData) {
    const created = await prisma.employee.create({
      data: { userId, ...emp },
    });
    employees.push(created);
    console.log(`  ✓ Employee: ${created.name}`);
  }

  // ── 4. April 2026 attendance ──
  const attendanceData = [
    { employeeId: employees[0].id, month: 4, year: 2026, presentDays: 22, paidLeaveDays: 0, unpaidLeaveDays: 0, overtimeHours: 5 },
    { employeeId: employees[1].id, month: 4, year: 2026, presentDays: 20, paidLeaveDays: 1, unpaidLeaveDays: 1, overtimeHours: 8 },
    { employeeId: employees[2].id, month: 4, year: 2026, presentDays: 21, paidLeaveDays: 1, unpaidLeaveDays: 0, overtimeHours: 0 },
    { employeeId: employees[3].id, month: 4, year: 2026, presentDays: 18, paidLeaveDays: 1, unpaidLeaveDays: 3, overtimeHours: 2 },
    { employeeId: employees[4].id, month: 4, year: 2026, presentDays: 22, paidLeaveDays: 0, unpaidLeaveDays: 0, overtimeHours: 12 },
  ];

  for (const att of attendanceData) {
    await prisma.attendanceLog.create({ data: att });
  }
  console.log('  ✓ April 2026 attendance seeded');

  // ── 5. Bonus events ──
  await prisma.bonusEvent.create({
    data: { employeeId: employees[0].id, month: 4, year: 2026, label: 'Ugadi Festival Bonus', amount: 5000 },
  });
  await prisma.bonusEvent.create({
    data: { employeeId: employees[4].id, month: 4, year: 2026, label: 'Performance Bonus', amount: 2000 },
  });
  console.log('  ✓ Bonus events seeded');

  console.log('\n✅ Seed complete! Login with:');
  console.log('   Email: demo@paylite.in');
  console.log('   Password: demo1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
