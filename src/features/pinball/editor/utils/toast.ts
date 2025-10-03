export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}

class ToastManager {
  private container: HTMLElement | null = null;
  
  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }
  
  show(message: string, options: ToastOptions = {}) {
    const {
      type = 'info',
      duration = 3000,
      dismissible = true
    } = options;
    
    const container = this.ensureContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideInToast 0.3s ease;
      pointer-events: auto;
      cursor: ${dismissible ? 'pointer' : 'default'};
      max-width: 400px;
      word-wrap: break-word;
    `;
    
    toast.innerHTML = message;
    
    // Add dismiss on click if dismissible
    if (dismissible) {
      toast.addEventListener('click', () => {
        this.remove(toast);
      });
    }
    
    container.appendChild(toast);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }
    
    return toast;
  }
  
  private getBackgroundColor(type: ToastType): string {
    switch (type) {
      case 'success': return '#27ae60';
      case 'error': return '#e74c3c';
      case 'warning': return '#f39c12';
      case 'info': return '#3498db';
      default: return '#333';
    }
  }
  
  private remove(toast: HTMLElement) {
    toast.style.animation = 'slideOutToast 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  success(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'success' });
  }
  
  error(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'error' });
  }
  
  warning(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'warning' });
  }
  
  info(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'info' });
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInToast {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutToast {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export const toast = new ToastManager();