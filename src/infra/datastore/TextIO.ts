import { KeyValueIO } from "./keyvalue/KeyValueIO";

export class PjfuTextIO {
  constructor(private keyValueIo: KeyValueIO) {}
  saveObjectives(raw: string, callback: (err: Error) => void) {
    this.keyValueIo.save(PjfuTextIOType.objectives, raw, callback);
  }
  saveActions(raw: string, callback: (err: Error) => void) {
    this.keyValueIo.save(PjfuTextIOType.actions, raw, callback);
  }
  loadObjectives(callback: (err: Error, raw: string) => void) {
    this.keyValueIo.load(PjfuTextIOType.objectives, callback);
  }
  loadActions(callback: (err: Error, raw: string) => void) {
    this.keyValueIo.load(PjfuTextIOType.actions, callback);
  }
}

enum PjfuTextIOType {
  objectives = 'objectives',
  actions = 'actions'
}


