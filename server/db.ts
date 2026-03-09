import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, "workshop.db"));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    vin TEXT UNIQUE,
    plate_number TEXT,
    battery_type TEXT,
    battery_capacity REAL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS battery_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity REAL NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS maintenance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    cost REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    date DATETIME NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  );
`);

// Insert some initial battery types if empty
const count = db.prepare("SELECT COUNT(*) as count FROM battery_types").get() as { count: number };
if (count.count === 0) {
  const insertBattery = db.prepare("INSERT INTO battery_types (name, capacity, price, stock, description) VALUES (?, ?, ?, ?, ?)");
  insertBattery.run("Lithium-ion (Li-ion) Standard", 60.0, 5000.0, 10, "Standard EV Battery");
  insertBattery.run("Lithium-ion (Li-ion) Long Range", 85.0, 8000.0, 5, "Long Range EV Battery");
  insertBattery.run("Lithium Iron Phosphate (LFP)", 50.0, 4000.0, 15, "Durable and safe LFP battery");
  insertBattery.run("Solid-State Prototype", 100.0, 15000.0, 2, "Next-gen solid state battery");
}

export default db;
