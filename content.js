// === SŁOWNIKI NASTROJÓW ===
const moodDictionaries = {
    'Fantasy': ['smok', 'magia', 'miecz', 'królestwo', 'rycerz', 'czarodziej', 'elf', 'krasnolud', 'zaklęcie', 'potwór', 'zamek', 'dragon', 'magic', 'sword'],
    'Science': ['badania', 'nauka', 'dane', 'analiza', 'eksperyment', 'teoria', 'kwant', 'kosmos', 'biologia', 'fizyka', 'metoda', 'wyniki', 'research', 'science'],
    'Tech': ['komputer', 'procesor', 'sztuczna inteligencja', 'serwer', 'sprzęt', 'kod', 'haker', 'programowanie', 'tech', 'software', 'hardware', 'cyber'],
    'Nature': ['las', 'góry', 'ocean', 'podróż', 'przyroda', 'zwierzęta', 'turystyka', 'klimat', 'drzewa', 'nature', 'travel', 'animals', 'earth'],
    'Crime': ['morderstwo', 'policja', 'detektyw', 'śledztwo', 'zbrodnia', 'tajemnica', 'podejrzany', 'krew', 'zabójca', 'crime', 'murder', 'detective', 'mystery'],
    'History': ['wojna', 'król', 'imperium', 'starożytność', 'bitwa', 'armia', 'rewolucja', 'cesarz', 'history', 'war', 'empire', 'ancient', 'king', 'battle'],
    'Lifestyle': ['przepis', 'kuchnia', 'zdrowie', 'relaks', 'trening', 'motywacja', 'codzienność', 'poranek', 'lifestyle', 'health', 'fitness', 'recipe', 'relax', 'morning']
};

let currentState = {
    isEnabled: true,
    boldMode: 'start',
    isMusicEnabled: false,
    fontSize: 100,
    isRulerEnabled: false,
    isProgressEnabled: false,
    isDyslexicEnabled: false,
    pageTheme: 'default'
};

let isProcessed = false;
let currentDetectedMood = 'Focus';

// Filtruje tagi, których nie chcemy modyfikować
const IGNORED_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BUTTON', 'SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'SVG', 'IMG'];

// ELEMENTY UI WSTRZYKIWANE PRZEZ WTYCZKĘ
let rulerEl = null;
let progressEl = null;
let adhdStyleEl = null; // Do czcionki dyslektycznej i motywów

// Inicjalizacja
chrome.storage.local.get([
    'isEnabled', 'boldMode', 'isMusicEnabled', 'fontSize',
    'isRulerEnabled', 'isProgressEnabled', 'isDyslexicEnabled', 'pageTheme'
], (result) => {
    currentState.isEnabled = result.isEnabled !== false;
    currentState.boldMode = result.boldMode || 'start';
    currentState.isMusicEnabled = result.isMusicEnabled === true;
    currentState.fontSize = result.fontSize || 100;
    
    currentState.isRulerEnabled = result.isRulerEnabled === true;
    currentState.isProgressEnabled = result.isProgressEnabled === true;
    currentState.isDyslexicEnabled = result.isDyslexicEnabled === true;
    currentState.pageTheme = result.pageTheme || 'default';

    if (currentState.isEnabled) processDocument();
    applyFontSize();
    applyThemeAndFont();
    
    if (currentState.isRulerEnabled) enableRuler();
    if (currentState.isProgressEnabled) enableProgressBar();
    if (currentState.isMusicEnabled) detectMoodAndPlayMusic();
});

// Nasłuchiwanie zmian z popupu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'toggleExtension':
            currentState.isEnabled = request.isEnabled;
            currentState.isEnabled ? processDocument() : revertDocument();
            break;
        case 'changeBoldMode':
            currentState.boldMode = request.boldMode;
            if (currentState.isEnabled) { revertDocument(); processDocument(); }
            break;
        case 'changeFontSize':
            currentState.fontSize = request.fontSize;
            applyFontSize();
            break;
        case 'requestScan':
            detectMoodAndPlayMusic();
            break;
        // NOWE FUNKCJE V2
        case 'toggleRuler':
            currentState.isRulerEnabled = request.isEnabled;
            currentState.isRulerEnabled ? enableRuler() : disableRuler();
            break;
        case 'toggleProgress':
            currentState.isProgressEnabled = request.isEnabled;
            currentState.isProgressEnabled ? enableProgressBar() : disableProgressBar();
            break;
        case 'toggleDyslexic':
            currentState.isDyslexicEnabled = request.isEnabled;
            applyThemeAndFont();
            break;
        case 'changeTheme':
            currentState.pageTheme = request.theme;
            applyThemeAndFont();
            break;
    }
});

// === 1. LINIJKA SKUPIENIA (RULER) ===
function onMouseMoveRuler(e) {
    if (!rulerEl) return;
    const y = e.clientY; // Pozycja kursora w viewport
    // Wysokość szpary to np. 100px.
    // Box-shadow służy jako "kurtyna" w górę i w dół.
    rulerEl.style.top = (y - 50) + 'px';
}

function enableRuler() {
    if (!rulerEl) {
        rulerEl = document.createElement('div');
        rulerEl.id = 'adhd-ruler';
        Object.assign(rulerEl.style, {
            position: 'fixed',
            left: '0',
            right: '0',
            height: '100px', // Szerokość "okienka"
            pointerEvents: 'none', // Kliknięcia przechodzą przez linijkę
            zIndex: '999998',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' // Cieniowanie wszystkiego dookoła
        });
        document.body.appendChild(rulerEl);
        document.addEventListener('mousemove', onMouseMoveRuler);
    }
}

function disableRuler() {
    if (rulerEl) {
        document.removeEventListener('mousemove', onMouseMoveRuler);
        rulerEl.remove();
        rulerEl = null;
    }
}

// === 2. PASEK POSTĘPU ===
function onScrollProgress() {
    if (!progressEl) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = document.documentElement.clientHeight;
    
    const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
    progressEl.style.width = scrollPercent + '%';
}

function enableProgressBar() {
    if (!progressEl) {
        progressEl = document.createElement('div');
        progressEl.id = 'adhd-progress-bar';
        Object.assign(progressEl.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            height: '5px',
            width: '0%',
            backgroundColor: '#bd93f9', // Przyjemny fioletowy
            zIndex: '999999',
            transition: 'width 0.1s ease-out'
        });
        document.body.appendChild(progressEl);
        window.addEventListener('scroll', onScrollProgress);
        onScrollProgress(); // inicjalizacja
    }
}

function disableProgressBar() {
    if (progressEl) {
        window.removeEventListener('scroll', onScrollProgress);
        progressEl.remove();
        progressEl = null;
    }
}

// === 3. MOTYW STRONY I CZCIONKA DYSLEKTYCZNA ===
function applyThemeAndFont() {
    if (!adhdStyleEl) {
        adhdStyleEl = document.createElement('style');
        adhdStyleEl.id = 'adhd-theme-style';
        document.head.appendChild(adhdStyleEl);
    }

    let css = '';

    // Czcionka Dyslektyczna
    if (currentState.isDyslexicEnabled) {
        css += `
            * {
                font-family: "Comic Sans MS", "Comic Sans", "OpenDyslexic", sans-serif !important;
                letter-spacing: 0.5px !important;
            }
        `;
    }

    // Motyw
    if (currentState.pageTheme === 'sepia') {
        css += `
            html, body {
                background-color: #f4ecd8 !important;
                color: #5b4636 !important;
            }
            p, span, div, h1, h2, h3, h4, h5, h6, a, li, td {
                background-color: transparent !important;
                color: inherit !important;
            }
        `;
    } else if (currentState.pageTheme === 'dark') {
        css += `
            html, body {
                background-color: #1e1e1e !important;
                color: #e0e0e0 !important;
            }
            p, span, div, h1, h2, h3, h4, h5, h6, a, li, td {
                background-color: transparent !important;
                color: inherit !important;
            }
        `;
    }

    adhdStyleEl.textContent = css;
}

// === 4. LOGIKA WIELKOŚCI CZCIONKI ===
function applyFontSize() {
    let styleEl = document.getElementById('adhd-font-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'adhd-font-style';
        document.head.appendChild(styleEl);
    }
    
    if (currentState.fontSize === 100) {
        styleEl.textContent = '';
    } else {
        styleEl.textContent = `
            .adhd-bionic-wrapper {
                font-size: ${currentState.fontSize}% !important;
                line-height: normal !important;
            }
        `;
    }
}

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

// === LOGIKA DETEKCJI NASTROJU (AI) ===
function detectMoodAndPlayMusic() {
    const textContent = document.body.innerText.toLowerCase();
    
    let scores = { 'Fantasy': 0, 'Science': 0, 'Tech': 0, 'Nature': 0, 'Crime': 0, 'History': 0, 'Lifestyle': 0 };

    for (const [mood, words] of Object.entries(moodDictionaries)) {
        words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = textContent.match(regex);
            if (matches) scores[mood] += matches.length;
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
