let creating; // Obietnica dla uniknięcia równoległego tworzenia wielu dokumentów offscreen
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

async function setupOffscreenDocument(path) {
    // Sprawdź czy dokument już istnieje
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
        return;
    }

    // Twórz dokument jeśli nie istnieje
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Odtwarzanie muzyki w tle dopasowanej do kontekstu tekstu'
        });
        await creating;
        creating = null;
    }
}

// Nasłuchiwanie komunikatów z content.js i popup.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'playMusic') {
        const { mood } = message;
        // Zapisz nastrój do local storage, aby popup mógł to odczytać
        chrome.storage.local.set({ lastDetectedMood: mood });
        
        // Poinformuj popup (jeśli jest otwarty) o nowym nastroju
        chrome.runtime.sendMessage({ action: 'moodDetected', mood: mood }).catch(() => {});

        // Najpierw upewnij się, że offscreen dokument istnieje
        await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
        
        // Sprawdź czy muzyka jest w ogóle włączona w ustawieniach
        chrome.storage.local.get(['isMusicEnabled', 'volume'], (result) => {
            if (result.isMusicEnabled) {
                chrome.runtime.sendMessage({
                    action: 'offscreenPlayMusic',
                    mood: mood,
                    volume: result.volume !== undefined ? result.volume : 0.2
                }).catch(() => {});
            }
        });
    } else if (message.action === 'toggleMusic') {
        await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
        if (message.isMusicEnabled) {
             // Wysłanie zapytania do aktywnej karty by przysłała mood
             chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                 if(tabs[0]) {
                     chrome.tabs.sendMessage(tabs[0].id, {action: "requestScan"});
                 }
             });
        } else {
            chrome.runtime.sendMessage({ action: 'offscreenStopMusic' }).catch(() => {});
        }
    } else if (message.action === 'changeVolume') {
        await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
        chrome.runtime.sendMessage({ 
            action: 'offscreenSetVolume', 
            volume: message.volume 
        }).catch(() => {});
    }
});
