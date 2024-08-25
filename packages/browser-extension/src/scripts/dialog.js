if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Report reasons
 * @type {string[]}
 */
const reasons = [
  'Cannot click',
  'Page contains visual glitches',
  'Page is blank',
  'Page is laggy',
  'Page is not responding',
  'Popup showed up',
];

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
          <div class="report-dialog-radio-group">
            <div
              aria-checked="false"
              class="report-dialog-radio"
              data-value="0"
              role="radio"
              tabindex="0"
            >
              ${browser.i18n.getMessage('reportDialog_cannotClickOption')}
            </div>
            <div
              aria-checked="false"
              class="report-dialog-radio"
              data-value="1"
              role="radio"
              tabindex="0"
            >
              ${browser.i18n.getMessage('reportDialog_pageVisualGlitchOption')}
            </div>
            <div
              aria-checked="false"
              class="report-dialog-radio"
              data-value="2"
              role="radio"
              tabindex="0"
            >
              ${browser.i18n.getMessage('reportDialog_blankPageOption')}
            </div>
            <div
              aria-checked="false"
              class="report-dialog-radio"
              data-value="3"
              role="radio"
              tabindex="0"
            >
              ${browser.i18n.getMessage('reportDialog_laggyPageOption')}
            </div>
            <div
              aria-checked="false"
              class="report-dialog-radio"
              data-value="4"
              role="radio"
              tabindex="0"
            >
              ${browser.i18n.getMessage('reportDialog_pageNotRespondingOption')}
            </div>
            <div
              aria-checked="false"
              class="report-dialog-radio"
              data-value="5"
              role="radio"
              tabindex="0"
            >
              ${browser.i18n.getMessage('reportDialog_popupShowUpOption')}
            </div>
          </div>
          <div aria-disabled="true" class="report-dialog-submit-button" role="button" tabindex="0">
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
 * @description Dialog radio input click handler
 * @param {MouseEvent} event
 */
function radioClickHandler(event) {
  const dialog = document.getElementById(reportDialogId);
  const radios = dialog.getElementsByClassName('report-dialog-radio');
  const submitButton = dialog?.getElementsByClassName('report-dialog-submit-button')[0];

  for (const radio of radios) {
    radio.setAttribute('aria-checked', 'false');
  }

  event.preventDefault();
  event.currentTarget.setAttribute('aria-checked', 'true');
  submitButton.setAttribute('aria-disabled', 'false');
  submitButton.addEventListener('click', submitButtonClickHandler);
}

/**
 * @description Show report dialog
 */
function showReportDialog() {
  const existingDialog = document.getElementById(reportDialogId);

  if (existingDialog) {
    existingDialog.showModal();
    return;
  }

  const parser = new DOMParser();
  const result = parser.parseFromString(reportDialogHtml, 'text/html');
  const dialog = result.body.firstElementChild;
  const closeButton = dialog.getElementsByClassName('report-dialog-close-button')[0];
  const link = document.createElement('link');
  const radios = dialog.getElementsByClassName('report-dialog-radio');

  closeButton.addEventListener('click', closeButtonClickHandler);
  link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Inter');
  link.setAttribute('id', 'report-dialog-font');
  link.setAttribute('rel', 'stylesheet');

  for (const radio of radios) {
    radio.addEventListener('click', radioClickHandler);
  }

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
  const target = event.currentTarget;

  if (target.getAttribute('aria-disabled') === 'true') {
    return;
  }

  event.preventDefault();
  target.setAttribute('aria-disabled', 'true');

  const dialog = document.getElementById(reportDialogId);
  const formView = dialog?.getElementsByClassName('report-dialog-form-view')[0];
  const issueButton = dialog?.getElementsByClassName('report-dialog-issue-button')[0];
  const option = dialog?.querySelector('.report-dialog-radio[aria-checked="true"]');
  const reasonIndex = option?.dataset.value;
  const reason = Number.isNaN(reasonIndex) ? 'Unknown' : reasons[reasonIndex];
  const submitView = dialog?.getElementsByClassName('report-dialog-submit-view')[0];
  const userAgent = window.navigator.userAgent;

  const issueUrl = await dispatch({ userAgent, reason, type: 'REPORT' });

  formView?.setAttribute('hidden', 'true');
  issueButton?.addEventListener('click', () => window.open(issueUrl, '_blank'));
  submitView?.removeAttribute('hidden');
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
