import { useStorage } from '@plasmohq/storage';

import type { Options, UseOptionsParams, UseOptionsResult } from './types';

export default function useOptions({ hostname }: UseOptionsParams): UseOptionsResult {
  const [options, setOptions] = useStorage<Options | undefined>(hostname);

  return [options ?? { enabled: true }, setOptions];
}
