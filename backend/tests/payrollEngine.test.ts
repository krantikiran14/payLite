// ─── PayLite Payroll Engine — Unit Tests ────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { calculatePayroll, EmployeeInput, AttendanceInput, BonusInput } from '../src/services/payrollEngine';

// ── Helper: create a default employee ──
function makeEmployee(overrides: Partial<EmployeeInput> = {}): EmployeeInput {
  return {
    basicSalary: 30000,
    hra: 12000,
    pfEnabled: true,
    esiEnabled: true,
    joiningDate: new Date('2025-01-01'),  // well before any test month
    ...overrides,
  };
}

// ── Helper: create default attendance ──
function makeAttendance(overrides: Partial<AttendanceInput> = {}): AttendanceInput {
  return {
    month: 4,
    year: 2026,
    presentDays: 22,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    overtimeHours: 0,
    ...overrides,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

describe('PayLite Payroll Engine', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // Test 1: Standard full-month salary — no OT, no deductions, no bonuses
  // ──────────────────────────────────────────────────────────────────────────
  it('should calculate standard full-month salary correctly', () => {
    const emp = makeEmployee({ esiEnabled: false }); // gross > 21000, ESI would be 0 anyway
    const att = makeAttendance();

    const result = calculatePayroll(emp, att, []);

    expect(result.basicSalary).toBe(30000);
    expect(result.hra).toBe(12000);
    expect(result.overtimePay).toBe(0);
    expect(result.festivalBonus).toBe(0);
    expect(result.grossPay).toBe(42000);
    expect(result.unpaidLeaveDeduction).toBe(0);
    expect(result.pfDeduction).toBe(3600); // 30000 * 0.12
    expect(result.esiDeduction).toBe(0);    // disabled
    expect(result.netPay).toBe(38400);      // 42000 - 3600
    expect(result.warnings).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 2: Overtime pay calculation
  // ──────────────────────────────────────────────────────────────────────────
  it('should calculate overtime pay correctly', () => {
    const emp = makeEmployee();
    const att = makeAttendance({ overtimeHours: 10 });

    const result = calculatePayroll(emp, att, []);

    // OT = (30000 / 26 / 8) * 10 * 1.5
    const expectedOT = round2((30000 / 26 / 8) * 10 * 1.5);
    expect(result.overtimePay).toBe(expectedOT);
    expect(result.grossPay).toBe(round2(30000 + 12000 + expectedOT));
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 3: Unpaid leave deduction
  // ──────────────────────────────────────────────────────────────────────────
  it('should deduct for unpaid leave days', () => {
    const emp = makeEmployee();
    const att = makeAttendance({ unpaidLeaveDays: 3 });

    const result = calculatePayroll(emp, att, []);

    const expectedDeduction = round2((30000 / 26) * 3);
    expect(result.unpaidLeaveDeduction).toBe(expectedDeduction);
    expect(result.warnings).toContain(
      'Employee has 3 unpaid leave days (policy warning)'
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 4: ESI applied when gross ≤ ₹21,000
  // ──────────────────────────────────────────────────────────────────────────
  it('should apply ESI when gross pay <= 21000', () => {
    const emp = makeEmployee({
      basicSalary: 12000,
      hra: 5000,
      esiEnabled: true,
    });
    const att = makeAttendance();

    const result = calculatePayroll(emp, att, []);

    expect(result.grossPay).toBe(17000); // 12000 + 5000
    expect(result.esiDeduction).toBe(round2(17000 * 0.0075));
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 5: ESI NOT applied when gross > ₹21,000
  // ──────────────────────────────────────────────────────────────────────────
  it('should NOT apply ESI when gross pay > 21000', () => {
    const emp = makeEmployee({ esiEnabled: true }); // gross = 42000
    const att = makeAttendance();

    const result = calculatePayroll(emp, att, []);

    expect(result.grossPay).toBe(42000);
    expect(result.esiDeduction).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 6: Mid-month joining proration
  // ──────────────────────────────────────────────────────────────────────────
  it('should prorate salary for mid-month joining', () => {
    // April 2026 has 30 days. Joining on April 16 → 15 remaining days
    const emp = makeEmployee({ joiningDate: new Date('2026-04-16') });
    const att = makeAttendance({ month: 4, year: 2026 });

    const result = calculatePayroll(emp, att, []);

    const factor = 15 / 30; // 0.5
    expect(result.basicSalary).toBe(round2(30000 * factor));
    expect(result.hra).toBe(round2(12000 * factor));
    expect(result.warnings.some(w => w.includes('prorated'))).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 7: PF disabled — zero PF deduction
  // ──────────────────────────────────────────────────────────────────────────
  it('should not deduct PF when pfEnabled is false', () => {
    const emp = makeEmployee({ pfEnabled: false });
    const att = makeAttendance();

    const result = calculatePayroll(emp, att, []);

    expect(result.pfDeduction).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 8: Multiple bonuses in a month
  // ──────────────────────────────────────────────────────────────────────────
  it('should sum multiple bonus events', () => {
    const emp = makeEmployee();
    const att = makeAttendance();
    const bonuses: BonusInput[] = [
      { label: 'Diwali Bonus', amount: 5000 },
      { label: 'Performance Bonus', amount: 3000 },
      { label: 'Spot Award', amount: 1500 },
    ];

    const result = calculatePayroll(emp, att, bonuses);

    expect(result.festivalBonus).toBe(9500);
    expect(result.grossPay).toBe(30000 + 12000 + 0 + 9500);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 9: Warning flag for unpaid leave > 1 day
  // ──────────────────────────────────────────────────────────────────────────
  it('should warn when unpaid leave days > 1', () => {
    const emp = makeEmployee();
    const att = makeAttendance({ unpaidLeaveDays: 2 });

    const result = calculatePayroll(emp, att, []);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('unpaid leave');
  });

  it('should NOT warn when unpaid leave days is exactly 1', () => {
    const emp = makeEmployee();
    const att = makeAttendance({ unpaidLeaveDays: 1 });

    const result = calculatePayroll(emp, att, []);
    expect(result.warnings.filter(w => w.includes('unpaid leave'))).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 10: Zero overtime edge case
  // ──────────────────────────────────────────────────────────────────────────
  it('should handle zero overtime correctly', () => {
    const emp = makeEmployee();
    const att = makeAttendance({ overtimeHours: 0 });

    const result = calculatePayroll(emp, att, []);
    expect(result.overtimePay).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 11: Employee joining in the future — zero payout
  // ──────────────────────────────────────────────────────────────────────────
  it('should return zero payout if employee has not yet joined', () => {
    const emp = makeEmployee({ joiningDate: new Date('2026-05-15') }); // after April
    const att = makeAttendance({ month: 4, year: 2026 });

    const result = calculatePayroll(emp, att, []);

    expect(result.basicSalary).toBe(0);
    expect(result.hra).toBe(0);
    expect(result.grossPay).toBe(0);
    expect(result.netPay).toBe(0);
    expect(result.warnings.some(w => w.includes('not yet joined'))).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 12: Full complex scenario — OT + bonuses + unpaid leave + ESI eligible
  // ──────────────────────────────────────────────────────────────────────────
  it('should handle a complex scenario with all components', () => {
    const emp = makeEmployee({
      basicSalary: 10000,
      hra: 4000,
      pfEnabled: true,
      esiEnabled: true,
    });
    const att = makeAttendance({
      overtimeHours: 8,
      unpaidLeaveDays: 2,
    });
    const bonuses: BonusInput[] = [
      { label: 'Festival', amount: 2000 },
    ];

    const result = calculatePayroll(emp, att, bonuses);

    const expectedOT = round2((10000 / 26 / 8) * 8 * 1.5);
    const expectedGross = round2(10000 + 4000 + expectedOT + 2000);
    const expectedUnpaidDed = round2((10000 / 26) * 2);
    const expectedPF = round2(10000 * 0.12);

    expect(result.grossPay).toBe(expectedGross);
    expect(result.unpaidLeaveDeduction).toBe(expectedUnpaidDed);
    expect(result.pfDeduction).toBe(expectedPF);

    // ESI: gross should be <= 21000 for this low-salary employee
    if (expectedGross <= 21000) {
      expect(result.esiDeduction).toBe(round2(expectedGross * 0.0075));
    }

    expect(result.netPay).toBe(
      round2(expectedGross - expectedUnpaidDed - expectedPF - result.esiDeduction)
    );
  });
});
