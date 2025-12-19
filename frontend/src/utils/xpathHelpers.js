/**
 * XPath helper utilities for testing and accessibility
 */

/**
 * Generate XPath selector for an element based on its attributes
 */
export const generateXPath = (element) => {
  if (!element) return null;
  
  if (element.id) {
    return `//*[@id='${element.id}']`;
  }
  
  if (element.getAttribute('data-testid')) {
    return `//*[@data-testid='${element.getAttribute('data-testid')}']`;
  }
  
  if (element.getAttribute('data-action')) {
    return `//*[@data-action='${element.getAttribute('data-action')}']`;
  }
  
  // Generate path based on tag name and position
  const path = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.previousSibling;
    
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    
    const tagName = current.tagName.toLowerCase();
    path.unshift(`${tagName}[${index}]`);
    current = current.parentElement;
  }
  
  return '/' + path.join('/');
};

/**
 * Find element by XPath
 */
export const findByXPath = (xpath) => {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return result.singleNodeValue;
};

/**
 * Common XPath patterns for testing
 */
export const xpathPatterns = {
  // Form fields
  inputByName: (name) => `//input[@name='${name}']`,
  inputByTestId: (testId) => `//input[@data-testid='${testId}']`,
  selectByName: (name) => `//select[@name='${name}']`,
  textareaByName: (name) => `//textarea[@name='${name}']`,
  
  // Buttons
  buttonByText: (text) => `//button[contains(text(),'${text}')]`,
  buttonByTestId: (testId) => `//button[@data-testid='${testId}']`,
  buttonByAction: (action) => `//button[@data-action='${action}']`,
  
  // Links
  linkByText: (text) => `//a[contains(text(),'${text}')]`,
  linkByHref: (href) => `//a[@href='${href}']`,
  
  // Containers
  divByTestId: (testId) => `//div[@data-testid='${testId}']`,
  sectionByTestId: (testId) => `//section[@data-testid='${testId}']`,
  
  // Forms
  formByTestId: (testId) => `//form[@data-testid='${testId}']`,
  formByType: (type) => `//form[@data-form-type='${type}']`,
  
  // Error messages
  errorMessage: (fieldName) => `//span[@data-field-error='${fieldName}']`,
  
  // Cards and lists
  cardByIndex: (index) => `//div[@data-testid='card'][${index}]`,
  listItemByIndex: (index) => `//li[@data-testid='list-item'][${index}]`,
};

/**
 * Get all elements matching an XPath
 */
export const findAllByXPath = (xpath) => {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  
  const elements = [];
  for (let i = 0; i < result.snapshotLength; i++) {
    elements.push(result.snapshotItem(i));
  }
  return elements;
};

/**
 * Wait for element to appear (for async testing)
 */
export const waitForXPath = (xpath, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    const check = () => {
      const element = findByXPath(xpath);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element not found: ${xpath}`));
        return;
      }
      
      setTimeout(check, checkInterval);
    };
    
    check();
  });
};

