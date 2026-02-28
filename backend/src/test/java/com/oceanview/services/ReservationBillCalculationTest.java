package com.oceanview.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TDD Unit Tests — Bill Calculation Logic
 *
 * Room rates: Standard=5000 | Deluxe=8000 | Suite=12000 (per night)
 *
 * Test IDs: TC-BC-xx
 */
@DisplayName("Bill Calculation Tests")
class ReservationBillCalculationTest {

    // ── Rate constants (mirror frontend + backend) ─────────────────────────────
    static final double STANDARD_RATE = 5000.0;
    static final double DELUXE_RATE   = 8000.0;
    static final double SUITE_RATE    = 12000.0;

    static double calculateBill(String roomType, String checkIn, String checkOut) {
        LocalDate in  = LocalDate.parse(checkIn);
        LocalDate out = LocalDate.parse(checkOut);
        long nights   = ChronoUnit.DAYS.between(in, out);
        double rate   = switch (roomType) {
            case "Standard" -> STANDARD_RATE;
            case "Deluxe"   -> DELUXE_RATE;
            case "Suite"    -> SUITE_RATE;
            default         -> throw new IllegalArgumentException("Invalid room type: " + roomType);
        };
        return nights * rate;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STANDARD RATE TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Standard Room Billing")
    class StandardRoomTests {

        @Test
        @DisplayName("TC-BC-01: 1 night Standard = LKR 5,000")
        void oneNightStandard() {
            double bill = calculateBill("Standard", "2026-04-01", "2026-04-02");
            assertEquals(5000.0, bill, 0.01);
        }

        @Test
        @DisplayName("TC-BC-02: 3 nights Standard = LKR 15,000")
        void threeNightsStandard() {
            double bill = calculateBill("Standard", "2026-04-01", "2026-04-04");
            assertEquals(15000.0, bill, 0.01);
        }

        @Test
        @DisplayName("TC-BC-03: 7 nights Standard = LKR 35,000")
        void sevenNightsStandard() {
            double bill = calculateBill("Standard", "2026-04-01", "2026-04-08");
            assertEquals(35000.0, bill, 0.01);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DELUXE RATE TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Deluxe Room Billing")
    class DeluxeRoomTests {

        @Test
        @DisplayName("TC-BC-04: 1 night Deluxe = LKR 8,000")
        void oneNightDeluxe() {
            double bill = calculateBill("Deluxe", "2026-04-01", "2026-04-02");
            assertEquals(8000.0, bill, 0.01);
        }

        @Test
        @DisplayName("TC-BC-05: 5 nights Deluxe = LKR 40,000")
        void fiveNightsDeluxe() {
            double bill = calculateBill("Deluxe", "2026-04-01", "2026-04-06");
            assertEquals(40000.0, bill, 0.01);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SUITE RATE TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Suite Room Billing")
    class SuiteRoomTests {

        @Test
        @DisplayName("TC-BC-06: 1 night Suite = LKR 12,000")
        void oneNightSuite() {
            double bill = calculateBill("Suite", "2026-04-01", "2026-04-02");
            assertEquals(12000.0, bill, 0.01);
        }

        @Test
        @DisplayName("TC-BC-07: 4 nights Suite = LKR 48,000")
        void fourNightsSuite() {
            double bill = calculateBill("Suite", "2026-04-01", "2026-04-05");
            assertEquals(48000.0, bill, 0.01);
        }

        @Test
        @DisplayName("TC-BC-08: 10 nights Suite = LKR 120,000")
        void tenNightsSuite() {
            double bill = calculateBill("Suite", "2026-04-01", "2026-04-11");
            assertEquals(120000.0, bill, 0.01);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PARAMETERIZED BILLING TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @ParameterizedTest(name = "TC-BC-P: {0} — {1} to {2} = LKR {3}")
    @CsvSource({
        "Standard, 2026-01-01, 2026-01-02, 5000.0",
        "Standard, 2026-01-01, 2026-01-08, 35000.0",
        "Deluxe,   2026-01-01, 2026-01-03, 16000.0",
        "Deluxe,   2026-01-01, 2026-01-06, 40000.0",
        "Suite,    2026-01-01, 2026-01-02, 12000.0",
        "Suite,    2026-01-01, 2026-01-11, 120000.0",
    })
    @DisplayName("TC-BC-09: Parameterized billing matrix")
    void parameterizedBillingMatrix(String roomType, String checkIn, String checkOut, double expectedBill) {
        double actual = calculateBill(roomType, checkIn, checkOut);
        assertEquals(expectedBill, actual, 0.01,
            "Bill mismatch for " + roomType + " (" + checkIn + " to " + checkOut + ")");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // EDGE CASE TESTS
    // ══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("TC-BC-10: Invalid room type throws exception")
        void invalidRoomType_throwsException() {
            assertThrows(IllegalArgumentException.class,
                () -> calculateBill("Presidential", "2026-04-01", "2026-04-05"));
        }

        @Test
        @DisplayName("TC-BC-11: Month boundary calculation is correct")
        void monthBoundaryNights_correct() {
            // April 28 to May 2 = 4 nights
            double bill = calculateBill("Standard", "2026-04-28", "2026-05-02");
            assertEquals(20000.0, bill, 0.01);
        }

        @Test
        @DisplayName("TC-BC-12: Year boundary calculation is correct")
        void yearBoundaryNights_correct() {
            // Dec 30 to Jan 2 = 3 nights
            double bill = calculateBill("Deluxe", "2026-12-30", "2027-01-02");
            assertEquals(24000.0, bill, 0.01);
        }
    }
}