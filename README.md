# 💊 MediStock

An inventory management system for **Pradhan Mantri Jan Aushadhi Kendras** that streamlines medicine inventory, sales, and inter-kendra stock transfers while reducing medicine wastage through **FEFO (First Expiry First Out)** inventory management.

---

## 📌 Overview

MediStock is a full-stack web application developed to improve inventory operations across Jan Aushadhi Kendras. The system enables administrators and shopkeepers to manage medicine stock efficiently through role-based access, batch-wise inventory tracking, FEFO-based sales, and intelligent transfer recommendations.

The primary objective is to minimize medicine expiry, prevent stock shortages, and simplify inventory management.

---

## ✨ Key Features

### 🔐 Authentication
- Role-based login system
- Admin and Shopkeeper modules
- Secure access to kendra-specific inventory

### 📦 Inventory Management
- Batch-wise inventory tracking
- Expiry date monitoring
- Low-stock identification
- Add new stock
- Automatic stock updates

### 💊 FEFO-Based Sales
- Automatic First Expiry First Out batch selection
- Multi-batch sales support
- Prevents sale of expired medicines
- Transaction-safe inventory updates

### 🚚 Transfer Management
- Rule-based transfer recommendations
- Admin approval workflow
- Dispatch and receive tracking
- Automatic inventory synchronization

### 📊 Dashboard
- Inventory overview
- Low stock alerts
- Transfer history
- Medicine status monitoring

---

## 🏗️ System Workflow

### Shopkeeper

Login

↓

View Inventory

↓

Add Stock / Sell Medicines

↓

FEFO Engine Selects Correct Batch

↓

Inventory Updated Automatically

↓

Receive / Dispatch Transfers

---

### Administrator

Login

↓

Monitor All Kendras

↓

View Transfer Recommendations

↓

Approve Transfers

↓

Track Dispatch & Completion

---

## ⚙️ Tech Stack

Frontend
- HTML
- CSS
- JavaScript

Backend
- Node.js
- Express.js

Database
- MySQL

Tools
- VS Code
- Git
- GitHub

---

## 🗄 Database

Current database contains the following modules:

- Kendras
- Users
- Medicines
- Inventory
- Sales
- Transfers

The system maintains relationships between medicines, batches, inventory, sales transactions, and transfer records.

---

## 🔄 FEFO Logic

Medicines are always sold from the earliest **non-expired** batch.

If the required quantity is not available in a single batch, MediStock automatically distributes the sale across multiple eligible batches while maintaining transactional consistency.

Expired batches are never considered for sales.

---

## 🚛 Transfer Recommendation Logic

The recommendation engine analyzes inventory across Jan Aushadhi Kendras and prioritizes transfers based on:

- Near-expiry medicines
- Low-stock kendras
- Excess inventory
- District-level prioritization

The generated recommendations are reviewed and approved by the administrator before execution.

---

## 📂 Project Structure

```
MediStock
│
├── Backend
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend
│   ├── login.html
│   ├── admin.html
│   ├── kendrastaff.html
│
├── Database
│   └── medistock.sql
│
└── README.md
```

---


## 📸 Screenshots

### Login

(Add screenshot)

---

### Admin Dashboard

(Add screenshot)

---

### Shopkeeper Dashboard

(Add screenshot)

---

### Inventory Module

(Add screenshot)

---

### Transfer Recommendations

(Add screenshot)

---

## 🚀 Future Enhancements

- Rack–Shelf–Bin warehouse mapping
- AI-assisted demand forecasting
- Dynamic reorder level calculation
- Seasonal demand prediction
- Notification system
- Analytics dashboard
- Medicine search optimization

---

## 👩‍💻 Developed By

**Kavya Mittal**

B.Tech Computer Science Engineering

---

## ⭐ Project Status

This project is under active development. New features and optimizations are being added incrementally.
