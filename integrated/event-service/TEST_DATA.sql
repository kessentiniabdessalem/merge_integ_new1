-- ============================================
-- Script d'insertion de données de test
-- Module Event Management
-- ============================================

-- Nettoyer les données existantes (optionnel)
-- DELETE FROM event_like;
-- DELETE FROM reservation;
-- DELETE FROM event_participants;
-- DELETE FROM event;
-- DELETE FROM participant;
-- DELETE FROM organizer;

-- ============================================
-- 1. ORGANIZERS
-- ============================================

INSERT INTO organizer (name, email, phone) VALUES
('Tech Academy', 'contact@techacademy.com', '+216 71 123 456'),
('Digital Learning Center', 'info@digitallearning.tn', '+216 71 789 012'),
('Innovation Hub', 'hello@innovationhub.tn', '+216 71 456 789'),
('Code School', 'admin@codeschool.tn', '+216 71 321 654');

-- ============================================
-- 2. PARTICIPANTS
-- ============================================

INSERT INTO participant (full_name, email, attended) VALUES
('Mohamed Salah', 'mohamed.salah@email.com', false),
('Fatma Ben Ali', 'fatma.benali@email.com', false),
('Ahmed Trabelsi', 'ahmed.trabelsi@email.com', false),
('Leila Mansour', 'leila.mansour@email.com', false),
('Karim Bouaziz', 'karim.bouaziz@email.com', false),
('Sarah Khalil', 'sarah.khalil@email.com', false),
('Youssef Hamdi', 'youssef.hamdi@email.com', false),
('Amira Jebali', 'amira.jebali@email.com', false),
('Mehdi Gharbi', 'mehdi.gharbi@email.com', false),
('Nour Slimani', 'nour.slimani@email.com', false);

-- ============================================
-- 3. EVENTS
-- ============================================

-- Événements à venir (Upcoming)
INSERT INTO event (name, category, status, date, places_limit, reserved_places, 
                   description, location, photo_url, organizer_first_name, 
                   organizer_last_name, organizer_id) VALUES

('Workshop Angular Avancé', 'WORKSHOP', 'Upcoming', '2026-04-15', 100, 0,
 'Atelier pratique sur Angular 19 avec les dernières fonctionnalités : signals, standalone components, et optimisations de performance.',
 'Salle A, Bâtiment 3, Campus Universitaire', '/uploads/angular.jpg', 'Ahmed', 'Mansour', 1),

('Webinar: Intelligence Artificielle et Machine Learning', 'WEBINAR', 'Upcoming', '2026-04-20', 200, 0,
 'Découvrez les applications pratiques de l\'IA et du ML dans le développement web moderne. Avec démonstrations en direct.',
 'En ligne - Zoom', '/uploads/ai-ml.jpg', 'Sarah', 'Khalil', 2),

('Conférence DevOps 2026', 'CONFERENCE', 'Upcoming', '2026-05-10', 150, 0,
 'Les meilleures pratiques DevOps pour 2026 : CI/CD, containerisation, orchestration avec Kubernetes.',
 'Centre de Conférences, Tunis', '/uploads/devops.jpg', 'Karim', 'Bouaziz', 1),

('Formation Spring Boot Microservices', 'TRAINING', 'Upcoming', '2026-05-15', 80, 0,
 'Formation complète sur l\'architecture microservices avec Spring Boot, Spring Cloud, et Docker.',
 'Salle B, Tech Academy', '/uploads/spring-boot.jpg', 'Mohamed', 'Gharbi', 1),

('Préparation Certification AWS', 'EXAM_PREPARATION', 'Upcoming', '2026-06-01', 50, 0,
 'Préparation intensive pour la certification AWS Solutions Architect Associate. Exercices pratiques et examens blancs.',
 'Salle C, Digital Learning Center', '/uploads/aws-cert.jpg', 'Leila', 'Mansour', 2),

('Business English for IT Professionals', 'BUSINESS_ENGLISH', 'Upcoming', '2026-06-10', 60, 0,
 'Améliorez votre anglais professionnel pour les métiers de l\'IT : présentations, réunions, emails.',
 'Salle D, Innovation Hub', '/uploads/business-english.jpg', 'Emma', 'Johnson', 3),

('Soirée Culturelle: Tech & Innovation', 'CULTURAL_EVENT', 'Upcoming', '2026-06-20', 120, 0,
 'Soirée networking avec présentations sur l\'innovation technologique en Tunisie. Buffet et animations.',
 'Espace Culturel, La Marsa', '/uploads/cultural-event.jpg', 'Youssef', 'Hamdi', 4),

('Workshop React & Next.js', 'WORKSHOP', 'Upcoming', '2026-07-05', 90, 0,
 'Créez des applications web performantes avec React 19 et Next.js 15. Projets pratiques inclus.',
 'Salle E, Code School', '/uploads/react-nextjs.jpg', 'Nour', 'Slimani', 4),

-- Événements en cours (Ongoing)
('Bootcamp Full Stack JavaScript', 'TRAINING', 'Ongoing', '2026-03-01', 100, 75,
 'Bootcamp intensif de 3 mois : HTML, CSS, JavaScript, Node.js, React, MongoDB.',
 'Campus Tech Academy', '/uploads/fullstack-bootcamp.jpg', 'Ahmed', 'Mansour', 1),

-- Événements terminés (Completed)
('Workshop Vue.js 3', 'WORKSHOP', 'Completed', '2026-02-15', 80, 80,
 'Introduction à Vue.js 3 avec Composition API et TypeScript.',
 'Salle A, Bâtiment 3', '/uploads/vuejs.jpg', 'Sarah', 'Khalil', 2),

('Conférence Cybersécurité', 'CONFERENCE', 'Completed', '2026-01-20', 150, 145,
 'Les enjeux de la cybersécurité en 2026 : menaces, solutions, bonnes pratiques.',
 'Centre de Conférences', '/uploads/cybersecurity.jpg', 'Karim', 'Bouaziz', 1),

-- Événement annulé (Cancelled)
('Webinar Python pour Data Science', 'WEBINAR', 'Cancelled', '2026-03-25', 100, 20,
 'Introduction à Python pour l\'analyse de données et le machine learning.',
 'En ligne - Zoom', '/uploads/python-data.jpg', 'Leila', 'Mansour', 2);

-- ============================================
-- 4. RESERVATIONS (pour les événements passés/en cours)
-- ============================================

-- Réservations pour l'événement "Bootcamp Full Stack JavaScript" (ID 9)
INSERT INTO reservation (event_id, participant_id, ticket_code, reservation_date, status) VALUES
(9, 1, 'TKT-A1B2C3D4', '2026-02-20 10:30:00', 'CONFIRMED'),
(9, 2, 'TKT-E5F6G7H8', '2026-02-20 11:15:00', 'CONFIRMED'),
(9, 3, 'TKT-I9J0K1L2', '2026-02-21 09:00:00', 'CONFIRMED'),
(9, 4, 'TKT-M3N4O5P6', '2026-02-21 14:30:00', 'CONFIRMED'),
(9, 5, 'TKT-Q7R8S9T0', '2026-02-22 10:00:00', 'CONFIRMED');

-- Réservations pour l'événement "Workshop Vue.js 3" (ID 10) - Completed
INSERT INTO reservation (event_id, participant_id, ticket_code, reservation_date, status) VALUES
(10, 1, 'TKT-U1V2W3X4', '2026-02-10 10:00:00', 'ATTENDED'),
(10, 2, 'TKT-Y5Z6A7B8', '2026-02-10 11:00:00', 'ATTENDED'),
(10, 6, 'TKT-C9D0E1F2', '2026-02-11 09:30:00', 'ATTENDED'),
(10, 7, 'TKT-G3H4I5J6', '2026-02-11 15:00:00', 'ATTENDED');

-- Réservations pour l'événement "Conférence Cybersécurité" (ID 11) - Completed
INSERT INTO reservation (event_id, participant_id, ticket_code, reservation_date, status) VALUES
(11, 3, 'TKT-K7L8M9N0', '2026-01-15 10:00:00', 'ATTENDED'),
(11, 4, 'TKT-O1P2Q3R4', '2026-01-15 11:00:00', 'ATTENDED'),
(11, 5, 'TKT-S5T6U7V8', '2026-01-16 09:00:00', 'ATTENDED'),
(11, 8, 'TKT-W9X0Y1Z2', '2026-01-16 14:00:00', 'ATTENDED'),
(11, 9, 'TKT-A3B4C5D6', '2026-01-17 10:30:00', 'ATTENDED');

-- Réservations annulées pour l'événement "Webinar Python" (ID 12) - Cancelled
INSERT INTO reservation (event_id, participant_id, ticket_code, reservation_date, status) VALUES
(12, 6, 'TKT-E7F8G9H0', '2026-03-10 10:00:00', 'CANCELLED'),
(12, 7, 'TKT-I1J2K3L4', '2026-03-10 11:00:00', 'CANCELLED');

-- ============================================
-- 5. EVENT LIKES
-- ============================================

-- Likes pour "Workshop Angular Avancé" (ID 1)
INSERT INTO event_like (event_id, participant_id, liked_at) VALUES
(1, 1, '2026-03-01 10:00:00'),
(1, 2, '2026-03-01 11:00:00'),
(1, 3, '2026-03-01 12:00:00'),
(1, 4, '2026-03-01 13:00:00'),
(1, 5, '2026-03-01 14:00:00'),
(1, 6, '2026-03-01 15:00:00');

-- Likes pour "Webinar: Intelligence Artificielle" (ID 2)
INSERT INTO event_like (event_id, participant_id, liked_at) VALUES
(2, 1, '2026-03-02 10:00:00'),
(2, 3, '2026-03-02 11:00:00'),
(2, 5, '2026-03-02 12:00:00'),
(2, 7, '2026-03-02 13:00:00'),
(2, 9, '2026-03-02 14:00:00');

-- Likes pour "Conférence DevOps 2026" (ID 3)
INSERT INTO event_like (event_id, participant_id, liked_at) VALUES
(3, 2, '2026-03-02 10:00:00'),
(3, 4, '2026-03-02 11:00:00'),
(3, 6, '2026-03-02 12:00:00'),
(3, 8, '2026-03-02 13:00:00');

-- Likes pour "Formation Spring Boot Microservices" (ID 4)
INSERT INTO event_like (event_id, participant_id, liked_at) VALUES
(4, 1, '2026-03-02 15:00:00'),
(4, 2, '2026-03-02 16:00:00'),
(4, 3, '2026-03-02 17:00:00');

-- ============================================
-- 6. EVENT_PARTICIPANTS (ManyToMany)
-- ============================================

-- Participants pour "Bootcamp Full Stack JavaScript" (ID 9)
INSERT INTO event_participants (event_id, participant_id) VALUES
(9, 1), (9, 2), (9, 3), (9, 4), (9, 5);

-- Participants pour "Workshop Vue.js 3" (ID 10)
INSERT INTO event_participants (event_id, participant_id) VALUES
(10, 1), (10, 2), (10, 6), (10, 7);

-- Participants pour "Conférence Cybersécurité" (ID 11)
INSERT INTO event_participants (event_id, participant_id) VALUES
(11, 3), (11, 4), (11, 5), (11, 8), (11, 9);

-- ============================================
-- VERIFICATION DES DONNEES
-- ============================================

-- Vérifier le nombre d'événements par status
SELECT status, COUNT(*) as total FROM event GROUP BY status;

-- Vérifier le nombre de réservations par status
SELECT status, COUNT(*) as total FROM reservation GROUP BY status;

-- Vérifier les événements les plus likés
SELECT e.name, COUNT(el.id) as likes_count 
FROM event e 
LEFT JOIN event_like el ON e.id = el.event_id 
GROUP BY e.id, e.name 
ORDER BY likes_count DESC;

-- Vérifier les événements les plus réservés
SELECT e.name, e.reserved_places, e.places_limit,
       ROUND((e.reserved_places * 100.0 / e.places_limit), 2) as fill_rate
FROM event e
ORDER BY e.reserved_places DESC;

-- Vérifier les participants les plus actifs
SELECT p.full_name, 
       COUNT(DISTINCT r.id) as reservations_count,
       COUNT(DISTINCT el.id) as likes_count
FROM participant p
LEFT JOIN reservation r ON p.id = r.participant_id
LEFT JOIN event_like el ON p.id = el.participant_id
GROUP BY p.id, p.full_name
ORDER BY reservations_count DESC, likes_count DESC;
