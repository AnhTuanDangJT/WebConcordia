require("dotenv").config();

const bcrypt = require("bcrypt");
const { db, run, get } = require("./database");

async function seedDatabase() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const existingStudent = await get(
    "SELECT user_id FROM users WHERE email = ?",
    ["student@test.com"]
  );

  if (existingStudent) {
    console.log("Seed data already exists. Skipping seed.");
    db.close();
    return;
  }

  const studentResult = await run(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
    ["Test Student", "student@test.com", passwordHash, "student"]
  );

  const adminResult = await run(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
    ["Test Admin", "admin@test.com", passwordHash, "admin"]
  );

  const categories = [
    ["Academic workshops", "Workshops and academic learning sessions"],
    ["Career events", "Career fairs and employer events"],
    ["Club activities", "Student club meetings and activities"],
    ["Sports events", "Campus sports and fitness events"],
    ["Cultural events", "Cultural celebrations and performances"],
    ["Volunteering events", "Community service opportunities"],
    ["Social events", "Social gatherings for students"],
    ["Guest lectures", "Talks from guest speakers"],
    ["Networking events", "Professional and student networking"],
    ["Other", "Other campus events"],
  ];

  for (const [name, description] of categories) {
    await run(
      `
        INSERT INTO categories (category_name, description)
        VALUES (?, ?)
      `,
      [name, description]
    );
  }

  const events = [
    {
      title: "Web Development Workshop",
      description:
        "Learn practical techniques for creating modern, responsive websites.",
      category: "Academic workshops",
      event_date: "2026-08-10",
      start_time: "13:00",
      end_time: "15:00",
      location: "Hall Building",
      capacity: 40,
      status: "Open",
    },
    {
      title: "Campus Career Fair",
      description:
        "Connect with employers and learn about internship and career opportunities.",
      category: "Career events",
      event_date: "2026-08-12",
      start_time: "10:00",
      end_time: "16:00",
      location: "EV Building",
      capacity: 2,
      status: "Open",
    },
    {
      title: "Student Networking Evening",
      description:
        "Meet students, alumni, and professionals from different academic programs.",
      category: "Networking events",
      event_date: "2026-08-18",
      start_time: "17:30",
      end_time: "20:00",
      location: "John Molson Building",
      capacity: 60,
      status: "Open",
    },
    {
      title: "Intro to Git and GitHub",
      description:
        "A hands-on workshop for version control basics and team collaboration.",
      category: "Academic workshops",
      event_date: "2026-08-20",
      start_time: "14:00",
      end_time: "16:00",
      location: "MB Building",
      capacity: 35,
      status: "Open",
    },
  ];

  const eventIds = [];

  for (const event of events) {
    const result = await run(
      `
        INSERT INTO events (
          title,
          description,
          category,
          event_date,
          start_time,
          end_time,
          location,
          capacity,
          status,
          organizer_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        event.title,
        event.description,
        event.category,
        event.event_date,
        event.start_time,
        event.end_time,
        event.location,
        event.capacity,
        event.status,
        adminResult.lastID,
      ]
    );

    eventIds.push(result.lastID);
  }

  await run(
    `
      INSERT INTO registrations (user_id, event_id, status, attended)
      VALUES (?, ?, 'Registered', 'No')
    `,
    [studentResult.lastID, eventIds[0]]
  );

  await run(
    `
      INSERT INTO registrations (user_id, event_id, status, attended)
      VALUES (?, ?, 'Registered', 'No')
    `,
    [studentResult.lastID, eventIds[2]]
  );

  console.log("Database seeded successfully.");
  console.log("Student login: student@test.com / password123");
  console.log("Admin login: admin@test.com / password123");

  db.close();
}

seedDatabase().catch((error) => {
  console.error("Failed to seed database:", error.message);
  db.close();
  process.exit(1);
});