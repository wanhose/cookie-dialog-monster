import { UNTOUCHABLE_SITES } from './constants.js'
import { getNotRemovableElements, getRemovableElements } from './helpers.js';

// Observer
const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(() => {
        observer.disconnect();
        doMagic();
        observe();
    });
});

// Remover
const doMagic = () => {
    // Getting elements
    const notRemovable = getNotRemovableElements(document)
        .filter(element => !!element);
    const removable = getRemovableElements(document)
        .filter(element => !!element);

    // Fixing main elements
    if (!UNTOUCHABLE_SITES.includes(document.location.host)) {
        document.documentElement.style.setProperty('margin-top', 'unset', 'important');
        document.documentElement.style.setProperty('overflow', 'unset', 'important');
        document.documentElement.style.setProperty('position', 'unset', 'important');
        document.body.style.setProperty('overflow', 'unset', 'important');
    }

    // Remove irritating all removable elements
    removable.forEach(element => {
        const isRemovable = 
            element.tagName.toLowerCase() !== 'body'
            && element.tagName.toLowerCase() !== 'html';

        if (isRemovable) {
            const exists = 
                document.getElementById(element.id) 
                || document.getElementsByName(element.name).length > 0 
                || document.getElementsByClassName(element.className).length > 0;

            if (exists) element.remove();
        }
    });

    // Remove irritating styles from elements not removable
    notRemovable.forEach(element => {
        element.style.setProperty('margin-top', 'unset', 'important');
        element.style.setProperty('overflow', 'unset', 'important');
        element.style.setProperty('padding-top', 'unset', 'important');

        // Miscellaneous
        element.classList.remove('cli-barmodal-open');
        element.classList.remove('cookiesAccepted');
        element.classList.remove('cookiewall-active');
    });
};

// Observer starts observe when call this function
const observe = () => {
    observer.observe(document.body, {
        attributes: true,
        childList: true,
    });
};

// Then...
doMagic();
observe();
