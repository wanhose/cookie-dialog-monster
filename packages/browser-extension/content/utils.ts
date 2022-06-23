import type { BackgroundMessage } from '~background/types';

export type CleanDomParams = {
  selector: string;
};

export function cleanDom({ selector }: CleanDomParams): void {
  const element = document.querySelector(selector);
  element?.remove();
}

export type FixDomParams = {
  classes: string[];
  fixes: string[];
  hostname: string;
  skips: string[];
};

export function fixDom({ classes, fixes, hostname, skips }: FixDomParams): void {
  if (skips.length && !skips.includes(hostname)) {
    for (const item of [document.body, document.documentElement]) {
      item?.classList.remove(...classes);
      item?.style.setProperty('position', 'initial', 'important');
      item?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }

  for (const fix of fixes) {
    const [match, selector, action, property] = fix.split('##');

    if (hostname.includes(match)) {
      switch (action) {
        case 'click': {
          const node: HTMLElement | null = document.querySelector(selector);
          node?.click?.();
          break;
        }
        case 'remove': {
          const node: HTMLElement | null = document.querySelector(selector);
          node?.style?.removeProperty?.(property);
          break;
        }
        case 'reset': {
          const node: HTMLElement | null = document.querySelector(selector);
          node?.style?.setProperty?.(property, 'initial', 'important');
          break;
        }
        case 'resetAll': {
          const nodes: HTMLElement[] = Array.from(document.querySelectorAll(selector));
          nodes.forEach((node) => node?.style?.setProperty?.(property, 'initial', 'important'));
          break;
        }
        default:
          break;
      }
    }
  }
}

export async function backgroundRequest<T>(message: BackgroundMessage): Promise<T> {
  return await chrome.runtime.sendMessage<BackgroundMessage, T>(message);
}
