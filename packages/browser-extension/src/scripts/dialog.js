if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Report dialog ID
 */
const reportDialogId = 'report-dialog';

/**
 * @description Report dialog outer HTML
 */
const reportDialogHtml = `
  <dialog id="${reportDialogId}" tabindex="0">
    <div class="report-dialog-header">
      <div class="report-dialog-header-title">Cookie Dialog Monster</div>
      <div class="report-dialog-close-button" role="button" tabindex="0">
        <svg 
          fill="none" 
          height="20" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          stroke-width="2" 
          viewBox="0 0 24 24" 
          width="20" 
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </div>
    <div class="report-dialog-body">
      <div class="report-dialog-form-view">
        <div class="report-dialog-body-text">
          ${browser.i18n.getMessage('reportDialog_bodyText')}
        </div>
        <div class="report-dialog-form">
          <div class="report-dialog-input-group">
            <div class="report-dialog-input-label" id="report-dialog-label-url">
              ${browser.i18n.getMessage('reportDialog_urlInputLabel')}
              <span class="report-dialog-input-label-required">*</span>
            </div>
            <input
              aria-labelledby="report-dialog-label-url"
              aria-required="true"
              class="report-dialog-input"
              id="report-dialog-input-url"
            />
            <div class="report-dialog-input-error" id="report-dialog-input-url-error">
              ${browser.i18n.getMessage('reportDialog_urlInputError')}
            </div>
          </div>
          <div class="report-dialog-input-group">
            <div class="report-dialog-input-label" id="report-dialog-label-reason">
              ${browser.i18n.getMessage('reportDialog_reasonInputLabel')}
              <span class="report-dialog-input-label-required">*</span>
            </div>
            <textarea
              aria-labelledby="report-dialog-label-reason"
              aria-required="true"
              class="report-dialog-input"
              id="report-dialog-input-reason"
              rows="4"
            >${browser.i18n.getMessage('reportDialog_reasonInputPlaceholder')}</textarea>
            <div class="report-dialog-input-error" id="report-dialog-input-reason-error">
              ${browser.i18n.getMessage('reportDialog_reasonInputError')}
            </div>
          </div>
          <div class="report-dialog-submit-button" role="button" tabindex="0">
            ${browser.i18n.getMessage('contextMenu_reportOption')?.replace('...', '')}
          </div>
        </div>
      </div>
      <div class="report-dialog-submit-view" hidden>
        <svg 
          fill="none" 
          height="48" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          stroke-width="2" 
          stroke="var(--cookie-dialog-monster-color-success)" 
          viewBox="0 0 24 24" 
          width="48" 
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div class="report-dialog-submit-text">
          ${browser.i18n.getMessage('reportDialog_submitText')}
        </div>
        <div class="report-dialog-submit-extra-text">
          ${browser.i18n.getMessage('reportDialog_submitExtraText')}
        </div>
        <div class="report-dialog-issue-button" role="button" tabindex="0">
          ${browser.i18n.getMessage('contextMenu_issueOption')}
        </div>
      </div>
    </div>
  </dialog>
`;

/**
 * @description Dialog close button click handler
 * @param {MouseEvent} event
 */
function closeButtonClickHandler(event) {
  const dialog = document.getElementById(reportDialogId);

  event.preventDefault();
  dialog?.remove();
}

/**
 * @description Hide report dialog
 */
function hideReportDialog() {
  document.getElementById(reportDialogId)?.remove();
}

/**
 * @description Input change handler
 * @param {InputEvent} event
 */
function inputChangeHandler(event) {
  event.currentTarget.removeAttribute('aria-invalid');
}

/**
 * @description Input key down handler
 * @param {KeyboardEvent} event
 */
function inputKeyDownHandler(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.currentTarget.blur();
  }
}

/**
 * @description Input paste handler
 * @param {ClipboardEvent} event
 */
function inputPasteHandler(event) {
  event.preventDefault();

  const text = event.clipboardData?.getData('text').replace(/\r?\n|\r/g, ' ');
  const selection = window.getSelection();

  if (selection.rangeCount) {
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
  }
}

/**
 * @description Show report dialog
 */
function showReportDialog() {
  const existingDialog = document.getElementById(reportDialogId);

  if (existingDialog) {
    const submitButton = existingDialog.getElementsByClassName('report-dialog-submit-button')[0];
    const urlInput = existingDialog.querySelector('#report-dialog-input-url');

    existingDialog.showModal();
    submitButton.setAttribute('aria-disabled', 'false');
    urlInput.setAttribute('value', window.location.origin + window.location.pathname);
    return;
  }

  const parser = new DOMParser();
  const result = parser.parseFromString(reportDialogHtml, 'text/html');
  const dialog = result.body.firstElementChild;
  const closeButton = dialog.getElementsByClassName('report-dialog-close-button')[0];
  const link = document.createElement('link');
  const reasonInput = dialog?.querySelector('#report-dialog-input-reason');
  const submitButton = dialog?.getElementsByClassName('report-dialog-submit-button')[0];
  const urlInput = dialog?.querySelector('#report-dialog-input-url');

  closeButton.addEventListener('click', closeButtonClickHandler);
  urlInput.setAttribute('value', window.location.origin + window.location.pathname);
  link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Inter');
  link.setAttribute('id', 'report-dialog-font');
  link.setAttribute('rel', 'stylesheet');
  reasonInput.addEventListener('input', inputChangeHandler);
  reasonInput.addEventListener('keydown', inputKeyDownHandler);
  reasonInput.addEventListener('paste', inputPasteHandler);
  submitButton.addEventListener('click', submitButtonClickHandler);
  urlInput.addEventListener('input', inputChangeHandler);
  urlInput.addEventListener('keydown', inputKeyDownHandler);
  urlInput.addEventListener('paste', inputPasteHandler);

  dispatch({ type: 'INSERT_DIALOG_CSS' });
  document.body.appendChild(dialog);
  document.head.appendChild(link);
  dialog.showModal();
}

/**
 * @description Dialog submit button click handler
 * @param {MouseEvent} event
 */
async function submitButtonClickHandler(event) {
  event.preventDefault();

  if (event.currentTarget.getAttribute('aria-disabled') === 'true') {
    return;
  }

  event.currentTarget.setAttribute('aria-disabled', 'true');

  const dialog = document.getElementById(reportDialogId);
  const reasonInput = dialog?.querySelector('#report-dialog-input-reason');
  const reasonText = reasonInput?.value.trim();
  const urlInput = dialog?.querySelector('#report-dialog-input-url');
  const urlText = urlInput?.value.trim();

  const errors = validateForm({ reason: reasonText, url: urlText });

  if (errors) {
    if (errors.reason) {
      reasonInput?.setAttribute('aria-invalid', 'true');
      reasonInput?.setAttribute('aria-errormessage', 'report-dialog-input-reason-error');
    }

    if (errors.url) {
      urlInput?.setAttribute('aria-invalid', 'true');
      urlInput?.setAttribute('aria-errormessage', 'report-dialog-input-url-error');
    }

    event.currentTarget.setAttribute('aria-disabled', 'false');
    return;
  }

  const formView = dialog?.getElementsByClassName('report-dialog-form-view')[0];
  const issueButton = dialog?.getElementsByClassName('report-dialog-issue-button')[0];
  const submitView = dialog?.getElementsByClassName('report-dialog-submit-view')[0];
  const userAgent = window.navigator.userAgent;
  const issueUrl = await dispatch({ userAgent, reason: reasonText, url: urlText, type: 'REPORT' });

  formView?.setAttribute('hidden', 'true');
  issueButton?.addEventListener('click', () => window.open(issueUrl, '_blank'));
  submitView?.removeAttribute('hidden');
}

/**
 * @description Validate form
 * @param {{ reason: string | undefined | undefined, url: string | undefined }} params
 * @returns {{ reason: string | undefined, url: string | undefined } | undefined}
 */
function validateForm(params) {
  const { reason, url } = params;
  let errors = undefined;

  if (!reason || reason.length < 10 || reason.length > 1000) {
    errors = {
      ...(errors ?? {}),
      reason: browser.i18n.getMessage('reportDialog_reasonInputError'),
    };
  }

  try {
    new URL(url);
  } catch {
    errors = {
      ...(errors ?? {}),
      url: browser.i18n.getMessage('reportDialog_urlInputError'),
    };
  }

  return errors;
}

/**
 * @description Listen to messages
 */
browser.runtime.onMessage.addListener((message) => {
  const isPage = window === window.top;

  switch (message.type) {
    case 'HIDE_REPORT_DIALOG':
      if (isPage) hideReportDialog();
      break;
    case 'SHOW_REPORT_DIALOG':
      if (isPage) showReportDialog();
      break;
    default:
      break;
  }
});
