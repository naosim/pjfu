import { Action } from "../domain/Action";
import { Objective } from "../domain/Objective";
import { InMemoryDataStore } from './InMemoryDataStore';
import { ActionDataStore } from "./ActionDataStore";

export class ActionRepositoryImpl implements Action.Repository {
  private inMemoryActionDataStore: InMemoryDataStore<Action.Id, Action.Entity>;
  private parentMap: { [key: string]: Action.Id[]; } = {}; //key:親, value: 子たち

  constructor(private dataStore: ActionDataStore, actions: Action.Entity[]) {
    this.inMemoryActionDataStore = new InMemoryDataStore<Action.Id, Action.Entity>(actions);
    this.onUpdate();
  }

  createId(callback: (err: Error, id: Action.Id) => void): void {
    const num = Math.floor(Date.now() / 1000);
    setTimeout(() => callback(null, Action.Id.create(num)), 100);
  }

  findAll(): Action.Entity[] {
    return this.inMemoryActionDataStore.findAll();
  }

  findById(id: Action.Id) {
    return this.inMemoryActionDataStore.findById(id);
  }

  /**
   * 指定したIDに子要素はあるか？
   * @param parentId 
   */
  hasChildren(parentId: Objective.Id) {
    return this.parentMap[parentId.value] ? true : false;
  }

  findChildren(parentId: Objective.Id): Action.Entity[] {
    return (this.parentMap[parentId.value] || []).map(id => this.findById(id));
  }

  private onUpdate() {
    this.parentMap = {}
    this.findAll().forEach(v => {
      v.parents.forEach(parent => {
        if (!this.parentMap[parent.value]) {
          this.parentMap[parent.value] = [];
        }
        this.parentMap[parent.value].push(v.id);
      });
    });
  }

  update(entity: Action.Entity, callback: (e) => void) {
    if (!this.inMemoryActionDataStore.isExist(entity.id)) {
      throw new Error(`entity not found: ${entity.id.value}`);
    }
    this.dataStore.updateAction(entity, (e) => {
      if (e) {
        callback(e);
        return;
      }
      this.inMemoryActionDataStore.update(entity);
      callback(null);
    });
  }

  insert(entity: Action.Entity, callback: (e) => void) {
    if (this.inMemoryActionDataStore.isExist(entity.id)) {
      throw new Error(`entity already exists: ${entity.id.value}`);
    }
    this.dataStore.insertAction(entity, (e) => {
      if (e) {
        callback(e);
        return;
      }
      this.inMemoryActionDataStore.insert(entity);
      this.onUpdate();
      callback(null);
    });
  }

  remove(id: Action.Id, callback: (e) => void) {
    if (!this.inMemoryActionDataStore.isExist(id)) {
      throw new Error(`entity not found: ${id.value}`);
    }
    this.dataStore.removeAction(id, e => {
      if (e) {
        callback(e);
        return;
      }
      this.inMemoryActionDataStore.remove(id);
      this.onUpdate();
      callback(null);
    });
  }
}
