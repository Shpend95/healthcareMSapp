/**
 * Accessibility helper utilities (WCAG 2.1 AA compliance)
 */

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Manage focus for modals and dialogs
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTab);
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTab);
  };
};

/**
 * Check color contrast ratio (WCAG AA requires 4.5:1 for normal text)
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(val => {
      val = parseInt(val) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Set focus management for dynamic content
 */
export const setFocusToElement = (element, options = {}) => {
  if (!element) return;
  
  const { announce = true, announceText } = options;
  
  if (announce && announceText) {
    announceToScreenReader(announceText);
  }
  
  element.focus();
  
  // Scroll into view if needed
  if (element.scrollIntoView) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/**
 * Generate unique ID for form labels
 */
export const generateId = (prefix = 'field') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate ARIA attributes
 */
export const validateAriaAttributes = (element) => {
  const errors = [];
  
  // Check if interactive element has accessible name
  if (['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
    const hasLabel = element.getAttribute('aria-label') || 
                    element.getAttribute('aria-labelledby') ||
                    (element.tagName.toLowerCase() === 'input' && element.getAttribute('type') === 'button' && element.value) ||
                    document.querySelector(`label[for="${element.id}"]`);
    
    if (!hasLabel && !element.getAttribute('aria-hidden')) {
      errors.push(`Element ${element.tagName} missing accessible name`);
    }
  }
  
  // Check if required fields are marked
  if (element.hasAttribute('required') && !element.getAttribute('aria-required')) {
    element.setAttribute('aria-required', 'true');
  }
  
  return errors;
};

/**
 * Keyboard navigation helpers
 */
export const handleKeyboardNavigation = (e, options = {}) => {
  const { onEnter, onEscape, onArrowUp, onArrowDown, preventDefault = true } = options;
  
  switch (e.key) {
    case 'Enter':
      if (onEnter) {
        if (preventDefault) e.preventDefault();
        onEnter(e);
      }
      break;
    case 'Escape':
      if (onEscape) {
        if (preventDefault) e.preventDefault();
        onEscape(e);
      }
      break;
    case 'ArrowUp':
      if (onArrowUp) {
        if (preventDefault) e.preventDefault();
        onArrowUp(e);
      }
      break;
    case 'ArrowDown':
      if (onArrowDown) {
        if (preventDefault) e.preventDefault();
        onArrowDown(e);
      }
      break;
  }
};

