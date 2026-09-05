const crypto = require('crypto');

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const hashPassword = (plainText) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(plainText), salt, KEY_LENGTH, SCRYPT_OPTIONS).toString('hex');
  return `scrypt$${salt}$${derived}`;
};

const verifyPassword = (plainText, storedHash) => {
  if (!storedHash || typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, salt, expectedHex] = parts;
  let derived;
  try {
    derived = crypto.scryptSync(String(plainText), salt, KEY_LENGTH, SCRYPT_OPTIONS);
  } catch {
    return false;
  }

  const expected = Buffer.from(expectedHex, 'hex');
  if (expected.length !== derived.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, derived);
};

module.exports = {
  hashPassword,
  verifyPassword,
};
