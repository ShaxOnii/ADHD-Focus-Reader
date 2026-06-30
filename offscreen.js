const audioPlayer = document.getElementById('audioPlayer');

const tracks = {
    'Fantasy': 'assets/audio/fantasy.mp3',
    'Science': 'assets/audio/science.mp3',
    'Tech': 'assets/audio/tech.mp3',
    'Nature': 'assets/audio/nature.mp3',
    'Crime': 'assets/audio/crime.mp3',
    'History': 'assets/audio/history.mp3',
    'Lifestyle': 'assets/audio/lifestyle.mp3',
    'Focus': 'assets/audio/focus.mp3'
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'offscreenPlayMusic') {
        const mood = message.mood;
        const volume = message.volume;
        
        let trackUrl = tracks[mood] || tracks['Focus'];
        console.log("[ADHD Offscreen] Odtwarzam muzykę dla nastroju:", mood, trackUrl);
        
        if (audioPlayer.src !== chrome.runtime.getURL(trackUrl)) {
            audioPlayer.src = chrome.runtime.getURL(trackUrl);
        }
        
        audioPlayer.volume = volume;
        audioPlayer.play().catch(e => console.error("[ADHD Offscreen] Błąd odtwarzania:", e));
    } else if (message.action === 'offscreenStopMusic') {
        console.log("[ADHD Offscreen] Zatrzymano muzykę.");
        audioPlayer.pause();
    } else if (message.action === 'offscreenSetVolume') {
        audioPlayer.volume = message.volume;
    }
});
