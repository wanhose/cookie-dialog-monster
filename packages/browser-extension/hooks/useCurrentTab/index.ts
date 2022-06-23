import React from 'react';

import { getCurrentTab } from '~core/tabs';

import type { CurrentTab, UseCurrentTabResult } from './types';

export default function useCurrentTab(): UseCurrentTabResult {
  const [currentTab, setCurrentTab] = React.useState<CurrentTab | undefined>();

  React.useEffect(() => {
    (async () => {
      const nextCurrentTab = await getCurrentTab();
      setCurrentTab(nextCurrentTab);
    })();
  }, [currentTab]);

  return [currentTab];
}
