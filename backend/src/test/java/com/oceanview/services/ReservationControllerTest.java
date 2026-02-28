package com.oceanview.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.models.Reservation;
import com.oceanview.repositories.ReservationRepository;
import com.oceanview.services.ValidationService;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TDD Integration Tests — ReservationController
 *
 * Uses @SpringBootTest with an in-memory test profile.
 * Tests were written BEFORE controller methods were implemented (TDD Red phase).
 * MockMvc exercises full HTTP request/response cycle without a real server.
 *
 * Test IDs: TC-RC-xx
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ReservationController Integration Tests")
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Reservation savedReservation;

    // ── Test Data Factory ──────────────────────────────────────────────────────
    private Reservation buildReservation(String resNo, String guestName) {
        Reservation r = new Reservation();
        r.setReservationNumber(resNo);
        r.setGuestName(guestName);
        r.setAddress("456 Test Street");
        r.setContactNumber("+94 77 123 4567");
        r.setRoomType("Deluxe");
        r.setCheckInDate("2026-05-01");
        r.setCheckOutDate("2026-05-04");
        r.setTotalBill(24000.0);
        r.setStatus("Pending");
        return r;
    }

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
        savedReservation = reservationRepository.save(buildReservation("OCV-TEST-01", "Alice Johnson"));
    }

    @AfterEach
    void tearDown() {
        reservationRepository.deleteAll();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET ALL RESERVATIONS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("GET /api/reservations")
    class GetAllTests {

        @Test
        @DisplayName("TC-RC-01: Returns 200 and list of reservations")
        void getAll_returns200AndList() throws Exception {
            mockMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].reservationNumber", is("OCV-TEST-01")))
                .andExpect(jsonPath("$[0].guestName", is("Alice Johnson")));
        }

        @Test
        @DisplayName("TC-RC-02: Returns empty list when no reservations")
        void getAll_returnsEmptyList_whenNone() throws Exception {
            reservationRepository.deleteAll();
            mockMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET BY ID
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("GET /api/reservations/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("TC-RC-03: Returns 200 with valid ID")
        void getById_existingId_returns200() throws Exception {
            mockMvc.perform(get("/api/reservations/" + savedReservation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestName", is("Alice Johnson")))
                .andExpect(jsonPath("$.roomType",  is("Deluxe")));
        }

        @Test
        @DisplayName("TC-RC-04: Returns 404 for non-existent ID")
        void getById_nonExistentId_returns404() throws Exception {
            mockMvc.perform(get("/api/reservations/nonexistent_id_999"))
                .andExpect(status().isNotFound());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CREATE RESERVATION
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("POST /api/reservations")
    class CreateTests {

        @Test
        @DisplayName("TC-RC-05: Valid reservation returns 200 with saved object")
        void create_validReservation_returns200() throws Exception {
            Reservation newRes = buildReservation("OCV-NEW-01", "Bob Smith");
            mockMvc.perform(post("/api/reservations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(newRes)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reservationNumber", is("OCV-NEW-01")))
                .andExpect(jsonPath("$.guestName",         is("Bob Smith")))
                .andExpect(jsonPath("$.status",            is("Pending")));
        }

        @Test
        @DisplayName("TC-RC-06: Missing guest name returns 400 with error list")
        void create_missingGuestName_returns400() throws Exception {
            Reservation r = buildReservation("OCV-BAD-01", null);
            mockMvc.perform(post("/api/reservations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @DisplayName("TC-RC-07: Check-out before check-in returns 400")
        void create_invalidDateRange_returns400() throws Exception {
            Reservation r = buildReservation("OCV-BAD-02", "Eve");
            r.setCheckInDate("2026-05-10");
            r.setCheckOutDate("2026-05-05");
            mockMvc.perform(post("/api/reservations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0]", containsString("Check-out")));
        }

        @Test
        @DisplayName("TC-RC-08: Invalid room type returns 400")
        void create_invalidRoomType_returns400() throws Exception {
            Reservation r = buildReservation("OCV-BAD-03", "Charlie");
            r.setRoomType("Presidential");
            mockMvc.perform(post("/api/reservations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TC-RC-09: New reservation defaults to Pending status")
        void create_noStatus_defaultsToPending() throws Exception {
            Reservation r = buildReservation("OCV-DEF-01", "David Lee");
            r.setStatus(null);
            mockMvc.perform(post("/api/reservations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Pending")));
        }

        @Test
        @DisplayName("TC-RC-10: Empty request body returns 400")
        void create_emptyBody_returns400() throws Exception {
            Reservation r = new Reservation();
            mockMvc.perform(post("/api/reservations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // UPDATE RESERVATION
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("PUT /api/reservations/{id}")
    class UpdateTests {

        @Test
        @DisplayName("TC-RC-11: Valid update returns 200 with updated data")
        void update_validData_returns200() throws Exception {
            Reservation update = buildReservation("OCV-TEST-01", "Alice Johnson Updated");
            update.setStatus("Confirmed");
            mockMvc.perform(put("/api/reservations/" + savedReservation.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestName", is("Alice Johnson Updated")))
                .andExpect(jsonPath("$.status",    is("Confirmed")));
        }

        @Test
        @DisplayName("TC-RC-12: Status change to Checked-In returns 200")
        void update_statusChange_checkedIn_returns200() throws Exception {
            Reservation update = buildReservation("OCV-TEST-01", "Alice Johnson");
            update.setStatus("Checked-In");
            mockMvc.perform(put("/api/reservations/" + savedReservation.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Checked-In")));
        }

        @Test
        @DisplayName("TC-RC-13: Invalid status returns 400")
        void update_invalidStatus_returns400() throws Exception {
            Reservation update = buildReservation("OCV-TEST-01", "Alice Johnson");
            update.setStatus("InvalidStatus");
            mockMvc.perform(put("/api/reservations/" + savedReservation.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid status")));
        }

        @Test
        @DisplayName("TC-RC-14: Update on non-existent ID returns 404")
        void update_nonExistentId_returns404() throws Exception {
            Reservation update = buildReservation("OCV-TEST-01", "Ghost");
            update.setStatus("Confirmed");
            mockMvc.perform(put("/api/reservations/bad_id_999")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isNotFound());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DELETE RESERVATION
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("DELETE /api/reservations/{id}")
    class DeleteTests {

        @Test
        @DisplayName("TC-RC-15: Delete existing reservation returns 200")
        void delete_existingId_returns200() throws Exception {
            mockMvc.perform(delete("/api/reservations/" + savedReservation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Deleted successfully")));
        }

        @Test
        @DisplayName("TC-RC-16: Deleted reservation cannot be retrieved")
        void delete_thenGet_returns404() throws Exception {
            String id = savedReservation.getId();
            mockMvc.perform(delete("/api/reservations/" + id))
                .andExpect(status().isOk());
            mockMvc.perform(get("/api/reservations/" + id))
                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("TC-RC-17: Delete non-existent ID returns 404")
        void delete_nonExistentId_returns404() throws Exception {
            mockMvc.perform(delete("/api/reservations/nonexistent_id_999"))
                .andExpect(status().isNotFound());
        }
    }
}