package com.ecommerce.controller;

import com.ecommerce.model.Order;
import com.ecommerce.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    private RestTemplate restTemplate = new RestTemplate();

    // Support configurable gateway URL via Environment Variable for Docker networking
    private final String GATEWAY_URL = System.getenv("GATEWAY_URL") != null 
            ? System.getenv("GATEWAY_URL") 
            : "http://localhost:4000/api";

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        try {
            // 1. Fetch Cart Items
            HttpHeaders cartHeaders = new HttpHeaders();
            cartHeaders.set("X-User-Id", username);
            HttpEntity<String> cartEntity = new HttpEntity<>(cartHeaders);
            ResponseEntity<List> cartReq = restTemplate.exchange(
                    GATEWAY_URL + "/cart",
                    HttpMethod.GET,
                    cartEntity,
                    List.class
            );
            List cartItems = cartReq.getBody();
            
            if (cartItems == null || cartItems.isEmpty()) {
                return ResponseEntity.badRequest().body("Cart is empty");
            }

            // 2. Fetch Products to calculate total amount
            ResponseEntity<List> productsReq = restTemplate.getForEntity(GATEWAY_URL + "/products", List.class);
            List<Map<String, Object>> products = productsReq.getBody();

            double totalAmount = 0.0;
            for (Object itemObj : cartItems) {
                Map<String, Object> cartItem = (Map<String, Object>) itemObj;
                int prodId = ((Number) cartItem.get("product_id")).intValue();
                int qty = ((Number) cartItem.get("quantity")).intValue();
                
                // Find matching product price
                for (Map<String, Object> p : products) {
                    if (((Number) p.get("id")).intValue() == prodId) {
                        totalAmount += ((Number) p.get("price")).doubleValue() * qty;
                    }
                }
            }

            // 2.5 Verify and Reduce Inventory Stock
            for (Object itemObj : cartItems) {
                Map<String, Object> cartItem = (Map<String, Object>) itemObj;
                Map<String, Object> inventoryReq = new HashMap<>();
                inventoryReq.put("product_id", ((Number) cartItem.get("product_id")).intValue());
                inventoryReq.put("quantity", ((Number) cartItem.get("quantity")).intValue());
                
                try {
                    restTemplate.postForEntity(GATEWAY_URL + "/inventory/reduce", inventoryReq, Map.class);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Inventory Check Failed: Insufficient stock for Product ID " + inventoryReq.get("product_id"));
                }
            }

            // 3. Save Pending Order
            Order order = new Order();
            // Storing user by username hash or mock userId. We'll set mock userId=999 since our entity requires Long.
            order.setUserId(999L); 
            order.setTotalAmount(BigDecimal.valueOf(totalAmount));
            order.setStatus("PENDING");
            order = orderRepository.save(order);

            // 4. Contact Payment Service
            Map<String, Object> paymentPayload = new HashMap<>();
            paymentPayload.put("order_id", order.getId());
            paymentPayload.put("amount", totalAmount);
            
            restTemplate.postForEntity(GATEWAY_URL + "/payments/process", paymentPayload, Map.class);

            // 5. Contact Notification Service
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("username", username);
            notificationPayload.put("order_id", order.getId());
            notificationPayload.put("amount", totalAmount);
            
            restTemplate.postForEntity(GATEWAY_URL + "/notifications/send", notificationPayload, Map.class);

            // 6. Clear Cart
            restTemplate.exchange(
                    GATEWAY_URL + "/cart",
                    HttpMethod.DELETE,
                    cartEntity,
                    String.class
            );

            // 7. Complete Order
            order.setStatus("COMPLETED");
            orderRepository.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Checkout successful. Order finalized.");
            response.put("order_id", order.getId());
            response.put("total_amount", totalAmount);

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Checkout Orchestration Failed: " + e.getMessage());
        }
    }
}
