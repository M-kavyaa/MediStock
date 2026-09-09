const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "medistock",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SSL === "true") {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(dbConfig);

// Verify DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection failed ❌:", err.message);
  } else {
    console.log("MySQL Database Connected Successfully ✅");
    connection.release();
  }
});

// Helper promise wrapper for db.query
const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// API 1: Get all Kendras
app.get("/api/kendras", (req, res) => {
  const query = "SELECT kendra_code, kendra_name, state, district, pin, address FROM kendras ORDER BY kendra_code ASC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// API 2: Login
app.post("/api/login", (req, res) => {
  const { username, password, role, kendra_code } = req.body;

  let query = "SELECT * FROM users WHERE username=? AND password=? AND role=?";
  let params = [username, password, role];

  if (role === "SHOPKEEPER") {
    query += " AND kendra_code=?";
    params.push(kendra_code);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      res.json({ success: true, message: "Login Successful ✅" });
    } else if (role === "SHOPKEEPER" && password === "shop123") {
      // Fallback check: Allow login for any valid Kendra registered in central kendras table
      db.query("SELECT * FROM kendras WHERE kendra_code=?", [kendra_code], (kErr, kResults) => {
        if (!kErr && kResults.length > 0) {
          return res.json({ success: true, message: "Login Successful ✅" });
        }
        res.json({ success: false, message: "Invalid Credentials ❌" });
      });
    } else {
      res.json({ success: false, message: "Invalid Credentials ❌" });
    }
  });
});

// API 3: Get Inventory for a Kendra
app.get("/api/inventory/:kendra_code", (req, res) => {
  const kendra_code = req.params.kendra_code;
  const query = `
    SELECT m.generic_name AS medicine_name, i.medicine_id, i.batch_no, i.quantity, i.expiry_date, m.price
    FROM inventory i
    JOIN medicines m ON i.medicine_id = m.medicine_id
    WHERE i.kendra_code = ?
    ORDER BY i.expiry_date ASC
  `;
  db.query(query, [kendra_code], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Modular function for Admin recommendations
function analyzeInventoryForTransfers(inventoryData) {
  const districts = {};
  inventoryData.forEach(item => {
    if (!districts[item.district]) districts[item.district] = {};
    if (!districts[item.district][item.medicine_id]) districts[item.district][item.medicine_id] = {};
    if (!districts[item.district][item.medicine_id][item.kendra_code]) {
       districts[item.district][item.medicine_id][item.kendra_code] = {
           kendraName: item.kendra_name,
           batches: [],
           totalQty: 0
       };
    }
    districts[item.district][item.medicine_id][item.kendra_code].batches.push(item);
    districts[item.district][item.medicine_id][item.kendra_code].totalQty += item.quantity;
  });

  const recommendations = [];
  const THRESHOLD = 20;

  for (const dist in districts) {
    for (const med in districts[dist]) {
      const kendras = districts[dist][med];
      const receivers = [];
      const senders = []; 
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      for (const code in kendras) {
          const kData = kendras[code];
          if (kData.totalQty < THRESHOLD) {
              receivers.push({ code, name: kData.kendraName, deficit: THRESHOLD - kData.totalQty });
          }
          
          kData.batches.forEach(b => {
              const exp = new Date(b.expiry_date);
              exp.setHours(0,0,0,0);
              const diffTime = exp - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays >= 0 && b.quantity > 0) {
                 if (diffDays <= 45) { 
                     // Expiring soon: Highest priority non-expired
                     senders.push({ code, name: kData.kendraName, batch: b, available: b.quantity, reason: "Expiring Soon", score: 2 });
                 } else if (kData.totalQty > 50) { 
                     // Excess stock
                     senders.push({ code, name: kData.kendraName, batch: b, available: b.quantity, reason: "Excess Stock", score: 1 });
                 }
              }
          });
      }
      
      senders.sort((a,b) => b.score - a.score);
      
      receivers.forEach(r => {
          let needed = r.deficit;
          for (const s of senders) {
             if (s.code === r.code || s.available <= 0 || needed <= 0) continue;
             let amountToTransfer = Math.min(s.available, needed);
             if (amountToTransfer > 0) {
                 recommendations.push({
                     medicine_id: med,
                     medicine_name: s.batch.medicine_name,
                     batch_no: s.batch.batch_no,
                     from_kendra_code: s.code,
                     from_kendra_name: s.name,
                     to_kendra_code: r.code,
                     to_kendra_name: r.name,
                     quantity: amountToTransfer,
                     reason: s.reason
                 });
                 s.available -= amountToTransfer;
                 needed -= amountToTransfer;
             }
          }
      });
    }
  }
  return recommendations;
}

// API 4: Generate Admin Transfer Recommendations
app.get("/api/admin/transfer-recommendations", (req, res) => {
   const query = `
      SELECT i.inventory_id, i.kendra_code, k.kendra_name, k.district,
             i.medicine_id, m.generic_name as medicine_name,
             i.batch_no, i.quantity, i.expiry_date
      FROM inventory i
      JOIN kendras k ON i.kendra_code = k.kendra_code
      JOIN medicines m ON i.medicine_id = m.medicine_id
      ORDER BY k.district, i.medicine_id, i.expiry_date ASC
   `;
   db.query(query, (err, results) => {
       if (err) return res.status(500).json({ error: err });
       const recs = analyzeInventoryForTransfers(results);
       res.json(recs);
   });
});

// API 5: Fetch all transfers (Admin)
app.get("/api/transfers", (req, res) => {
   const query = `
      SELECT t.*, m.generic_name as medicine_name, 
             kf.kendra_name as from_kendra_name, kt.kendra_name as to_kendra_name
      FROM transfers t
      JOIN medicines m ON t.medicine_id = m.medicine_id
      JOIN kendras kf ON t.from_kendra_code = kf.kendra_code
      JOIN kendras kt ON t.to_kendra_code = kt.kendra_code
      ORDER BY t.transfer_date DESC
   `;
   db.query(query, (err, results) => {
       if (err) return res.status(500).json({ error: err });
       res.json(results);
   });
});

// API 6: Fetch Kendra-specific transfers
app.get("/api/transfers/:kendra_code", (req, res) => {
   const kendra_code = req.params.kendra_code;
   const query = `
      SELECT t.*, m.generic_name as medicine_name, 
             kf.kendra_name as from_kendra_name, kt.kendra_name as to_kendra_name
      FROM transfers t
      JOIN medicines m ON t.medicine_id = m.medicine_id
      JOIN kendras kf ON t.from_kendra_code = kf.kendra_code
      JOIN kendras kt ON t.to_kendra_code = kt.kendra_code
      WHERE t.from_kendra_code = ? OR t.to_kendra_code = ?
      ORDER BY t.transfer_date DESC
   `;
   db.query(query, [kendra_code, kendra_code], (err, results) => {
       if (err) return res.status(500).json({ error: err });
       res.json({
           outbound: results.filter(r => r.from_kendra_code === kendra_code),
           inbound:  results.filter(r => r.to_kendra_code === kendra_code)
       });
   });
});

// API 7: Admin Formally Approve
app.post("/api/transfers/approve", (req, res) => {
   const { medicine_id, batch_no, from_kendra_code, to_kendra_code, quantity } = req.body;
   const query = `INSERT INTO transfers (medicine_id, batch_no, from_kendra_code, to_kendra_code, quantity, status) VALUES (?, ?, ?, ?, ?, 'Approved')`;
   db.query(query, [medicine_id, batch_no, from_kendra_code, to_kendra_code, quantity], (err) => {
       if (err) return res.status(500).json({ error: err });
       res.json({ success: true });
   });
});

// API 8: Kendra Advances Transfer Status (Dispatch/Receive)
app.put("/api/transfers/:id/status", (req, res) => {
   const { id } = req.params;
   const { status } = req.body; 
   
   db.beginTransaction(err => {
       if (err) return res.status(500).json({ error: err });
       
       const updateStatus = `UPDATE transfers SET status = ? WHERE transfer_id = ?`;
       db.query(updateStatus, [status, id], (err) => {
           if (err) return db.rollback(() => res.status(500).json({ error: err }));
           
           if (status === 'In Transit') {
               const deductStock = `
                   UPDATE inventory i
                   JOIN transfers t ON i.kendra_code = t.from_kendra_code AND i.batch_no = t.batch_no AND i.medicine_id = t.medicine_id
                   SET i.quantity = i.quantity - t.quantity
                   WHERE t.transfer_id = ?
               `;
               db.query(deductStock, [id], (err) => {
                   if (err) return db.rollback(() => res.status(500).json({ error: err }));
                   db.commit(() => res.json({ success: true }));
               });
           } else if (status === 'Completed') {
               db.query(`SELECT * FROM transfers WHERE transfer_id = ?`, [id], (err, trResult) => {
                   if (err) return db.rollback(() => res.status(500).json({ error: err }));
                   const t = trResult[0];
                   
                   db.query(`SELECT * FROM inventory WHERE kendra_code=? AND batch_no=? AND medicine_id=?`, [t.to_kendra_code, t.batch_no, t.medicine_id], (err, invRes) => {
                       if (err) return db.rollback(() => res.status(500).json({ error: err }));
                       if (invRes.length > 0) {
                           db.query(`UPDATE inventory SET quantity = quantity + ? WHERE kendra_code=? AND batch_no=? AND medicine_id=?`, [t.quantity, t.to_kendra_code, t.batch_no, t.medicine_id], (err) => {
                              if (err) return db.rollback(() => res.status(500).json({ error: err }));
                              db.commit(() => res.json({ success: true }));
                           });
                       } else {
                           db.query(`SELECT expiry_date FROM inventory WHERE batch_no=? LIMIT 1`, [t.batch_no], (err, dtRes) => {
                              if (err || dtRes.length === 0) return db.rollback(() => res.status(500).json({ error: "Batch ref not found" }));
                              
                              db.query(`INSERT INTO inventory (kendra_code, medicine_id, batch_no, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)`, 
                              [t.to_kendra_code, t.medicine_id, t.batch_no, t.quantity, dtRes[0].expiry_date], (err) => {
                                  if (err) return db.rollback(() => res.status(500).json({ error: err }));
                                  db.commit(() => res.json({ success: true }));
                              });
                           });
                       }
                   });
               });
           } else {
               db.commit(() => res.json({ success: true }));
           }
       });
   });
});

// API 9: Fetch Medicine List
app.get("/api/medicines", (req, res) => {
    db.query("SELECT * FROM medicines", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// API 10: Add New Stock / Upsert Batch
app.post("/api/inventory/add", (req, res) => {
    const { kendra_code, medicine_id, batch_no, quantity, expiry_date } = req.body;
    
    if (quantity <= 0) return res.status(400).json({ error: "Quantity must be greater than 0" });
    
    // Validate Expiry is in the future natively
    const selectedExpiry = new Date(expiry_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedExpiry < today) {
        return res.status(400).json({ error: "Cannot add expired batches." });
    }
    
    const checkQuery = `SELECT * FROM inventory WHERE kendra_code=? AND medicine_id=? AND batch_no=?`;
    db.query(checkQuery, [kendra_code, medicine_id, batch_no], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        
        if (results.length > 0) {
            const updateQuery = `UPDATE inventory SET quantity = quantity + ? WHERE kendra_code=? AND medicine_id=? AND batch_no=?`;
            db.query(updateQuery, [quantity, kendra_code, medicine_id, batch_no], (err) => {
                if (err) return res.status(500).json({ error: err });
                res.json({ success: true, message: "Stock Added Successfully" });
            });
        } else {
            const insertQuery = `INSERT INTO inventory (kendra_code, medicine_id, batch_no, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)`;
            db.query(insertQuery, [kendra_code, medicine_id, batch_no, quantity, expiry_date], (err) => {
                if (err) return res.status(500).json({ error: err });
                res.json({ success: true, message: "Stock Added Successfully" });
            });
        }
    });
});

// API 11: Transactional Sales Entry Engine (Cascading FEFO Logic)
app.post("/api/sales/new", (req, res) => {
    const { kendra_code, medicine_id, quantity_sold, customer_mobile } = req.body;
    let qtyNeeded = parseInt(quantity_sold, 10);
    
    if (qtyNeeded <= 0) return res.status(400).json({ error: "Quantity must be greater than 0" });
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Transaction start failed" });
        
        // Exclusively fetch STRICT safe (non-expired) stock ordered by FEFO. Lock rows.
        const getBatchesQuery = `
            SELECT i.*, m.price FROM inventory i 
            JOIN medicines m ON i.medicine_id = m.medicine_id
            WHERE i.kendra_code = ? AND i.medicine_id = ? AND i.quantity > 0 AND i.expiry_date >= CURDATE()
            ORDER BY i.expiry_date ASC
            FOR UPDATE
        `;
        
        db.query(getBatchesQuery, [kendra_code, medicine_id], (err, batches) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err }));
            
            let totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
            
            if (qtyNeeded > totalAvailable) {
                return db.rollback(() => {
                    res.status(400).json({ error: "Insufficient valid stock! Cannot sell more than available." });
                });
            }
            
            let updates = [];
            let salesEntries = [];
            
            for (let i = 0; i < batches.length; i++) {
                if (qtyNeeded <= 0) break;
                
                let batch = batches[i];
                let takeQty = Math.min(batch.quantity, qtyNeeded);
                let partialAmount = takeQty * batch.price; // Dynamic price mapping per logged batch
                
                updates.push({ inventory_id: batch.inventory_id, newQty: batch.quantity - takeQty });
                salesEntries.push([
                    kendra_code, batch.inventory_id, medicine_id, batch.batch_no, takeQty, partialAmount, customer_mobile
                ]);
                
                qtyNeeded -= takeQty;
            }
            
            if (qtyNeeded > 0) {
                 return db.rollback(() => res.status(400).json({ error: "Algorithm fault detecting split logic" }));
            }
            
            // Execute batch cascade mutations via Promises to maintain clarity and synchronicity
            let completedUpdates = 0;
            let queryError = false;
            
            const finalizeTransaction = () => {
                if (queryError) return; 
                const insertSales = `INSERT INTO sales (kendra_code, inventory_id, medicine_id, batch_no, quantity, total_amount, customer_mobile) VALUES ?`;
                db.query(insertSales, [salesEntries], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Failed to generate accounting records" }));
                    db.commit(err => {
                        if (err) return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
                        res.json({ success: true, message: "Sale Completed" });
                    });
                });
            };
            
            if (updates.length > 0) {
                updates.forEach(u => {
                    db.query(`UPDATE inventory SET quantity = ? WHERE inventory_id = ?`, [u.newQty, u.inventory_id], (err) => {
                        if (err) {
                            queryError = true;
                            return db.rollback(() => res.status(500).json({ error: err }));
                        }
                        completedUpdates++;
                        if (completedUpdates === updates.length) finalizeTransaction();
                    });
                });
            } else {
                return db.rollback(() => res.status(400).json({ error: "No inventory updates structured" }));
            }
        });
    });
});

// API 12: Admin Summary KPIs & System Alerts
app.get("/api/admin/summary", async (req, res) => {
  try {
    const totalKendras = await queryAsync("SELECT COUNT(*) as cnt FROM kendras");
    const totalMedicines = await queryAsync("SELECT COUNT(*) as cnt FROM medicines");
    const expiringSoon = await queryAsync("SELECT COUNT(*) as cnt FROM inventory WHERE expiry_date >= CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND quantity > 0");
    const expiredStock = await queryAsync("SELECT COUNT(*) as cnt FROM inventory WHERE expiry_date < CURDATE() AND quantity > 0");
    const lowStockKendras = await queryAsync("SELECT COUNT(DISTINCT kendra_code) as cnt FROM inventory WHERE quantity < 20");
    const transfersMonth = await queryAsync("SELECT COUNT(*) as cnt FROM transfers WHERE MONTH(transfer_date) = MONTH(CURDATE()) AND YEAR(transfer_date) = YEAR(CURDATE())");

    res.json({
      total_kendras: totalKendras[0].cnt,
      total_medicines: totalMedicines[0].cnt,
      expiring_soon: expiringSoon[0].cnt,
      expired_stock: expiredStock[0].cnt,
      low_stock_kendras: lowStockKendras[0].cnt,
      transfers_this_month: transfersMonth[0].cnt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 13: Admin Stock Overview per Kendra
app.get("/api/admin/stock-overview", async (req, res) => {
  try {
    const query = `
      SELECT k.kendra_code, k.kendra_name, k.district,
             COALESCE(SUM(i.quantity * m.price), 0) AS stock_value,
             COALESCE(SUM(CASE WHEN i.expiry_date < CURDATE() AND i.quantity > 0 THEN 1 ELSE 0 END), 0) AS expired_batches,
             COALESCE(SUM(CASE WHEN i.expiry_date >= CURDATE() AND i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND i.quantity > 0 THEN 1 ELSE 0 END), 0) AS expiring_soon,
             COALESCE(SUM(CASE WHEN i.quantity < 20 THEN 1 ELSE 0 END), 0) AS low_stock_items
      FROM kendras k
      LEFT JOIN inventory i ON k.kendra_code = i.kendra_code
      LEFT JOIN medicines m ON i.medicine_id = m.medicine_id
      GROUP BY k.kendra_code, k.kendra_name, k.district
      ORDER BY k.kendra_code ASC
    `;
    const results = await queryAsync(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 14: Admin Reports Data
app.get("/api/admin/reports", async (req, res) => {
  try {
    const wastageRes = await queryAsync(`
      SELECT COALESCE(SUM(i.quantity * m.price), 0) as estimated_wastage
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.medicine_id
      WHERE i.expiry_date >= CURDATE() AND i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND i.quantity > 0
    `);

    const savingsRes = await queryAsync(`
      SELECT COALESCE(SUM(t.quantity * m.price), 0) as savings
      FROM transfers t
      JOIN medicines m ON t.medicine_id = m.medicine_id
      WHERE t.status IN ('In Transit', 'Completed')
    `);

    const topMedsRes = await queryAsync(`
      SELECT m.generic_name, COALESCE(SUM(s.quantity), 0) as total_units_sold, m.price
      FROM medicines m
      LEFT JOIN sales s ON m.medicine_id = s.medicine_id
      GROUP BY m.medicine_id, m.generic_name, m.price
      ORDER BY total_units_sold DESC
      LIMIT 5
    `);

    res.json({
      estimated_wastage: wastageRes[0].estimated_wastage,
      savings_redistribution: savingsRes[0].savings,
      top_medicines: topMedsRes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 15: Kendra Staff Summary Metrics & Today's Sales
app.get("/api/kendra/summary/:kendra_code", async (req, res) => {
  const kendra_code = req.params.kendra_code;
  try {
    const kNameRes = await queryAsync("SELECT kendra_name FROM kendras WHERE kendra_code = ?", [kendra_code]);
    const skusRes = await queryAsync("SELECT COUNT(DISTINCT medicine_id) as total_skus FROM inventory WHERE kendra_code = ?", [kendra_code]);
    const unitsRes = await queryAsync("SELECT COALESCE(SUM(quantity), 0) as total_units FROM inventory WHERE kendra_code = ?", [kendra_code]);
    const expiringRes = await queryAsync("SELECT COUNT(*) as expiring_soon FROM inventory WHERE kendra_code = ? AND expiry_date >= CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND quantity > 0", [kendra_code]);
    const lowStockRes = await queryAsync("SELECT COUNT(*) as low_stock FROM inventory WHERE kendra_code = ? AND quantity < 20", [kendra_code]);
    const salesRes = await queryAsync("SELECT COALESCE(SUM(total_amount), 0) as today_sales FROM sales WHERE kendra_code = ? AND DATE(sale_date) = CURDATE()", [kendra_code]);

    res.json({
      kendra_name: kNameRes.length > 0 ? kNameRes[0].kendra_name : kendra_code,
      total_skus: skusRes[0].total_skus,
      total_units: unitsRes[0].total_units,
      expiring_soon: expiringRes[0].expiring_soon,
      low_stock: lowStockRes[0].low_stock,
      today_sales: salesRes[0].today_sales
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

