# Color Palette Extractor

A browser extension that extracts the color palette from any webpage using advanced area-based color detection.

## Features

- **Area-Based Color Detection**: Colors are detected based on their actual usage area on the page
- **Comprehensive Analysis**: Analyzes all visible elements including text, backgrounds, borders, and gradients
- **Full Page Support**: Analyzes the entire page content, including scrollable areas
- **Accurate Color Representation**: Shows the most prominent colors used on the webpage
- **Clean Interface**: Simple and intuitive user interface showing color hexadecimal values

## How It Works

1. Click the extension icon on any webpage
2. The extension analyzes all visible elements on the page
3. Colors are extracted from:
   - Text colors
   - Background colors
   - Border colors
   - Gradient colors
4. Each color's prominence is calculated based on the actual area it occupies
5. The most prominent colors are displayed in the popup

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store page (link coming soon)
2. Click "Add to Chrome"
3. Click "Add Extension" in the popup

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Version History

### v1.1.0
- Implemented area-based color detection
- Added full page analysis support
- Improved color extraction accuracy
- Enhanced user interface
- Optimized performance

### v1.0.0
- Initial release
- Basic color extraction
- Simple popup interface

## Technical Details

The extension uses:
- Manifest V3
- Content Scripts for page analysis
- Area-based color prominence calculation
- DOM traversal for comprehensive color detection

## Permissions

The extension requires minimal permissions:
- `activeTab`: To analyze the current tab
- `scripting`: To run the color extraction script

## License

MIT License - See LICENSE file for details
