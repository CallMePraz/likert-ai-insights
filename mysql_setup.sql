-- Create a dedicated user for the application
CREATE USER IF NOT EXISTS 'likert_user'@'localhost' IDENTIFIED BY 'likert_password';

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dev_DBLikert;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON dev_DBLikert.* TO 'likert_user'@'localhost';

-- Use the database
USE dev_DBLikert;

-- Create the surveyData table if it doesn't exist
CREATE TABLE IF NOT EXISTS surveyData (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    branch VARCHAR(100),
    sentiment ENUM('positive', 'neutral', 'negative') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add some sample data
INSERT INTO surveyData (date, rating, comment, branch, sentiment) VALUES
('2025-04-10', 5, 'Excellent service, the staff was very helpful and knowledgeable.', 'Downtown', 'positive'),
('2025-04-10', 2, 'Had to wait for over 30 minutes to be served. Unacceptable.', 'Westside', 'negative'),
('2025-04-09', 4, 'Mobile app works great, but could use more features.', 'Online', 'positive'),
('2025-04-09', 3, 'Average experience. Nothing special to note.', 'Northgate', 'neutral'),
('2025-04-08', 1, 'App keeps crashing when trying to make a transfer. Very frustrating!', 'Online', 'negative');
