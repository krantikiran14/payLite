// ─── PayLite Payroll Calculation Engine ─────────────────────────────────────
// Pure function — no side effects, fully testable

export interface EmployeeInput {
  basicSalary: number;
  hra: number;
  pfEnabled: boolean;
  esiEnabled: boolean;
  joiningDate: Date;
}

export interface AttendanceInput {
  month: number;        // 1-12
  year: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  overtimeHours: number;
}

export interface BonusInput {
  label: string;
  amount: number;
}

export interface PayrollBreakdown {
  basicSalary: number;
  hra: number;
  overtimePay: number;
  festivalBonus: number;
  grossPay: number;
  unpaidLeaveDeduction: number;
  pfDeduction: number;
  esiDeduction: number;
  netPay: number;
  warnings: string[];
}

/**
 * Get the number of days in a given month/year.
 */
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Round to 2 decimal places (standard for currency).
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate the proration factor for mid-month joining.
 * If the employee joined before or on the 1st of the payroll month, factor = 1.
 * If they joined during the month, factor = remaining days / total days.
 * If they joined after this month, factor = 0.
 */
function getProrataFactor(joiningDate: Date, month: number, year: number): number {
  const totalDays = getDaysInMonth(month, year);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, totalDays);

  // If joining is after this month entirely, no salary
  if (joiningDate > monthEnd) {
    return 0;
  }

  // If joining is on or before the 1st of this month, full salary
  if (joiningDate <= monthStart) {
    return 1;
  }

  // Mid-month joining: remaining days (inclusive of joining day)
  const joiningDay = joiningDate.getDate();
  const remainingDays = totalDays - joiningDay + 1;
  return remainingDays / totalDays;
}

/**
 * Core payroll calculation function.
 *
 * @param employee  - Employee salary and benefit configuration
 * @param attendance - Attendance data for the month
 * @param bonuses   - Array of bonus events for the month
 * @returns PayrollBreakdown with all earnings, deductions, and warnings
 */
export function calculatePayroll(
  employee: EmployeeInput,
  attendance: AttendanceInput,
  bonuses: BonusInput[] = []
): PayrollBreakdown {
  const warnings: string[] = [];

  // ── 1. Prorate basic salary for mid-month joining ──
  const prorataFactor = getProrataFactor(
    employee.joiningDate,
    attendance.month,
    attendance.year
  );
  const basicSalary = round2(employee.basicSalary * prorataFactor);

  // ── 2. HRA (also prorated) ──
  const hra = round2(employee.hra * prorataFactor);

  // ── 3. Overtime pay ──
  // Formula: (basicSalary / 26 / 8) * overtimeHours * 1.5
  // Uses the FULL basic salary for the per-day/per-hour rate, not prorated
  const hourlyRate = employee.basicSalary / 26 / 8;
  const overtimePay = round2(hourlyRate * attendance.overtimeHours * 1.5);

  // ── 4. Festival / ad-hoc bonuses ──
  const festivalBonus = round2(
    bonuses.reduce((sum, b) => sum + b.amount, 0)
  );

  // ── 5. Gross pay ──
  const grossPay = round2(basicSalary + hra + overtimePay + festivalBonus);

  // ── 6. Unpaid leave deduction ──
  // Uses the FULL basic salary for per-day rate
  const perDayRate = employee.basicSalary / 26;
  const unpaidLeaveDeduction = round2(perDayRate * attendance.unpaidLeaveDays);

  // ── 7. PF deduction (12% of basic, if enabled) ──
  const pfDeduction = employee.pfEnabled ? round2(basicSalary * 0.12) : 0;

  // ── 8. ESI deduction (0.75% of gross, if gross ≤ ₹21,000 per Indian ESI rules) ──
  let esiDeduction = 0;
  if (employee.esiEnabled && grossPay <= 21000) {
    esiDeduction = round2(grossPay * 0.0075);
  }

  // ── 9. Net pay ──
  const netPay = round2(grossPay - unpaidLeaveDeduction - pfDeduction - esiDeduction);

  // ── 10. Warnings ──
  if (attendance.unpaidLeaveDays > 1) {
    warnings.push(`Employee has ${attendance.unpaidLeaveDays} unpaid leave days (policy warning)`);
  }

  if (prorataFactor > 0 && prorataFactor < 1) {
    warnings.push(`Salary prorated (joining mid-month, factor: ${round2(prorataFactor)})`);
  }

  if (prorataFactor === 0) {
    warnings.push('Employee has not yet joined — zero payout');
  }

  return {
    basicSalary,
    hra,
    overtimePay,
    festivalBonus,
    grossPay,
    unpaidLeaveDeduction,
    pfDeduction,
    esiDeduction,
    netPay,
    warnings,
  };
}
