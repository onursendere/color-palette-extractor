const ntc = {
  name: function(hex) {
    hex = hex.toUpperCase();
    
    // Exact match
    if (this.colors[hex]) {
      return [hex, this.colors[hex], true];
    }
    
    // Convert input hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Find closest color
    let minDistance = Number.MAX_VALUE;
    let closestHex = '';
    let closestName = '';
    
    for (const [colorHex, colorName] of Object.entries(this.colors)) {
      const cr = parseInt(colorHex.slice(1, 3), 16);
      const cg = parseInt(colorHex.slice(3, 5), 16);
      const cb = parseInt(colorHex.slice(5, 7), 16);
      
      // Calculate weighted Euclidean distance
      // Ağırlıklar insan gözünün renk hassasiyetine göre ayarlandı
      const distance = Math.sqrt(
        3 * Math.pow(r - cr, 2) +  // Red
        4 * Math.pow(g - cg, 2) +  // Green (most sensitive)
        2 * Math.pow(b - cb, 2)    // Blue
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestHex = colorHex;
        closestName = colorName;
      }
    }
    
    // Return closest match if within reasonable threshold
    if (minDistance < 25) {
      return [closestHex, closestName, false];
    }
    
    // Generate descriptive name for unknown colors
    const hue = this.getHueName(r, g, b);
    const brightness = this.getBrightnessName(r, g, b);
    const saturation = this.getSaturationName(r, g, b);
    
    return [hex, `${brightness} ${saturation} ${hue}`, false];
  },
  
  getHueName: function(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) {
      if (max === 0) return 'Black';
      if (max === 255) return 'White';
      return 'Gray';
    }
    
    let hue = 0;
    if (max === r) {
      hue = (g - b) / (max - min);
    } else if (max === g) {
      hue = 2 + (b - r) / (max - min);
    } else {
      hue = 4 + (r - g) / (max - min);
    }
    
    hue *= 60;
    if (hue < 0) hue += 360;
    
    if (hue >= 0 && hue < 30) return 'Red';
    if (hue < 60) return 'Orange Red';
    if (hue < 90) return 'Orange';
    if (hue < 120) return 'Yellow Orange';
    if (hue < 150) return 'Yellow';
    if (hue < 180) return 'Yellow Green';
    if (hue < 210) return 'Green';
    if (hue < 240) return 'Blue Green';
    if (hue < 270) return 'Blue';
    if (hue < 300) return 'Blue Violet';
    if (hue < 330) return 'Violet';
    return 'Red Violet';
  },
  
  getBrightnessName: function(r, g, b) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness < 51) return 'Very Dark';
    if (brightness < 102) return 'Dark';
    if (brightness < 153) return 'Medium Dark';
    if (brightness < 204) return 'Medium';
    if (brightness < 245) return 'Light';
    return 'Very Light';
  },
  
  getSaturationName: function(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === 0) return '';
    
    const saturation = (max - min) / max;
    
    if (saturation < 0.1) return '';
    if (saturation < 0.3) return 'Grayish';
    if (saturation < 0.5) return 'Moderate';
    if (saturation < 0.7) return 'Strong';
    if (saturation < 0.9) return 'Vivid';
    return 'Pure';
  },
  
  colors: {
    // Temel Renkler
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Lime',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#00FFFF': 'Cyan',
    '#FF00FF': 'Magenta',
    
    // Gri Tonları
    '#F8F8F8': 'Ghost White',
    '#F5F5F5': 'White Smoke',
    '#DCDCDC': 'Gainsboro',
    '#D3D3D3': 'Light Gray',
    '#C0C0C0': 'Silver',
    '#A9A9A9': 'Dark Gray',
    '#808080': 'Gray',
    '#696969': 'Dim Gray',
    '#404040': 'Charcoal',
    '#202020': 'Almost Black',
    
    // Kırmızı Tonları
    '#8B0000': 'Dark Red',
    '#B22222': 'Fire Brick',
    '#CD5C5C': 'Indian Red',
    '#DC143C': 'Crimson',
    '#FF4500': 'Orange Red',
    '#FF6347': 'Tomato',
    '#FF7F50': 'Coral',
    '#FA8072': 'Salmon',
    '#E9967A': 'Dark Salmon',
    '#F08080': 'Light Coral',
    
    // Pembe Tonları
    '#FF69B4': 'Hot Pink',
    '#FF1493': 'Deep Pink',
    '#DB7093': 'Pale Violet Red',
    '#FFB6C1': 'Light Pink',
    '#FFC0CB': 'Pink',
    '#FFE4E1': 'Misty Rose',
    
    // Turuncu Tonları
    '#FFA500': 'Orange',
    '#FF8C00': 'Dark Orange',
    '#FF7F24': 'Burnt Orange',
    '#F4A460': 'Sandy Brown',
    '#D2691E': 'Chocolate',
    '#8B4513': 'Saddle Brown',
    
    // Sarı Tonları
    '#FFD700': 'Gold',
    '#DAA520': 'Goldenrod',
    '#B8860B': 'Dark Goldenrod',
    '#BDB76B': 'Dark Khaki',
    '#F0E68C': 'Khaki',
    '#EEE8AA': 'Pale Goldenrod',
    
    // Yeşil Tonları
    '#006400': 'Dark Green',
    '#008000': 'Green',
    '#228B22': 'Forest Green',
    '#32CD32': 'Lime Green',
    '#90EE90': 'Light Green',
    '#98FB98': 'Pale Green',
    '#00FF7F': 'Spring Green',
    '#00FA9A': 'Medium Spring Green',
    '#2E8B57': 'Sea Green',
    '#3CB371': 'Medium Sea Green',
    '#66CDAA': 'Medium Aquamarine',
    '#8FBC8F': 'Dark Sea Green',
    '#9ACD32': 'Yellow Green',
    '#6B8E23': 'Olive Drab',
    '#808000': 'Olive',
    
    // Mavi Tonları
    '#000080': 'Navy',
    '#00008B': 'Dark Blue',
    '#0000CD': 'Medium Blue',
    '#4169E1': 'Royal Blue',
    '#1E90FF': 'Dodger Blue',
    '#00BFFF': 'Deep Sky Blue',
    '#87CEEB': 'Sky Blue',
    '#87CEFA': 'Light Sky Blue',
    '#ADD8E6': 'Light Blue',
    '#B0C4DE': 'Light Steel Blue',
    '#B0E0E6': 'Powder Blue',
    '#F0F8FF': 'Alice Blue',
    
    // Turkuaz Tonları
    '#40E0D0': 'Turquoise',
    '#48D1CC': 'Medium Turquoise',
    '#00CED1': 'Dark Turquoise',
    '#20B2AA': 'Light Sea Green',
    '#008B8B': 'Dark Cyan',
    '#008080': 'Teal',
    
    // Mor Tonları
    '#800080': 'Purple',
    '#8B008B': 'Dark Magenta',
    '#9370DB': 'Medium Purple',
    '#9932CC': 'Dark Orchid',
    '#8A2BE2': 'Blue Violet',
    '#9400D3': 'Dark Violet',
    '#9932CC': 'Dark Orchid',
    '#BA55D3': 'Medium Orchid',
    '#DA70D6': 'Orchid',
    '#DDA0DD': 'Plum',
    '#EE82EE': 'Violet',
    '#D8BFD8': 'Thistle',
    '#E6E6FA': 'Lavender',
    
    // Kahverengi Tonları
    '#A0522D': 'Sienna',
    '#8B4513': 'Saddle Brown',
    '#D2691E': 'Chocolate',
    '#CD853F': 'Peru',
    '#DEB887': 'Burlywood',
    '#F4A460': 'Sandy Brown',
    '#D2B48C': 'Tan',
    '#BC8F8F': 'Rosy Brown',
    
    // Material Design Renkleri
    '#F44336': 'Material Red',
    '#E91E63': 'Material Pink',
    '#9C27B0': 'Material Purple',
    '#673AB7': 'Material Deep Purple',
    '#3F51B5': 'Material Indigo',
    '#2196F3': 'Material Blue',
    '#03A9F4': 'Material Light Blue',
    '#00BCD4': 'Material Cyan',
    '#009688': 'Material Teal',
    '#4CAF50': 'Material Green',
    '#8BC34A': 'Material Light Green',
    '#CDDC39': 'Material Lime',
    '#FFEB3B': 'Material Yellow',
    '#FFC107': 'Material Amber',
    '#FF9800': 'Material Orange',
    '#FF5722': 'Material Deep Orange',
    '#795548': 'Material Brown',
    '#9E9E9E': 'Material Grey',
    '#607D8B': 'Material Blue Grey'
  }
};
