import type { Options } from '~core/storage';

export type { Options };

export type UseOptionsParams = {
  hostname: string;
};

export type UseOptionsResult = [options: Options, setOptions: (newOptions: Options) => void];
