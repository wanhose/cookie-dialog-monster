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

    // Remove irritating all removable elements
    removable.forEach(element => {
        const exists = 
            document.getElementById(element.id) 
            || document.getElementsByName(element.name).length > 0 
            || document.getElementsByClassName(element.className).length > 0;

        if (exists) element.remove();
    });

    // Remove irritating styles from elements not removable
    notRemovable.forEach(element => element.style.setProperty('overflow', 'unset', 'important'));
};

// Observer starts observe when call this function
const observe = () => {
    observer.observe(document.body, {
        attributes: true,
    });
};

// Then...
doMagic();
observe();