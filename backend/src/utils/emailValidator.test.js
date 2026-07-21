const { validateEmail } = require('./emailValidator');

const testCases = [
  // --- DUMMY & FAKE EMAILS (Must ALL FAIL validation) ---
  { email: 'test@test.com', shouldBeValid: false, reason: 'Generic test email' },
  { email: 'dummy@dummy.com', shouldBeValid: false, reason: 'Dummy domain' },
  { email: 'fake@fake.com', shouldBeValid: false, reason: 'Fake domain' },
  { email: 'asdf@asdf.com', shouldBeValid: false, reason: 'Repeated pattern dummy' },
  { email: 'user@example.com', shouldBeValid: false, reason: 'Example.com RFC dummy domain' },
  { email: 'user@example.org', shouldBeValid: false, reason: 'Example.org RFC dummy domain' },
  { email: 'user@mailinator.com', shouldBeValid: false, reason: 'Mailinator disposable service' },
  { email: 'user@tempmail.com', shouldBeValid: false, reason: 'Tempmail disposable service' },
  { email: 'user@10minutemail.com', shouldBeValid: false, reason: '10minutemail disposable service' },
  { email: 'john@guerrillamail.com', shouldBeValid: false, reason: 'Guerrillamail disposable service' },
  { email: 'alex@yopmail.com', shouldBeValid: false, reason: 'Yopmail disposable service' },
  { email: 'test@trashmail.com', shouldBeValid: false, reason: 'Trashmail disposable service' },
  { email: 'dummy@gmail.com', shouldBeValid: false, reason: 'Dummy username' },
  { email: 'fake@yahoo.com', shouldBeValid: false, reason: 'Fake username' },
  { email: 'invalid-email', shouldBeValid: false, reason: 'Invalid format (missing @)' },
  { email: 'test@', shouldBeValid: false, reason: 'Invalid format (missing domain)' },
  { email: '@domain.com', shouldBeValid: false, reason: 'Invalid format (missing username)' },
  { email: 'user@domain', shouldBeValid: false, reason: 'Invalid format (missing TLD)' },
  { email: 'user..name@gmail.com', shouldBeValid: false, reason: 'Consecutive dots' },

  // --- LEGITIMATE REAL EMAILS (Must ALL PASS validation) ---
  { email: 'user@nutritrack.com', shouldBeValid: true, reason: 'NutriTrack demo user email' },
  { email: 'admin@nutritrack.com', shouldBeValid: true, reason: 'NutriTrack demo admin email' },
  { email: 'john.doe@gmail.com', shouldBeValid: true, reason: 'Standard Gmail user' },
  { email: 'sarah_smith@yahoo.com', shouldBeValid: true, reason: 'Standard Yahoo user' },
  { email: 'alex.dev@outlook.com', shouldBeValid: true, reason: 'Standard Outlook user' },
  { email: 'rahul.kumar@company.co.in', shouldBeValid: true, reason: 'Corporate Indian domain email' }
];

let passed = 0;
let failed = 0;

console.log('\n========================================');
console.log('  RUNNING DUMMY EMAIL VALIDATION TESTS  ');
console.log('========================================\n');

testCases.forEach(({ email, shouldBeValid, reason }) => {
  const result = validateEmail(email);
  const isValid = result.valid;
  if (isValid === shouldBeValid) {
    passed++;
    console.log(`✅ [PASS] "${email}" -> Expected ${shouldBeValid ? 'VALID' : 'INVALID'}, Got ${isValid ? 'VALID' : 'INVALID'} (${reason})`);
  } else {
    failed++;
    console.error(`❌ [FAIL] "${email}" -> Expected ${shouldBeValid ? 'VALID' : 'INVALID'}, Got ${isValid ? 'VALID' : 'INVALID'} (${reason}) - Message: ${result.message}`);
  }
});

console.log('\n----------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed.`);
console.log('----------------------------------------\n');

if (failed > 0) {
  process.exit(1);
}
