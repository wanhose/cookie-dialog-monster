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

/**
 * @description Report dialog ID
 */

const REPORT_DIALOG_ID = 'report-dialog';

/**
 * @description Report dialog outer HTML
 */

const REPORT_DIALOG_HTML = `
  <dialog class="report-dialog" id="${REPORT_DIALOG_ID}">
    <div class="report-dialog-header">
      <span>Cookie Dialog Monster</span>
      <button class="report-dialog-close-button">
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
      </button>
    </div>
    <div class="report-dialog-body">
      <div data-view="form">
        <p class="report-dialog-body-text">
          ${chrome.i18n.getMessage('reportDialog_bodyText')}
        </p>
        <form id="report-dialog-form">
          <label>
            <input name="report-dialog-option" type="radio" value="0" />
            ${chrome.i18n.getMessage('reportDialog_cannotClick')}
          </label>  
          <label>
            <input name="report-dialog-option" type="radio" value="1" />
            ${chrome.i18n.getMessage('reportDialog_pageVisualGlitchOption')}
          </label>
          <label>
            <input name="report-dialog-option" type="radio" value="2" />
            ${chrome.i18n.getMessage('reportDialog_blankPageOption')}
          </label>
          <label>
            <input name="report-dialog-option" type="radio" value="3" />
            ${chrome.i18n.getMessage('reportDialog_laggyPageOption')}
          </label>
          <label>
            <input name="report-dialog-option" type="radio" value="4" />
            ${chrome.i18n.getMessage('reportDialog_pageNotRespondingOption')}
          </label>
          <label>
            <input name="report-dialog-option" type="radio" value="5" />
            ${chrome.i18n.getMessage('reportDialog_popupShowUpOption')}
          </label>
          <button class="report-dialog-submit-button" disabled type="submit">
            ${chrome.i18n.getMessage('contextMenu_reportOption')?.replace('...', '')}
          </button>
        </form>
      </div>
      <div class="report-dialog-submit-view" data-view="submit" hidden>
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
        <p class="report-dialog-submit-text">
          ${chrome.i18n.getMessage('reportDialog_submitText')}
        </p>
        <p class="report-dialog-submit-extra-text">
          ${chrome.i18n.getMessage('reportDialog_submitExtraText')}
        </p>
      </div>
    </div>
  </dialog>
`;

/**
 * @description Hides report dialog
 */

const hideReportDialog = () => {
  document.getElementById(REPORT_DIALOG_ID)?.close();
};

/**
 * @description Shows report dialog
 */

const showReportDialog = () => {
  const element = document.getElementById(REPORT_DIALOG_ID);

  if (element) {
    element.showModal();
  } else {
    const parser = new DOMParser();
    const result = parser.parseFromString(REPORT_DIALOG_HTML, 'text/html');
    const dialog = result.body.firstElementChild;
    const closeButton = dialog.getElementsByClassName('report-dialog-close-button')[0];
    const form = dialog.querySelector('#report-dialog-form');
    const formView = dialog.querySelector('[data-view="form"]');
    const labels = dialog.getElementsByTagName('label');
    const submitButton = dialog.getElementsByClassName('report-dialog-submit-button')[0];
    const submitView = dialog.querySelector('[data-view="submit"]');

    closeButton.addEventListener('click', () => {
      dialog.close();
      formView.removeAttribute('hidden');
      submitView.setAttribute('hidden', 'true');
    });

    form.addEventListener('submit', (event) => {
      const formData = new FormData(form);
      const reasonIndex = Number(formData.get('report-dialog-option'));
      const reason = Number.isNaN(reasonIndex) ? 'Unknown' : reasons[reasonIndex];
      const userAgent = window.navigator.userAgent;

      event.preventDefault();
      dispatch({ userAgent, reason, type: 'REPORT' });
      formView.setAttribute('hidden', 'true');
      submitView.removeAttribute('hidden');
    });

    for (const label of labels) {
      label.addEventListener('click', () => {
        submitButton.removeAttribute('disabled');
      });
    }

    document.body.appendChild(dialog);
    dialog.showModal();
  }
};
