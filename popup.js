document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('color-container');
    container.innerHTML = '<div class="loading">Creating color palette with love...</div>';
    
    try {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Execute the color extraction code
        const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        
        // Get the results from the injected script
        const colors = await result[0].result;
        
        // Display the colors
        container.innerHTML = ''; // Clear loading message
        
        if (!colors || colors.length === 0) {
            container.innerHTML = '<div class="error">Bu sayfada renk bulunamadı.</div>';
            return;
        }
        
        colors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            
            const colorSquare = document.createElement('div');
            colorSquare.className = 'color-square';
            colorSquare.style.backgroundColor = color.hex;
            
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            colorInfo.innerHTML = `
                <div class="color-name">${color.name}</div>
                <div class="color-hex">${color.hex}</div>
                <div class="color-percentage">${color.percentage}%</div>
            `;
            
            colorBox.appendChild(colorSquare);
            colorBox.appendChild(colorInfo);
            container.appendChild(colorBox);
            
            // Add click to copy functionality
            colorBox.addEventListener('click', () => {
                navigator.clipboard.writeText(color.hex);
                
                // Show feedback
                const feedback = document.createElement('div');
                feedback.className = 'copy-feedback';
                feedback.textContent = 'Copied!';
                colorBox.appendChild(feedback);
                
                // Remove feedback after animation
                setTimeout(() => {
                    feedback.remove();
                }, 1000);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="error">Renk paleti oluşturulamadı. Lütfen tekrar deneyin.</div>';
    }
});
