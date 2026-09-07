/* ============================================================
   UNSUBSCRIBE.JS - Unsubscribe popup logic
   ============================================================ */

import { capitalizeWords, STATE_ABBREVIATIONS } from './utils.js';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxu1Y8rNtdDR_Y23arMLMm8w65zXGRZQDeC5BE9R-4EiWlBFi6YpP4RxLOZYwe_dStEUA/exec';

export function initUnsubscribePopup() {
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    const unsubscribeLink = document.getElementById('unsubscribe-link');
    const popupForm = document.getElementById('unsubscribe-form');
    const popupFirstName = document.getElementById('popup-first-name');
    const popupLastName = document.getElementById('popup-last-name');
    const popupAddress = document.getElementById('popup-address');
    const popupSubmitBtn = document.getElementById('popup-submit-btn');
    const popupBtnBorder = document.getElementById('popupBtnBorder');
    const popupError = document.getElementById('popupError');
    const popupSuccess = document.getElementById('popupSuccess');

    let isPopupSubmitting = false;

    // ----- OPEN POPUP -----
    function openPopup() {
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        popupForm.reset();
        popupError.classList.remove('show');
        popupSuccess.classList.remove('show');
        popupBtnBorder.classList.remove('success', 'disabled');
        popupSubmitBtn.disabled = false;
        popupSubmitBtn.textContent = 'unsubscribe';
    }

    // ----- CLOSE POPUP -----
    function closePopup() {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ----- EVENT LISTENERS -----
    if (unsubscribeLink) {
        unsubscribeLink.addEventListener('click', openPopup);
    }

    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) closePopup();
        });
    }

    // ----- INPUT CAPITALIZATION -----
    function capitalizePopupWords(input) {
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

    if (popupFirstName) {
        popupFirstName.addEventListener('input', function() {
            capitalizePopupWords(this);
        });
    }

    if (popupLastName) {
        popupLastName.addEventListener('input', function() {
            capitalizePopupWords(this);
        });
    }

    if (popupAddress) {
        popupAddress.addEventListener('input', function() {
            capitalizePopupWords(this);
        });
    }

    // ----- POPUP SUBMIT -----
    if (popupForm) {
        popupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (isPopupSubmitting) return;

            const fName = popupFirstName.value.trim();
            const lName = popupLastName.value.trim();
            const addr = popupAddress.value.trim();

            if (!fName || !lName || !addr) {
                popupError.textContent = 'Please fill in all fields.';
                popupError.classList.add('show');
                return;
            }
            popupError.classList.remove('show');

            // Format inputs
            let formattedFName = fName.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');

            let formattedLName = lName.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');

            let words = addr.split(' ');
            let capitalizedWords = words.map(word => {
                if (word.length === 0) return word;
                if (word.length === 2) {
                    let lowerWord = word.toLowerCase();
                    if (STATE_ABBREVIATIONS[lowerWord]) {
                        return STATE_ABBREVIATIONS[lowerWord];
                    }
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            });
            let formattedAddr = capitalizedWords.join(' ');

            isPopupSubmitting = true;
            popupSubmitBtn.disabled = true;
            popupBtnBorder.classList.add('disabled');
            popupSubmitBtn.textContent = 'processing...';

            const formData = {
                firstName: formattedFName,
                lastName: formattedLName,
                address: formattedAddr,
                type: 'unsubscribe'
            };

            fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                .then(() => {
                    isPopupSubmitting = false;
                    popupBtnBorder.classList.remove('disabled');
                    popupBtnBorder.classList.add('success');
                    popupSubmitBtn.textContent = 'unsubscribed';
                    popupSubmitBtn.disabled = true;
                    popupSuccess.classList.add('show');

                    setTimeout(() => {
                        closePopup();
                        popupBtnBorder.classList.remove('success');
                        popupSubmitBtn.disabled = false;
                        popupSubmitBtn.textContent = 'unsubscribe';
                        popupSuccess.classList.remove('show');
                        popupForm.reset();
                    }, 3000);
                })
                .catch((error) => {
                    console.error('Unsubscribe error:', error);
                    isPopupSubmitting = false;
                    popupSubmitBtn.disabled = false;
                    popupBtnBorder.classList.remove('disabled');
                    popupSubmitBtn.textContent = 'unsubscribe';
                    popupError.textContent = 'Something went wrong. Please try again.';
                    popupError.classList.add('show');
                });
        });
    }
}