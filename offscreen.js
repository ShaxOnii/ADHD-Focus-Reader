const audioPlayer = document.getElementById('audioPlayer');

// Ścieżki do przykładowych plików audio wewnątrz wtyczki
// Zostaną one pobrane w kolejnym kroku
const tracks = {
    'Fantasy': 'assets/audio/fantasy.mp3',
    'Nauka': 'assets/audio/science.mp3',
    'Skupienie (Domyślny)': 'assets/audio/focus.mp3'
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'offscreenPlayMusic') {
        const mood = message.mood;
        const volume = message.volume;
        
        let trackUrl = tracks[mood] || tracks['Skupienie (Domyślny)'];
        
        if (audioPlayer.src !== chrome.runtime.getURL(trackUrl)) {
            audioPlayer.src = chrome.runtime.getURL(trackUrl);
        }
        
        audioPlayer.volume = volume;
        audioPlayer.play().catch(e => console.error("Błąd odtwarzania:", e));
    } else if (message.action === 'offscreenStopMusic') {
        audioPlayer.pause();
    } else if (message.action === 'offscreenSetVolume') {
        audioPlayer.volume = message.volume;
    }
});
