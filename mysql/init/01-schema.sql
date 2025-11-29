-- G-Radius Database Schema for MySQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(512) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WireGuard peers table
CREATE TABLE IF NOT EXISTS wireguard_peers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  public_key VARCHAR(255) UNIQUE NOT NULL,
  private_key VARCHAR(255) NOT NULL,
  ip_address VARCHAR(15) UNIQUE NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_ip_address (ip_address),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radcheck table
CREATE TABLE IF NOT EXISTS radcheck (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(253) NOT NULL DEFAULT '',
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radreply table
CREATE TABLE IF NOT EXISTS radreply (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '=',
  value VARCHAR(253) NOT NULL DEFAULT '',
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radgroupcheck table
CREATE TABLE IF NOT EXISTS radgroupcheck (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(253) NOT NULL DEFAULT '',
  INDEX idx_groupname (groupname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radgroupreply table
CREATE TABLE IF NOT EXISTS radgroupreply (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '=',
  value VARCHAR(253) NOT NULL DEFAULT '',
  INDEX idx_groupname (groupname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radusergroup table
CREATE TABLE IF NOT EXISTS radusergroup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL DEFAULT '',
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  priority INT NOT NULL DEFAULT 0,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radacct table (accounting)
CREATE TABLE IF NOT EXISTS radacct (
  radacctid BIGINT AUTO_INCREMENT PRIMARY KEY,
  acctsessionid VARCHAR(64) NOT NULL DEFAULT '',
  acctuniqueid VARCHAR(32) NOT NULL DEFAULT '',
  username VARCHAR(64) NOT NULL DEFAULT '',
  realm VARCHAR(64) DEFAULT '',
  nasipaddress VARCHAR(15) NOT NULL DEFAULT '',
  nasportid VARCHAR(32) DEFAULT NULL,
  nasporttype VARCHAR(32) DEFAULT NULL,
  acctstarttime DATETIME NULL DEFAULT NULL,
  acctupdatetime DATETIME NULL DEFAULT NULL,
  acctstoptime DATETIME NULL DEFAULT NULL,
  acctinterval INT DEFAULT NULL,
  acctsessiontime INT UNSIGNED DEFAULT NULL,
  acctauthentic VARCHAR(32) DEFAULT NULL,
  connectinfo_start VARCHAR(128) DEFAULT NULL,
  connectinfo_stop VARCHAR(128) DEFAULT NULL,
  acctinputoctets BIGINT UNSIGNED DEFAULT NULL,
  acctoutputoctets BIGINT UNSIGNED DEFAULT NULL,
  calledstationid VARCHAR(50) DEFAULT NULL,
  callingstationid VARCHAR(50) DEFAULT NULL,
  acctterminatecause VARCHAR(32) DEFAULT NULL,
  servicetype VARCHAR(32) DEFAULT NULL,
  framedprotocol VARCHAR(32) DEFAULT NULL,
  framedipaddress VARCHAR(15) DEFAULT NULL,
  INDEX idx_username (username),
  INDEX idx_acctsessionid (acctsessionid),
  INDEX idx_acctstarttime (acctstarttime),
  INDEX idx_acctstoptime (acctstoptime),
  INDEX idx_nasipaddress (nasipaddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FreeRADIUS radpostauth table
CREATE TABLE IF NOT EXISTS radpostauth (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL DEFAULT '',
  pass VARCHAR(64) NOT NULL DEFAULT '',
  reply VARCHAR(32) NOT NULL DEFAULT '',
  authdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_authdate (authdate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NAS table (RADIUS clients)
CREATE TABLE IF NOT EXISTS nas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nasname VARCHAR(128) NOT NULL,
  shortname VARCHAR(32) NOT NULL,
  type VARCHAR(30) DEFAULT 'other',
  ports INT DEFAULT NULL,
  secret VARCHAR(60) NOT NULL DEFAULT 'secret',
  server VARCHAR(64) DEFAULT NULL,
  community VARCHAR(50) DEFAULT NULL,
  description VARCHAR(200) DEFAULT NULL,
  INDEX idx_nasname (nasname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
