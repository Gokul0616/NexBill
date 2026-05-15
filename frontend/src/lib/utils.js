import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes with clsx support.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
