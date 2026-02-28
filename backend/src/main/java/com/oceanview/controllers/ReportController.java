package com.oceanview.controllers;

import com.oceanview.models.Reservation;
import com.oceanview.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReservationRepository reservationRepository;

    // ── Summary Report ─────────────────────────────────────────────────────────
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        List<Reservation> all = reservationRepository.findAll();

        long total      = all.size();
        long pending    = all.stream().filter(r -> "Pending".equals(r.getStatus())).count();
        long confirmed  = all.stream().filter(r -> "Confirmed".equals(r.getStatus())).count();
        long checkedIn  = all.stream().filter(r -> "Checked-In".equals(r.getStatus())).count();
        long checkedOut = all.stream().filter(r -> "Checked-Out".equals(r.getStatus())).count();
        long cancelled  = all.stream().filter(r -> "Cancelled".equals(r.getStatus())).count();

        double totalIncome = all.stream()
            .filter(r -> !"Cancelled".equals(r.getStatus()))
            .mapToDouble(r -> r.getTotalBill() != null ? r.getTotalBill() : 0)
            .sum();

        double avgBill = all.stream()
            .filter(r -> !"Cancelled".equals(r.getStatus()) && r.getTotalBill() != null)
            .mapToDouble(Reservation::getTotalBill)
            .average().orElse(0);

        // Income by room type
        Map<String, Double> incomeByRoom = all.stream()
            .filter(r -> !"Cancelled".equals(r.getStatus()) && r.getTotalBill() != null)
            .collect(Collectors.groupingBy(
                Reservation::getRoomType,
                Collectors.summingDouble(r -> r.getTotalBill() != null ? r.getTotalBill() : 0)
            ));

        // Bookings by room type
        Map<String, Long> bookingsByRoom = all.stream()
            .collect(Collectors.groupingBy(Reservation::getRoomType, Collectors.counting()));

        return ResponseEntity.ok(Map.of(
            "total",         total,
            "pending",       pending,
            "confirmed",     confirmed,
            "checkedIn",     checkedIn,
            "checkedOut",    checkedOut,
            "cancelled",     cancelled,
            "totalIncome",   totalIncome,
            "avgBill",       avgBill,
            "incomeByRoom",  incomeByRoom,
            "bookingsByRoom", bookingsByRoom
        ));
    }

    // ── Income Report ──────────────────────────────────────────────────────────
    @GetMapping("/income")
    public ResponseEntity<?> getIncomeReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        List<Reservation> all = reservationRepository.findAll();

        // Filter by date range if provided
        if (from != null && !from.isEmpty()) {
            all = all.stream().filter(r -> r.getCheckInDate() != null && r.getCheckInDate().compareTo(from) >= 0).collect(Collectors.toList());
        }
        if (to != null && !to.isEmpty()) {
            all = all.stream().filter(r -> r.getCheckInDate() != null && r.getCheckInDate().compareTo(to) <= 0).collect(Collectors.toList());
        }

        List<Map<String, Object>> report = all.stream()
            .filter(r -> !"Cancelled".equals(r.getStatus()))
            .map(r -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("reservationNumber", r.getReservationNumber());
                row.put("guestName",         r.getGuestName());
                row.put("roomType",          r.getRoomType());
                row.put("checkInDate",       r.getCheckInDate());
                row.put("checkOutDate",      r.getCheckOutDate());
                row.put("status",            r.getStatus());
                row.put("totalBill",         r.getTotalBill());
                return row;
            })
            .collect(Collectors.toList());

        double totalIncome = report.stream()
            .mapToDouble(r -> r.get("totalBill") != null ? (Double) r.get("totalBill") : 0)
            .sum();

        return ResponseEntity.ok(Map.of(
            "records",     report,
            "totalIncome", totalIncome,
            "count",       report.size()
        ));
    }

    // ── Occupancy Report ───────────────────────────────────────────────────────
    @GetMapping("/occupancy")
    public ResponseEntity<?> getOccupancyReport() {
        List<Reservation> all = reservationRepository.findAll();

        Map<String, Long> byRoomType = all.stream()
            .filter(r -> "Checked-In".equals(r.getStatus()) || "Confirmed".equals(r.getStatus()))
            .collect(Collectors.groupingBy(Reservation::getRoomType, Collectors.counting()));

        Map<String, Long> byStatus = all.stream()
            .collect(Collectors.groupingBy(Reservation::getStatus, Collectors.counting()));

        return ResponseEntity.ok(Map.of(
            "byRoomType", byRoomType,
            "byStatus",   byStatus,
            "total",      all.size()
        ));
    }

    // ── Filtered Reservations ──────────────────────────────────────────────────
    @GetMapping("/filter")
    public ResponseEntity<?> filterReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        List<Reservation> all = reservationRepository.findAll();

        if (status   != null && !status.equals("All"))   all = all.stream().filter(r -> status.equals(r.getStatus())).collect(Collectors.toList());
        if (roomType != null && !roomType.equals("All")) all = all.stream().filter(r -> roomType.equals(r.getRoomType())).collect(Collectors.toList());
        if (from     != null && !from.isEmpty())          all = all.stream().filter(r -> r.getCheckInDate() != null && r.getCheckInDate().compareTo(from) >= 0).collect(Collectors.toList());
        if (to       != null && !to.isEmpty())            all = all.stream().filter(r -> r.getCheckInDate() != null && r.getCheckInDate().compareTo(to) <= 0).collect(Collectors.toList());

        return ResponseEntity.ok(all);
    }
}