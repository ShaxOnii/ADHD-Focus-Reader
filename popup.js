document.addEventListener('DOMContentLoaded', () => {
    const enableExtension = document.getElementById('enableExtension');
    const radioButtons = document.querySelectorAll('input[name="boldMode"]');
    const enableMusic = document.getElementById('enableMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentMoodSpan = document.querySelector('#currentMood span');

    // Wczytywanie zapisanych ustawień
    chrome.storage.local.get(['isEnabled', 'boldMode', 'isMusicEnabled', 'volume', 'lastDetectedMood'], (result) => {
        enableExtension.checked = result.isEnabled !== false; // Domyślnie włączone
        
        const mode = result.boldMode || 'start';
        document.querySelector(`input[name="boldMode"][value="${mode}"]`).checked = true;
        
        enableMusic.checked = result.isMusicEnabled === true;
        volumeSlider.value = result.volume !== undefined ? result.volume : 0.2;
        
        if (result.lastDetectedMood) {
            currentMoodSpan.textContent = result.lastDetectedMood;
        }
    });

    // Zapisywanie stanu przełącznika
    enableExtension.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ isEnabled });
        sendMessageToContentScript('toggleExtension', { isEnabled });
    });

    // Zapisywanie trybu pogrubiania
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const boldMode = e.target.value;
            chrome.storage.local.set({ boldMode });
            sendMessageToContentScript('changeBoldMode', { boldMode });
        });
    });

    // Zapisywanie ustawień muzyki
    enableMusic.addEventListener('change', (e) => {
        const isMusicEnabled = e.target.checked;
        chrome.storage.local.set({ isMusicEnabled });
        chrome.runtime.sendMessage({ action: 'toggleMusic', isMusicEnabled });
        
        // Zmuś stronę do ponownego skanowania jeśli muzyka została włączona
        if (isMusicEnabled) {
            sendMessageToContentScript('requestScan', {});
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        chrome.storage.local.set({ volume });
        chrome.runtime.sendMessage({ action: 'changeVolume', volume });
    });

    // Nasłuchiwanie na wiadomości o zmianie nastroju
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'moodDetected') {
            currentMoodSpan.textContent = request.mood;
        }
    });

    function sendMessageToContentScript(action, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action, ...data });
            }
        });
    }
});
