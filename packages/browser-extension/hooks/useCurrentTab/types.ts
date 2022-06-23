export type CurrentTab = { hostname?: string; id?: number; url?: string };

export type UseCurrentTabResult = [currentTab: CurrentTab | undefined];
