import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.ADMIN_PASSWORD || 'default-secret-key-must-be-32-by'; // 32 chars
const IV_LENGTH = 16; 

// Ensure key is exactly 32 bytes
const getKey = () => {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest('base64').substring(0, 32);
};

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(getKey()), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(getKey()), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return ''; // Return empty string on failure to avoid leaking corrupted data
  }
}
