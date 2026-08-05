PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE, -- unique email address for each user
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  category_id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL UNIQUE,
  description TEXT -- can be NULL
);

CREATE TABLE IF NOT EXISTS events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0), -- number of people that can attend the event
  status TEXT NOT NULL CHECK (
    status IN ('Open', 'Full', 'Cancelled', 'Completed', 'Disabled')
  ),
  organizer_id INTEGER NOT NULL,
  created_on TEXT NOT NULL DEFAULT (datetime('now')), -- save the current datetime as deafult
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) -- link the event to the user who created it
);

CREATE TABLE IF NOT EXISTS registrations (
  registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  registration_date TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL CHECK (
    status IN ('Registered', 'Cancelled', 'Attended', 'Missed')
  ),
  attended TEXT NOT NULL DEFAULT 'No' CHECK (attended IN ('Yes', 'No')),
  UNIQUE (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);