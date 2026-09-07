/* ============================================================
   FORMS.JS - Form handling logic
   ============================================================ */

import {
    capitalizeWords,
    lowercaseEmail,
    validateName,
    validateEmail,
    validateAddress,
    validateZipCode,
    createStarBurst,
    STATE_ABBREVIATIONS
} from './utils.js';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxu1Y8rNtdDR_Y23arMLMm8w65zXGRZQDeC5BE9R-4EiWlBFi6YpP4RxLOZYwe_dStEUA/exec';

// ----- SET LOADING STATE -----
export function setLoadingState(form, submitBtn, btnBorder, btnText) {
    submitBtn.disabled = true;
    btnBorder.classList.add('disabled');
    btnText.innerHTML = 'sending...';
    form.querySelectorAll('input, textarea').forEach(el => el.disabled = true);
}

// ----- SET SUCCESS STATE -----
export function setSuccessState(form, submitBtn, btnBorder, btnText, starContainer) {
    btnBorder.classList.remove('disabled');
    btnBorder.classList.add('success');
    btnText.innerHTML = 'success!';
    submitBtn.disabled = true;
    form.reset();
    form.querySelectorAll('input, textarea').forEach(el => el.disabled = false);
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.field-error.show').forEach(el => el.classList.remove('show'));
    createStarBurst(starContainer);
}

// ----- SET ERROR STATE -----
export function setErrorState(form, submitBtn, btnBorder, btnText, message) {
    submitBtn.disabled = false;
    btnBorder.classList.remove('disabled');
    btnText.innerHTML = 'sign up';
    form.querySelectorAll('input, textarea').forEach(el => el.disabled = false);

    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'text-align:center;padding:0.75rem;margin-top:1rem;background:#fef0f0;border-radius:6px;border:1px solid #cc0000;color:#cc0000;font-size:0.9rem;';
    errorMsg.textContent = message || 'Something went wrong. Please try again.';

    const existingError = document.querySelector('.fetch-error');
    if (existingError) existingError.remove();
    errorMsg.className = 'fetch-error';
    form.appendChild(errorMsg);

    setTimeout(() => {
        if (errorMsg.parentNode) errorMsg.remove();
    }, 5000);
}

// ----- INIT SIGNUP FORM -----
export function initSignupForm(formId, options = {}) {
    const form = document.getElementById(formId);
    if (!form) return;

    const submitBtn = form.querySelector('#submit-btn');
    const btnText = form.querySelector('#btnText');
    const btnBorder = form.querySelector('#btnBorder');
    const firstName = form.querySelector('#first-name');
    const lastName = form.querySelector('#last-name');
    const email = form.querySelector('#email');
    const address = form.querySelector('#address');
    const starContainer = form.querySelector('#starBurstContainer');

    const firstNameError = form.querySelector('#first-name-error');
    const lastNameError = form.querySelector('#last-name-error');
    const emailError = form.querySelector('#email-error');
    const addressError = form.querySelector('#address-error');
    const zipError = form.querySelector('#zip-error');

    let isSubmitting = false;

    // ----- INPUT EVENTS -----
    firstName.addEventListener('input', function() {
        capitalizeWords(this);
        if (this.value.trim().length > 0) {
            this.classList.remove('error');
            firstNameError.classList.remove('show');
        }
    });
    firstName.addEventListener('blur', function() {
        validateName(this, firstNameError);
    });

    lastName.addEventListener('input', function() {
        capitalizeWords(this);
        if (this.value.trim().length > 0) {
            this.classList.remove('error');
            lastNameError.classList.remove('show');
        }
    });
    lastName.addEventListener('blur', function() {
        validateName(this, lastNameError);
    });

    email.addEventListener('input', function() {
        lowercaseEmail(this);
        const val = this.value.trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            this.classList.remove('error');
            emailError.classList.remove('show');
        }
    });
    email.addEventListener('blur', function() {
        validateEmail(this, emailError);
    });

    address.addEventListener('input', function() {
        capitalizeWords(this);
        if (this.value.trim().length > 5) {
            this.classList.remove('error');
            addressError.classList.remove('show');
            zipError.style.display = 'none';
        }
    });
    address.addEventListener('blur', function() {
        if (this.value.trim().length > 0) {
            const words = this.value.split(' ');
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
            this.value = capitalizedWords.join(' ');
        }
        validateAddress(this, addressError);
        validateZipCode(this, zipError);
    });

    // ----- FORM SUBMIT -----
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (isSubmitting) return;

        // Final formatting
        if (firstName.value.trim().length > 0) {
            firstName.value = firstName.value.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
        }
        if (lastName.value.trim().length > 0) {
            lastName.value = lastName.value.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
        }
        if (email.value.trim().length > 0) {
            email.value = email.value.toLowerCase();
        }
        if (address.value.trim().length > 0) {
            const words = address.value.split(' ');
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
            address.value = capitalizedWords.join(' ');
        }

        // Validate all fields
        const isFirstValid = validateName(firstName, firstNameError);
        const isLastValid = validateName(lastName, lastNameError);
        const isEmailValid = validateEmail(email, emailError);
        const isAddressValid = validateAddress(address, addressError);
        const isZipValid = validateZipCode(address, zipError);

        if (!isFirstValid || !isLastValid || !isEmailValid || !isAddressValid || !isZipValid) {
            if (!isFirstValid) firstName.focus();
            else if (!isLastValid) lastName.focus();
            else if (!isEmailValid) email.focus();
            else if (!isAddressValid || !isZipValid) address.focus();
            return;
        }

        isSubmitting = true;
        setLoadingState(form, submitBtn, btnBorder, btnText);

        const formData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            address: address.value.trim(),
            type: options.formType || 'signup'
        };

        fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(() => {
                isSubmitting = false;
                setSuccessState(form, submitBtn, btnBorder, btnText, starContainer);
            })
            .catch((error) => {
                console.error('Form error:', error);
                isSubmitting = false;
                setErrorState(form, submitBtn, btnBorder, btnText, error.message);
            });
    });
}