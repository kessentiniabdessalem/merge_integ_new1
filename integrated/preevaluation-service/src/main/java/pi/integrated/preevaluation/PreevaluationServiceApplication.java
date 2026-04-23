package pi.integrated.preevaluation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PreevaluationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PreevaluationServiceApplication.class, args);
    }
}
