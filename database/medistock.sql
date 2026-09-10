drop database medistock;
create database medistock;
use medistock;

create table kendras(
    sno int,
    kendra_code varchar(50) primary key,
    kendra_name varchar(255),
    state varchar(100),
    district varchar(100),
    pin varchar(20),
    address text
);

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

INSERT INTO users (username, password, role, kendra_code) VALUES
('admin', 'admin123', 'ADMIN', NULL),
('JA001', 'shop123', 'SHOPKEEPER', 'JA001'),
('JA002', 'shop123', 'SHOPKEEPER', 'JA002'),
('JA003', 'shop123', 'SHOPKEEPER', 'JA003'),
('JA004', 'shop123', 'SHOPKEEPER', 'JA004'),
('JA005', 'shop123', 'SHOPKEEPER', 'JA005'),
('JA006', 'shop123', 'SHOPKEEPER', 'JA006'),
('JA007', 'shop123', 'SHOPKEEPER', 'JA007'),
('JA008', 'shop123', 'SHOPKEEPER', 'JA008'),
('JA009', 'shop123', 'SHOPKEEPER', 'JA009'),
('JA010', 'shop123', 'SHOPKEEPER', 'JA010'),
('JA011', 'shop123', 'SHOPKEEPER', 'JA011'),
('JA012', 'shop123', 'SHOPKEEPER', 'JA012'),
('JA013', 'shop123', 'SHOPKEEPER', 'JA013'),
('JA014', 'shop123', 'SHOPKEEPER', 'JA014'),
('JA015', 'shop123', 'SHOPKEEPER', 'JA015'),
('JA016', 'shop123', 'SHOPKEEPER', 'JA016'),
('JA017', 'shop123', 'SHOPKEEPER', 'JA017'),
('JA018', 'shop123', 'SHOPKEEPER', 'JA018'),
('JA019', 'shop123', 'SHOPKEEPER', 'JA019'),
('JA020', 'shop123', 'SHOPKEEPER', 'JA020');

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
    rack VARCHAR(20) DEFAULT 'R-1',
    shelf VARCHAR(20) DEFAULT 'S-1',
    bin VARCHAR(20) DEFAULT 'B-1',
    FOREIGN KEY (kendra_code) REFERENCES kendras(kendra_code),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);

INSERT INTO inventory (kendra_code, medicine_id, batch_no, quantity, expiry_date, rack, shelf, bin) VALUES
('JA001', 1, 'BCH-P001', 500, DATE_ADD(CURDATE(), INTERVAL 12 MONTH), 'R-1', 'S-1', 'B-1'),
('JA001', 1, 'BCH-P002', 200, DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'R-1', 'S-2', 'B-3'),
('JA001', 1, 'BCH-P003', 100, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'R-2', 'S-1', 'B-2'),
('JA001', 1, 'BCH-P004', 10, DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'R-2', 'S-3', 'B-1'),
('JA001', 2, 'BCH-A001', 25, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'R-3', 'S-1', 'B-4'),
('JA001', 2, 'BCH-A002', 500, DATE_ADD(CURDATE(), INTERVAL 18 MONTH), 'R-3', 'S-2', 'B-2'), 
('JA001', 2, 'BCH-A003', 5, DATE_ADD(CURDATE(), INTERVAL 20 MONTH), 'R-3', 'S-3', 'B-1'),
('JA001', 3, 'BCH-O001', 15, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'R-4', 'S-1', 'B-1'),
('JA001', 3, 'BCH-O002', 0, DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'R-4', 'S-1', 'B-2'),
('JA001', 4, 'BCH-M001', 100, DATE_ADD(CURDATE(), INTERVAL 5 MONTH), 'R-5', 'S-2', 'B-3'),
('JA001', 4, 'BCH-M002', 15, DATE_ADD(CURDATE(), INTERVAL 12 MONTH), 'R-5', 'S-2', 'B-4'),
('JA002', 1, 'BCH-P005', 350, DATE_ADD(CURDATE(), INTERVAL 10 MONTH), 'R-1', 'S-1', 'B-1'),
('JA002', 2, 'BCH-A002', 500, DATE_ADD(CURDATE(), INTERVAL 18 MONTH), 'R-3', 'S-2', 'B-2'), 
('JA003', 3, 'BCH-O002', 300, DATE_ADD(CURDATE(), INTERVAL 14 MONTH), 'R-4', 'S-1', 'B-2'),
('JA004', 1, 'BCH-P006', 150, DATE_ADD(CURDATE(), INTERVAL 8 MONTH), 'R-1', 'S-3', 'B-1'),
('JA004', 4, 'BCH-M003', 12, DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'R-5', 'S-1', 'B-2'),
('JA005', 5, 'BCH-AM01', 450, DATE_ADD(CURDATE(), INTERVAL 12 MONTH), 'R-2', 'S-2', 'B-1'),
('JA005', 6, 'BCH-C001', 8, DATE_ADD(CURDATE(), INTERVAL 4 MONTH), 'R-6', 'S-1', 'B-3'),
('JA006', 1, 'BCH-P007', 600, DATE_ADD(CURDATE(), INTERVAL 15 MONTH), 'R-1', 'S-2', 'B-1'),
('JA006', 7, 'BCH-PT01', 5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'R-7', 'S-1', 'B-1'),
('JA007', 2, 'BCH-A004', 80, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'R-3', 'S-3', 'B-2'),
('JA008', 3, 'BCH-O003', 250, DATE_ADD(CURDATE(), INTERVAL 11 MONTH), 'R-4', 'S-2', 'B-1'),
('JA009', 4, 'BCH-M004', 400, DATE_ADD(CURDATE(), INTERVAL 20 MONTH), 'R-5', 'S-3', 'B-4'),
('JA010', 5, 'BCH-AM02', 18, DATE_ADD(CURDATE(), INTERVAL 5 MONTH), 'R-2', 'S-1', 'B-2'),
('JA011', 6, 'BCH-C002', 320, DATE_ADD(CURDATE(), INTERVAL 16 MONTH), 'R-6', 'S-2', 'B-1'),
('JA015', 1, 'BCH-P008', 210, DATE_ADD(CURDATE(), INTERVAL 9 MONTH), 'R-1', 'S-1', 'B-3'),
('JA015', 7, 'BCH-PT02', 140, DATE_ADD(CURDATE(), INTERVAL 22 DAY), 'R-7', 'S-2', 'B-1');

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

INSERT INTO sales (kendra_code, inventory_id, medicine_id, batch_no, quantity, total_amount, customer_mobile, sale_date) VALUES
('JA001', 1, 1, 'BCH-P001', 20, 300.00, '9876543210', CURRENT_TIMESTAMP),
('JA001', 2, 1, 'BCH-P002', 50, 750.00, '9876543211', CURRENT_TIMESTAMP),
('JA001', 5, 2, 'BCH-A002', 15, 450.00, '9876543212', CURRENT_TIMESTAMP),
('JA002', 6, 2, 'BCH-A002', 30, 900.00, '9876543213', CURRENT_TIMESTAMP),
('JA003', 7, 3, 'BCH-O002', 40, 720.00, '9876543214', CURRENT_TIMESTAMP),
('JA001', 1, 1, 'BCH-P001', 100, 1500.00, '9876543215', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY)),
('JA001', 4, 4, 'BCH-M001', 60, 1320.00, '9876543216', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY)),
('JA006', 12, 1, 'BCH-P007', 80, 1200.00, '9876543217', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY));

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

INSERT INTO transfers (medicine_id, batch_no, from_kendra_code, to_kendra_code, quantity, status) VALUES
(1, 'BCH-P002', 'JA001', 'JA002', 50, 'Approved'),
(2, 'BCH-A002', 'JA002', 'JA001', 30, 'In Transit'),
(3, 'BCH-O002', 'JA003', 'JA001', 100, 'Completed');
