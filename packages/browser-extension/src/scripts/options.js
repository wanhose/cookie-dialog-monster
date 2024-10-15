if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Shortcut to send messages to background script
 */
const dispatch = browser.runtime.sendMessage;

/**
 * @description RegExp for matching domains
 */
const domainRegExp = /^(?!-)[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z]{2,})+$/;

/**
 * @description Exclusion list, URLs where the user prefers to disable the extension
 * @type {string[]}
 */
let exclusionList = [];

/**
 * @description Render exclusion items into exclusion list
 * @returns {void}
 */
function createList() {
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
}

/**
 * @async
 * @description Add a new item to the exclusion list
 * @returns {Promise<void>}
 */
async function handleAddClick() {
  const message = browser.i18n.getMessage('options_addPrompt');
  const value = window.prompt(message)?.trim().replace('www.', '');

  if (value && (domainRegExp.test(value) || value === 'localhost')) {
    const filterInputElement = document.getElementById('filter-input');
    const state = { on: false };
    await dispatch({ hostname: value, state, type: 'UPDATE_STORE' });

    exclusionList = [...new Set([...exclusionList, value])].sort();
    createList();
    updateList(filterInputElement.value.trim());
  }
}

/**
 * @async
 * @description Clear all items from the exclusion list
 * @returns {Promise<void>}
 */
async function handleClearClick() {
  const filterInputElement = document.getElementById('filter-input');

  for (const exclusionValue of exclusionList) {
    const state = { on: true };
    await dispatch({ hostname: exclusionValue, state, type: 'UPDATE_STORE' });
  }

  exclusionList = [];
  createList();
  updateList(filterInputElement.value.trim());
}

/**
 * @async
 * @description Setup handlers and items
 */
async function handleContentLoaded() {
  exclusionList = await dispatch({ type: 'GET_EXCLUSION_LIST' });
  createList();

  const addButtonElement = document.getElementById('add-button');
  addButtonElement.addEventListener('click', handleAddClick);

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
}

/**
 * @async
 * @description Delete the clicked element from the exclusion list
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */
async function handleDeleteClick(event) {
  const filterInputElement = document.getElementById('filter-input');
  const { value } = event.currentTarget.parentElement.dataset;
  const itemElement = document.querySelector(`[data-value="${value}"]`);
  const state = { on: true };

  await dispatch({ hostname: value, state, type: 'UPDATE_STORE' });
  exclusionList = exclusionList.filter((exclusionValue) => exclusionValue !== value);
  itemElement?.remove();
  updateList(filterInputElement.value.trim());
}

/**
 * @description Export a file with the current exclusion list
 * @returns {void}
 */
function handleExportClick() {
  const anchor = document.createElement('a');
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.getMonth().toString().padStart(2, '0');
  const year = now.getUTCFullYear();
  const text = exclusionList.join('\n');
  const defaultTitle = `${year}${month}${day}`;
  const customTitle = window.prompt('Enter a file name', defaultTitle);
  const blob = new Blob([text], { type: 'octet/stream' });
  const url = window.URL.createObjectURL(blob);

  anchor.href = url;
  anchor.download = `${customTitle || defaultTitle}.cdm`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

/**
 * @description Process a file and send the updates
 * @param {InputEvent} event
 * @returns {void}
 */
function handleFileChange(event) {
  const file = event.currentTarget.files[0];
  const filterInputElement = document.getElementById('filter-input');
  const reader = new FileReader();

  reader.addEventListener('load', async (event) => {
    const input = event.currentTarget.result.split('\n');
    const exclusions = [];

    for (let value of input) {
      value = value.replace('www.', '');

      if (value && (domainRegExp.test(value) || value === 'localhost')) {
        const state = { on: false };

        await dispatch({ hostname: value, state, type: 'UPDATE_STORE' });
        exclusions.push(value);
      }
    }

    exclusionList = [...new Set([...exclusionList, ...exclusions])].sort();
    createList();
    updateList(filterInputElement.value.trim());
  });

  event.currentTarget.value = '';
  reader.readAsText(file);
}

/**
 * @description Apply filter to the exclusion list when the user presses ENTER key
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleFilterKeyDown(event) {
  if (event.key === 'Enter') {
    const filterValue = event.currentTarget.value.trim();
    updateList(filterValue);
  }
}

/**
 * @description Shallow click an hidden input to open the file explorer
 * @returns {void}
 */
function handleImportClick() {
  const fileInputElement = document.getElementById('file-input');
  fileInputElement.click();
}

/**
 * @description Apply translations to tags with i18n data attribute
 * @returns {void}
 */
function translate() {
  const nodes = document.querySelectorAll('[data-i18n], [data-i18n-placeholder]');

  for (let i = nodes.length; i--; ) {
    const node = nodes[i];
    const { i18n, i18nPlaceholder } = node.dataset;

    if (i18n) {
      node.innerHTML = browser.i18n.getMessage(i18n);
    }

    if (i18nPlaceholder) {
      node.setAttribute('placeholder', browser.i18n.getMessage(i18nPlaceholder));
    }
  }
}

/**
 * @description Update exclusion items in DOM
 * @param {string | undefined} filterValue
 * @returns {void}
 */
function updateList(filterValue) {
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
}

/**
 * @description Listen to document ready
 * @listens document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', handleContentLoaded);
