package com.oceanview.controllers;

import com.oceanview.models.Reservation;
import com.oceanview.repositories.ReservationRepository;
import com.oceanview.services.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ValidationService validationService; // ✅ Service Pattern

    // ── GET ALL ────────────────────────────────────────────────────────────────
    @GetMapping("/reservations")
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // ── CREATE ─────────────────────────────────────────────────────────────────
    @PostMapping("/reservations")
    public ResponseEntity<?> create(@RequestBody Reservation reservation) {
        // ✅ Server-side validation via ValidationService
        List<String> errors = validationService.validateReservation(reservation);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("errors", errors));
        }

        if (reservation.getStatus() == null || reservation.getStatus().isEmpty()) {
            reservation.setStatus("Pending");
        }

        return ResponseEntity.ok(reservationRepository.save(reservation));
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────────
    @PutMapping("/reservations/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Reservation reservation) {
        // Validate status if provided
        if (reservation.getStatus() != null && !validationService.isValidStatus(reservation.getStatus())) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid status value"));
        }

        return reservationRepository.findById(id)
            .map(existing -> {
                if (reservation.getReservationNumber() != null) existing.setReservationNumber(reservation.getReservationNumber());
                if (reservation.getGuestName()         != null) existing.setGuestName(reservation.getGuestName());
                if (reservation.getAddress()           != null) existing.setAddress(reservation.getAddress());
                if (reservation.getContactNumber()     != null) existing.setContactNumber(reservation.getContactNumber());
                if (reservation.getRoomType()          != null) existing.setRoomType(reservation.getRoomType());
                if (reservation.getCheckInDate()       != null) existing.setCheckInDate(reservation.getCheckInDate());
                if (reservation.getCheckOutDate()      != null) existing.setCheckOutDate(reservation.getCheckOutDate());
                if (reservation.getTotalBill()         != null) existing.setTotalBill(reservation.getTotalBill());
                if (reservation.getStatus()            != null) existing.setStatus(reservation.getStatus());
                return ResponseEntity.ok((Object) reservationRepository.save(existing));
            })
            .orElse(ResponseEntity.status(404).body(Map.of("message", "Reservation not found")));
    }

    // ── DELETE ─────────────────────────────────────────────────────────────────
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!reservationRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Reservation not found"));
        }
        reservationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    // ── GET BY ID ──────────────────────────────────────────────────────────────
    @GetMapping("/reservations/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return reservationRepository.findById(id)
            .map(r -> ResponseEntity.ok((Object) r))
            .orElse(ResponseEntity.status(404).body(Map.of("message", "Reservation not found")));
    }
}