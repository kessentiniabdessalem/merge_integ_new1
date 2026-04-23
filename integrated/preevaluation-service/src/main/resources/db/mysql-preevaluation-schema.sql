-- Schéma MySQL aligné sur les entités JPA du preevaluation-service.
-- À exécuter sur la base preevaluation_db (phpMyAdmin ou mysql CLI) si les tables
-- n’existent pas encore. Alternative : démarrer une fois le service avec
-- spring.jpa.hibernate.ddl-auto=update (défaut) — Hibernate créera/mettra à jour le schéma.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS preeval_questions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  text VARCHAR(4000) NOT NULL,
  level VARCHAR(8) NOT NULL,
  category VARCHAR(20) NOT NULL,
  source_hash VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_preeval_questions_source_hash (source_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preeval_options (
  id BIGINT NOT NULL AUTO_INCREMENT,
  text VARCHAR(2000) NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  sort_order INT NOT NULL,
  question_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_preeval_options_question (question_id),
  CONSTRAINT fk_preeval_options_question FOREIGN KEY (question_id) REFERENCES preeval_questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_profile (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL,
  studied_before TINYINT(1) NOT NULL,
  frequency VARCHAR(16) NOT NULL,
  goal VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_preevaluation_profile_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_result (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL,
  final_level VARCHAR(8) NOT NULL,
  completed_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_preevaluation_result_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_answer (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL,
  question_id BIGINT NOT NULL,
  selected_option_id BIGINT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_preeval_answer_user (user_email),
  KEY idx_preeval_answer_question (question_id),
  KEY idx_preeval_answer_option (selected_option_id),
  CONSTRAINT fk_preeval_answer_question FOREIGN KEY (question_id) REFERENCES preeval_questions (id),
  CONSTRAINT fk_preeval_answer_option FOREIGN KEY (selected_option_id) REFERENCES preeval_options (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_level_selection (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL,
  level VARCHAR(8) NOT NULL,
  submitted TINYINT(1) NOT NULL,
  passed TINYINT(1) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_preeval_level_sel_user (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_level_selection_q (
  selection_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  sort_idx INT NOT NULL,
  PRIMARY KEY (selection_id, sort_idx),
  CONSTRAINT fk_preeval_level_sel_q FOREIGN KEY (selection_id) REFERENCES preevaluation_level_selection (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_fraud_tracking (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL,
  first_strike_consumed TINYINT(1) NOT NULL,
  terminated_for_cheating TINYINT(1) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_preeval_fraud_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS preevaluation_fraud_log (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL,
  reason VARCHAR(64) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_preeval_fraud_log_user (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
