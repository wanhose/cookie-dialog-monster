export type BackgroundMessage =
  | {
      elements: string[];
      type: 'CHECK_ELEMENTS';
    }
  | {
      type: 'DISABLE_ICON' | 'ENABLE_ICON' | 'ENABLE_POPUP' | 'GET_CURRENT_TAB' | 'GET_DATA';
    }
  | {
      hostname: string;
      type: 'GET_OPTIONS';
    };
