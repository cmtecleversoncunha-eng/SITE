import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCPF = (value: string | null | undefined): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (!match) return value;
  let result = match[1];
  if (match[2]) result += `.${match[2]}`;
  if (match[3]) result += `.${match[3]}`;
  if (match[4]) result += `-${match[4]}`;
  return result;
};

export const formatPhone = (value: string | null | undefined): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    const match = cleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
    if (!match) return value;
    let result = '';
    if (match[1]) result += `(${match[1]}`;
    if (match[2]) result += `) ${match[2]}`;
    if (match[3]) result += `-${match[3]}`;
    return result;
  } else {
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return value;
    let result = '';
    if (match[1]) result += `(${match[1]}`;
    if (match[2]) result += `) ${match[2]}`;
    if (match[3]) result += `-${match[3]}`;
    return result;
  }
};

export function validateCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false;
  const cleaned = cpf.replace(/[^\d]+/g, '');
  if (cleaned.length !== 11 || !!cleaned.match(/(\d)\1{10}/)) return false;
  
  const digits = cleaned.split('').map(Number);
  
  const calculateDigit = (slice: number): number => {
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += digits[i] * (slice + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const d1 = calculateDigit(9);
  if (d1 !== digits[9]) return false;

  const d2 = calculateDigit(10);
  if (d2 !== digits[10]) return false;

  return true;
}

export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[^\d]+/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}
