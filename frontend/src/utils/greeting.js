/**
 * Returns a time-appropriate greeting:
 * - 05:00 - 11:59: "Good morning"
 * - 12:00 - 16:59: "Good afternoon"
 * - 17:00 - 21:59: "Good evening"
 * - 22:00 - 04:59: "Good night"
 */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

/**
 * Returns a user-friendly display name for HR / Admin / Payroll users.
 */
export function getHRDisplayName(user, employees = []) {
  if (!user) return 'HR Manager';

  // 1. Explicit Role Overrides
  if (user.role === 'hr_payroll_user' || user.role === 'HR_PAYROLL_USER') {
    return 'Payroll User';
  }
  if (user.role === 'hr_payroll_manager' || user.role === 'HR_PAYROLL_MANAGER') {
    return 'Payroll Manager';
  }

  // 2. Check if user is linked to an employee record
  if (Array.isArray(employees) && employees.length > 0) {
    const matched = employees.find(
      (e) =>
        (user.employeeCode && (e.employeeCode === user.employeeCode || e.id === user.employeeCode)) ||
        (user.employeeId && (e._id === user.employeeId || e.id === user.employeeId)) ||
        (user.email && e.email?.toLowerCase() === user.email?.toLowerCase())
    );
    if (matched) {
      if (matched.firstName) return matched.firstName;
      if (matched.fullName) return matched.fullName.split(' ')[0] || matched.fullName;
    }
  }

  // 3. Email-based naming inspection
  if (user.email) {
    const username = user.email.split('@')[0];
    const lower = username.toLowerCase();
    if (
      lower.includes('payroll.user') ||
      lower.includes('payroll_user') ||
      lower === 'payrolluser' ||
      lower === 'payroll.specialist'
    ) {
      return 'Payroll User';
    }
    if (
      lower.includes('payroll.manager') ||
      lower.includes('payroll_manager') ||
      lower === 'payrollmanager'
    ) {
      return 'Payroll Manager';
    }
    if (lower === 'hrmanager' || lower === 'hr' || lower.includes('hr.manager')) return 'HR Manager';
    if (lower === 'admin' || lower === 'systemadmin') return 'Administrator';
    if (lower.includes('payroll')) return 'Payroll User';
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  if (user.name) return user.name.split(' ')[0] || user.name;
  if (user.firstName) return user.firstName;

  return 'HR Manager';
}
