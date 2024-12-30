function extractColorsFromCSS() {
    const colorStats = new Map();
    let totalPixelCount = 0;

    // Get full page dimensions
    const pageWidth = Math.max(
        document.documentElement.scrollWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
    const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
    const pageArea = pageWidth * pageHeight;

    // First, detect background color
    const bodyBgColor = getBackgroundColor(document.body) || getBackgroundColor(document.documentElement);
    const backgroundHex = convertToHex(bodyBgColor);
    if (backgroundHex) {
        colorStats.set(backgroundHex, pageArea);
        totalPixelCount += pageArea;
    }

    // Get all elements
    const elements = document.querySelectorAll('*');
    const processedElements = new Set();

    elements.forEach(element => {
        // Skip if already processed or not visible
        if (processedElements.has(element) || !isElementVisible(element)) return;

        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Convert viewport-relative coordinates to page-relative
        const absoluteRect = {
            left: rect.left + scrollLeft,
            right: rect.right + scrollLeft,
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
            width: rect.width,
            height: rect.height
        };

        // Calculate actual area
        const elementArea = absoluteRect.width * absoluteRect.height;
        if (elementArea <= 0) return;

        // Get computed styles
        const styles = window.getComputedStyle(element);
        
        // Process colors with their areas
        processElementColors(element, styles, elementArea);
        
        // Mark as processed
        processedElements.add(element);
    });

    function processElementColors(element, styles, area) {
        // Get all colors from the element
        const elementColors = new Set();

        // Text color (only if element has visible text)
        if (hasVisibleText(element)) {
            const textColor = convertToHex(styles.color);
            if (isValidColor(textColor)) {
                elementColors.add(textColor);
            }
        }

        // Background color
        const bgColor = getBackgroundColor(null, styles);
        if (isValidColor(bgColor)) {
            const bgHex = convertToHex(bgColor);
            if (bgHex) elementColors.add(bgHex);
        }

        // Border colors (only if border is visible)
        if (hasBorder(styles)) {
            ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].forEach(prop => {
                const borderColor = convertToHex(styles[prop]);
                if (isValidColor(borderColor)) {
                    elementColors.add(borderColor);
                }
            });
        }

        // Gradient colors
        const backgroundImage = styles.backgroundImage;
        if (backgroundImage && backgroundImage !== 'none') {
            const gradientColors = extractGradientColors(backgroundImage);
            gradientColors.forEach(gradientColor => {
                const hex = convertToHex(gradientColor);
                if (isValidColor(hex)) {
                    elementColors.add(hex);
                }
            });
        }

        // Update color statistics
        elementColors.forEach(color => {
            if (color === backgroundHex) return; // Skip background color
            const currentArea = colorStats.get(color) || 0;
            colorStats.set(color, currentArea + area);
            totalPixelCount += area;
        });
    }

    // Calculate percentages and sort colors
    const sortedColors = Array.from(colorStats.entries())
        .map(([hex, area]) => {
            const percentage = Math.max(1, Math.round((area / totalPixelCount) * 100));
            return { hex, percentage };
        })
        .filter(color => color.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

    return {
        backgroundColor: backgroundHex,
        colors: sortedColors
    };
}

function hasVisibleText(element) {
    const text = element.textContent.trim();
    if (!text) return false;

    const styles = window.getComputedStyle(element);
    return styles.fontSize !== '0px' && 
           styles.visibility === 'visible' && 
           styles.display !== 'none' && 
           parseFloat(styles.opacity) > 0;
}

function hasBorder(styles) {
    return ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].some(prop => 
        parseFloat(styles[prop]) > 0
    );
}

function isElementVisible(element) {
    if (!element || !element.getBoundingClientRect) return false;

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           parseFloat(style.opacity) > 0 && 
           element.getBoundingClientRect().width > 0 && 
           element.getBoundingClientRect().height > 0;
}

function getBackgroundColor(element, styles = null) {
    const computedStyle = styles || (element ? window.getComputedStyle(element) : null);
    if (!computedStyle) return null;

    const backgroundColor = computedStyle.backgroundColor;
    if (!backgroundColor || 
        backgroundColor === 'transparent' || 
        backgroundColor === 'rgba(0, 0, 0, 0)') {
        return null;
    }

    return backgroundColor;
}

function isValidColor(color) {
    if (!color) return false;
    
    // Convert to hex first if it's not already
    const hex = color.startsWith('#') ? color : convertToHex(color);
    
    // Check if it's a valid 6-digit hex color
    return hex && hex.match(/^#[0-9A-F]{6}$/i);
}

function convertToHex(color) {
    if (!color || 
        color === 'transparent' || 
        color === 'rgba(0, 0, 0, 0)' || 
        color.includes('var(')) return null;

    // Handle hex colors
    if (color.startsWith('#')) {
        const hex = color.length === 4 ? 
            `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : 
            color;
        return hex.toUpperCase();
    }

    // Handle other color formats
    try {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computed = window.getComputedStyle(div).color;
        document.body.removeChild(div);
        
        const rgb = computed.match(/\d+/g);
        if (!rgb || rgb.length < 3) return null;

        const hex = '#' + rgb.slice(0, 3)
            .map(x => parseInt(x).toString(16).padStart(2, '0'))
            .join('');
        
        return hex.toUpperCase();
    } catch (error) {
        console.error('Error converting color to hex:', error);
        return null;
    }
}

function extractGradientColors(gradient) {
    const colorMatches = gradient.match(/(#[a-f\d]{3,8}|(rgb|hsl)a?\([\d\s%,.]+\))/gi) || [];
    return colorMatches.filter(color => 
        color !== 'transparent' && 
        color !== 'rgba(0, 0, 0, 0)' && 
        !color.includes('var(')
    );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractColors") {
        const result = extractColorsFromCSS();
        sendResponse(result);
    }
    return true;
});
