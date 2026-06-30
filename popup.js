// Słownik tłumaczeń
const i18n = {
    'pl': {
        lblEnable: 'Włącz wtyczkę',
        lblBoldMode: 'Tryb pogrubiania',
        lblModeStart: 'Początek słowa',
        lblModeEnd: 'Koniec słowa',
        lblModeBoth: 'Oba (początek i koniec)',
        lblFontSize: 'Wielkość czcionki',
        lblMusicTitle: 'Muzyka w tle (Focus & Chill)',
        lblMusicEnable: 'Włącz inteligentną muzykę',
        lblVolume: 'Głośność:',
        lblMoodTitle: 'Wykryty nastrój:',
        moodDefault: 'Brak (Oczekiwanie na skan)',
        moodFocus: 'Skupienie (Domyślny)',
        moodFantasy: 'Fantasy',
        moodScience: 'Nauka'
    },
    'en': {
        lblEnable: 'Enable Extension',
        lblBoldMode: 'Bolding Mode',
        lblModeStart: 'Start of word',
        lblModeEnd: 'End of word',
        lblModeBoth: 'Both (start and end)',
        lblFontSize: 'Font Size',
        lblMusicTitle: 'Background Music (Focus & Chill)',
        lblMusicEnable: 'Enable Smart Music',
        lblVolume: 'Volume:',
        lblMoodTitle: 'Detected Mood:',
        moodDefault: 'None (Waiting for scan)',
        moodFocus: 'Focus (Default)',
        moodFantasy: 'Fantasy',
        moodScience: 'Science'
    }
};

let currentLang = 'pl';

function updateUI() {
    const t = i18n[currentLang];
    document.getElementById('lblEnable').textContent = t.lblEnable;
    document.getElementById('lblBoldMode').textContent = t.lblBoldMode;
    document.getElementById('lblModeStart').textContent = t.lblModeStart;
    document.getElementById('lblModeEnd').textContent = t.lblModeEnd;
    document.getElementById('lblModeBoth').textContent = t.lblModeBoth;
    document.getElementById('lblFontSize').textContent = t.lblFontSize;
    document.getElementById('lblMusicTitle').textContent = t.lblMusicTitle;
    document.getElementById('lblMusicEnable').textContent = t.lblMusicEnable;
    document.getElementById('lblVolume').textContent = t.lblVolume;
    document.getElementById('lblMoodTitle').textContent = t.lblMoodTitle;
    
    // Zmiana aktywności guzików
    document.getElementById('langPl').classList.toggle('active', currentLang === 'pl');
    document.getElementById('langEn').classList.toggle('active', currentLang === 'en');
}

document.addEventListener('DOMContentLoaded', () => {
    const enableExtension = document.getElementById('enableExtension');
    const radioButtons = document.querySelectorAll('input[name="boldMode"]');
    const enableMusic = document.getElementById('enableMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const fontSlider = document.getElementById('fontSlider');
    const lblFontValue = document.getElementById('lblFontValue');
    const moodValueSpan = document.getElementById('moodValue');
    
    const langPlBtn = document.getElementById('langPl');
    const langEnBtn = document.getElementById('langEn');

    // Wczytywanie zapisanych ustawień
    chrome.storage.local.get(['isEnabled', 'boldMode', 'isMusicEnabled', 'volume', 'lastDetectedMood', 'fontSize', 'lang'], (result) => {
        currentLang = result.lang || 'pl';
        updateUI();

        enableExtension.checked = result.isEnabled !== false;
        const mode = result.boldMode || 'start';
        document.querySelector(`input[name="boldMode"][value="${mode}"]`).checked = true;
        
        enableMusic.checked = result.isMusicEnabled === true;
        volumeSlider.value = result.volume !== undefined ? result.volume : 0.2;
        
        fontSlider.value = result.fontSize || 100;
        lblFontValue.textContent = fontSlider.value + '%';

        if (result.lastDetectedMood) {
            moodValueSpan.textContent = i18n[currentLang][`mood${result.lastDetectedMood}`] || result.lastDetectedMood;
        } else {
            moodValueSpan.textContent = i18n[currentLang].moodDefault;
        }
    });

    // Zmiana języka
    langPlBtn.addEventListener('click', () => {
        currentLang = 'pl';
        chrome.storage.local.set({ lang: currentLang });
        updateUI();
    });
    langEnBtn.addEventListener('click', () => {
        currentLang = 'en';
        chrome.storage.local.set({ lang: currentLang });
        updateUI();
    });

    // Stan wtyczki
    enableExtension.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ isEnabled });
        sendMessageToContentScript('toggleExtension', { isEnabled });
    });

    // Tryb pogrubiania
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const boldMode = e.target.value;
            chrome.storage.local.set({ boldMode });
            sendMessageToContentScript('changeBoldMode', { boldMode });
        });
    });

    // Zmiana czcionki
    fontSlider.addEventListener('input', (e) => {
        lblFontValue.textContent = e.target.value + '%';
    });
    fontSlider.addEventListener('change', (e) => {
        const fontSize = parseInt(e.target.value);
        chrome.storage.local.set({ fontSize });
        sendMessageToContentScript('changeFontSize', { fontSize });
    });

    // Ustawienia muzyki
    enableMusic.addEventListener('change', (e) => {
        const isMusicEnabled = e.target.checked;
        chrome.storage.local.set({ isMusicEnabled });
        chrome.runtime.sendMessage({ action: 'toggleMusic', isMusicEnabled });
        
        if (isMusicEnabled) {
            sendMessageToContentScript('requestScan', {});
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        chrome.storage.local.set({ volume });
        chrome.runtime.sendMessage({ action: 'changeVolume', volume });
    });

    // Nasłuchiwanie zmian nastroju
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'moodDetected') {
            moodValueSpan.textContent = i18n[currentLang][`mood${request.mood}`] || request.mood;
        }
    });

    function sendMessageToContentScript(action, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action, ...data }).catch(() => {});
            }
        });
    }
});
