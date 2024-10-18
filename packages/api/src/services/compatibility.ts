export function parseAction(action: Action): string {
  return `${action.domain}##${action.selector}##${action.name}${action.property ? `##${action.property}` : ''}`;
}

export function parseActionName(
  action: Action
): Omit<Action, 'name'> & { readonly action: string } {
  const { name, ...rest } = action;

  return { action: name, ...rest };
}

export function toDeclarativeNetRequestRule(urlFilter: string, index: number) {
  return {
    action: {
      type: 'block',
    },
    condition: {
      resourceTypes: ['font', 'image', 'media', 'object', 'script', 'stylesheet', 'xmlhttprequest'],
      urlFilter,
    },
    id: index + 1,
    priority: 1,
  };
}

export interface Action {
  readonly domain: string;
  readonly name: string;
  readonly property?: string;
  readonly selector: string;
}
