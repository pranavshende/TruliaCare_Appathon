const argon2 = require('argon2');
const prisma = require('../prismaClient');

async function main() {
  console.log('🌱 Starting database seed for TruliaCare Maintenance & Escalation System (Updated Schema)...');

  // 1. Clean existing records in reverse dependency order
  console.log('Cleaning existing records...');
  await prisma.emailLog.deleteMany({});
  await prisma.escalationLog.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash default passwords
  const defaultPassword = await argon2.hash('password123');
  const adminPassword = await argon2.hash('admin123');

  // 3. Seed Users (Employee, Admin, Technicians)
  console.log('Seeding users across EMPLOYEE, ADMIN, and TECHNICIAN roles...');

  const employee = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@company.com',
      password: defaultPassword,
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@company.com',
      password: defaultPassword,
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Facility Manager',
      email: 'fm@company.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const techIT = await prisma.user.create({
    data: {
      name: 'Ravi Kumar (IT Specialist)',
      email: 'ravi.tech@company.com',
      password: defaultPassword,
      role: 'TECHNICIAN',
      isActive: true,
    },
  });

  const techFacility = await prisma.user.create({
    data: {
      name: 'Suresh Patel (Facility Specialist)',
      email: 'suresh.tech@company.com',
      password: defaultPassword,
      role: 'TECHNICIAN',
      isActive: true,
    },
  });

  const techElectrical = await prisma.user.create({
    data: {
      name: 'Amit Sharma (Electrical Specialist)',
      email: 'amit.tech@company.com',
      password: defaultPassword,
      role: 'TECHNICIAN',
      isActive: true,
    },
  });

  console.log(`✓ Seeded users:
  - Employee: ${employee.email}, ${employee2.email}
  - Admin: ${admin.email}
  - Technicians: ${techIT.email}, ${techFacility.email}, ${techElectrical.email}`);

  // 4. Seed Maintenance Requests
  console.log('Seeding maintenance requests...');
  const now = new Date();

  // Request 1: PENDING (IT - VPN Issue)
  const req1 = await prisma.maintenanceRequest.create({
    data: {
      title: 'VPN connection dropping repeatedly on 4th floor',
      description: 'Corporate GlobalProtect VPN drops every 10-15 minutes when connecting from the engineering wing.',
      category: 'IT',
      priority: 'HIGH',
      status: 'PENDING',
      employeeId: employee.id,
    },
  });

  // Request 2: IN_PROGRESS (FACILITY - AC leak)
  const req2 = await prisma.maintenanceRequest.create({
    data: {
      title: 'AC unit condensation leaking in Server Room B',
      description: 'Water droplet condensation visible above Server Rack #2. Needs urgent drainage inspection.',
      category: 'FACILITY',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      employeeId: employee.id,
      technicianId: techFacility.id,
    },
  });

  // Request 3: ESCALATED (ELECTRICAL - Main Breaker Trip)
  const pastTime = new Date(now.getTime() - 40 * 60 * 1000); // 40 minutes ago
  const escalatedTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
  const req3 = await prisma.maintenanceRequest.create({
    data: {
      title: 'Main power breaker tripping intermittently in Lab 3',
      description: 'Lab 3 heavy equipment trips breaker panel 3B under sustained load. Immediate inspection required.',
      category: 'ELECTRICAL',
      priority: 'CRITICAL',
      status: 'ESCALATED',
      employeeId: employee2.id,
      technicianId: techElectrical.id,
      createdAt: pastTime,
      escalatedAt: escalatedTime,
    },
  });

  // Request 4: RESOLVED (PLUMBING - Cafeteria tap)
  const req4 = await prisma.maintenanceRequest.create({
    data: {
      title: 'Cafeteria sink faucet leaking constantly',
      description: 'Hot water faucet in main cafeteria sink #2 cannot be shut off completely.',
      category: 'PLUMBING',
      priority: 'LOW',
      status: 'RESOLVED',
      employeeId: employee.id,
      technicianId: techFacility.id,
    },
  });

  console.log('✓ Seeded maintenance requests (PENDING, IN_PROGRESS, ESCALATED, RESOLVED)');

  // 5. Seed Escalation Logs
  console.log('Seeding escalation logs...');
  await prisma.escalationLog.create({
    data: {
      requestId: req3.id,
      previousStatus: 'PENDING',
      newStatus: 'ESCALATED',
      reason: 'Critical SLA breached: Request remained unacknowledged past 30-minute threshold',
      escalatedTo: admin.id,
      escalationType: 'AUTOMATIC',
      createdAt: escalatedTime,
    },
  });

  console.log('✓ Seeded escalation log for Request #3');

  // 6. Seed Email Logs
  console.log('Seeding email audit logs...');
  await prisma.emailLog.create({
    data: {
      requestId: req3.id,
      recipient: admin.email,
      subject: `[URGENT ESCALATION] Maintenance Request: ${req3.title}`,
      notificationType: 'REQUEST_ESCALATED',
      status: 'SENT',
      messageId: '<msg-esc-10293847@truliacare.internal>',
      createdAt: escalatedTime,
    },
  });

  await prisma.emailLog.create({
    data: {
      requestId: req2.id,
      recipient: employee.email,
      subject: `[UPDATE] Technician assigned to your request: ${req2.title}`,
      notificationType: 'TECHNICIAN_ASSIGNED',
      status: 'SENT',
      messageId: '<msg-assign-9847192@truliacare.internal>',
    },
  });

  console.log('✓ Seeded email logs');
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
