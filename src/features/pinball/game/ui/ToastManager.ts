/**
 * Toast notification manager
 * Handles temporary notification messages to the user
 */

import { Toast } from '../../../shared/types';

/**
 * Show a toast notification
 * @param message - The message to display
 * @param type - The type of toast (info, success, warning, error)
 * @param duration - How long to show the toast in milliseconds
 */
export function showToast(message: string, type: Toast['type'], duration: number = 3000): void {
  const container = document.getElementById('toast-container') as HTMLDivElement;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    if (container.contains(toast)) {
      container.removeChild(toast);
    }
  }, duration);
}