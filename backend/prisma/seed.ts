import { prisma } from "../src/repositories/prisma/prismaClient";
import { users, attendance, assignments, events, rsvps, roster, SUBJECTS } from "../src/seed";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Delete all existing data
  await prisma.rSVP.deleteMany();
  await prisma.event.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();

  const userIds = new Set(users.map(u => u.userID));
  
  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  const defaultPass = bcrypt.hashSync("student123", 10);
  
  for (const r of roster) {
    if (!userIds.has(r.studentID)) {
      await prisma.user.create({
        data: {
          userID: r.studentID,
          name: r.name,
          email: `${r.name.split(" ")[0].toLowerCase()}@student.isas.edu`,
          passwordHash: defaultPass,
          role: "student",
          section: r.section,
          enrolledSubjects: SUBJECTS,
        }
      });
    }
  }

  // Seed Attendance
  await prisma.attendance.createMany({
    data: attendance,
  });
  console.log(`Seeded ${attendance.length} attendance records.`);

  // Seed Assignments and Checklist items
  for (const a of assignments) {
    const { checklist, ...assignmentData } = a;
    await prisma.assignment.create({
      data: {
        ...assignmentData,
        checklist: {
          create: checklist,
        },
      },
    });
  }
  console.log(`Seeded ${assignments.length} assignments.`);

  // Seed Events
  await prisma.event.createMany({
    data: events,
  });
  console.log(`Seeded ${events.length} events.`);

  // Seed RSVPs
  await prisma.rSVP.createMany({
    data: rsvps,
  });
  console.log(`Seeded ${rsvps.length} RSVPs.`);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
