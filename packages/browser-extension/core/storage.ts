import { Storage } from '@plasmohq/storage';

export type Options = {
  enabled: boolean;
};

export type GetOptionParams = {
  hostname: string;
};

export async function getOptions({ hostname }: GetOptionParams): Promise<Options | undefined> {
  const storage = new Storage();
  const options = await storage.get<Options>(hostname);

  return options ?? { enabled: true };
}

export type setOptionsParams = {
  hostname: string;
  options: Options;
};

export async function setOptions({ hostname, options }: setOptionsParams): Promise<void> {
  const storage = new Storage();
  await storage.set(hostname, options);
}
