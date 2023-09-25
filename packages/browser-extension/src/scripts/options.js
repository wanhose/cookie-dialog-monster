/**
 * @description Shortcut to send messages to background script
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Exclusion list, URLs where the user prefers to disable the extension
 * @type {string[]}
 */

let exclusionList = [];

/**
 * @description Renders exclusion items into exclusion list
 * @returns {void}
 */

const createList = () => {
  const emptyItemElement = document.getElementById('exclusion-list-item-empty');
  const exclusionListElement = document.getElementById('exclusion-list');
  const exclusionListItemTemplateElement = document.getElementById('exclusion-list-item-template');

  Array.from(exclusionListElement.querySelectorAll('[data-value]')).forEach((exclusionItem) => {
    exclusionItem.remove();
  });

  if (exclusionList.length) {
    for (const exclusionValue of exclusionList) {
      const ariaLabelOrTitle = `Delete ${exclusionValue}`;
      const itemElement = exclusionListItemTemplateElement.cloneNode(true);
      const deleteButtonElement = itemElement.getElementsByTagName('button')[0];

      deleteButtonElement.addEventListener('click', handleDeleteClick);
      deleteButtonElement.setAttribute('aria-label', ariaLabelOrTitle);
      deleteButtonElement.setAttribute('title', ariaLabelOrTitle);
      itemElement.removeAttribute('id');
      itemElement.getElementsByTagName('span')[0].innerText = exclusionValue;
      itemElement.setAttribute('data-value', exclusionValue);
      itemElement.style.removeProperty('display');
      exclusionListElement.appendChild(itemElement);
    }
  } else {
    emptyItemElement.innerText = "You don't have any exclusions yet";
    emptyItemElement.style.removeProperty('display');
  }
};

/**
 * @async
 * @description Clear all items from the exclusion list
 * @returns {Promise<void>}
 */

const handleClearClick = async () => {
  const filterInputElement = document.getElementById('filter-input');

  for (const exclusionValue of exclusionList) {
    const state = { enabled: true };
    await dispatch({ hostname: exclusionValue, state, type: 'SET_HOSTNAME_STATE' });
  }

  exclusionList = [];
  createList();
  updateList(filterInputElement.value.trim());
};

/**
 * @async
 * @description Setup handlers and items
 */

const handleContentLoaded = async () => {
  exclusionList = await dispatch({ type: 'GET_EXCLUSION_LIST' });
  createList();

  const clearButtonElement = document.getElementById('clear-button');
  clearButtonElement.addEventListener('click', handleClearClick);

  const exportButtonElement = document.getElementById('export-button');
  exportButtonElement.addEventListener('click', handleExportClick);

  const fileInputElement = document.getElementById('file-input');
  fileInputElement.addEventListener('change', handleFileChange);

  const filterInputElement = document.getElementById('filter-input');
  filterInputElement.addEventListener('keydown', handleFilterKeyDown);

  const importButtonElement = document.getElementById('import-button');
  importButtonElement.addEventListener('click', handleImportClick);

  translate();
};

/**
 * @async
 * @description Deletes the clicked element from the exclusion list
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */

const handleDeleteClick = async (event) => {
  const filterInputElement = document.getElementById('filter-input');
  const { value } = event.currentTarget.parentElement.dataset;
  const state = { enabled: true };

  await dispatch({ hostname: value, state, type: 'SET_HOSTNAME_STATE' });
  exclusionList = exclusionList.filter((exclusionValue) => exclusionValue !== value);
  itemElement.remove();
  updateList(filterInputElement.value.trim());
};

/**
 * @description Exports a file with the current exclusion list
 * @returns {void}
 */

const handleExportClick = () => {
  const anchor = document.createElement('a');
  const text = exclusionList.join('\n');
  const blob = new Blob([text], { type: 'octet/stream' });
  const url = window.URL.createObjectURL(blob);

  anchor.href = url;
  anchor.download = `${new Date().valueOf()}.cdm`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

/**
 * @description Processes a file and sends the updates
 * @param {InputEvent} event
 * @returns {void}
 */

const handleFileChange = (event) => {
  const file = event.currentTarget.files[0];
  const filterInputElement = document.getElementById('filter-input');
  const reader = new FileReader();

  reader.addEventListener('load', async (event) => {
    const newExclusionList = event.currentTarget.result.split('\n').filter((x) => x.trim());

    for (const exclusionValue of newExclusionList) {
      const state = { enabled: false };
      await dispatch({ hostname: exclusionValue, state, type: 'SET_HOSTNAME_STATE' });
    }

    if (newExclusionList.length) {
      exclusionList = [...new Set([...exclusionList, ...newExclusionList])].sort();
      createList();
      updateList(filterInputElement.value.trim());
    }
  });

  event.currentTarget.value = '';
  reader.readAsText(file);
};

/**
 * @description Applies filter to the exclusion list when the user presses ENTER key
 * @param {KeyboardEvent} event
 * @returns {void}
 */

const handleFilterKeyDown = (event) => {
  if (event.key === 'Enter') {
    const filterValue = event.currentTarget.value.trim();
    updateList(filterValue);
  }
};

/**
 * @description Shallow clicks an hidden input to open the file explorer
 * @returns {void}
 */

const handleImportClick = () => {
  const fileInputElement = document.getElementById('file-input');
  fileInputElement.click();
};

/**
 * @description Applies translations to tags with i18n data attribute
 * @returns {void}
 */

const translate = () => {
  const nodes = document.querySelectorAll('[data-i18n]');

  for (let i = nodes.length; i--; ) {
    const node = nodes[i];
    const { i18n, i18nAriaLabel, i18nPlaceholder } = node.dataset;

    if (i18n) {
      node.innerHTML = chrome.i18n.getMessage(i18n);
    }

    if (i18nAriaLabel) {
      node.setAttribute('aria-label', i18nAriaLabel);
    }

    if (i18nPlaceholder) {
      node.setAttribute('placeholder', i18nPlaceholder);
    }
  }
};

/**
 * @description Updates exclusion items in DOM
 * @param {string | undefined} filterValue
 * @returns {void}
 */

const updateList = (filterValue) => {
  const emptyItemElement = document.getElementById('exclusion-list-item-empty');
  const exclusionListElement = document.getElementById('exclusion-list');
  const exclusionListElements = exclusionListElement.querySelectorAll(`[data-value]`);

  if (exclusionListElements.length) {
    let isEmpty = true;
    emptyItemElement.style.setProperty('display', 'none');

    for (const exclusionItemElement of Array.from(exclusionListElements)) {
      if (exclusionItemElement.matches(`[data-value*="${filterValue}"]`) || !filterValue) {
        exclusionItemElement.style.removeProperty('display');
        isEmpty = false;
      } else {
        exclusionItemElement.style.setProperty('display', 'none');
      }
    }

    if (isEmpty) {
      emptyItemElement.innerText = 'No exclusions found';
      emptyItemElement.style.removeProperty('display');
    }
  } else {
    emptyItemElement.innerText = "You don't have any exclusions yet";
    emptyItemElement.style.removeProperty('display');
  }
};

/**
 * @description Listen to document ready
 * @listens document#DOMContentLoaded
 */

document.addEventListener('DOMContentLoaded', handleContentLoaded);
