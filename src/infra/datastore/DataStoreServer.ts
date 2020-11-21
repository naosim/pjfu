import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";
import { DataStore } from './DataStore';
import { DataStoreUtils } from './DataStoreUtils';
import { PjfuTextIO } from "./TextIO";

export class DataStoreServer implements DataStore {
  private callCount = 0;
  private list: Objective.Entity[];
  private actions: Action.Entity[];

  constructor(private textIO: PjfuTextIO) {

  }

  findAll(callback: (err: Error, objectives: Objective.Entity[], actions: Action.Entity[]) => void) {
    this.findAllObjective((err, objectives) => {
      if (err) {
        callback(err, null, null);
        return;
      }
      this.findAllAction((err, actions) => {
        if (err) {
          callback(err, null, null);
          return;
        }
        setTimeout(() => callback(null, objectives, actions), 100);
      });
    });
  }

  private findAllObjective(callback: (err: Error, entities: Objective.Entity[]) => void): void {
    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }
    this.textIO.loadObjectives((err:Error, raw:string) => {
      if(err) {
        callback(err, null);
        return;
      }
      if (!raw) {
        raw = JSON.stringify([Objective.Entity.root()].map(v => v.toObject()));
        this.textIO.saveObjectives(raw, (err) => {})
      }
      console.log(raw);
      var now = new Date();
      this.list = JSON.parse(raw).map(v => DataStoreUtils.dataToObjectiveEntity(v, now));
      callback(null, this.list)
    })
  }

  private findAllAction(callback: (err: Error, entities: Action.Entity[]) => void): void {
    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }
    this.textIO.loadActions((err:Error, raw:string) => {
      if(err) {
        callback(err, null);
        return;
      }

      if (!raw) {
        raw = '[]';
        this.textIO.saveActions(raw, (err) => {})
      }
      console.log(raw);
      var now = new Date();
      this.actions = JSON.parse(raw).map(v => DataStoreUtils.dataToActionEntity(v, now));
  
      callback(null, this.actions)
    })
  }

  private saveObjective(callback: (err:Error) => void) {
    const raw = JSON.stringify(this.list.map(v => v.toObject()));
    console.log(raw);
    this.textIO.saveObjectives(raw, callback);
  }

  private saveAction(callback: (err:Error) => void) {
    const raw = JSON.stringify(this.actions.map(v => v.toObject()));
    console.log(raw);
    this.textIO.saveActions(raw, callback);
  }

  updateObjective(entity: Objective.Entity, callback: (err) => void) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id.value == entity.id.value) {
        this.list[i] = entity;
        this.saveObjective(callback);
        return;
      }
    }
    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100);
  }

  updateAction(entity: Action.Entity, callback: (err) => void) {
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].id.value == entity.id.value) {
        this.actions[i] = entity;
        this.saveAction(callback);
        return;
      }
    }
    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100);
  }

  insertObjective(entity: Objective.Entity, callback: (err: Error) => void) {
    this.list.push(entity);
    this.saveObjective(callback);
  }

  insertAction(entity: Action.Entity, callback: (err: Error) => void) {
    this.actions.push(entity);
    this.saveAction(callback);
  }

  removeObjective(id: Objective.Id, callback: (err: Error) => void) {
    this.list = this.list.filter(v => !v.id.eq(id));
    this.saveObjective(callback);
  }

  removeAction(id: Action.Id, callback: (err: Error) => void) {
    this.actions = this.actions.filter(v => !v.id.eq(id));
    this.saveAction(callback);
  }
}
