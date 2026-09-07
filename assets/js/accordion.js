/* ============================================================
   ACCORDION.JS - Accordion toggle for main page
   ============================================================ */

export function initAccordion() {
    const releasesHeader = document.getElementById('releasesHeader');
    const releasesArrow = document.getElementById('releasesArrow');
    const wheelWrapper = document.getElementById('wheelWrapper');
    const mailingHeader = document.getElementById('mailingHeader');
    const mailingArrow = document.getElementById('mailingArrow');
    const mailingWrapper = document.getElementById('mailingWrapper');
    const contactHeader = document.getElementById('contactHeader');
    const contactArrow = document.getElementById('contactArrow');
    const contactWrapper = document.getElementById('contactWrapper');

    let currentlyOpen = null;
    let openTimer = null;

    function closeSection(wrapper, arrow) {
        if (wrapper) wrapper.classList.remove('expanded');
        if (arrow) arrow.classList.remove('rotated');
    }

    function openSection(wrapper, arrow) {
        if (wrapper) wrapper.classList.add('expanded');
        if (arrow) arrow.classList.add('rotated');
    }

    function toggleSection(targetWrapper, targetArrow, targetName) {
        clearTimeout(openTimer);

        if (currentlyOpen === targetName) {
            closeSection(targetWrapper, targetArrow);
            currentlyOpen = null;
            return;
        }

        if (currentlyOpen === 'releases') {
            closeSection(wheelWrapper, releasesArrow);
        } else if (currentlyOpen === 'mailing') {
            closeSection(mailingWrapper, mailingArrow);
        } else if (currentlyOpen === 'contact') {
            closeSection(contactWrapper, contactArrow);
        }

        openTimer = setTimeout(() => {
            openSection(targetWrapper, targetArrow);
            currentlyOpen = targetName;
            openTimer = null;
        }, 30);
    }

    if (releasesHeader) {
        releasesHeader.addEventListener('click', function(e) {
            toggleSection(wheelWrapper, releasesArrow, 'releases');
        });
    }

    if (mailingHeader) {
        mailingHeader.addEventListener('click', function(e) {
            toggleSection(mailingWrapper, mailingArrow, 'mailing');
        });
    }

    if (contactHeader) {
        contactHeader.addEventListener('click', function(e) {
            toggleSection(contactWrapper, contactArrow, 'contact');
        });
    }
}