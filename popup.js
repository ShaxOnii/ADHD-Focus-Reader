// Słownik tłumaczeń
const i18n = {
    'pl': {
        lblEnable: 'Włącz Bionic Reading',
        lblBoldMode: 'Tryb pogrubiania',
        lblModeStart: 'Początek słowa',
        lblModeEnd: 'Koniec słowa',
        lblModeBoth: 'Oba',
        lblFontSize: 'Wielkość czcionki: ',
        lblMusicTitle: 'Muzyka w tle',
        lblMusicEnable: 'Włącz AI Muzykę',
        lblVolume: 'Głośność:',
        lblMoodTitle: 'Wykryto:',
        moodDefault: 'Brak',
        moodFocus: 'Skupienie (Domyślny)',
        moodFantasy: 'Fantasy',
        moodScience: 'Nauka',
        moodTech: 'Technologia',
        moodNature: 'Natura',
        moodCrime: 'Kryminał',
        moodHistory: 'Historia',
        moodLifestyle: 'Lifestyle',
        lblPomodoroTitle: 'Pomodoro Timer',
        lblPomoMinutes: 'Czas (minuty):',
        lblPomoStatus: 'Zegar pojawi się na stronie.',
        lblFocusTools: 'Narzędzia Skupienia',
        lblRuler: 'Linijka Skupienia',
        lblProgressBar: 'Pasek postępu czytania',
        lblVisuals: 'Wygląd i Oczy',
        lblDyslexic: 'Czcionka dla Dyslektyków',
        lblTheme: 'Motyw strony:',
        optThemeDefault: 'Domyślny',
        optThemeSepia: 'Sepia (Ciepły)',
        optThemeDark: 'Ciemny (Dark Mode)',
        btnStart: 'Start na stronie',
        btnStop: 'Ukryj timer'
    },
    'en': {
        lblEnable: 'Enable Bionic Reading',
        lblBoldMode: 'Bolding Mode',
        lblModeStart: 'Start of word',
        lblModeEnd: 'End of word',
        lblModeBoth: 'Both',
        lblFontSize: 'Font Size: ',
        lblMusicTitle: 'Background Music',
        lblMusicEnable: 'Enable AI Music',
        lblVolume: 'Volume:',
        lblMoodTitle: 'Detected:',
        moodDefault: 'None',
        moodFocus: 'Focus (Default)',
        moodFantasy: 'Fantasy',
        moodScience: 'Science',
        moodTech: 'Technology',
        moodNature: 'Nature',
        moodCrime: 'Crime / Thriller',
        moodHistory: 'History',
        moodLifestyle: 'Lifestyle',
        lblPomodoroTitle: 'Pomodoro Timer',
        lblPomoMinutes: 'Time (minutes):',
        lblPomoStatus: 'Widget will appear on page.',
        lblFocusTools: 'Focus Tools',
        lblRuler: 'Reading Ruler',
        lblProgressBar: 'Reading Progress Bar',
        lblVisuals: 'Visuals & Eyes',
        lblDyslexic: 'Dyslexia Friendly Font',
        lblTheme: 'Page Theme:',
        optThemeDefault: 'Default',
        optThemeSepia: 'Sepia (Warm)',
        optThemeDark: 'Dark Mode',
        btnStart: 'Show Widget',
        btnStop: 'Hide Widget'
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
    document.getElementById('lblFontSize').childNodes[0].textContent = t.lblFontSize;
    document.getElementById('lblMusicTitle').textContent = t.lblMusicTitle;
    document.getElementById('lblMusicEnable').textContent = t.lblMusicEnable;
    document.getElementById('lblVolume').textContent = t.lblVolume;
    document.getElementById('lblMoodTitle').textContent = t.lblMoodTitle;
    
    document.getElementById('lblPomodoroTitle').textContent = t.lblPomodoroTitle;
    document.getElementById('lblPomoMinutes').textContent = t.lblPomoMinutes;
    document.getElementById('lblPomoStatus').textContent = t.lblPomoStatus;
    
    document.getElementById('lblFocusTools').textContent = t.lblFocusTools;
    document.getElementById('lblRuler').textContent = t.lblRuler;
    document.getElementById('lblProgressBar').textContent = t.lblProgressBar;
    document.getElementById('lblVisuals').textContent = t.lblVisuals;
    document.getElementById('lblDyslexic').textContent = t.lblDyslexic;
    document.getElementById('lblTheme').textContent = t.lblTheme;
    document.getElementById('optThemeDefault').textContent = t.optThemeDefault;
    document.getElementById('optThemeSepia').textContent = t.optThemeSepia;
    document.getElementById('optThemeDark').textContent = t.optThemeDark;
    
    document.getElementById('btnPomoStart').textContent = t.btnStart;
    document.getElementById('btnPomoStop').textContent = t.btnStop;

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
    
    const enableRuler = document.getElementById('enableRuler');
    const enableProgressBar = document.getElementById('enableProgressBar');
    const enableDyslexic = document.getElementById('enableDyslexic');
    const themeSelect = document.getElementById('themeSelect');
    
    const pomoMinutesInput = document.getElementById('pomoMinutes');
    const btnPomoStart = document.getElementById('btnPomoStart');
    const btnPomoStop = document.getElementById('btnPomoStop');

    const langPlBtn = document.getElementById('langPl');
    const langEnBtn = document.getElementById('langEn');

    // Wczytywanie stanu
    const keys = [
        'isEnabled', 'boldMode', 'isMusicEnabled', 'volume', 'lastDetectedMood', 
        'fontSize', 'lang', 'pomodoroDuration', 'isPomodoroRunning',
        'isRulerEnabled', 'isProgressEnabled', 'isDyslexicEnabled', 'pageTheme'
    ];

    chrome.storage.local.get(keys, (result) => {
        currentLang = result.lang || 'pl';
        updateUI();

        enableExtension.checked = result.isEnabled !== false;
        const mode = result.boldMode || 'start';
        document.querySelector(`input[name="boldMode"][value="${mode}"]`).checked = true;
        
        fontSlider.value = result.fontSize || 100;
        lblFontValue.textContent = fontSlider.value + '%';

        enableRuler.checked = result.isRulerEnabled === true;
        enableProgressBar.checked = result.isProgressEnabled === true;
        enableDyslexic.checked = result.isDyslexicEnabled === true;
        themeSelect.value = result.pageTheme || 'default';

        enableMusic.checked = result.isMusicEnabled === true;
        volumeSlider.value = result.volume !== undefined ? result.volume : 0.2;
        if (result.lastDetectedMood) {
            moodValueSpan.textContent = i18n[currentLang][`mood${result.lastDetectedMood}`] || result.lastDetectedMood;
        } else {
            moodValueSpan.textContent = i18n[currentLang].moodDefault;
        }

        if (result.pomodoroDuration) {
            pomoMinutesInput.value = result.pomodoroDuration;
        }
    });

    langPlBtn.addEventListener('click', () => { currentLang = 'pl'; chrome.storage.local.set({ lang: currentLang }); updateUI(); });
    langEnBtn.addEventListener('click', () => { currentLang = 'en'; chrome.storage.local.set({ lang: currentLang }); updateUI(); });

    enableExtension.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ isEnabled });
        sendMessageToContentScript('toggleExtension', { isEnabled });
    });

    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const boldMode = e.target.value;
            chrome.storage.local.set({ boldMode });
            sendMessageToContentScript('changeBoldMode', { boldMode });
        });
    });

    fontSlider.addEventListener('input', (e) => { lblFontValue.textContent = e.target.value + '%'; });
    fontSlider.addEventListener('change', (e) => {
        const fontSize = parseInt(e.target.value);
        chrome.storage.local.set({ fontSize });
        sendMessageToContentScript('changeFontSize', { fontSize });
    });

    enableRuler.addEventListener('change', (e) => {
        chrome.storage.local.set({ isRulerEnabled: e.target.checked });
        sendMessageToContentScript('toggleRuler', { isEnabled: e.target.checked });
    });

    enableProgressBar.addEventListener('change', (e) => {
        chrome.storage.local.set({ isProgressEnabled: e.target.checked });
        sendMessageToContentScript('toggleProgress', { isEnabled: e.target.checked });
    });

    enableDyslexic.addEventListener('change', (e) => {
        chrome.storage.local.set({ isDyslexicEnabled: e.target.checked });
        sendMessageToContentScript('toggleDyslexic', { isEnabled: e.target.checked });
    });

    themeSelect.addEventListener('change', (e) => {
        chrome.storage.local.set({ pageTheme: e.target.value });
        sendMessageToContentScript('changeTheme', { theme: e.target.value });
    });

    enableMusic.addEventListener('change', (e) => {
        const isMusicEnabled = e.target.checked;
        chrome.storage.local.set({ isMusicEnabled });
        chrome.runtime.sendMessage({ action: 'toggleMusic', isMusicEnabled });
        if (isMusicEnabled) sendMessageToContentScript('requestScan', {});
    });

    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        chrome.storage.local.set({ volume });
        chrome.runtime.sendMessage({ action: 'changeVolume', volume });
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'moodDetected') {
            moodValueSpan.textContent = i18n[currentLang][`mood${request.mood}`] || request.mood;
        }
    });

    // POMODORO LOGIC V2 (WIDGET ON PAGE)
    btnPomoStart.addEventListener('click', () => {
        let mins = parseInt(pomoMinutesInput.value);
        if (isNaN(mins) || mins < 1) mins = 25;
        
        chrome.storage.local.set({ pomodoroDuration: mins });
        
        const endTime = Date.now() + (mins * 60 * 1000);
        chrome.storage.local.set({ pomodoroEndTime: endTime, isPomodoroRunning: true });
        
        chrome.runtime.sendMessage({ action: 'startPomodoroAlarm', endTime: endTime });
        sendMessageToContentScript('showPomodoroWidget', { endTime: endTime });
    });

    btnPomoStop.addEventListener('click', () => {
        chrome.storage.local.set({ isPomodoroRunning: false, pomodoroEndTime: 0 });
        chrome.runtime.sendMessage({ action: 'stopPomodoroAlarm' });
        sendMessageToContentScript('hidePomodoroWidget', {});
    });

    function sendMessageToContentScript(action, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action, ...data }).catch(() => {});
            }
        });
    }
});
