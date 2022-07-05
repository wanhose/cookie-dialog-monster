/**
 * @description Listens to messages
 */

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'HIDE_REPORT_CONFIRMATION':
      hideReportConfirmation();
      break;
    case 'SHOW_REPORT_CONFIRMATION':
      showReportConfirmation();
      break;
    default:
      break;
  }
});

/**
 * @description Report confirmation ID
 */

const REPORT_CONFIRMATION_ID = 'report-confirmation';

/**
 * @description Report confirmation outer HTML
 */

const REPORT_CONFIRMATION_HTML = `
  <div id="${REPORT_CONFIRMATION_ID}">
    <div id="report-confirmation-bar"></div>
    <div id="report-confirmation-content">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="32" width="32">
          <path
            fill="#3dd9eb"
            d="M45,22.5C45,32,36,41,24,41S3,33,3,22.5C3,14.492,14.059,12,24,12S45,14.492,45,22.5z"
          />
          <circle cx="17.5" cy="13.5" r="9.5" fill="#3dd9eb" />
          <circle cx="30.5" cy="13.5" r="9.5" fill="#3dd9eb" />
          <circle cx="17.5" cy="13.5" r="6.5" fill="#fff" />
          <circle cx="30.5" cy="13.5" r="6.5" fill="#fff" />
          <circle cx="18" cy="15" r="2" fill="#34495e" />
          <circle cx="29" cy="13" r="2" fill="#34495e" />
          <path
            fill="#3dd9eb"
            d="M8.118,15.007c0,0-1.91-1.046-4.118-0.007l1.5,1.817c0,0-3.994,1.404-5.486,4.525l3.16-0.632 c0,0-2.149,1.315-2.174,5.284l2.098-1.466c0,0-2.402,3.514-0.126,7.483l1.138-3.362c0,0-0.126,4.475,1.871,7.306l0.657-2.831 c0,0,0.413,3.84,3.413,5.84l-0.303-2.629c0,0,1.702,2.25,4.197,4.542l0.034-1.989L17.011,40L19,33.09L8.118,15.007z"
          />
          <path
            fill="#3dd9eb"
            d="M39.906,15.007c0,0,1.91-1.046,4.118-0.007l-1.5,1.817c0,0,3.994,1.404,5.486,4.525l-3.16-0.632 c0,0,2.149,1.315,2.174,5.284l-2.098-1.466c0,0,2.402,3.514,0.126,7.483l-1.138-3.362c0,0,0.126,4.475-1.871,7.306l-0.657-2.831 c0,0-0.413,3.84-3.413,5.84l0.303-2.629c0,0-1.702,2.25-4.197,4.542l-0.034-1.989L31.013,40l-1.989-6.91L39.906,15.007z"
          />
          <path
            fill="#34495e"
            d="M24,28.5c-5.661,0-12.909-1.736-15.24-4.643l2.34-1.877c1.478,1.842,7.626,3.52,12.9,3.52 c5.231,0,11.363-1.657,12.865-3.477l2.313,1.909C36.819,26.792,29.608,28.5,24,28.5z"
          />
          <path
            fill="#34495e"
            d="M36,25.5C36,31.851,30.075,36,24,36s-12-4.149-12-10.5c0-0.25,6.5,1.5,12,1.5S36,25.25,36,25.5z"
          />
          <path
            fill="#3dd9eb"
            d="M13.978,38.888C13.978,38.888,18,42,20,42l-2-3L13.978,38.888z"
          />
          <path fill="#3dd9eb" d="M34,38.888c0,0-4.022,3.112-6.022,3.112l2-3L34,38.888z" />
          <polygon fill="#3dd9eb" points="19.034,40.472 24,43 29.011,40.404" />
      </svg>
      <span>${chrome.i18n.getMessage('reportText')}</span>
    </div>
  </div>
`;

/**
 * @description Hides report confirmation
 */

function hideReportConfirmation() {
  document.getElementById(REPORT_CONFIRMATION_ID)?.setAttribute('hidden', 'true');
}

/**
 * @description Shows report confirmation
 */

function showReportConfirmation() {
  const element = document.getElementById(REPORT_CONFIRMATION_ID);

  if (element) {
    element.removeAttribute('hidden');
  } else {
    const parser = new DOMParser();
    const result = parser.parseFromString(REPORT_CONFIRMATION_HTML, 'text/html');
    const snackbar = result.body.firstElementChild;

    document.body.appendChild(snackbar);
  }

  setTimeout(() => hideReportConfirmation(), 3750);
}
