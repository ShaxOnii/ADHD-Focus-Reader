// === SŁOWNIKI NASTROJÓW ===
const moodDictionaries = {
    'Fantasy': ['smok', 'magia', 'miecz', 'królestwo', 'rycerz', 'czarodziej', 'elf', 'krasnolud', 'zaklęcie', 'potwór', 'zamek'],
    'Nauka': ['badania', 'nauka', 'dane', 'analiza', 'eksperyment', 'teoria', 'kwant', 'kosmos', 'biologia', 'fizyka', 'metoda', 'wyniki']
};

let currentState = {
    isEnabled: true,
    boldMode: 'start',
    isMusicEnabled: false
};

let isProcessed = false;
let currentDetectedMood = 'Skupienie (Domyślny)';

// Filtruje tagi, których nie chcemy modyfikować
const IGNORED_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'SVG', 'IMG'];

// Inicjalizacja
chrome.storage.local.get(['isEnabled', 'boldMode', 'isMusicEnabled'], (result) => {
    currentState.isEnabled = result.isEnabled !== false;
    currentState.boldMode = result.boldMode || 'start';
    currentState.isMusicEnabled = result.isMusicEnabled === true;

    if (currentState.isEnabled) {
        processDocument();
    }
    if (currentState.isMusicEnabled) {
        detectMoodAndPlayMusic();
    }
});

// Nasłuchiwanie zmian z popupu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleExtension') {
        currentState.isEnabled = request.isEnabled;
        if (currentState.isEnabled) {
            processDocument();
        } else {
            revertDocument();
        }
    } else if (request.action === 'changeBoldMode') {
        currentState.boldMode = request.boldMode;
        if (currentState.isEnabled) {
            revertDocument();
            processDocument();
        }
    } else if (request.action === 'requestScan') {
        detectMoodAndPlayMusic();
    }
});

// === LOGIKA POGRUBIANIA (BIONIC READING) ===

function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        // Szukaj słów (pomijając białe znaki)
        if (text.trim().length === 0) return;

        const words = text.split(/(\s+)/); // Dzieli zachowując spacje
        const fragment = document.createDocumentFragment();

        words.forEach(word => {
            if (word.trim().length > 0 && word.length > 1) {
                const span = document.createElement('span');
                span.classList.add('adhd-bionic-word');
                span.innerHTML = applyBionicBold(word, currentState.boldMode);
                fragment.appendChild(span);
            } else {
                fragment.appendChild(document.createTextNode(word));
            }
        });

        const wrapper = document.createElement('span');
        wrapper.classList.add('adhd-bionic-wrapper');
        wrapper.setAttribute('data-original-text', text);
        wrapper.appendChild(fragment);

        node.parentNode.replaceChild(wrapper, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (IGNORED_TAGS.includes(node.tagName) || node.classList.contains('adhd-bionic-wrapper')) {
            return; // Omijamy nagłówki, linki itp.
        }
        // Klonujemy childNodes, bo będziemy je modyfikować w pętli
        Array.from(node.childNodes).forEach(processNode);
    }
}

function applyBionicBold(word, mode) {
    const lettersToBold = Math.ceil(word.length / 2) || 1; // Mniej więcej połowa słowa (lub mądrzejsza logika)
    
    // Uproszczona logika dla testów:
    // Słowa krótkie (1-3) - 1 litera
    // Średnie (4-6) - 2-3 litery
    const boldCount = word.length <= 3 ? 1 : Math.ceil(word.length * 0.4);

    if (mode === 'start') {
        return `<b>${word.substring(0, boldCount)}</b>${word.substring(boldCount)}`;
    } else if (mode === 'end') {
        return `${word.substring(0, word.length - boldCount)}<b>${word.substring(word.length - boldCount)}</b>`;
    } else if (mode === 'both') {
        if (word.length <= 2) return `<b>${word}</b>`;
        const edgeCount = Math.max(1, Math.floor(boldCount / 2));
        return `<b>${word.substring(0, edgeCount)}</b>${word.substring(edgeCount, word.length - edgeCount)}<b>${word.substring(word.length - edgeCount)}</b>`;
    }
    return word;
}

function processDocument() {
    if (isProcessed) return;
    isProcessed = true;
    
    // Zastosuj do całego body
    Array.from(document.body.childNodes).forEach(processNode);
}

function revertDocument() {
    if (!isProcessed) return;
    
    const wrappers = document.querySelectorAll('.adhd-bionic-wrapper');
    wrappers.forEach(wrapper => {
        const originalText = wrapper.getAttribute('data-original-text');
        const textNode = document.createTextNode(originalText);
        wrapper.parentNode.replaceChild(textNode, wrapper);
    });
    
    isProcessed = false;
}

// === LOGIKA DETEKCJI NASTROJU (AI) ===

function detectMoodAndPlayMusic() {
    const textContent = document.body.innerText.toLowerCase();
    
    let scores = {
        'Fantasy': 0,
        'Nauka': 0
    };

    // Zlicz wystąpienia słów kluczowych
    for (const [mood, words] of Object.entries(moodDictionaries)) {
        words.forEach(word => {
            // Proste szukanie z regexem (całe słowa)
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = textContent.match(regex);
            if (matches) {
                scores[mood] += matches.length;
            }
        });
    }

    let detectedMood = 'Skupienie (Domyślny)';
    let maxScore = 0;

    for (const [mood, score] of Object.entries(scores)) {
        // Dodaj próg minimum 2 wystąpień, aby uniknąć przypadków
        if (score > maxScore && score >= 2) {
            maxScore = score;
            detectedMood = mood;
        }
    }

    currentDetectedMood = detectedMood;
    console.log(`[ADHD Focus Reader] Wykryto nastrój: ${detectedMood} (Wynik: ${maxScore})`);

    // Wyślij polecenie do background.js by odtworzył muzykę
    chrome.runtime.sendMessage({
        action: 'playMusic',
        mood: detectedMood
    });
}
