export interface KeyValueIO {
  save(key: string, value: string, callback: (err: Error) => void);
  load(key: string, callback: (err: Error, raw: string) => void);
}