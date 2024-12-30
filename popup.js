document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('color-container');
    setLoadingMessage();

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "extractColors"}, async function(response) {
            if (chrome.runtime.lastError) {
                setErrorMessage("Error analyzing page colors.");
                return;
            }

            if (!response || (!response.colors && !response.backgroundColor)) {
                setErrorMessage("Could not retrieve color information.");
                return;
            }

            try {
                // Get color names
                const colorsWithNames = await Promise.all(response.colors.map(async color => ({
                    ...color,
                    name: await getColorName(color.hex)
                })));

                const backgroundColorWithName = response.backgroundColor ? 
                    { hex: response.backgroundColor, name: await getColorName(response.backgroundColor) } : null;

                displayResults(colorsWithNames, backgroundColorWithName);
            } catch (error) {
                setErrorMessage("Error fetching color names.");
                console.error('Error:', error);
            }
        });
    });
});

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

function setLoadingMessage() {
    const container = document.getElementById('color-container');
    container.innerHTML = '<p class="message">Analyzing colors...</p>';
}

function setErrorMessage(message) {
    const container = document.getElementById('color-container');
    container.innerHTML = `<p class="error">${message}</p>`;
}

function displayResults(colors, backgroundColor) {
    const container = document.getElementById('color-container');
    container.innerHTML = '';

    // Display colors first
    if (colors.length > 0) {
        colors.forEach(color => {
            const colorItem = createColorItem(color.hex, color.name);
            container.appendChild(colorItem);
        });
    } else {
        container.innerHTML = '<p class="message">No colors found.</p>';
        return;
    }

    // Display background color if available
    if (backgroundColor) {
        const separator = document.createElement('hr');
        separator.className = 'separator';
        container.appendChild(separator);

        const bgColorItem = createColorItem(backgroundColor.hex, backgroundColor.name, true);
        container.appendChild(bgColorItem);
    }
}

function createColorItem(hex, name, isBackground = false) {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-item';
    if (isBackground) colorDiv.classList.add('background-color');

    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = hex;

    const colorInfo = document.createElement('div');
    colorInfo.className = 'color-info';

    const colorName = document.createElement('span');
    colorName.className = 'color-name';
    colorName.textContent = isBackground ? 'Background Color' : name;

    const colorHex = document.createElement('span');
    colorHex.className = 'color-hex';
    colorHex.textContent = hex;
    colorHex.addEventListener('click', () => {
        navigator.clipboard.writeText(hex);
        showCopiedMessage(colorHex);
    });

    colorInfo.appendChild(colorName);
    colorInfo.appendChild(colorHex);

    colorDiv.appendChild(colorBox);
    colorDiv.appendChild(colorInfo);

    return colorDiv;
}

function showCopiedMessage(element) {
    const originalText = element.textContent;
    element.textContent = 'Copied!';
    element.classList.add('copied');
    
    setTimeout(() => {
        element.textContent = originalText;
        element.classList.remove('copied');
    }, 1000);
}
