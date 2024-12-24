// Function to convert RGB to HEX
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Function to check if element should be ignored
function shouldIgnoreElement(element) {
  // Ignore images, SVGs, and elements with background images
  if (element.tagName === 'IMG' || 
      element.tagName === 'SVG' || 
      element.tagName === 'PICTURE' ||
      element.tagName === 'VIDEO' ||
      element.tagName === 'CANVAS') {
    return true;
  }

  const style = window.getComputedStyle(element);
  const backgroundImage = style.backgroundImage;
  
  // Ignore elements with background images
  if (backgroundImage && backgroundImage !== 'none') {
    return true;
  }

  return false;
}

// Function to extract colors from computed styles
function extractColors() {
  const elements = document.querySelectorAll('*');
  const colorMap = new Map();
  
  elements.forEach(element => {
    // Skip images and elements with background images
    if (shouldIgnoreElement(element)) {
      return;
    }

    const styles = window.getComputedStyle(element);
    
    // Extract background color
    let bgColor = styles.backgroundColor;
    if (bgColor && 
        bgColor !== 'transparent' && 
        bgColor !== 'rgba(0, 0, 0, 0)' &&
        bgColor !== 'rgb(0, 0, 0, 0)') {
      // Convert rgb/rgba to hex
      const match = bgColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    }
    
    // Extract text color
    let textColor = styles.color;
    if (textColor && textColor !== 'transparent') {
      const match = textColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    }
    
    // Extract border color
    let borderColor = styles.borderColor;
    if (borderColor && 
        borderColor !== 'transparent' && 
        borderColor !== 'rgba(0, 0, 0, 0)' &&
        borderColor !== 'rgb(0, 0, 0, 0)') {
      const match = borderColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    }
  });
  
  // Convert Map to array and sort by usage count
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color, count]) => ({ hex: color, count }));
  
  return sortedColors;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getColors') {
    sendResponse(extractColors());
  }
});
