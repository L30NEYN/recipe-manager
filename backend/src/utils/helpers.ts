import crypto from 'crypto';

export const generateToken = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const parseAmount = (amount: string | number): number | null => {
  if (typeof amount === 'number') return amount;
  if (!amount) return null;
  
  // Handle fractions
  if (amount.includes('/')) {
    const [num, den] = amount.split('/').map(n => parseFloat(n.trim()));
    return den ? num / den : null;
  }
  
  // Handle mixed numbers (1 1/2)
  if (amount.includes(' ') && amount.includes('/')) {
    const parts = amount.split(' ');
    const whole = parseFloat(parts[0]);
    const [num, den] = parts[1].split('/').map(n => parseFloat(n));
    return whole + (num / den);
  }
  
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? null : parsed;
};
