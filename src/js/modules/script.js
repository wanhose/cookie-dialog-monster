import { notRemovable, removable } from 'js/modules/elements.js';

// Observer
const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            observer.disconnect();
            doMagic();
            observe();
        }
    });
});

// Remover
const doMagic = () => {
    // Remove irritating styles
    notRemovable.forEach(element => {
        // PLO
        element.classList.remove("plu-no-scroll");
        // Quantcast
        element.classList.remove("qc-cmp-ui-showing");
        // Miscellaneous
        element.classList.remove("_2LLC6zrbk-vsnF0seit6vi");
        element.classList.remove("gdpr");
        element.classList.remove("noScroll");
    });

    // Remove irritating elements
    removable.forEach(element => !!element && element.remove());

    // Fix stucked pages
    if (document.body.style) {
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("overflowX");
        document.body.style.removeProperty("overflowY");
    };
};

// Observer starts observe when call this function
const observe = () => {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        //...
    });
};

// Then...
doMagic();
observe();