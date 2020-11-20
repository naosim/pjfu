import { KeyValueIO } from "./KeyValueIO";


export class LocalStrageKeyValueIO implements KeyValueIO {
  constructor(private keyMap: { [key: string]: string; }) {}
  save(key: string, value: string, callback: (err: Error) => void) {
    localStorage.setItem(this.keyMap ? this.keyMap[key] : key, value);
    setTimeout(() => callback(null), 100);
  }
  load(key: string, callback: (err: Error, value: string) => void) {
    const value = localStorage.getItem(this.keyMap ? this.keyMap[key] : key);
    setTimeout(() => callback(null, value), 100);
  }
}