// === SŁOWNIKI NASTROJÓW ===
const moodDictionaries = {
    'Fantasy': ['smok', 'magia', 'miecz', 'królestwo', 'rycerz', 'czarodziej', 'elf', 'krasnolud', 'zaklęcie', 'potwór', 'zamek', 'dragon', 'magic', 'sword'],
    'Science': ['badania', 'nauka', 'dane', 'analiza', 'eksperyment', 'teoria', 'kwant', 'kosmos', 'biologia', 'fizyka', 'metoda', 'wyniki', 'research', 'science']
};

let currentState = {
    isEnabled: true,
    boldMode: 'start',
    isMusicEnabled: false,
    fontSize: 100
};

let isProcessed = false;
let currentDetectedMood = 'Focus';

// Filtruje tagi, których nie chcemy modyfikować
const IGNORED_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'SVG', 'IMG'];

// Inicjalizacja
chrome.storage.local.get(['isEnabled', 'boldMode', 'isMusicEnabled', 'fontSize'], (result) => {
    currentState.isEnabled = result.isEnabled !== false;
    currentState.boldMode = result.boldMode || 'start';
    currentState.isMusicEnabled = result.isMusicEnabled === true;
    currentState.fontSize = result.fontSize || 100;

    if (currentState.isEnabled) {
        processDocument();
    }
    applyFontSize();
    
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
    } else if (request.action === 'changeFontSize') {
        currentState.fontSize = request.fontSize;
        applyFontSize();
    }
});

// === LOGIKA POGRUBIANIA (BIONIC READING) ===

function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (text.trim().length === 0) return;

        const words = text.split(/(\s+)/);
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
            return;
        }
        Array.from(node.childNodes).forEach(processNode);
    }
}

function applyBionicBold(word, mode) {
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

// === LOGIKA WIELKOŚCI CZCIONKI ===

function applyFontSize() {
    // Powiększa tylko bazowy rozmiar na body używając CSS zmiennej lub filtru
    // Najbezpieczniejszym sposobem bez niszczenia układu jest użycie zoom lub modyfikacji HTML font-size
    if (currentState.fontSize === 100) {
        document.body.style.zoom = "1";
        // fallback for Firefox
        document.body.style.transform = "scale(1)";
        document.body.style.transformOrigin = "top left";
    } else {
        const scale = currentState.fontSize / 100;
        document.body.style.zoom = scale;
        // fallback for Firefox
        document.body.style.transform = `scale(${scale})`;
        document.body.style.transformOrigin = "top left";
    }
}

// === LOGIKA DETEKCJI NASTROJU (AI) ===

function detectMoodAndPlayMusic() {
    const textContent = document.body.innerText.toLowerCase();
    
    let scores = {
        'Fantasy': 0,
        'Science': 0
    };

    for (const [mood, words] of Object.entries(moodDictionaries)) {
        words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = textContent.match(regex);
            if (matches) {
                scores[mood] += matches.length;
            }
        });
    }

    let detectedMood = 'Focus';
    let maxScore = 0;

    for (const [mood, score] of Object.entries(scores)) {
        if (score > maxScore && score >= 2) {
            maxScore = score;
            detectedMood = mood;
        }
    }

    currentDetectedMood = detectedMood;
    console.log(`[ADHD Focus Reader] Wykryto nastrój: ${detectedMood} (Wynik: ${maxScore})`);

    chrome.runtime.sendMessage({
        action: 'playMusic',
        mood: detectedMood
    });
}
