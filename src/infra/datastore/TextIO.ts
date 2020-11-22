import { KeyValueIO } from "./keyvalue/KeyValueIO.ts";

export class PjfuTextIO {
  constructor(private keyValueIo: KeyValueIO) {}
  saveObjectives(raw: string, callback: (err?: Error) => void): void {
    this.keyValueIo.save(PjfuTextIOType.objectives, raw, callback);
  }
  saveActions(raw: string, callback: (err?: Error) => void): void {
    this.keyValueIo.save(PjfuTextIOType.actions, raw, callback);
  }
  loadObjectives(callback: (err?: Error, raw?: string) => void): void {
    this.keyValueIo.load(PjfuTextIOType.objectives, callback);
  }
  loadActions(callback: (err?: Error, raw?: string) => void): void {
    this.keyValueIo.load(PjfuTextIOType.actions, callback);
  }
}

enum PjfuTextIOType {
  objectives = 'objectives',
  actions = 'actions'
}


