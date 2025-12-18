/**
 * Currency conversion utilities
 * Conversion rate: 1 USD = 330 LKR
 */

const USD_TO_LKR_RATE = 330;

export const formatCurrency = (amount: number, currency: 'USD' | 'LKR' = 'LKR'): string => {
  if (currency === 'LKR') {
    return `Rs. ${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
};

export const convertUSDToLKR = (usdAmount: number): number => {
  return Math.round(usdAmount * USD_TO_LKR_RATE);
};

export const getLKRCurrencySymbol = (): string => 'Rs.';

export const getCurrencyCode = (): string => 'LKR';
