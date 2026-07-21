const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Creates a SHA-256 hash of a given text.
 * @param {string} text 
 * @returns {string} Hexadecimal hash
 */
function hashSHA256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Encrypts a text using AES-256-CBC.
 * @param {string} text 
 * @returns {string} Hex-encoded IV and encrypted text
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text encrypted with AES-256-CBC.
 * @param {string} text 
 * @returns {string} Decrypted text
 */
function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Generates a random anonymous token (hex string).
 * @param {number} length Number of bytes
 * @returns {string}
 */
function generateAnonymousToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  hashSHA256,
  encrypt,
  decrypt,
  generateAnonymousToken
};
