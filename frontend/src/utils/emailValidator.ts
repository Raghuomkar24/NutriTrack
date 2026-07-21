/**
 * Utility to validate email addresses and reject dummy, fake, or disposable email addresses on frontend.
 */

export const DUMMY_DOMAINS = new Set([
  // Generic fake/test domains
  'example.com', 'example.org', 'example.net',
  'test.com', 'test.org', 'test.net',
  'dummy.com', 'dummy.org', 'dummy.net',
  'fake.com', 'fake.org', 'fake.net',
  'invalid.com', 'sample.com', 'localhost',
  'foo.com', 'bar.com', 'temp.com', 'testing.com',

  // Disposable / Temporary email domains
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'tempmail.net',
  '10minutemail.com', '10minutemail.net', '10minutemail.co.uk',
  'guerrillamail.com', 'guerrillamail.block', 'sharklasers.com',
  'trashmail.com', 'trashmail.net', 'dispostable.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'throwawaymail.com', 'getnada.com', 'nada.ltd',
  'fakemailgenerator.com', 'mohmal.com', 'maildrop.cc',
  'disposable.com', 'disposablemail.com', 'crazymailing.com',
  'burnermail.io', 'mailnesia.com', 'getairmail.com',
  'mytemp.email', 'boun.cr', 'inboxalias.com',
  'tempmailaddress.com', 'tmpmail.org', 'tmpmail.net',
  '0815.ru'
]);

export const DUMMY_USERNAMES = new Set([
  'dummy', 'fake', 'test', 'tester', 'testing', 'asdf', 'qwerty',
  '123456', 'temp', 'disposable', 'junk', 'trash', 'spam'
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  valid: boolean;
  message?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic regex check
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, message: 'Please enter a valid email address format (e.g., user@domain.com).' };
  }

  // Check for consecutive dots or invalid placement
  if (cleanEmail.includes('..') || cleanEmail.includes('.@') || cleanEmail.includes('@.')) {
    return { valid: false, message: 'Email address contains invalid consecutive punctuation.' };
  }

  const [username, domain] = cleanEmail.split('@');

  if (!username || !domain) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  // Check if domain is a known dummy/disposable domain
  if (DUMMY_DOMAINS.has(domain)) {
    return { valid: false, message: 'Dummy or disposable email addresses are not allowed. Please use a valid email.' };
  }

  // Check subdomains of known disposable providers (e.g., *.mailinator.com)
  const domainParts = domain.split('.');
  if (domainParts.length > 2) {
    const parentDomain = domainParts.slice(-2).join('.');
    if (DUMMY_DOMAINS.has(parentDomain)) {
      return { valid: false, message: 'Dummy or disposable email addresses are not allowed. Please use a valid email.' };
    }
  }

  // Check for dummy usernames (e.g., dummy@..., fake@..., test@...) or matching username & main domain name (e.g., asdf@asdf.com)
  const mainDomainName = domainParts[0];
  if (DUMMY_USERNAMES.has(username) || username === mainDomainName) {
    return { valid: false, message: 'Dummy or placeholder email addresses are not allowed. Please use a real email.' };
  }

  return { valid: true };
}
