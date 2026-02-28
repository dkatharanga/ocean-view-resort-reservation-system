package com.oceanview.services;

import com.oceanview.models.Reservation;
import com.oceanview.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TDD Unit Tests — ValidationService
 *
 * Test Strategy: Written BEFORE the production code was finalised.
 * Each test defines the expected behaviour; code was adjusted until all pass.
 *
 * Coverage:
 *   - Reservation validation (happy path + 8 failure cases)
 *   - User validation (happy path + 5 failure cases)
 *   - Status validation (5 valid + 3 invalid)
 */
@DisplayName("ValidationService Tests")
class ValidationServiceTest {

    private ValidationService validationService;

    // ── Test Data ──────────────────────────────────────────────────────────────
    private Reservation buildValidReservation() {
        Reservation r = new Reservation();
        r.setReservationNumber("OCV001");
        r.setGuestName("Tom Cruise");
        r.setAddress("123 Hollywood Blvd, CA");
        r.setContactNumber("+1 310 555 0100");
        r.setRoomType("Standard");
        r.setCheckInDate("2026-04-01");
        r.setCheckOutDate("2026-04-05");
        r.setTotalBill(20000.0);
        r.setStatus("Pending");
        return r;
    }

    private User buildValidUser() {
        User u = new User();
        u.setUsername("john_staff");
        u.setEmail("john@oceanview.com");
        u.setPassword("pass1234");
        u.setRole("USER");
        return u;
    }

    @BeforeEach
    void setUp() {
        validationService = new ValidationService();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RESERVATION VALIDATION TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Reservation Validation")
    class ReservationValidationTests {

        @Test
        @DisplayName("TC-RV-01: Valid reservation returns no errors")
        void validReservation_returnsEmptyErrors() {
            Reservation r = buildValidReservation();
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.isEmpty(), "Valid reservation should produce no errors");
        }

        @Test
        @DisplayName("TC-RV-02: Missing reservation number returns error")
        void missingReservationNumber_returnsError() {
            Reservation r = buildValidReservation();
            r.setReservationNumber(null);
            List<String> errors = validationService.validateReservation(r);
            assertFalse(errors.isEmpty());
            assertTrue(errors.stream().anyMatch(e -> e.contains("Reservation number")));
        }

        @Test
        @DisplayName("TC-RV-03: Empty reservation number returns error")
        void emptyReservationNumber_returnsError() {
            Reservation r = buildValidReservation();
            r.setReservationNumber("   ");
            List<String> errors = validationService.validateReservation(r);
            assertFalse(errors.isEmpty());
        }

        @Test
        @DisplayName("TC-RV-04: Missing guest name returns error")
        void missingGuestName_returnsError() {
            Reservation r = buildValidReservation();
            r.setGuestName(null);
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.stream().anyMatch(e -> e.toLowerCase().contains("guest name")));
        }

        @Test
        @DisplayName("TC-RV-05: Guest name too short (1 char) returns error")
        void shortGuestName_returnsError() {
            Reservation r = buildValidReservation();
            r.setGuestName("A");
            List<String> errors = validationService.validateReservation(r);
            assertFalse(errors.isEmpty(), "Single character guest name should fail");
        }

        @Test
        @DisplayName("TC-RV-06: Invalid room type returns error")
        void invalidRoomType_returnsError() {
            Reservation r = buildValidReservation();
            r.setRoomType("Presidential");
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Room type")));
        }

        @Test
        @DisplayName("TC-RV-07: All three valid room types pass")
        void allValidRoomTypes_pass() {
            for (String type : new String[]{"Standard", "Deluxe", "Suite"}) {
                Reservation r = buildValidReservation();
                r.setRoomType(type);
                List<String> errors = validationService.validateReservation(r);
                assertTrue(errors.isEmpty(), type + " should be valid");
            }
        }

        @Test
        @DisplayName("TC-RV-08: Check-out same as check-in returns error")
        void checkOutSameAsCheckIn_returnsError() {
            Reservation r = buildValidReservation();
            r.setCheckInDate("2026-04-01");
            r.setCheckOutDate("2026-04-01");
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Check-out")));
        }

        @Test
        @DisplayName("TC-RV-09: Check-out before check-in returns error")
        void checkOutBeforeCheckIn_returnsError() {
            Reservation r = buildValidReservation();
            r.setCheckInDate("2026-04-10");
            r.setCheckOutDate("2026-04-05");
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Check-out")));
        }

        @Test
        @DisplayName("TC-RV-10: Negative total bill returns error")
        void negativeTotalBill_returnsError() {
            Reservation r = buildValidReservation();
            r.setTotalBill(-500.0);
            List<String> errors = validationService.validateReservation(r);
            assertFalse(errors.isEmpty(), "Negative bill should fail");
        }

        @Test
        @DisplayName("TC-RV-11: Zero total bill is allowed")
        void zeroTotalBill_isAllowed() {
            Reservation r = buildValidReservation();
            r.setTotalBill(0.0);
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.isEmpty(), "Zero bill should be valid");
        }

        @Test
        @DisplayName("TC-RV-12: Missing check-in date returns error")
        void missingCheckInDate_returnsError() {
            Reservation r = buildValidReservation();
            r.setCheckInDate(null);
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Check-in")));
        }

        @Test
        @DisplayName("TC-RV-13: Missing check-out date returns error")
        void missingCheckOutDate_returnsError() {
            Reservation r = buildValidReservation();
            r.setCheckOutDate(null);
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Check-out")));
        }

        @Test
        @DisplayName("TC-RV-14: Multiple violations returns multiple errors")
        void multipleViolations_returnsMultipleErrors() {
            Reservation r = new Reservation();
            r.setReservationNumber(null);
            r.setGuestName(null);
            r.setRoomType("Unknown");
            r.setCheckInDate(null);
            r.setCheckOutDate(null);
            List<String> errors = validationService.validateReservation(r);
            assertTrue(errors.size() >= 3, "Multiple violations should produce multiple errors, got: " + errors.size());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // USER VALIDATION TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("User Validation")
    class UserValidationTests {

        @Test
        @DisplayName("TC-UV-01: Valid user returns no errors")
        void validUser_returnsNoErrors() {
            User u = buildValidUser();
            List<String> errors = validationService.validateUser(u, false);
            assertTrue(errors.isEmpty(), "Valid user should pass with no errors");
        }

        @Test
        @DisplayName("TC-UV-02: Username too short returns error")
        void shortUsername_returnsError() {
            User u = buildValidUser();
            u.setUsername("ab");
            List<String> errors = validationService.validateUser(u, false);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Username")));
        }

        @Test
        @DisplayName("TC-UV-03: Invalid email format returns error")
        void invalidEmail_returnsError() {
            User u = buildValidUser();
            u.setEmail("notanemail");
            List<String> errors = validationService.validateUser(u, false);
            assertTrue(errors.stream().anyMatch(e -> e.contains("email")));
        }

        @Test
        @DisplayName("TC-UV-04: Email without domain returns error")
        void emailWithoutDomain_returnsError() {
            User u = buildValidUser();
            u.setEmail("user@");
            List<String> errors = validationService.validateUser(u, false);
            assertFalse(errors.isEmpty());
        }

        @Test
        @DisplayName("TC-UV-05: Short password on create returns error")
        void shortPassword_create_returnsError() {
            User u = buildValidUser();
            u.setPassword("abc");
            List<String> errors = validationService.validateUser(u, false);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Password")));
        }

        @Test
        @DisplayName("TC-UV-06: Password not checked on update (isEdit=true)")
        void password_notCheckedOnUpdate() {
            User u = buildValidUser();
            u.setPassword("");  // blank = keep existing
            List<String> errors = validationService.validateUser(u, true);
            assertTrue(errors.isEmpty(), "Password should not be required on edit");
        }

        @Test
        @DisplayName("TC-UV-07: Invalid role returns error")
        void invalidRole_returnsError() {
            User u = buildValidUser();
            u.setRole("SUPERADMIN");
            List<String> errors = validationService.validateUser(u, false);
            assertTrue(errors.stream().anyMatch(e -> e.contains("Role")));
        }

        @Test
        @DisplayName("TC-UV-08: Both ADMIN and USER roles are valid")
        void validRoles_pass() {
            for (String role : new String[]{"ADMIN", "USER"}) {
                User u = buildValidUser();
                u.setRole(role);
                List<String> errors = validationService.validateUser(u, false);
                assertTrue(errors.isEmpty(), role + " should be a valid role");
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STATUS VALIDATION TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Status Validation")
    class StatusValidationTests {

        @Test
        @DisplayName("TC-SV-01: All five valid statuses return true")
        void allValidStatuses_returnTrue() {
            String[] valid = {"Pending", "Confirmed", "Checked-In", "Checked-Out", "Cancelled"};
            for (String s : valid) {
                assertTrue(validationService.isValidStatus(s), s + " should be valid");
            }
        }

        @Test
        @DisplayName("TC-SV-02: Unknown status returns false")
        void unknownStatus_returnsFalse() {
            assertFalse(validationService.isValidStatus("Active"));
            assertFalse(validationService.isValidStatus("Done"));
            assertFalse(validationService.isValidStatus(""));
        }

        @Test
        @DisplayName("TC-SV-03: Case-sensitive status check")
        void caseSensitiveStatus_fails() {
            assertFalse(validationService.isValidStatus("pending"),
                "Status check must be case-sensitive");
            assertFalse(validationService.isValidStatus("CONFIRMED"));
        }

        @Test
        @DisplayName("TC-SV-04: Null status returns false")
        void nullStatus_returnsFalse() {
            assertFalse(validationService.isValidStatus(null));
        }
    }
}