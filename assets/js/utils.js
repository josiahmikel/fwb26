/* ============================================================
   UTILS.JS - Shared utility functions
   ============================================================ */

// ----- STATE ABBREVIATIONS -----
export const STATE_ABBREVIATIONS = {
    'al': 'AL',
    'ak': 'AK',
    'az': 'AZ',
    'ar': 'AR',
    'ca': 'CA',
    'co': 'CO',
    'ct': 'CT',
    'de': 'DE',
    'fl': 'FL',
    'ga': 'GA',
    'hi': 'HI',
    'id': 'ID',
    'il': 'IL',
    'in': 'IN',
    'ia': 'IA',
    'ks': 'KS',
    'ky': 'KY',
    'la': 'LA',
    'me': 'ME',
    'md': 'MD',
    'ma': 'MA',
    'mi': 'MI',
    'mn': 'MN',
    'ms': 'MS',
    'mo': 'MO',
    'mt': 'MT',
    'ne': 'NE',
    'nv': 'NV',
    'nh': 'NH',
    'nj': 'NJ',
    'nm': 'NM',
    'ny': 'NY',
    'nc': 'NC',
    'nd': 'ND',
    'oh': 'OH',
    'ok': 'OK',
    'or': 'OR',
    'pa': 'PA',
    'ri': 'RI',
    'sc': 'SC',
    'sd': 'SD',
    'tn': 'TN',
    'tx': 'TX',
    'ut': 'UT',
    'vt': 'VT',
    'va': 'VA',
    'wa': 'WA',
    'wv': 'WV',
    'wi': 'WI',
    'wy': 'WY'
};

// ----- NEON COLORS -----
export const NEON_COLORS = ['#ff0040', '#ff4400', '#ffdd00', '#00ff44', '#00ddff', '#cc00ff'];
export const STAR_CHARS = ['★', '✦', '✧'];

// ----- CAPITALIZE WORDS (for address/name inputs) -----
export function capitalizeWords(input) {
    const value = input.value;
    if (!value) return;

    const words = value.split(' ');
    const capitalizedWords = words.map(word => {
        if (word.length === 0) return word;
        if (word.length === 2) {
            const lowerWord = word.toLowerCase();
            if (STATE_ABBREVIATIONS[lowerWord]) {
                return STATE_ABBREVIATIONS[lowerWord];
            }
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    const newValue = capitalizedWords.join(' ');
    if (newValue !== value) {
        const cursorPos = input.selectionStart;
        input.value = newValue;
        const newCursorPos = Math.min(cursorPos, newValue.length);
        input.setSelectionRange(newCursorPos, newCursorPos);
    }
}

// ----- LOWERCASE EMAIL -----
export function lowercaseEmail(input) {
    const value = input.value;
    if (!value) return;
    const newValue = value.toLowerCase();
    if (newValue !== value) {
        const cursorPos = input.selectionStart;
        input.value = newValue;
        const newCursorPos = Math.min(cursorPos, newValue.length);
        input.setSelectionRange(newCursorPos, newCursorPos);
    }
}

// ----- VALIDATE NAME -----
export function validateName(input, errorEl) {
    const val = input.value.trim();
    if (val.length === 0) {
        input.classList.add('error');
        errorEl.classList.add('show');
        return false;
    }
    input.classList.remove('error');
    errorEl.classList.remove('show');
    return true;
}

// ----- VALIDATE EMAIL -----
export function validateEmail(input, errorEl) {
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
        input.classList.add('error');
        errorEl.classList.add('show');
        return false;
    }
    input.classList.remove('error');
    errorEl.classList.remove('show');
    return true;
}

// ----- VALIDATE ADDRESS -----
export function validateAddress(input, errorEl) {
    const val = input.value.trim();
    if (val.length < 5) {
        input.classList.add('error');
        errorEl.classList.add('show');
        return false;
    }
    input.classList.remove('error');
    errorEl.classList.remove('show');
    return true;
}

// ----- VALIDATE ZIP CODE -----
export function validateZipCode(address, zipError) {
    const val = address.value.trim();
    const zipMatch = val.match(/\b\d{5}\b/);
    if (!zipMatch) {
        address.classList.add('error');
        zipError.style.display = 'block';
        return false;
    }
    address.classList.remove('error');
    zipError.style.display = 'none';
    return true;
}

// ----- CREATE STAR BURST -----
export function createStarBurst(container) {
    const numStars = 50;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 160;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        star.style.setProperty('--tx', tx + 'px');
        star.style.setProperty('--ty', ty + 'px');
        star.textContent = STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)];
        star.style.color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        star.style.fontSize = '10px';
        star.style.left = centerX + 'px';
        star.style.top = centerY + 'px';
        star.style.animationDuration = (1 + Math.random() * 0.6) + 's';
        star.style.animationDelay = (Math.random() * 0.2) + 's';
        container.appendChild(star);
    }

    setTimeout(() => {
        container.innerHTML = '';
    }, 2500);
}