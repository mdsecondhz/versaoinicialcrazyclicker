import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  
  const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi"];
  const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);
  
  let shortValue = parseFloat((suffixNum != 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
  if (shortValue % 1 != 0) {
      shortValue = Number(shortValue.toFixed(1));
  }
  return shortValue + suffixes[suffixNum];
}