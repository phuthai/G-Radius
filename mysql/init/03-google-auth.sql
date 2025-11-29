-- Google OAuth Settings Table
CREATE TABLE IF NOT EXISTS google_auth_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enabled BOOLEAN DEFAULT FALSE,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    callback_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add Google ID column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS auth_provider ENUM('local', 'google') DEFAULT 'local',
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Insert default Google auth settings
INSERT INTO google_auth_settings (enabled, client_id, client_secret, callback_url)
VALUES (FALSE, '', '', 'http://10.0.0.3:5000/api/auth/google/callback')
ON DUPLICATE KEY UPDATE id=id;

-- Create index for faster Google ID lookups
CREATE INDEX idx_google_id ON users(google_id);
CREATE INDEX idx_auth_provider ON users(auth_provider);
