package com.oceanview.controllers;

import com.oceanview.models.User;
import com.oceanview.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // Check username exists
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.status(400).body(Map.of("message", "Username already exists"));
        }

        // Check email exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(400).body(Map.of("message", "Email already exists"));
        }

        // Validate password length
        if (user.getPassword() == null || user.getPassword().length() < 4) {
            return ResponseEntity.status(400).body(Map.of("message", "Password must be at least 4 characters"));
        }

        // Default role
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "message", "Registration successful",
            "username", saved.getUsername(),
            "role", saved.getRole()
        ));
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {

        // Check username
        User user = userRepository.findByUsername(loginUser.getUsername());
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }

        // Check password
        if (!user.getPassword().equals(loginUser.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid password"));
        }

        // ✅ Return user data (no password)
        return ResponseEntity.ok(Map.of(
            "id",       user.getId(),
            "username", user.getUsername(),
            "email",    user.getEmail(),
            "role",     user.getRole()
        ));
    }

    // ✅ GET ALL USERS (Admin only)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // ✅ GET USER BY ID
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok((Object) Map.of(
                "id",       user.getId(),
                "username", user.getUsername(),
                "email",    user.getEmail(),
                "role",     user.getRole()
            )))
            .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    // ✅ UPDATE USER
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
            .map(existing -> {
                if (updatedUser.getUsername() != null) existing.setUsername(updatedUser.getUsername());
                if (updatedUser.getEmail()    != null) existing.setEmail(updatedUser.getEmail());
                if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                    existing.setPassword(updatedUser.getPassword());
                }
                if (updatedUser.getRole() != null) existing.setRole(updatedUser.getRole());
                userRepository.save(existing);
                return ResponseEntity.ok((Object) Map.of("message", "User updated successfully"));
            })
            .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    // ✅ DELETE USER
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ✅ CHANGE PASSWORD
    @PutMapping("/users/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        return userRepository.findById(id)
            .map(user -> {
                if (!user.getPassword().equals(oldPassword)) {
                    return ResponseEntity.status(400).body((Object) Map.of("message", "Old password is incorrect"));
                }
                if (newPassword == null || newPassword.length() < 4) {
                    return ResponseEntity.status(400).body(Map.of("message", "New password must be at least 4 characters"));
                }
                user.setPassword(newPassword);
                userRepository.save(user);
                return ResponseEntity.ok((Object) Map.of("message", "Password changed successfully"));
            })
            .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    // ✅ TEST API
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Auth API working!"));
    }
}