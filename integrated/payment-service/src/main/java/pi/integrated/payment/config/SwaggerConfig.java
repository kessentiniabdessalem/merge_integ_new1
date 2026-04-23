package pi.integrated.payment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI paymentServiceAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Payment Service API")
                        .description("REST API for LearnifyEnglish Payment Management")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("LearnifyEnglish Team")
                                .email("support@learnifyenglish.com")));
    }
}
