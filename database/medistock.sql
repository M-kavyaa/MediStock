create database medistock;
use medistock;
create table kendras(
sno int,
kendra_code varchar(50) primary key,
kendra_name varchar(255),
state varchar(100),
district varchar(100),
pin varchar(20),
-- pharmacist varchar(50),
address text);
INSERT INTO kendras (sno, kendra_code, kendra_name, state, district, pin, address) VALUES
(1, 'JA001', 'Pradhan Mantri Jan Aushadhi Kendra - MG Road', 'Karnataka', 'Bengaluru', '560001', 'MG Road, Bengaluru, Karnataka'),
(2, 'JA002', 'Pradhan Mantri Jan Aushadhi Kendra - Indiranagar', 'Karnataka', 'Bengaluru', '560038', 'Indiranagar, Bengaluru, Karnataka'),
(3, 'JA003', 'Pradhan Mantri Jan Aushadhi Kendra - Koramangala', 'Karnataka', 'Bengaluru', '560034', 'Koramangala, Bengaluru, Karnataka'),
(4, 'JA004', 'Pradhan Mantri Jan Aushadhi Kendra - Whitefield', 'Karnataka', 'Bengaluru', '560066', 'Whitefield Main Road, Bengaluru'),
(5, 'JA005', 'Pradhan Mantri Jan Aushadhi Kendra - Electronic City', 'Karnataka', 'Bengaluru', '560100', 'Electronic City Phase 1, Bengaluru'),

(6, 'JA006', 'Pradhan Mantri Jan Aushadhi Kendra - Rohini Sector 7', 'Delhi', 'Delhi', '110085', 'Sector 7, Rohini, Delhi'),
(7, 'JA007', 'Pradhan Mantri Jan Aushadhi Kendra - Dwarka Sector 10', 'Delhi', 'Delhi', '110075', 'Sector 10, Dwarka, Delhi'),
(8, 'JA008', 'Pradhan Mantri Jan Aushadhi Kendra - Lajpat Nagar', 'Delhi', 'Delhi', '110024', 'Lajpat Nagar, New Delhi'),
(9, 'JA009', 'Pradhan Mantri Jan Aushadhi Kendra - Karol Bagh', 'Delhi', 'Delhi', '110005', 'Karol Bagh, New Delhi'),
(10, 'JA010', 'Pradhan Mantri Jan Aushadhi Kendra - Janakpuri', 'Delhi', 'Delhi', '110058', 'Janakpuri District Centre, Delhi'),

(11, 'JA011', 'Pradhan Mantri Jan Aushadhi Kendra - Andheri West', 'Maharashtra', 'Mumbai', '400053', 'Andheri West, Mumbai'),
(12, 'JA012', 'Pradhan Mantri Jan Aushadhi Kendra - Borivali East', 'Maharashtra', 'Mumbai', '400066', 'Borivali East, Mumbai'),
(13, 'JA013', 'Pradhan Mantri Jan Aushadhi Kendra - Dadar', 'Maharashtra', 'Mumbai', '400014', 'Dadar, Mumbai'),
(14, 'JA014', 'Pradhan Mantri Jan Aushadhi Kendra - Thane West', 'Maharashtra', 'Thane', '400601', 'Thane West, Maharashtra'),
(15, 'JA015', 'Pradhan Mantri Jan Aushadhi Kendra - Navi Mumbai', 'Maharashtra', 'Navi Mumbai', '400703', 'Vashi, Navi Mumbai'),

(16, 'JA016', 'Pradhan Mantri Jan Aushadhi Kendra - Boring Road', 'Bihar', 'Patna', '800001', 'Boring Road, Patna, Bihar'),
(17, 'JA017', 'Pradhan Mantri Jan Aushadhi Kendra - Kankarbagh', 'Bihar', 'Patna', '800020', 'Kankarbagh, Patna'),
(18, 'JA018', 'Pradhan Mantri Jan Aushadhi Kendra - Civil Lines', 'Uttar Pradesh', 'Prayagraj', '211001', 'Civil Lines, Prayagraj'),
(19, 'JA019', 'Pradhan Mantri Jan Aushadhi Kendra - Gomti Nagar', 'Uttar Pradesh', 'Lucknow', '226010', 'Gomti Nagar, Lucknow'),
(20, 'JA020', 'Pradhan Mantri Jan Aushadhi Kendra - Hazratganj', 'Uttar Pradesh', 'Lucknow', '226001', 'Hazratganj, Lucknow');
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'SHOPKEEPER') NOT NULL,
    kendra_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (kendra_code) REFERENCES kendras(kendra_code)
);
INSERT INTO users (username, password, role, kendra_code)
VALUES ('admin', 'admin123', 'ADMIN', NULL);
INSERT INTO users (username, password, role, kendra_code) VALUES
('JA001', 'shop123', 'SHOPKEEPER', 'JA001'),
('JA002', 'shop123', 'SHOPKEEPER', 'JA002'),
('JA003', 'shop123', 'SHOPKEEPER', 'JA003');



CREATE TABLE medicines (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    generic_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    composition TEXT,
    group_name TEXT
);

INSERT INTO medicines (generic_name, price, composition, group_name) VALUES
('Paracetamol 500mg', 15.00, 'Paracetamol', 'Analgesics'),
('Azithromycin 250mg', 30.00, 'Azithromycin', 'Antibiotics'),
('ORS Powder', 18.00, 'Oral Rehydration Salts', 'Electrolytes'),
('Metformin 500mg', 22.00, 'Metformin', 'Anti-diabetic'),
('Amoxicillin 500mg', 35.00, 'Amoxicillin', 'Antibiotics'),
('Cetirizine 10mg', 10.00, 'Cetirizine', 'Antihistamines'),
('Pantoprazole 40mg', 25.00, 'Pantoprazole', 'Antacids');

CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    kendra_code VARCHAR(50),
    medicine_id INT,
    batch_no VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    expiry_date DATE NOT NULL,
    FOREIGN KEY (kendra_code) REFERENCES kendras(kendra_code),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);

-- Seed some inventory with standard, low stock, near expiry, and expired
INSERT INTO inventory (kendra_code, medicine_id, batch_no, quantity, expiry_date) VALUES
('JA001', 1, 'BCH-P001', 500, DATE_ADD(CURDATE(), INTERVAL 12 MONTH)),
('JA001', 2, 'BCH-A001', 20, DATE_ADD(CURDATE(), INTERVAL 20 DAY)), -- Expiring soon
('JA001', 3, 'BCH-O001', 0, DATE_ADD(CURDATE(), INTERVAL 6 MONTH)), -- Stockout
('JA001', 4, 'BCH-M001', 100, DATE_SUB(CURDATE(), INTERVAL 5 DAY)), -- Expired

('JA002', 2, 'BCH-A002', 500, DATE_ADD(CURDATE(), INTERVAL 18 MONTH)), -- Healthy stock of Azithromycin
('JA003', 3, 'BCH-O002', 300, DATE_ADD(CURDATE(), INTERVAL 14 MONTH)); 

CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    kendra_code VARCHAR(50),
    inventory_id INT,
    medicine_id INT,
    batch_no VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2),
    customer_mobile VARCHAR(20),
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kendra_code) REFERENCES kendras(kendra_code),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);

CREATE TABLE transfers (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id INT,
    batch_no VARCHAR(50),
    from_kendra_code VARCHAR(50),
    to_kendra_code VARCHAR(50),
    quantity INT,
    status ENUM('Requested', 'Approved', 'In Transit', 'Completed') DEFAULT 'Requested',
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_kendra_code) REFERENCES kendras(kendra_code),
    FOREIGN KEY (to_kendra_code) REFERENCES kendras(kendra_code),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);

-- ALTER TABLE users ADD COLUMN district VARCHAR(100);
-- 👉 Admin is NOT global
-- 👉 Admin is city/state specific

-- Example:

-- Jaipur Admin → manages only Jaipur Kendras

-- Delhi Admin → manages only Delhi Kendras

-- ✔ Transfers → only within same city
-- ✔ Monitoring → only own region