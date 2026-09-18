-- ==========================================================
-- NEXORA: AIoT Smart Rolling Barrier & Accident Response System
-- MySQL Relational Database Schema
-- SIH Innovation Prototype
-- ==========================================================

CREATE DATABASE IF NOT EXISTS nexora_db;
USE nexora_db;

-- 1. BARRIERS TABLE
-- Tracks individual rolling barrier modules installed along the highway
CREATE TABLE IF NOT EXISTS barriers (
    barrier_id VARCHAR(20) PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    status ENUM('HEALTHY', 'IMPACT_DETECTED', 'DAMAGE_DETECTED', 'MAINTENANCE_REQUIRED') DEFAULT 'HEALTHY',
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    gateway_id VARCHAR(20) NOT NULL,
    last_inspection DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SENSOR_READINGS TABLE
-- High-frequency telemetry transmitted via LoRa to Gateway
CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(30) NOT NULL,
    barrier_id VARCHAR(20) NOT NULL,
    acceleration DECIMAL(6, 2) NOT NULL COMMENT 'Acceleration in g (Normal: ~0.98g)',
    force DECIMAL(8, 2) NOT NULL COMMENT 'Collision force in kN (Normal: 0 kN)',
    tilt DECIMAL(6, 2) NOT NULL COMMENT 'Deflection angle in degrees (Normal: ~2°)',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barrier_id) REFERENCES barriers(barrier_id) ON DELETE CASCADE,
    INDEX idx_barrier_timestamp (barrier_id, timestamp)
);

-- 3. ACCIDENTS TABLE
-- Detected vehicular collisions verified by AI sensor fusion
CREATE TABLE IF NOT EXISTS accidents (
    accident_id VARCHAR(30) PRIMARY KEY,
    barrier_id VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    impact_force DECIMAL(8, 2) NOT NULL,
    peak_acceleration DECIMAL(6, 2) NOT NULL,
    tilt_deflection DECIMAL(6, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_status ENUM('PENDING', 'ALERT_SENT', 'SERVICES_DISPATCHED', 'RESOLVED') DEFAULT 'ALERT_SENT',
    FOREIGN KEY (barrier_id) REFERENCES barriers(barrier_id) ON DELETE CASCADE
);

-- 4. EMERGENCY_ALERTS TABLE
-- Dispatches triggered to Police, Hospital, and Ambulance services
CREATE TABLE IF NOT EXISTS emergency_alerts (
    alert_id VARCHAR(30) PRIMARY KEY,
    accident_id VARCHAR(30) NOT NULL,
    barrier_id VARCHAR(20) NOT NULL,
    police_status ENUM('QUEUED', 'SENT', 'ACKNOWLEDGED', 'ON_SCENE') DEFAULT 'SENT',
    police_station VARCHAR(100) DEFAULT 'Highway Patrol Post #4',
    hospital_status ENUM('QUEUED', 'SENT', 'ACKNOWLEDGED', 'TRAUMA_TEAM_READY') DEFAULT 'SENT',
    hospital_name VARCHAR(100) DEFAULT 'Apex Trauma Center & Hospital',
    ambulance_status ENUM('QUEUED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED') DEFAULT 'DISPATCHED',
    ambulance_unit VARCHAR(50) DEFAULT 'EMS Unit 108-Alpha',
    response_latency_sec DECIMAL(4, 2) DEFAULT 2.40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accident_id) REFERENCES accidents(accident_id) ON DELETE CASCADE,
    FOREIGN KEY (barrier_id) REFERENCES barriers(barrier_id) ON DELETE CASCADE
);

-- ==========================================================
-- SEED DATA FOR DEMO & SIH PRESENTATION
-- Monitored Highway: Western Expressway Corridor (KM 100 - 140)
-- ==========================================================

INSERT INTO barriers (barrier_id, location, zone, status, latitude, longitude, gateway_id, last_inspection) VALUES
('RB-001', 'KM 102.4 - Northbound', 'Zone 01 (KM 100-110)', 'HEALTHY', 18.712400, 73.351200, 'GW-01', '2026-09-10 08:30:00'),
('RB-002', 'KM 105.8 - Northbound', 'Zone 01 (KM 100-110)', 'HEALTHY', 18.721000, 73.364500, 'GW-01', '2026-09-10 09:15:00'),
('RB-003', 'KM 109.1 - Southbound', 'Zone 01 (KM 100-110)', 'HEALTHY', 18.730500, 73.379000, 'GW-01', '2026-09-11 11:00:00'),
('RB-004', 'KM 112.3 - Curve Entry',  'Zone 02 (KM 110-120)', 'MAINTENANCE_REQUIRED', 18.741200, 73.391000, 'GW-02', '2026-08-28 14:20:00'),
('RB-005', 'KM 115.6 - Valley Bridge', 'Zone 02 (KM 110-120)', 'HEALTHY', 18.749000, 73.402500, 'GW-02', '2026-09-12 10:10:00'),
('RB-006', 'KM 118.9 - Southbound', 'Zone 02 (KM 110-120)', 'HEALTHY', 18.756200, 73.414000, 'GW-02', '2026-09-12 13:40:00'),
('RB-023', 'KM 126.4 - Sharp Curve', 'Zone 03 (KM 120-130)', 'HEALTHY', 18.768400, 73.432800, 'GW-03', '2026-09-15 15:30:00'),
('RB-024', 'KM 128.2 - Gradient Section', 'Zone 03 (KM 120-130)', 'HEALTHY', 18.775000, 73.441000, 'GW-03', '2026-09-15 16:15:00'),
('RB-030', 'KM 133.5 - Southbound', 'Zone 04 (KM 130-140)', 'HEALTHY', 18.789100, 73.461200, 'GW-04', '2026-09-16 09:00:00'),
('RB-031', 'KM 137.0 - Interchange Entry', 'Zone 04 (KM 130-140)', 'HEALTHY', 18.798400, 73.473500, 'GW-04', '2026-09-16 11:30:00');

-- Normal baseline readings for all units
INSERT INTO sensor_readings (sensor_id, barrier_id, acceleration, force, tilt) VALUES
('SENS-RB-001', 'RB-001', 0.98, 0.00, 1.8),
('SENS-RB-002', 'RB-002', 0.99, 0.00, 2.0),
('SENS-RB-004', 'RB-004', 1.05, 0.20, 5.4),
('SENS-RB-023', 'RB-023', 0.98, 0.00, 2.1);
