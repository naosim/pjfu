import { Action } from "../domain/Action";

export interface ActionDataStore {
  // findAllAction(callback: (err: Error, entities: Action.Entity[]) => void): void;
  updateAction(entity: Action.Entity, callback: (err) => void);
  insertAction(entity: Action.Entity, callback: (err: Error) => void);
  removeAction(id: Action.Id, callback: (err: Error) => void);
}
