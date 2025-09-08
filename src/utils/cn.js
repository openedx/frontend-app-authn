// eslint-disable-next-line import/no-extraneous-dependencies
import { clsx } from 'clsx';
// eslint-disable-next-line import/no-extraneous-dependencies
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional class names and tailwind-merge for intelligent merging.
 *
 * @param {...(string|object|array)} inputs - Class names or conditional class objects
 * @returns {string} Merged class names string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-2 is overridden by px-4)
 * cn('text-red-500', condition && 'text-blue-500') // conditionally applies classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
