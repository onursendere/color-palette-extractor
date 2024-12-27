// Function to convert RGB to HEX
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Function to get color name from TheColorAPI
async function getColorName(hex) {
  try {
    const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}`);
    const data = await response.json();
    return data.name.value;
  } catch (error) {
    console.error('Error fetching color name:', error);
    return hex;
  }
}

// Function to check if element should be ignored
function shouldIgnoreElement(element) {
  if (element.tagName === 'IMG' || 
      element.tagName === 'SVG' || 
      element.tagName === 'PICTURE' ||
      element.tagName === 'VIDEO' ||
      element.tagName === 'CANVAS') {
    return true;
  }

  const style = window.getComputedStyle(element);
  const backgroundImage = style.backgroundImage;
  
  return backgroundImage && backgroundImage !== 'none';
}

// Function to extract colors from computed styles
async function extractColors() {
  const elements = document.querySelectorAll('*');
  const colorMap = new Map();
  let totalColorUses = 0;
  
  for (const element of elements) {
    if (shouldIgnoreElement(element)) continue;

    const styles = window.getComputedStyle(element);
    
    // Extract background color
    let bgColor = styles.backgroundColor;
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      const match = bgColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        totalColorUses++;
      }
    }
    
    // Extract text color
    let textColor = styles.color;
    if (textColor && textColor !== 'transparent') {
      const match = textColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        totalColorUses++;
      }
    }
    
    // Extract border color
    let borderColor = styles.borderColor;
    if (borderColor && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)') {
      const match = borderColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        totalColorUses++;
      }
    }
  }
  
  // Convert Map to array and sort by usage count
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Get color names for each hex code
  const colorPromises = sortedColors.map(async ([hex, count]) => {
    const name = await getColorName(hex);
    const percentage = ((count / totalColorUses) * 100).toFixed(1);
    return {
      hex: hex,
      name: name,
      percentage: percentage
    };
  });
  
  return Promise.all(colorPromises);
}

// Execute and return the results
extractColors();
