import type { IResult as UAParserResult } from 'ua-parser-js';

export function formatMessage(params: FormatMessageParams): string {
  const { reason = '-', ua, url, version } = params;

  return [
    '## Issue information',
    ...(ua.browser.name && ua.browser.version
      ? ['#### 🖥️ Browser', `${ua.browser.name} (${ua.browser.version})`]
      : []),
    ...(ua.device.type && ua.device.vendor
      ? ['#### 📱 Device', `${ua.device.vendor} (${ua.device.type})`]
      : []),
    '#### 📝 Reason',
    reason,
    '#### 🔗 URL',
    url,
    '#### 🏷️ Version',
    version,
  ].join('\n');
}

export interface FormatMessageParams {
  readonly reason?: string;
  readonly ua: UAParserResult;
  readonly url: string;
  readonly version: string;
}
