import {
  Link,
  MetaData,
  Objective,
  Action
} from '../domain/domain'
import { DataStore } from './DataStore';

export class DataStoreImpl implements DataStore {
  private callCount = 0;
  private list: Objective.Entity[];
  private actions: Action.Entity[];

  static dataToObjectiveEntity(v): Objective.Entity {
    return new Objective.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parent ? new Objective.Id(v.parent) : null,
      new MetaData(
        v.metaData.description, 
        v.metaData.members || [], 
        v.metaData.links ? v.metaData.links.map(v => new Link(v.name, v.path)) : [])
    )
  }

  static dataToActionEntity(v): Action.Entity {
    return new Action.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parents.map(v => new Action.Id(v)),
      new MetaData(
        v.metaData.description, 
        v.metaData.members || [], 
        v.metaData.links ? v.metaData.links.map(v => new Link(v.name, v.path)) : [])
    )
  }

  findAll(callback: (err: Error, objectives: Objective.Entity[], actions: Action.Entity[]) => void) {
    this.findAllObjective((err, objectives) => {
      if(err) {
        callback(err, null, null);
        return;
      }
      this.findAllAction((err, actions) => {
        if(err) {
          callback(err, null, null);
          return;
        }
        setTimeout(() => callback(null, objectives, actions), 100);
      })
    })
  }

  private findAllObjective(callback: (err: Error, entities: Objective.Entity[]) => void): void {
    if(this.callCount > 0) {
      throw '2回目の呼出です'
    }
    var raw = localStorage.getItem('objectiveTree');
    if(!raw) {
      raw = JSON.stringify([Objective.Entity.root()].map(v => v.toObject()));
      localStorage.setItem('objectiveTree', raw);
    }
    console.log(raw);

    this.list = JSON.parse(raw).map(v => DataStoreImpl.dataToObjectiveEntity(v))
    setTimeout(() => callback(null, this.list), 100);
  }

  private findAllAction(callback: (err: Error, entities: Action.Entity[]) => void): void {
    if(this.callCount > 0) {
      throw '2回目の呼出です'
    }
    var raw = localStorage.getItem('actionTree');
    if(!raw) {
      raw = '[]';
      localStorage.setItem('actionTree', raw);
    }
    console.log(raw);

    this.actions = JSON.parse(raw).map(v => DataStoreImpl.dataToActionEntity(v))

    setTimeout(() => callback(null, this.actions), 100);
  }

  updateObjective(entity: Objective.Entity, callback: (err) => void) {
    for(var i = 0; i < this.list.length; i++) {
      if(this.list[i].id.value == entity.id.value) {
        this.list[i] = entity;
        this.saveObjective();
        setTimeout(() => callback(null), 100)
        return;
      }
    }
    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100)
  }

  updateAction(entity: Action.Entity, callback: (err) => void) {
    for(var i = 0; i < this.actions.length; i++) {
      if(this.actions[i].id.value == entity.id.value) {
        this.actions[i] = entity;
        this.saveAction();
        setTimeout(() => callback(null), 100)
        return;
      }
    }
    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100)
  }

  insertObjective(entity: Objective.Entity, callback: (err:Error) => void) {
    this.list.push(entity);
    this.saveObjective();
    setTimeout(() => callback(null), 100);
  }

  insertAction(entity: Action.Entity, callback: (err:Error) => void) {
    this.actions.push(entity);
    this.saveAction();
    setTimeout(() => callback(null), 100);
  }

  removeObjective(id: Objective.Id, callback: (err:Error) => void) {
    this.list = this.list.filter(v => !v.id.eq(id))
    this.saveObjective();
    setTimeout(() => callback(null), 100);
  }

  removeAction(id: Action.Id, callback: (err:Error) => void) {
    this.actions = this.actions.filter(v => !v.id.eq(id))
    this.saveAction();
    setTimeout(() => callback(null), 100);
  }

  private saveObjective() {
    const raw = JSON.stringify(this.list.map(v => v.toObject()));
    console.log(raw);
    localStorage.setItem('objectiveTree', raw);
  }

  private saveAction() {
    const raw = JSON.stringify(this.actions.map(v => v.toObject()));
    console.log(raw);
    localStorage.setItem('actionTree', raw);
  }
}




