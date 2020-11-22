import { KeyValueIO } from "./KeyValueIO.ts";

// declare const localStorage: {
//   setItem: (key:string, value:string) => void,
//   getItem: (key:string) => string
// }

declare global {
  interface Window {
    localStorage: {
        setItem: (key:string, value:string) => void,
        getItem: (key:string) => string
      };
  }
}

export class LocalStrageKeyValueIO implements KeyValueIO {
  constructor(private keyMap?: { [key: string]: string; }) {}
  save(key: string, value: string, callback: (err?: Error) => void) {
    window.localStorage.setItem(this.keyMap ? this.keyMap[key] : key, value);
    setTimeout(() => callback(undefined), 100);
  }
  load(key: string, callback: (err?: Error, value?: string) => void) {
    const value = window.localStorage.getItem(this.keyMap ? this.keyMap[key] : key);
    setTimeout(() => callback(undefined, value), 100);
  }
}