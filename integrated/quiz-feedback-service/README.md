# Quiz & Feedback Service - Learnify Platform

Complete implementation of the quiz-feedback-service microservice for the Learnify Online Learning Management System.

## Architecture

- **Backend**: Spring Boot 3.2.0 + MySQL 8
- **Frontend**: Angular (integrated module)
- **Service Discovery**: Eureka Server (port 8761)
- **API Gateway**: Port 8080
- **Quiz Service**: Port 8081

## Features Implemented

### Backend (Spring Boot)
- ✅ 4 Entities: Quiz, Question, QuizAttempt, Feedback
- ✅ JPA Repositories with custom queries
- ✅ Service layer with full CRUD operations
- ✅ REST Controllers with CORS enabled
- ✅ Global Exception Handling
- ✅ DTO pattern for all requests/responses
- ✅ Auto-scoring quiz attempts
- ✅ Statistics calculation (avg score, pass rate, ratings)
- ✅ Unit tests (JUnit 5 + Mockito)
- ✅ Integration tests (MockMvc)

### Frontend (Angular)
- ✅ Quiz management (list, create, edit, delete, publish/archive)
- ✅ Question management (add, edit, delete, reorder)
- ✅ Take quiz interface (multiple choice, true/false, short answer)
- ✅ Quiz attempt results with pass/fail
- ✅ Feedback system with star ratings
- ✅ Statistics dashboard
- ✅ Reactive forms with validation
- ✅ Lazy-loaded module

## Startup Instructions

### Step 1: Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run the initialization script
mysql -u root -p < backend/quiz-feedback-service/init_quiz_feedback.sql
```

### Step 2: Start Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```
Wait until you see: "Started Eureka Server on port 8761"

### Step 3: Start API Gateway
```bash
cd api-gateway
mvn spring-boot:run
```
Wait until you see: "Started API Gateway on port 8080"

### Step 4: Start Quiz-Feedback Service
```bash
cd backend/quiz-feedback-service
mvn spring-boot:run
```
Wait until you see: "Started QuizFeedbackServiceApplication on port 8081"

### Step 5: Start Angular Frontend
```bash
cd elearning-angular
ng serve
```
Wait until you see: "Compiled successfully"

### Step 6: Access the Application
Open your browser and navigate to:
```
http://localhost:4200/quizzes
```

## API Endpoints

### Quiz Endpoints
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/{id}` - Get quiz by ID
- `GET /api/quizzes/{id}/full` - Get quiz with questions
- `GET /api/quizzes/{id}/stats` - Get quiz statistics
- `GET /api/quizzes/course/{courseId}` - Get quizzes by course
- `GET /api/quizzes/published` - Get published quizzes
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/{id}` - Update quiz
- `PUT /api/quizzes/{id}/publish` - Publish quiz
- `PUT /api/quizzes/{id}/archive` - Archive quiz
- `DELETE /api/quizzes/{id}` - Delete quiz

### Question Endpoints
- `GET /api/questions/quiz/{quizId}` - Get questions by quiz
- `GET /api/questions/{id}` - Get question by ID
- `POST /api/questions` - Add question
- `PUT /api/questions/{id}` - Update question
- `PUT /api/questions/quiz/{quizId}/reorder` - Reorder questions
- `DELETE /api/questions/{id}` - Delete question

### Quiz Attempt Endpoints
- `POST /api/attempts/submit` - Submit quiz attempt
- `GET /api/attempts/quiz/{quizId}` - Get attempts by quiz
- `GET /api/attempts/student/{studentId}` - Get attempts by student
- `GET /api/attempts/{id}` - Get attempt by ID

### Feedback Endpoints
- `GET /api/feedbacks` - Get all feedbacks
- `GET /api/feedbacks/{id}` - Get feedback by ID
- `GET /api/feedbacks/quiz/{quizId}` - Get feedbacks by quiz
- `GET /api/feedbacks/quiz/{quizId}/average` - Get average rating
- `GET /api/feedbacks/course/{courseId}` - Get feedbacks by course
- `GET /api/feedbacks/student/{studentId}` - Get feedbacks by student
- `POST /api/feedbacks` - Create feedback
- `PUT /api/feedbacks/{id}` - Update feedback
- `DELETE /api/feedbacks/{id}` - Delete feedback

## Testing

### Run Backend Tests
```bash
cd backend/quiz-feedback-service
mvn test
```

### Test Coverage
- QuizServiceImplTest: 6 tests
- QuizAttemptServiceImplTest: 2 tests
- FeedbackServiceImplTest: 5 tests
- QuizControllerTest: 4 tests
- FeedbackControllerTest: 3 tests

## Sample Data

The initialization script includes:
- 3 sample quizzes (Java Basics, Spring Boot Advanced, Angular Components)
- 8 questions across different types
- 4 quiz attempts (2 passed, 2 failed)
- 5 feedbacks with ratings 3-5

## Configuration

### Backend Configuration (application.yml)
- Server Port: 8081
- Database: learnify_db
- Eureka: http://localhost:8761/eureka/
- JPA: Auto-update schema

### Frontend Configuration
- API Base URL: http://localhost:8080/api
- CORS: Enabled for localhost:4200

## Project Structure

```
backend/quiz-feedback-service/
├── src/main/java/com/elearning/quiz/
│   ├── model/          # Entities
│   ├── repository/     # JPA Repositories
│   ├── service/        # Business Logic
│   ├── controller/     # REST Controllers
│   ├── dto/            # Data Transfer Objects
│   ├── exception/      # Exception Handling
│   └── config/         # Configuration
├── src/test/java/      # Unit & Integration Tests
└── init_quiz_feedback.sql

src/app/quiz-feedback/
├── models/             # TypeScript Interfaces
├── services/           # HTTP Services
└── components/
    ├── quiz/           # Quiz Components
    ├── quiz-attempt/   # Quiz Taking & Results
    └── feedback/       # Feedback Components
```

## Notes

- All backend responses use proper HTTP status codes
- Frontend uses reactive forms with validation
- Proper error handling on both frontend and backend
- All services use takeUntil pattern for subscription management
- CORS configured for localhost:4200
- Auto-scoring implemented for quiz attempts
- Statistics calculated in real-time

## Troubleshooting

1. **Port already in use**: Make sure ports 8761, 8080, 8081, and 4200 are available
2. **Database connection error**: Verify MySQL is running and credentials are correct
3. **Eureka registration failed**: Ensure Eureka server is running before starting services
4. **CORS errors**: Verify API Gateway and service CORS configuration

## Future Enhancements

- Authentication & Authorization
- Real-time quiz timer
- Question bank management
- Quiz templates
- Advanced analytics
- Export results to PDF
- Email notifications
