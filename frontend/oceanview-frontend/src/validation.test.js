// validation.test.js
// Frontend Unit Tests — OceanView Reservation System
// Framework: Vitest (Vite-native test runner)
// Run: npm run test
//
// TDD Approach: These tests were written BEFORE the validation functions
// were extracted into utils/validation.js. The tests define the contract;
// the implementation was written to satisfy them.

import { describe, it, expect, beforeEach } from 'vitest';

// ── Pure functions under test ─────────────────────────────────────────────────
// These mirror the logic in AddReservation.jsx and UserManagement.jsx

const RATES = { Standard: 5000, Deluxe: 8000, Suite: 12000 };

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(
    Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay),
    0
  );
}

function calculateBill(roomType, checkIn, checkOut) {
  const nights = calculateNights(checkIn, checkOut);
  const rate   = RATES[roomType] ?? 0;
  return nights * rate;
}

function validateReservationForm(form) {
  const errors = {};
  if (!form.reservationNumber || !form.reservationNumber.trim())
    errors.reservationNumber = 'Reservation number is required';
  if (!form.guestName || form.guestName.trim().length < 2)
    errors.guestName = 'Guest name must be at least 2 characters';
  if (!form.roomType || !['Standard', 'Deluxe', 'Suite'].includes(form.roomType))
    errors.roomType = 'Select a valid room type';
  if (!form.checkInDate)
    errors.checkInDate = 'Check-in date is required';
  if (!form.checkOutDate)
    errors.checkOutDate = 'Check-out date is required';
  if (form.checkInDate && form.checkOutDate && form.checkOutDate <= form.checkInDate)
    errors.dateRange = 'Check-out date must be after check-in date';
  return errors;
}

function validateUserForm(form, isEdit = false) {
  const errors = {};
  if (!form.username || form.username.trim().length < 3)
    errors.username = 'Username must be at least 3 characters';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email || !emailRegex.test(form.email))
    errors.email = 'Valid email address required';
  if (!isEdit && (!form.password || form.password.length < 4))
    errors.password = 'Password must be at least 4 characters';
  if (!form.role || !['USER', 'ADMIN'].includes(form.role))
    errors.role = 'Role must be USER or ADMIN';
  return errors;
}

function validateReportFilters(dateFrom, dateTo) {
  if (dateFrom && dateTo && dateTo < dateFrom)
    return 'End date must be on or after start date';
  return null;
}

function getStatusColor(status) {
  const map = {
    'Pending':     { background: '#fff3cd', color: '#856404' },
    'Confirmed':   { background: '#d1e7dd', color: '#0f5132' },
    'Checked-In':  { background: '#cfe2ff', color: '#084298' },
    'Checked-Out': { background: '#e2e3e5', color: '#41464b' },
    'Cancelled':   { background: '#f8d7da', color: '#842029' },
  };
  return map[status] ?? null;
}

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═════════════════════════════════════════════════════════════════════════════

// ── TC-FE-01 to TC-FE-06: Night Calculation ───────────────────────────────────
describe('Night Calculation', () => {
  it('TC-FE-01: 1 night between consecutive days', () => {
    expect(calculateNights('2026-04-01', '2026-04-02')).toBe(1);
  });

  it('TC-FE-02: 5 nights calculated correctly', () => {
    expect(calculateNights('2026-04-01', '2026-04-06')).toBe(5);
  });

  it('TC-FE-03: same date returns 0 nights', () => {
    expect(calculateNights('2026-04-01', '2026-04-01')).toBe(0);
  });

  it('TC-FE-04: checkout before checkin returns 0', () => {
    expect(calculateNights('2026-04-10', '2026-04-05')).toBe(0);
  });

  it('TC-FE-05: null inputs return 0', () => {
    expect(calculateNights(null, '2026-04-05')).toBe(0);
    expect(calculateNights('2026-04-01', null)).toBe(0);
  });

  it('TC-FE-06: month boundary calculation is correct', () => {
    expect(calculateNights('2026-04-28', '2026-05-02')).toBe(4);
  });
});

// ── TC-FE-07 to TC-FE-15: Bill Calculation ────────────────────────────────────
describe('Bill Calculation', () => {
  it('TC-FE-07: 1 night Standard = 5000', () => {
    expect(calculateBill('Standard', '2026-04-01', '2026-04-02')).toBe(5000);
  });

  it('TC-FE-08: 3 nights Standard = 15000', () => {
    expect(calculateBill('Standard', '2026-04-01', '2026-04-04')).toBe(15000);
  });

  it('TC-FE-09: 1 night Deluxe = 8000', () => {
    expect(calculateBill('Deluxe', '2026-04-01', '2026-04-02')).toBe(8000);
  });

  it('TC-FE-10: 5 nights Deluxe = 40000', () => {
    expect(calculateBill('Deluxe', '2026-04-01', '2026-04-06')).toBe(40000);
  });

  it('TC-FE-11: 1 night Suite = 12000', () => {
    expect(calculateBill('Suite', '2026-04-01', '2026-04-02')).toBe(12000);
  });

  it('TC-FE-12: 4 nights Suite = 48000', () => {
    expect(calculateBill('Suite', '2026-04-01', '2026-04-05')).toBe(48000);
  });

  it('TC-FE-13: unknown room type returns 0', () => {
    expect(calculateBill('Presidential', '2026-04-01', '2026-04-05')).toBe(0);
  });

  it('TC-FE-14: bill is 0 for same date (0 nights)', () => {
    expect(calculateBill('Suite', '2026-04-01', '2026-04-01')).toBe(0);
  });

  it('TC-FE-15: year boundary 3 nights Deluxe = 24000', () => {
    expect(calculateBill('Deluxe', '2026-12-30', '2027-01-02')).toBe(24000);
  });
});

// ── TC-FE-16 to TC-FE-26: Reservation Form Validation ────────────────────────
describe('Reservation Form Validation', () => {
  let validForm;

  beforeEach(() => {
    validForm = {
      reservationNumber: 'OCV001',
      guestName: 'Tom Cruise',
      roomType: 'Standard',
      checkInDate: '2026-04-01',
      checkOutDate: '2026-04-05',
    };
  });

  it('TC-FE-16: valid form returns no errors', () => {
    expect(Object.keys(validateReservationForm(validForm))).toHaveLength(0);
  });

  it('TC-FE-17: missing reservation number is caught', () => {
    const errors = validateReservationForm({ ...validForm, reservationNumber: '' });
    expect(errors.reservationNumber).toBeDefined();
  });

  it('TC-FE-18: whitespace-only reservation number is caught', () => {
    const errors = validateReservationForm({ ...validForm, reservationNumber: '   ' });
    expect(errors.reservationNumber).toBeDefined();
  });

  it('TC-FE-19: guest name shorter than 2 chars is caught', () => {
    const errors = validateReservationForm({ ...validForm, guestName: 'A' });
    expect(errors.guestName).toBeDefined();
  });

  it('TC-FE-20: null guest name is caught', () => {
    const errors = validateReservationForm({ ...validForm, guestName: null });
    expect(errors.guestName).toBeDefined();
  });

  it('TC-FE-21: invalid room type is caught', () => {
    const errors = validateReservationForm({ ...validForm, roomType: 'VIP' });
    expect(errors.roomType).toBeDefined();
  });

  it('TC-FE-22: all valid room types pass', () => {
    ['Standard', 'Deluxe', 'Suite'].forEach(type => {
      const errors = validateReservationForm({ ...validForm, roomType: type });
      expect(errors.roomType).toBeUndefined();
    });
  });

  it('TC-FE-23: checkout same as checkin is caught', () => {
    const errors = validateReservationForm({
      ...validForm, checkInDate: '2026-04-01', checkOutDate: '2026-04-01'
    });
    expect(errors.dateRange).toBeDefined();
  });

  it('TC-FE-24: checkout before checkin is caught', () => {
    const errors = validateReservationForm({
      ...validForm, checkInDate: '2026-04-10', checkOutDate: '2026-04-05'
    });
    expect(errors.dateRange).toBeDefined();
  });

  it('TC-FE-25: missing checkin date is caught', () => {
    const errors = validateReservationForm({ ...validForm, checkInDate: '' });
    expect(errors.checkInDate).toBeDefined();
  });

  it('TC-FE-26: multiple errors reported simultaneously', () => {
    const errors = validateReservationForm({
      reservationNumber: '', guestName: '', roomType: 'Bad',
      checkInDate: '', checkOutDate: '',
    });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
  });
});

// ── TC-FE-27 to TC-FE-34: User Form Validation ───────────────────────────────
describe('User Form Validation', () => {
  let validUser;

  beforeEach(() => {
    validUser = {
      username: 'john_staff',
      email: 'john@oceanview.com',
      password: 'pass1234',
      role: 'USER',
    };
  });

  it('TC-FE-27: valid user form returns no errors', () => {
    expect(Object.keys(validateUserForm(validUser))).toHaveLength(0);
  });

  it('TC-FE-28: username shorter than 3 chars is caught', () => {
    const errors = validateUserForm({ ...validUser, username: 'ab' });
    expect(errors.username).toBeDefined();
  });

  it('TC-FE-29: invalid email format is caught', () => {
    const errors = validateUserForm({ ...validUser, email: 'notanemail' });
    expect(errors.email).toBeDefined();
  });

  it('TC-FE-30: email without @ is caught', () => {
    const errors = validateUserForm({ ...validUser, email: 'userdomain.com' });
    expect(errors.email).toBeDefined();
  });

  it('TC-FE-31: short password on create is caught', () => {
    const errors = validateUserForm({ ...validUser, password: 'abc' }, false);
    expect(errors.password).toBeDefined();
  });

  it('TC-FE-32: blank password on edit is allowed', () => {
    const errors = validateUserForm({ ...validUser, password: '' }, true);
    expect(errors.password).toBeUndefined();
  });

  it('TC-FE-33: invalid role is caught', () => {
    const errors = validateUserForm({ ...validUser, role: 'SUPERADMIN' });
    expect(errors.role).toBeDefined();
  });

  it('TC-FE-34: both USER and ADMIN roles pass', () => {
    ['USER', 'ADMIN'].forEach(role => {
      const errors = validateUserForm({ ...validUser, role });
      expect(errors.role).toBeUndefined();
    });
  });
});

// ── TC-FE-35 to TC-FE-38: Report Filter Validation ───────────────────────────
describe('Report Filter Validation', () => {
  it('TC-FE-35: no dates returns null (valid)', () => {
    expect(validateReportFilters('', '')).toBeNull();
  });

  it('TC-FE-36: valid date range returns null', () => {
    expect(validateReportFilters('2026-04-01', '2026-04-30')).toBeNull();
  });

  it('TC-FE-37: same date is valid (single day range)', () => {
    expect(validateReportFilters('2026-04-01', '2026-04-01')).toBeNull();
  });

  it('TC-FE-38: end before start returns error string', () => {
    const result = validateReportFilters('2026-04-10', '2026-04-05');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── TC-FE-39 to TC-FE-44: Status Colour Mapping ──────────────────────────────
describe('Status Colour Mapping', () => {
  it('TC-FE-39: Pending returns yellow theme', () => {
    const style = getStatusColor('Pending');
    expect(style).not.toBeNull();
    expect(style.background).toBe('#fff3cd');
  });

  it('TC-FE-40: Confirmed returns green theme', () => {
    const style = getStatusColor('Confirmed');
    expect(style.background).toBe('#d1e7dd');
  });

  it('TC-FE-41: Checked-In returns blue theme', () => {
    const style = getStatusColor('Checked-In');
    expect(style.background).toBe('#cfe2ff');
  });

  it('TC-FE-42: Cancelled returns red theme', () => {
    const style = getStatusColor('Cancelled');
    expect(style.background).toBe('#f8d7da');
  });

  it('TC-FE-43: Checked-Out returns grey theme', () => {
    const style = getStatusColor('Checked-Out');
    expect(style.background).toBe('#e2e3e5');
  });

  it('TC-FE-44: unknown status returns null', () => {
    expect(getStatusColor('Unknown')).toBeNull();
  });
});