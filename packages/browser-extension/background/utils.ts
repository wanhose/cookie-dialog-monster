import type { ContentMessage } from '~content/types';
import runtime from '~core/runtime';

export type CheckElementsParams = {
  nodes: string[];
  selectors: string[];
};

export async function checkElements({ nodes, selectors }: CheckElementsParams): Promise<void> {
  const result: string[] = [];

  for (const node of nodes) {
    const parser = new DOMParser();
    const document = parser.parseFromString(node, 'text/html');

    for (const selector of selectors) {
      const element = document.querySelector(selector) ?? undefined;
      const valid = validateElement({ element });
      if (valid) result.push(selector);
    }
  }

  await contentRequest({ selectors: result, type: 'CLEAN_ELEMENTS' });
}

export type GetDataResult = {
  attributes: string[];
  classes: string[];
  fixes: string[];
  selectors: string[];
  skips: string[];
};

export async function getData(): Promise<GetDataResult> {
  const data = await Promise.all([
    queryData({ key: 'classes' }),
    queryData({ key: 'elements' }),
    queryData({ key: 'fixes' }),
    queryData({ key: 'skips' }),
  ]);

  const result = {
    attributes: [
      ...new Set(
        data[1].elements.flatMap((element) => {
          const attributes = element.match(/(?<=\[)[^(){}[\]]+(?=\])/g);

          return attributes?.length
            ? [
                ...attributes.flatMap((attribute) => {
                  return attribute ? [attribute.replace(/".*"|(=|\^|\*|\$)/g, '')] : [];
                }),
              ]
            : [];
        })
      ),
    ],
    classes: data[0].classes,
    fixes: data[2].fixes,
    selectors: data[1].elements,
    skips: data[3].skips,
  };

  return result;
}

export type QueryDataParams = {
  key: string;
};

export async function queryData({ key }: QueryDataParams): Promise<Record<string, string[]>> {
  try {
    const url = `${runtime.dataUrl}/${key}.txt`;
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    return { [key]: [...new Set(data.split('\n'))] };
  } catch {
    return { [key]: [] };
  }
}

export async function contentRequest<T>(message: ContentMessage): Promise<T> {
  return await chrome.runtime.sendMessage<ContentMessage, T>(message);
}

export type ValidateElementParams = {
  element?: Element;
};

export function validateElement({ element }: ValidateElementParams): boolean {
  return (
    element instanceof HTMLElement &&
    !!element.parentElement &&
    !['BODY', 'HTML'].includes(element.tagName) &&
    !(element.id && ['APP', 'ROOT'].includes(element.id?.toUpperCase?.()))
  );
}
