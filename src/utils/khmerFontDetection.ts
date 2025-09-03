// Khmer font auto-detection utility
// This script automatically detects Khmer text and applies the appropriate font

// Declare global timeout variable
declare global {
  interface Window {
    khmerDetectionTimeout?: NodeJS.Timeout;
  }
}

/**
 * Detects if a string contains Khmer characters
 * Khmer Unicode range: U+1780-U+17FF
 */
function containsKhmerText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  // Khmer Unicode range: ក-៹ (U+1780-U+17FF)
  const khmerRegex = /[\u1780-\u17FF]/;
  const hasKhmer = khmerRegex.test(text);
  
  if (hasKhmer) {
    console.log('🔤 Khmer text detected:', text.substring(0, 50) + '...');
  }
  
  return hasKhmer;
}

/**
 * Applies Khmer font class to an element - matching font test page approach
 */
function applyKhmerFont(element: HTMLElement): void {
  if (element && element.classList) {
    element.classList.add('has-khmer-text');
    
    // Apply the exact same inline style as the working font test page
    element.style.fontFamily = "'Khmer OS Battambang', serif";
    
    console.log('✅ Applied Khmer font to element:', element.tagName, element.textContent?.substring(0, 30) + '...');
  }
}

/**
 * Processes a single element and its text content
 */
function processElement(element: HTMLElement): void {
  // Skip if already processed
  if (element.classList && element.classList.contains('has-khmer-text')) {
    return;
  }

  // Check direct text content
  const textContent = element.textContent || element.innerText || '';
  if (containsKhmerText(textContent)) {
    applyKhmerFont(element);
    return;
  }

  // Check for text nodes within the element
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let textNode;
  while (textNode = walker.nextNode()) {
    if (containsKhmerText(textNode.textContent || '')) {
      applyKhmerFont(element);
      return;
    }
  }
}

/**
 * Scans the document for Khmer text and applies appropriate fonts
 */
function detectAndApplyKhmerFonts() {
  console.log('🔤 Detecting Khmer text for font application...');
  
  // Get all text-containing elements, including table elements specifically
  const textElements = document.querySelectorAll(
    'p, span, div, td, th, h1, h2, h3, h4, h5, h6, label, button, a, li, tr, table'
  );

  let khmerElementsFound = 0;

  textElements.forEach(element => {
    try {
      if (element instanceof HTMLElement) {
        processElement(element);
        if (element.classList.contains('has-khmer-text')) {
          khmerElementsFound++;
          
          // Force apply the exact same styling as working font test page
          if (element.tagName === 'TD' || element.tagName === 'TH' || element.tagName === 'TR') {
            element.style.fontFamily = "'Khmer OS Battambang', serif";
            console.log('🎯 Force-applied font to table element:', element.tagName);
          }
        }
      }
    } catch (error) {
      console.warn('Error processing element for Khmer text:', error);
    }
  });

  console.log(`✅ Applied Khmer font to ${khmerElementsFound} elements`);
  
  // Additional pass specifically for table cells
  const tableCells = document.querySelectorAll('td, th');
  let tableElementsProcessed = 0;
  
  tableCells.forEach(cell => {
    if (cell instanceof HTMLElement) {
      const text = cell.textContent || '';
      if (containsKhmerText(text)) {
        // Apply exact same style as working font test page
        cell.style.fontFamily = "'Khmer OS Battambang', serif";
        cell.classList.add('has-khmer-text');
        tableElementsProcessed++;
        console.log('📊 Table cell styled:', text.substring(0, 30));
      }
    }
  });
  
  console.log(`📋 Processed ${tableElementsProcessed} table cells with Khmer text`);
}

/**
 * Initialize Khmer font detection
 */
function initKhmerFontDetection() {
  // Run initial detection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectAndApplyKhmerFonts);
  } else {
    detectAndApplyKhmerFonts();
  }

  // Set up a MutationObserver to detect dynamically added content
  const observer = new MutationObserver((mutations) => {
    let shouldReprocess = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            shouldReprocess = true;
          }
        });
      }
    });

    if (shouldReprocess) {
      // Debounce the reprocessing
      clearTimeout(window.khmerDetectionTimeout);
      window.khmerDetectionTimeout = setTimeout(detectAndApplyKhmerFonts, 100);
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('🔤 Khmer font detection initialized');
}

// Export for use in React components
export { 
  containsKhmerText, 
  applyKhmerFont, 
  detectAndApplyKhmerFonts, 
  initKhmerFontDetection 
};

/**
 * Check if Khmer OS Battambang font is loaded
 */
function checkFontLoaded(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        const fontFaces = Array.from(document.fonts);
        const khmerFont = fontFaces.find(font => 
          font.family.includes('Khmer OS Battambang')
        );
        console.log('🔤 Available fonts:', fontFaces.map(f => f.family));
        console.log('🎯 Khmer OS Battambang loaded:', !!khmerFont);
        resolve(!!khmerFont);
      });
    } else {
      // Fallback for browsers without FontFace API
      resolve(true);
    }
  });
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  initKhmerFontDetection();
  
  // Add a global function for manual testing
  (window as any).testKhmerFontDetection = () => {
    console.log('🔍 Manual Khmer font detection test...');
    checkFontLoaded().then(loaded => {
      console.log('🎯 Font loading status:', loaded);
      detectAndApplyKhmerFonts();
      
      // Test with a specific element
      const testElement = document.querySelector('.has-khmer-text');
      if (testElement) {
        const computedStyle = window.getComputedStyle(testElement);
        console.log('🎨 Computed font-family:', computedStyle.fontFamily);
      }
    });
  };
  
  // Add function to show current Khmer elements with font info
  (window as any).showKhmerElements = () => {
    const khmerElements = document.querySelectorAll('.has-khmer-text');
    console.log(`📋 Found ${khmerElements.length} elements with .has-khmer-text class:`);
    khmerElements.forEach((el, index) => {
      const computedStyle = window.getComputedStyle(el);
      console.log(`${index + 1}. ${el.tagName}: ${el.textContent?.slice(0, 50)}...`);
      console.log(`   Font: ${computedStyle.fontFamily}`);
    });
  };
}
