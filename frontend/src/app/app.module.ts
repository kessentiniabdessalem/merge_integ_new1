import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeModule } from './home/home.module';
import { CoursesModule } from './courses/courses.module';
import { FeaturesModule } from './features/features.module';
import { EventsModule } from './pages/events/events.module';
import { ComponentsModule } from './components/components.module';
import { QuizFeedbackModule } from './quiz-feedback/quiz-feedback.module';
import { AiModule } from './ai/ai.module';

// Interceptors
import { ApiGatewayInterceptor } from './core/interceptors/api-gateway.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

// Shared components (standalone)
import { LearnbotComponent } from './shared/components/learnbot/learnbot.component';
import { VoiceCommandComponent } from './shared/components/voice-command/voice-command.component';
import { PaymentRecommendationComponent } from './shared/components/payment-recommendation/payment-recommendation.component';
import { ToastComponent } from './components/toast/toast.component';

// Cart page (CODE2)
import { CartComponent } from './pages/cart/cart.component';

@NgModule({
  declarations: [
    AppComponent,
    CartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    HomeModule,
    CoursesModule,
    FeaturesModule,
    EventsModule,
    ComponentsModule,
    QuizFeedbackModule,
    AiModule,
    // Standalone components
    LearnbotComponent,
    VoiceCommandComponent,
    PaymentRecommendationComponent,
    ToastComponent,
  ],
  providers: [
    // JWT interceptor runs first — attaches Bearer token to all protected requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    // API Gateway interceptor — handles Content-Type headers, error handling, retry logic
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiGatewayInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
