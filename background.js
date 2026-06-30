let offscreenDocumentUrl = 'offscreen.html';

async function setupOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenDocumentUrl]
    });

    if (existingContexts.length > 0) return;

    await chrome.offscreen.createDocument({
        url: offscreenDocumentUrl,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Odtwarzanie muzyki w tle ułatwiającej czytanie'
    });
}

async function closeOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenDocumentUrl]
    });

    if (existingContexts.length > 0) {
        await chrome.offscreen.closeDocument();
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'playMusic') {
        chrome.storage.local.get(['isMusicEnabled', 'volume'], async (result) => {
            if (result.isMusicEnabled) {
                chrome.storage.local.set({ lastDetectedMood: request.mood });
                await setupOffscreenDocument();
                chrome.runtime.sendMessage({
                    action: 'offscreenPlayMusic',
                    mood: request.mood,
                    volume: result.volume !== undefined ? result.volume : 0.2
                });
                
                // Prześlij info do popupu jeśli jest otwarty
                chrome.runtime.sendMessage({ action: 'moodDetected', mood: request.mood });
            }
        });
    } else if (request.action === 'toggleMusic') {
        if (!request.isMusicEnabled) {
            chrome.runtime.sendMessage({ action: 'offscreenStopMusic' });
            // Możemy też całkowicie zamknąć offscreen:
            // closeOffscreenDocument();
        }
    } else if (request.action === 'changeVolume') {
        chrome.runtime.sendMessage({ action: 'offscreenSetVolume', volume: request.volume });
    } else if (request.action === 'startPomodoroAlarm') {
        // Oblicz pozostały czas w minutach, by stworzyć alarm
        const now = Date.now();
        const diffMs = request.endTime - now;
        if (diffMs > 0) {
            const delayInMinutes = diffMs / 60000;
            chrome.alarms.create('pomodoroDone', { delayInMinutes });
        }
    } else if (request.action === 'stopPomodoroAlarm') {
        chrome.alarms.clear('pomodoroDone');
    }
});

// Nasłuchuj końca timera Pomodoro
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoroDone') {
        chrome.storage.local.set({ isPomodoroRunning: false });
        
        // Wyślij powiadomienie
        chrome.notifications.create('pomodoroNotify', {
            type: 'basic',
            iconUrl: 'icon_128.png', // Zaktualizowana nazwa po AI
            title: 'Czas minął! (Pomodoro)',
            message: 'Wykonano 25 minut pełnego skupienia. Zrób sobie teraz 5 minutową przerwę.',
            priority: 2
        });
        
        // Opcjonalnie powiadom popup, by zaktualizował UI (jeśli akurat jest otwarty)
        chrome.runtime.sendMessage({ action: 'pomodoroFinished' });
    }
});
