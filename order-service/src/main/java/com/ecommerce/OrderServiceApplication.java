package com.ecommerce;

import com.ecommerce.model.Order;
import com.ecommerce.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;

@SpringBootApplication
@RestController
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(OrderRepository orderRepository) {
        return args -> {
            if (orderRepository.count() == 0) {
                Order order1 = new Order();
                order1.setUserId(1L);
                order1.setTotalAmount(new BigDecimal("299.99"));
                order1.setStatus("COMPLETED");
                orderRepository.save(order1);

                Order order2 = new Order();
                order2.setUserId(2L);
                order2.setTotalAmount(new BigDecimal("149.99"));
                order2.setStatus("PENDING");
                orderRepository.save(order2);
                System.out.println("Seeded dummy orders into order_schema!");
            }
        };
    }

    @GetMapping("/health")
    public String health() {
        return "Order Service is healthy";
    }
}
