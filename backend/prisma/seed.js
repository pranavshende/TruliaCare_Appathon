const argon2 = require('argon2');
const prisma = require('../prismaClient');

async function main() {
  console.log('🌱 Starting database seed for TruliaCare Maintenance & Escalation System...');

  // 1. Clean existing records in reverse dependency order (optional/safe upsert)
  console.log('Cleaning existing seed records...');
  await prisma.notification.deleteMany({});
  await prisma.escalationLog.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.slaRule.deleteMany({});
  await prisma.technician.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Seed Users
  console.log('Seeding users...');
  const employeePassword = await argon2.hash('password123');
  const adminPassword = await argon2.hash('admin123');

  const employee = await prisma.user.upsert({
    where: { email: 'john@company.com' },
    update: {
      name: 'John Doe',
      role: 'employee',
      department: 'IT',
      isActive: true,
    },
    create: {
      name: 'John Doe',
      email: 'john@company.com',
      password: employeePassword,
      role: 'employee',
      department: 'IT',
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'fm@company.com' },
    update: {
      name: 'Facility Manager',
      role: 'admin',
      department: 'Facilities',
      isActive: true,
    },
    create: {
      name: 'Facility Manager',
      email: 'fm@company.com',
      password: adminPassword,
      role: 'admin',
      department: 'Facilities',
      isActive: true,
    },
  });

  console.log(`✓ Seeded users: ${employee.email} (employee), ${admin.email} (admin)`);

  // 3. Seed Categories
  console.log('Seeding categories...');
  const itCategory = await prisma.category.create({
    data: { name: 'IT' },
  });

  const facilitiesCategory = await prisma.category.create({
    data: { name: 'Facilities' },
  });

  const infrastructureCategory = await prisma.category.create({
    data: { name: 'Infrastructure' },
  });

  console.log('✓ Seeded categories: IT, Facilities, Infrastructure');

  // 4. Seed Technicians
  console.log('Seeding technicians...');
  const techIT = await prisma.technician.create({
    data: {
      name: 'Ravi Kumar',
      categoryId: itCategory.id,
      isAvailable: true,
    },
  });

  const techFacilities = await prisma.technician.create({
    data: {
      name: 'Suresh Patel',
      categoryId: facilitiesCategory.id,
      isAvailable: true,
    },
  });

  const techInfra = await prisma.technician.create({
    data: {
      name: 'Amit Sharma',
      categoryId: infrastructureCategory.id,
      isAvailable: true,
    },
  });

  console.log('✓ Seeded technicians: Ravi Kumar (IT), Suresh Patel (Facilities), Amit Sharma (Infrastructure)');

  // 5. Seed SLA Rules
  console.log('Seeding SLA rules...');
  await prisma.slaRule.createMany({
    data: [
      { categoryId: itCategory.id, priority: 'Critical', thresholdMinutes: 15, escalateToRole: 'admin' },
      { categoryId: itCategory.id, priority: 'High', thresholdMinutes: 30, escalateToRole: 'admin' },
      { categoryId: itCategory.id, priority: 'Medium', thresholdMinutes: 120, escalateToRole: 'admin' },
      { categoryId: itCategory.id, priority: 'Low', thresholdMinutes: 480, escalateToRole: 'admin' },
      { categoryId: facilitiesCategory.id, priority: 'Critical', thresholdMinutes: 20, escalateToRole: 'admin' },
      { categoryId: facilitiesCategory.id, priority: 'High', thresholdMinutes: 60, escalateToRole: 'admin' },
      { categoryId: facilitiesCategory.id, priority: 'Medium', thresholdMinutes: 180, escalateToRole: 'admin' },
      { categoryId: facilitiesCategory.id, priority: 'Low', thresholdMinutes: 720, escalateToRole: 'admin' },
      { categoryId: infrastructureCategory.id, priority: 'Critical', thresholdMinutes: 10, escalateToRole: 'admin' },
      { categoryId: infrastructureCategory.id, priority: 'High', thresholdMinutes: 30, escalateToRole: 'admin' },
      { categoryId: infrastructureCategory.id, priority: 'Medium', thresholdMinutes: 120, escalateToRole: 'admin' },
      { categoryId: infrastructureCategory.id, priority: 'Low', thresholdMinutes: 240, escalateToRole: 'admin' },
    ],
  });

  console.log('✓ Seeded SLA rules across IT, Facilities, and Infrastructure');

  // 6. Seed Sample Maintenance Requests & Escalation Logs
  console.log('Seeding sample maintenance requests...');
  const now = new Date();

  // Request 1: Pending (VPN issue)
  const req1 = await prisma.maintenanceRequest.create({
    data: {
      userId: employee.id,
      categoryId: itCategory.id,
      title: 'VPN connection dropping repeatedly during remote work',
      description: 'The corporate GlobalProtect VPN disconnects every 10-15 minutes on the 4th floor network.',
      priority: 'High',
      status: 'Pending',
      escalationLevel: 0,
      slaDueAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 mins from now
    },
  });

  // Request 2: In Progress (AC leaking in Server Room B)
  const req2 = await prisma.maintenanceRequest.create({
    data: {
      userId: employee.id,
      categoryId: facilitiesCategory.id,
      title: 'AC unit condensation leaking in Server Room B',
      description: 'Water droplet condensation visible directly above rack #2 in Server Room B. Urgent attention needed.',
      priority: 'Critical',
      status: 'In Progress',
      assignedTechnicianId: techFacilities.id,
      escalationLevel: 0,
      slaDueAt: new Date(now.getTime() + 20 * 60 * 1000),
    },
  });

  // Request 3: Escalated (Core Switch overheating)
  const pastCreated = new Date(now.getTime() - 45 * 60 * 1000); // 45 mins ago
  const req3 = await prisma.maintenanceRequest.create({
    data: {
      userId: employee.id,
      categoryId: infrastructureCategory.id,
      title: 'Core Switch 01 overheating and causing packet loss',
      description: 'Temperature sensor alert triggered on Core Switch 01 (IDF-3). Exhaust fan failure suspected.',
      priority: 'Critical',
      status: 'Escalated',
      assignedTechnicianId: techInfra.id,
      escalationLevel: 1,
      slaDueAt: new Date(pastCreated.getTime() + 10 * 60 * 1000), // breached 35 mins ago
      createdAt: pastCreated,
    },
  });

  // Escalation log for Request 3
  await prisma.escalationLog.create({
    data: {
      requestId: req3.id,
      fromStatus: 'Pending',
      toStatus: 'Escalated',
      escalationLevel: 1,
      escalatedToRole: 'admin',
      triggerType: 'timer',
      reason: 'SLA breached: unresolved after 10-minute critical threshold',
      createdAt: new Date(pastCreated.getTime() + 10 * 60 * 1000),
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: admin.id,
      requestId: req3.id,
      message: `[ESCALATION] Maintenance Request #${req3.id} ("${req3.title}") has been escalated to Level 1 due to SLA breach.`,
      type: 'in_app',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: employee.id,
      requestId: req2.id,
      message: `Your request #${req2.id} has been assigned to technician Suresh Patel and is now In Progress.`,
      type: 'in_app',
      isRead: false,
    },
  });

  console.log('✓ Seeded sample requests, escalation logs, and notifications');
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
