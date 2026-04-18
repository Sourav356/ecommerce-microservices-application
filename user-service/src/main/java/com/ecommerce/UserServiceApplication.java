package com.ecommerce;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                      @Value("${ADMIN_PASSWORD}") String adminPassword) {
        return args -> {
            if (userRepository.count() == 0) {
                User user1 = new User();
                user1.setUsername("demouser");
                user1.setEmail("demo@ecommerce.com");
                user1.setPassword("password123");
                userRepository.save(user1);

                User user2 = new User();
                user2.setUsername("admin");
                user2.setEmail("admin@ecommerce.com");
                user2.setPassword(adminPassword);
                userRepository.save(user2);
                System.out.println("Seeded dummy users into user_schema!");
            }
        };
    }

    @GetMapping("/health")
    public String health() {
        return "User Service is healthy";
    }
}
