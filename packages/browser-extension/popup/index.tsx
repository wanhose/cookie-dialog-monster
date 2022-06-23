import '~assets/css/reset.css';
import '~assets/css/fonts.css';
import '~assets/css/popup.css';

import React from 'react';
import { RefreshCw, Send, ThumbsDown, ThumbsUp } from 'react-feather';

import runtime from '~core/runtime';
import { refreshTab } from '~core/tabs';
import useCurrentTab from '~hooks/useCurrentTab';
import useOptions from '~hooks/useOptions';

import type { Rate } from './types';

export default function Popup(): JSX.Element {
  const [currentTab] = useCurrentTab();
  const isChrome = navigator.userAgent.indexOf('Chrome') !== -1;
  const isEdge = navigator.userAgent.indexOf('Edg') !== -1;
  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  const [options, setOptions] = useOptions({ hostname: currentTab?.hostname ?? '' });
  const [rate, setRate] = React.useState<Rate>();
  const [store, setStore] = React.useState<string>('');

  const handlePower = React.useCallback(async () => {
    setOptions({ ...options, enabled: !options?.enabled });
    await refreshTab();
  }, [options, setOptions]);

  const handleRate = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { id } = event.currentTarget;

    if (id === 'like') setRate('positive');
    else if (id === 'unlike') setRate('negative');
    await refreshTab();
  }, []);

  const handleRefresh = React.useCallback(async () => {
    await refreshTab();
  }, []);

  React.useLayoutEffect(() => {
    if (isEdge) setStore(runtime.edgeUrl);
    else if (isChrome) setStore(runtime.chromeUrl);
    else if (isFirefox) setStore(runtime.firefoxUrl);
  }, [isChrome, isEdge, isFirefox]);

  return (
    <>
      <header>
        <h1 className="header-title">{chrome.runtime.getManifest().name}</h1>
        <div className="header-actions">
          <button aria-label="Reload page" id="reload" onClick={handleRefresh}>
            <RefreshCw size={16} />
          </button>
        </div>
      </header>
      <main>
        <label className="switch-label">
          <span>
            <span>{chrome.i18n.getMessage('toggleText')}</span>
            <strong id="host">{currentTab?.hostname}</strong>
          </span>
          <div className="switch">
            <input checked={options?.enabled} id="power" onClick={handlePower} type="checkbox" />
            <span className="slider"></span>
          </div>
        </label>
        <div>
          <div className="rating">
            <span>{chrome.i18n.getMessage('reviewText')}</span>
            <div className="rating-actions">
              <button aria-label="Unlike" id="unlike" onClick={handleRate}>
                <ThumbsDown size={16} />
              </button>
              <button aria-label="Like" id="like" onClick={handleRate}>
                <ThumbsUp size={16} />
              </button>
            </div>
          </div>
          {rate === 'negative' ? (
            <p id="negative">{chrome.i18n.getMessage('negativeText', [runtime.email])}</p>
          ) : null}
          {rate === 'positive' ? (
            <p id="positive">{chrome.i18n.getMessage('positiveText', [store])}</p>
          ) : null}
        </div>
        <div className="help">
          <span>{chrome.i18n.getMessage('helpText')}</span>
          <a href={`mailto:${runtime.email}`} target="_blank" rel="noreferrer">
            <Send size={16} />
          </a>
        </div>
      </main>
      <footer>
        <hr />
        <span
          dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('footerText', undefined) }}
        />
        <a href={`https://github.com/${runtime.author}`} target="_blank" rel="noreferrer">
          {runtime.author}
        </a>
      </footer>
    </>
  );
}
