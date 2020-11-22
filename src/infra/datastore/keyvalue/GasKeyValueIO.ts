import { KeyValueIO } from "./KeyValueIO.ts";
declare global {
  interface Window {
    google: any;
  }
}

export class GasKeyValueIO implements KeyValueIO {
  save(key: string, value: string, callback: (err?: Error) => void) {
    window.google.script.run.withSuccessHandler((value:any)=> callback()).withFailureHandler((e:any) => callback(e)).saveGasKeyValue(key, value);
  }
  load(key: string, callback: (err?: Error, value?: string) => void) {
    window.google.script.run.withSuccessHandler((value:any)=> callback(undefined, value)).withFailureHandler((e:any) => callback(e)).loadGasKeyValue(key);
  }
}