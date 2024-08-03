/**
 * Parse the new fix object into the old string format used by older versions of the extension
 */
export function parseNewFix(fix: Fix): string {
  return `${fix.domain}##${fix.selector}##${fix.action}${fix.property ? `##${fix.property}` : ''}`;
}

export interface Fix {
  readonly action: string;
  readonly domain: string;
  readonly property?: string;
  readonly selector: string;
}
