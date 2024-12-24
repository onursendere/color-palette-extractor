document.addEventListener('DOMContentLoaded', function() {
  // Query the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Send message to content script
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getColors'}, function(colors) {
      const container = document.getElementById('colors-container');
      const noColors = document.getElementById('no-colors');
      
      if (colors && colors.length > 0) {
        noColors.style.display = 'none';
        container.innerHTML = '';
        
        // Only show top 10 colors
        colors.slice(0, 10).forEach((color, index) => {
          const colorName = ntc.name(color.hex);
          const colorBox = document.createElement('div');
          colorBox.className = 'color-box';
          
          colorBox.innerHTML = `
            <div class="color-preview" style="background-color: ${color.hex}"></div>
            <div class="color-info">
              <div class="color-name">${colorName}</div>
              <div class="hex-code">${color.hex.toUpperCase()}</div>
              <div class="usage-count">Used ${color.count} times</div>
            </div>
            <button class="copy-button" data-color="${color.hex}">Copy</button>
          `;
          
          container.appendChild(colorBox);
        });
        
        // Add click handlers for copy buttons
        document.querySelectorAll('.copy-button').forEach(button => {
          button.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            navigator.clipboard.writeText(color).then(() => {
              const originalText = this.textContent;
              this.textContent = 'Copied!';
              setTimeout(() => {
                this.textContent = originalText;
              }, 1000);
            });
          });
        });
      } else {
        container.innerHTML = '';
        noColors.style.display = 'block';
      }
    });
  });
});
