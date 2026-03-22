CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    semester INT,
    gmail_refresh_token TEXT,
    gmail_access_token TEXT,
    token_expiry BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    gmail_id VARCHAR(255),
    sender_email VARCHAR(150) NOT NULL,
    sender_name VARCHAR(150),
    subject TEXT NOT NULL,
    body_raw LONGTEXT,
    body_clean TEXT,
    received_at DATETIME,
    category ENUM('exam','assign','club','circular','fee','placement','holiday','general') DEFAULT 'general',
    urgency ENUM('high','medium','low') DEFAULT 'low',
    is_urgent BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_cat (user_id, category),
    INDEX idx_user_unread (user_id, is_read)
);

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority ENUM('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
    due_date DATETIME,
    due_raw VARCHAR(200),
    confidence_score INT DEFAULT 70,
    conf_task_intent INT DEFAULT 70,
    conf_deadline INT DEFAULT 70,
    conf_priority_reason INT DEFAULT 70,
    conf_tag_accuracy INT DEFAULT 70,
    conf_sender_authority INT DEFAULT 70,
    has_collision BOOLEAN DEFAULT FALSE,
    collision_detail TEXT,
    status ENUM('PENDING_REVIEW','ACTIVE','DONE','SYNCED') DEFAULT 'ACTIVE',
    synced_to VARCHAR(100),
    deep_link_module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status),
    INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS task_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    tag VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    original_priority ENUM('HIGH','MEDIUM','LOW'),
    corrected_priority ENUM('HIGH','MEDIUM','LOW'),
    correction_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timetable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(100),
    day_of_week ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
    start_time TIME,
    end_time TIME,
    room VARCHAR(50)
);

INSERT INTO users (name, roll_number, email, password_hash, department, semester)
VALUES ('Sanjay Kumar', '21CS045', 'gssanjaykumar2007@gmail.com', '$2a$10$placeholder', 'CSE', 5);
