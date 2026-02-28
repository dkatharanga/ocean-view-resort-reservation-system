package com.oceanview.services;

import com.oceanview.models.Reservation;
import com.oceanview.models.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;


@Service
public class ValidationService {

    // ── User Validation ────────────────────────────────────────────────────────
    public List<String> validateUser(User user, boolean isUpdate) {
        List<String> errors = new ArrayList<>();

        if (!isUpdate) {
            if (user.getUsername() == null || user.getUsername().trim().length() < 3)
                errors.add("Username must be at least 3 characters");

            if (user.getEmail() == null || !user.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
                errors.add("Valid email address is required");

            if (user.getPassword() == null || user.getPassword().length() < 4)
                errors.add("Password must be at least 4 characters");
        } else {
            if (user.getUsername() != null && user.getUsername().trim().length() > 0 && user.getUsername().trim().length() < 3)
                errors.add("Username must be at least 3 characters");
        }

        if (user.getRole() != null && !user.getRole().equals("USER") && !user.getRole().equals("ADMIN"))
            errors.add("Role must be USER or ADMIN");

        return errors;
    }

    // ── Reservation Validation ─────────────────────────────────────────────────
    public List<String> validateReservation(Reservation r) {
        List<String> errors = new ArrayList<>();

        if (r.getReservationNumber() == null || r.getReservationNumber().trim().isEmpty())
            errors.add("Reservation number is required");

        if (r.getGuestName() == null || r.getGuestName().trim().isEmpty())
            errors.add("Guest name is required");

        if (r.getGuestName() != null && r.getGuestName().trim().length() < 2)
            errors.add("Guest name must be at least 2 characters");

        if (r.getRoomType() == null || (!r.getRoomType().equals("Standard") && !r.getRoomType().equals("Deluxe") && !r.getRoomType().equals("Suite")))
            errors.add("Room type must be Standard, Deluxe, or Suite");

        if (r.getCheckInDate() == null || r.getCheckInDate().trim().isEmpty())
            errors.add("Check-in date is required");

        if (r.getCheckOutDate() == null || r.getCheckOutDate().trim().isEmpty())
            errors.add("Check-out date is required");

        // Date logic validation
        if (r.getCheckInDate() != null && r.getCheckOutDate() != null) {
            try {
                LocalDate checkIn  = LocalDate.parse(r.getCheckInDate());
                LocalDate checkOut = LocalDate.parse(r.getCheckOutDate());
                if (!checkOut.isAfter(checkIn))
                    errors.add("Check-out date must be after check-in date");
            } catch (DateTimeParseException e) {
                errors.add("Dates must be in YYYY-MM-DD format");
            }
        }

        if (r.getTotalBill() != null && r.getTotalBill() < 0)
            errors.add("Total bill cannot be negative");

        // Contact number format (if provided)
        if (r.getContactNumber() != null && !r.getContactNumber().isEmpty()) {
            if (!r.getContactNumber().matches("^[+]?[0-9\\s\\-]{7,15}$"))
                errors.add("Contact number format is invalid");
        }

        return errors;
    }

    // ── Status Validation ──────────────────────────────────────────────────────
    public boolean isValidStatus(String status) {
        return List.of("Pending", "Confirmed", "Checked-In", "Checked-Out", "Cancelled").contains(status);
    }
}