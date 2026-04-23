package learnifyapp.userandpreevaluation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class UserAndPreevaluationApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserAndPreevaluationApplication.class, args);
    }
}