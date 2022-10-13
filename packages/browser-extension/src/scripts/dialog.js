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
    <report-dialog-header>
      <span>Cookie Dialog Monster</span>
      <report-dialog-close-button role="button" tabindex="0">
        <svg 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          stroke="currentColor" 
          stroke-width="2" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </report-dialog-close-button>
    </report-dialog-header>
    <report-dialog-body>
      <report-dialog-form-view>
        <report-dialog-body-text>
          ${chrome.i18n.getMessage('reportDialog_bodyText')}
        </report-dialog-body-text>
        <report-dialog-form>
          <report-dialog-radio-group>
            <report-dialog-radio 
              aria-checked="false" 
              data-value="0" role="radio" 
              tabindex="0">
              ${chrome.i18n.getMessage('reportDialog_cannotClickOption')}
            </report-dialog-radio>
            <report-dialog-radio 
              aria-checked="false" 
              data-value="1" 
              role="radio" 
              tabindex="0">
              ${chrome.i18n.getMessage('reportDialog_pageVisualGlitchOption')}
            </report-dialog-radio>
            <report-dialog-radio 
              aria-checked="false" 
              data-value="2" 
              role="radio" 
              tabindex="0">
              ${chrome.i18n.getMessage('reportDialog_blankPageOption')}
            </report-dialog-radio>
            <report-dialog-radio 
              aria-checked="false" 
              data-value="3" 
              role="radio" 
              tabindex="0">
              ${chrome.i18n.getMessage('reportDialog_laggyPageOption')}
            </report-dialog-radio>
            <report-dialog-radio 
              aria-checked="false" 
              data-value="4" 
              role="radio" 
              tabindex="0">
              ${chrome.i18n.getMessage('reportDialog_pageNotRespondingOption')}
            </report-dialog-radio>
            <report-dialog-radio 
              aria-checked="false" 
              data-value="5" 
              role="radio" 
              tabindex="0">
              ${chrome.i18n.getMessage('reportDialog_popupShowUpOption')}
            </report-dialog-radio>
          </report-dialog-radio-group>
          <report-dialog-submit-button aria-disabled="true" role="button" tabindex="0">
            ${chrome.i18n.getMessage('contextMenu_reportOption')?.replace('...', '')}
          </report-dialog-submit-button>
        </report-dialog-form>
      </report-dialog-form-view>
      <report-dialog-submit-view hidden>
        <svg 
          viewBox="0 0 24 24" 
          width="48" 
          height="48" 
          stroke="var(--cookie-dialog-monster-color-success)" 
          stroke-width="2" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <report-dialog-submit-text>
          ${chrome.i18n.getMessage('reportDialog_submitText')}
        </report-dialog-submit-text>
        <report-dialog-submit-extra-text>
          ${chrome.i18n.getMessage('reportDialog_submitExtraText')}
        </report-dialog-submit-extra-text>
      </report-dialog-submit-view>
    </report-dialog-body>
  </dialog>
`;

/**
 * @description Dialog close button click handler
 * @param {MouseEvent} event
 */

const closeButtonClickHandler = (event) => {
  const dialog = document.getElementById(reportDialogId);

  event.preventDefault();
  dialog?.remove();
};

/**
 * @description Hides report dialog
 */

const hideReportDialog = () => {
  document.getElementById(reportDialogId)?.remove();
};

/**
 * @description Dialog radio input click handler
 * @param {MouseEvent} event
 */

const radioClickHandler = (event) => {
  const dialog = document.getElementById(reportDialogId);
  const radios = dialog.getElementsByTagName('report-dialog-radio');
  const submitButton = dialog?.getElementsByTagName('report-dialog-submit-button')[0];

  for (const radio of radios) {
    radio.setAttribute('aria-checked', 'false');
  }

  event.preventDefault();
  event.currentTarget.setAttribute('aria-checked', 'true');
  submitButton.setAttribute('aria-disabled', 'false');
  submitButton.addEventListener('click', submitButtonClickHandler);
};

/**
 * @description Shows report dialog
 */

const showReportDialog = () => {
  const parser = new DOMParser();
  const result = parser.parseFromString(reportDialogHtml, 'text/html');
  const dialog = result.body.firstElementChild;
  const closeButton = dialog.getElementsByTagName('report-dialog-close-button')[0];
  const radios = dialog.getElementsByTagName('report-dialog-radio');

  closeButton.addEventListener('click', closeButtonClickHandler);

  for (const radio of radios) {
    radio.addEventListener('click', radioClickHandler);
  }

  document.body.appendChild(dialog);
  dialog.showModal();
};

/**
 * @description Dialog submit button click handler
 * @param {MouseEvent} event
 */

const submitButtonClickHandler = (event) => {
  const dialog = document.getElementById(reportDialogId);
  const formView = dialog?.getElementsByTagName('report-dialog-form-view')[0];
  const option = dialog?.querySelector('report-dialog-radio[aria-checked="true"]');
  const reasonIndex = option?.dataset.value;
  const reason = Number.isNaN(reasonIndex) ? 'Unknown' : reasons[reasonIndex];
  const submitView = dialog?.getElementsByTagName('report-dialog-submit-view')[0];
  const userAgent = window.navigator.userAgent;

  event.preventDefault();
  dispatch({ userAgent, reason, type: 'REPORT' });
  formView?.setAttribute('hidden', 'true');
  submitView?.removeAttribute('hidden');
};

/**
 * @description Listens to messages
 */

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'HIDE_REPORT_DIALOG':
      hideReportDialog();
      break;
    case 'SHOW_REPORT_DIALOG':
      showReportDialog();
      break;
    default:
      break;
  }
});
