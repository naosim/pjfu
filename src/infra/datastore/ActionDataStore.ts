import { Action } from "../../domain/Action.ts";

export interface ActionDataStore {
  updateAction(entity: Action.Entity, callback: (err?: Error) => void): void;
  insertAction(entity: Action.Entity, callback: (err?: Error) => void): void;
  removeAction(id: Action.Id, callback: (err?: Error) => void): void;
}
