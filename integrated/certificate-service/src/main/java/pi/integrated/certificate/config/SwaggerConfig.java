package pi.integrated.certificate.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI certificateServiceAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Certificate Service API")
                        .description("REST API for LearnifyEnglish Certificate Management")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("LearnifyEnglish Team")
                                .email("support@learnifyenglish.com")));
    }
}
