-- Use existing learnify_db
USE learnify_db;

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    course_id BIGINT NOT NULL,
    tutor_id BIGINT,
    time_limit_minutes INT,
    passing_score FLOAT,
    total_points INT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_course_id (course_id),
    INDEX idx_tutor_id (tutor_id),
    INDEX idx_status (status)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(1000) NOT NULL,
    type VARCHAR(20) NOT NULL,
    correct_answer VARCHAR(500) NOT NULL,
    points INT DEFAULT 1,
    explanation VARCHAR(1000),
    order_index INT,
    quiz_id BIGINT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id)
);

-- Create question_options table
CREATE TABLE IF NOT EXISTS question_options (
    question_id BIGINT NOT NULL,
    option_text VARCHAR(500),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(255),
    score FLOAT,
    total_points INT,
    passed BOOLEAN,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    time_spent_minutes INT,
    answers TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_student_id (student_id)
);

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT,
    course_id BIGINT,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(255),
    rating INT NOT NULL,
    comment VARCHAR(2000),
    type VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    created_at DATETIME NOT NULL,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_course_id (course_id),
    INDEX idx_student_id (student_id)
);

-- Insert sample quizzes
INSERT INTO quizzes (title, description, course_id, tutor_id, time_limit_minutes, passing_score, total_points, status, created_at, updated_at) VALUES
('Java Basics Quiz', 'Test your knowledge of Java fundamentals', 1, 1, 30, 70.0, 100, 'PUBLISHED', NOW(), NOW()),
('Spring Boot Advanced', 'Advanced concepts in Spring Boot framework', 1, 1, 45, 75.0, 150, 'PUBLISHED', NOW(), NOW()),
('Angular Components Draft', 'Understanding Angular components', 2, 2, 20, 60.0, 80, 'DRAFT', NOW(), NOW());

-- Insert sample questions for Quiz 1 (Java Basics)
INSERT INTO questions (question_text, type, correct_answer, points, explanation, order_index, quiz_id) VALUES
('What is the default value of a boolean variable in Java?', 'MULTIPLE_CHOICE', 'false', 10, 'In Java, boolean variables are initialized to false by default.', 1, 1),
('Java is platform independent', 'TRUE_FALSE', 'True', 10, 'Java code runs on JVM which makes it platform independent.', 2, 1),
('What keyword is used to inherit a class in Java?', 'SHORT_ANSWER', 'extends', 15, 'The extends keyword is used for inheritance in Java.', 3, 1);

-- Insert options for multiple choice question
INSERT INTO question_options (question_id, option_text) VALUES
(1, 'true'),
(1, 'false'),
(1, '0'),
(1, 'null');

-- Insert sample questions for Quiz 2 (Spring Boot)
INSERT INTO questions (question_text, type, correct_answer, points, explanation, order_index, quiz_id) VALUES
('Which annotation is used to mark a class as a REST controller?', 'MULTIPLE_CHOICE', '@RestController', 20, '@RestController combines @Controller and @ResponseBody.', 1, 2),
('Spring Boot requires XML configuration', 'TRUE_FALSE', 'False', 15, 'Spring Boot uses auto-configuration and annotations.', 2, 2),
('What is the default port for Spring Boot applications?', 'SHORT_ANSWER', '8080', 20, 'Spring Boot applications run on port 8080 by default.', 3, 2);

-- Insert options for Spring Boot multiple choice
INSERT INTO question_options (question_id, option_text) VALUES
(4, '@Controller'),
(4, '@RestController'),
(4, '@Service'),
(4, '@Component');

-- Insert sample questions for Quiz 3 (Angular)
INSERT INTO questions (question_text, type, correct_answer, points, explanation, order_index, quiz_id) VALUES
('What decorator is used to define an Angular component?', 'MULTIPLE_CHOICE', '@Component', 10, '@Component decorator marks a class as an Angular component.', 1, 3),
('Angular uses TypeScript by default', 'TRUE_FALSE', 'True', 10, 'Angular is built with TypeScript.', 2, 3);

-- Insert options for Angular multiple choice
INSERT INTO question_options (question_id, option_text) VALUES
(7, '@Component'),
(7, '@Directive'),
(7, '@NgModule'),
(7, '@Injectable');

-- Insert sample quiz attempts
INSERT INTO quiz_attempts (quiz_id, student_id, student_name, score, total_points, passed, started_at, completed_at, time_spent_minutes, answers) VALUES
(1, 101, 'John Doe', 85.0, 100, TRUE, '2024-02-20 10:00:00', '2024-02-20 10:25:00', 25, '{"1":"false","2":"True","3":"extends"}'),
(1, 102, 'Jane Smith', 55.0, 100, FALSE, '2024-02-20 11:00:00', '2024-02-20 11:20:00', 20, '{"1":"true","2":"False","3":"implements"}'),
(2, 101, 'John Doe', 120.0, 150, TRUE, '2024-02-21 14:00:00', '2024-02-21 14:40:00', 40, '{"4":"@RestController","5":"False","6":"8080"}'),
(2, 103, 'Bob Johnson', 90.0, 150, TRUE, '2024-02-21 15:00:00', '2024-02-21 15:35:00', 35, '{"4":"@RestController","5":"False","6":"8080"}');

-- Insert sample feedbacks
INSERT INTO feedbacks (quiz_id, course_id, student_id, student_name, rating, comment, type, created_at) VALUES
(1, 1, 101, 'John Doe', 5, 'Excellent quiz! Really helped me understand Java basics.', 'QUIZ_FEEDBACK', NOW()),
(1, 1, 102, 'Jane Smith', 4, 'Good questions but could use more examples.', 'QUIZ_FEEDBACK', NOW()),
(2, 1, 101, 'John Doe', 5, 'Very comprehensive coverage of Spring Boot concepts.', 'QUIZ_FEEDBACK', NOW()),
(2, 1, 103, 'Bob Johnson', 4, 'Challenging but fair questions.', 'QUIZ_FEEDBACK', NOW()),
(NULL, 1, 101, 'John Doe', 5, 'Great course overall! Highly recommended.', 'COURSE_FEEDBACK', NOW());

-- Create chat_sessions table for AI LearnBot
CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    INDEX idx_user_id (user_id)
);

-- Create chat_messages table for AI LearnBot
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
);
