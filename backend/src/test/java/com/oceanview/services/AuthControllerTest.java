package com.oceanview.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.models.User;
import com.oceanview.repositories.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TDD Integration Tests — AuthController
 *
 * Test IDs: TC-AC-xx
 * Tests register, login, get users, update user, delete user endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController Integration Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User savedUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User u = new User();
        u.setUsername("test_staff");
        u.setEmail("staff@oceanview.com");
        u.setPassword("pass1234");
        u.setRole("USER");
        savedUser = userRepository.save(u);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // REGISTER
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("TC-AC-01: Valid registration returns 201 with user object")
        void register_validUser_returns201() throws Exception {
            Map<String, String> body = Map.of(
                "username", "new_user",
                "email",    "new@oceanview.com",
                "password", "pass5678",
                "role",     "USER"
            );
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("new_user")))
                .andExpect(jsonPath("$.role",     is("USER")));
        }

        @Test
        @DisplayName("TC-AC-02: Duplicate username returns 400")
        void register_duplicateUsername_returns400() throws Exception {
            Map<String, String> body = Map.of(
                "username", "test_staff",   // already exists
                "email",    "other@oceanview.com",
                "password", "pass5678",
                "role",     "USER"
            );
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
        }

        @Test
        @DisplayName("TC-AC-03: Duplicate email returns 400")
        void register_duplicateEmail_returns400() throws Exception {
            Map<String, String> body = Map.of(
                "username", "brand_new",
                "email",    "staff@oceanview.com",  // already exists
                "password", "pass5678",
                "role",     "USER"
            );
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TC-AC-04: Short username returns 400")
        void register_shortUsername_returns400() throws Exception {
            Map<String, String> body = Map.of(
                "username", "ab",
                "email",    "valid@oceanview.com",
                "password", "pass5678",
                "role",     "USER"
            );
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TC-AC-05: Admin role registration succeeds")
        void register_adminRole_succeeds() throws Exception {
            Map<String, String> body = Map.of(
                "username", "admin_user",
                "email",    "admin@oceanview.com",
                "password", "adminpass",
                "role",     "ADMIN"
            );
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("ADMIN")));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LOGIN
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("TC-AC-06: Valid credentials returns 200 with user data")
        void login_validCredentials_returns200() throws Exception {
            Map<String, String> body = Map.of(
                "username", "test_staff",
                "password", "pass1234"
            );
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("test_staff")))
                .andExpect(jsonPath("$.role",     is("USER")))
                .andExpect(jsonPath("$.id",       notNullValue()));
        }

        @Test
        @DisplayName("TC-AC-07: Wrong password returns 401")
        void login_wrongPassword_returns401() throws Exception {
            Map<String, String> body = Map.of(
                "username", "test_staff",
                "password", "wrongpass"
            );
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid password")));
        }

        @Test
        @DisplayName("TC-AC-08: Non-existent username returns 404")
        void login_nonExistentUser_returns404() throws Exception {
            Map<String, String> body = Map.of(
                "username", "ghost_user",
                "password", "pass1234"
            );
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("not found")));
        }

        @Test
        @DisplayName("TC-AC-09: Login response never includes password")
        void login_responseDoesNotIncludePassword() throws Exception {
            Map<String, String> body = Map.of(
                "username", "test_staff",
                "password", "pass1234"
            );
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET ALL USERS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("GET /api/auth/users")
    class GetUsersTests {

        @Test
        @DisplayName("TC-AC-10: Returns list with at least one user")
        void getUsers_returnsList() throws Exception {
            mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].username", is("test_staff")));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // UPDATE USER
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("PUT /api/auth/users/{id}")
    class UpdateUserTests {

        @Test
        @DisplayName("TC-AC-11: Valid update changes user role")
        void updateUser_changesRole() throws Exception {
            Map<String, String> body = Map.of(
                "username", "test_staff",
                "email",    "staff@oceanview.com",
                "role",     "ADMIN"
            );
            mockMvc.perform(put("/api/auth/users/" + savedUser.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("ADMIN")));
        }

        @Test
        @DisplayName("TC-AC-12: Update non-existent user returns 404")
        void updateUser_nonExistent_returns404() throws Exception {
            Map<String, String> body = Map.of("username", "ghost", "email", "g@g.com", "role", "USER");
            mockMvc.perform(put("/api/auth/users/bad_id_999")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DELETE USER
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("DELETE /api/auth/users/{id}")
    class DeleteUserTests {

        @Test
        @DisplayName("TC-AC-13: Delete existing user returns 200")
        void deleteUser_existing_returns200() throws Exception {
            mockMvc.perform(delete("/api/auth/users/" + savedUser.getId()))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("TC-AC-14: Delete non-existent user returns 404")
        void deleteUser_nonExistent_returns404() throws Exception {
            mockMvc.perform(delete("/api/auth/users/bad_id_999"))
                .andExpect(status().isNotFound());
        }
    }
}