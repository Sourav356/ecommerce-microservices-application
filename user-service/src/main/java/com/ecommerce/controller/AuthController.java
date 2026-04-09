package com.ecommerce.controller;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Generate secure dynamic key on boot (In prod, this should be stored in env vars)
    private Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username already exists");
            return ResponseEntity.status(400).body(error);
        }
        userRepository.save(user);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password))
                .map(user -> {
                    String token = Jwts.builder()
                            .setSubject(user.getUsername())
                            .setIssuedAt(new Date())
                            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day validity
                            .signWith(key)
                            .compact();
                    Map<String, String> response = new HashMap<>();
                    response.put("token", token);
                    response.put("username", user.getUsername());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid credentials");
                    return ResponseEntity.status(401).body(error);
                });
    }
}
