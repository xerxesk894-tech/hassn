import { Express } from "express";
import db from "./db.js";

export function setupRoutes(app: Express) {
  // --- Dashboard Stats ---
  app.get("/api/stats", (req, res) => {
    try {
      const customersCount = db.prepare("SELECT COUNT(*) as count FROM customers").get() as { count: number };
      const vehiclesCount = db.prepare("SELECT COUNT(*) as count FROM vehicles").get() as { count: number };
      const appointmentsCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled'").get() as { count: number };
      const totalRevenue = db.prepare("SELECT SUM(cost) as total FROM maintenance_records WHERE status = 'completed'").get() as { total: number };
      
      const recentAppointments = db.prepare(`
        SELECT a.*, c.name as customer_name, v.make, v.model, v.plate_number
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN vehicles v ON a.vehicle_id = v.id
        ORDER BY a.date DESC LIMIT 5
      `).all();

      res.json({
        customers: customersCount.count,
        vehicles: vehiclesCount.count,
        appointments: appointmentsCount.count,
        revenue: totalRevenue.total || 0,
        recentAppointments
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // --- Customers ---
  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { name, phone, email } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)");
      const info = stmt.run(name, phone, email);
      res.json({ id: info.lastInsertRowid, name, phone, email });
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // --- Vehicles ---
  app.get("/api/vehicles", (req, res) => {
    const vehicles = db.prepare(`
      SELECT v.*, c.name as customer_name 
      FROM vehicles v 
      JOIN customers c ON v.customer_id = c.id
    `).all();
    res.json(vehicles);
  });

  app.post("/api/vehicles", (req, res) => {
    const { customer_id, make, model, year, vin, plate_number, battery_type, battery_capacity } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO vehicles (customer_id, make, model, year, vin, plate_number, battery_type, battery_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(customer_id, make, model, year, vin, plate_number, battery_type, battery_capacity);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add vehicle" });
    }
  });

  // --- Battery Types ---
  app.get("/api/batteries", (req, res) => {
    const batteries = db.prepare("SELECT * FROM battery_types").all();
    res.json(batteries);
  });

  // --- Maintenance Records ---
  app.get("/api/maintenance", (req, res) => {
    const records = db.prepare(`
      SELECT m.*, v.make, v.model, v.plate_number, c.name as customer_name
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      ORDER BY m.date DESC
    `).all();
    res.json(records);
  });

  app.post("/api/maintenance", (req, res) => {
    const { vehicle_id, description, cost, status, notes } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO maintenance_records (vehicle_id, description, cost, status, notes)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(vehicle_id, description, cost, status, notes);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add maintenance record" });
    }
  });

  // --- Appointments ---
  app.get("/api/appointments", (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, c.name as customer_name, v.make, v.model, v.plate_number
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN vehicles v ON a.vehicle_id = v.id
      ORDER BY a.date ASC
    `).all();
    res.json(appointments);
  });

  app.post("/api/appointments", (req, res) => {
    const { customer_id, vehicle_id, date, service_type, status } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO appointments (customer_id, vehicle_id, date, service_type, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(customer_id, vehicle_id, date, service_type, status || 'scheduled');
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule appointment" });
    }
  });
}
