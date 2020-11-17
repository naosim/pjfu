import { Objective } from "../domain/Objective";
import { InMemoryDataStore } from './InMemoryDataStore';
import { ObjectiveDataStore } from "./datastore/ObjectiveDataStore";

export class ObjectiveRepositoryImpl implements Objective.Repository {
  private inMemoryObjectiveDataStore: InMemoryDataStore<Objective.Id, Objective.Entity>;
  private parentMap: { [key: string]: Objective.Id[]; } = {}; //key:親, value: 子たち

  constructor(private dataStore: ObjectiveDataStore, objectives: Objective.Entity[]) {
    this.inMemoryObjectiveDataStore = new InMemoryDataStore<Objective.Id, Objective.Entity>(objectives);
    this.onUpdate();
  }

  createId(callback: (err: Error, id: Objective.Id) => void): void {
    const num = Math.floor(Date.now() / 1000);
    setTimeout(() => callback(null, Objective.Id.create(num)), 100);
  }

  findAll(): Objective.Entity[] {
    return this.inMemoryObjectiveDataStore.findAll();
  }

  findById(id: Objective.Id) {
    return this.inMemoryObjectiveDataStore.findById(id);
  }

  findParentsTree(rootId: Objective.Id): Objective.Entity[] {
    const parentTrunkList: Objective.Id[] = [];
    const findParentTrunk = (id: Objective.Id) => {
      parentTrunkList.push(id);
      const entity = this.findById(id);
      if(entity.isNotRoot) {
        findParentTrunk(entity.parent)
      }
    };
    var current = this.findById(rootId);
    if(current.isRoot) {
      return [];
    }
    findParentTrunk(current.parent);
    var result: Objective.Entity[] = [];
    parentTrunkList.forEach(p => {
      this.parentMap[p.value].forEach(v => result.push(this.findById(v)));
    })
    result.push(this.findById(parentTrunkList[parentTrunkList.length - 1]))
    return result;
  }

  findUnder(rootId: Objective.Id) {
    var getChildren = (rootId: Objective.Id): Objective.Entity[] => {
      var list = [this.findById(rootId)];
      if (!this.parentMap[rootId.value]) {
        return list;
      }
      this.parentMap[rootId.value].forEach(ch => getChildren(ch).forEach(v => list.push(v)));
      return list;
    };

    return getChildren(rootId);
  }

  private onUpdate() {
    this.parentMap = {}
    this.findAll().filter(v => v.parent).forEach(v => {
      if (!this.parentMap[v.parent.value]) {
        this.parentMap[v.parent.value] = [];
      }
      this.parentMap[v.parent.value].push(v.id);
    });
  }

  update(entity: Objective.Entity, callback: (e) => void) {
    if(!this.inMemoryObjectiveDataStore.isExist(entity.id)) {
      callback(new Error('entity not found: ' + entity.id.value));
        return;
    }
    this.dataStore.updateObjective(entity, (e) => {
      if (e) {
        callback(e);
        return;
      }
      this.inMemoryObjectiveDataStore.update(entity);
      this.onUpdate();
      callback(null);
    });
  }

  insert(entity: Objective.Entity, callback: (e) => void) {
    if(this.inMemoryObjectiveDataStore.isExist(entity.id)) {
      callback(new Error('entity already exists: ' + entity.id.value));
        return;
    }
    this.dataStore.insertObjective(entity, (e) => {
      if (e) {
        callback(e);
        return;
      }
      this.inMemoryObjectiveDataStore.insert(entity);
      this.onUpdate();
      callback(null);
    });
  }

  remove(id: Objective.Id, callback: (e) => void) {
    if (this.parentMap[id.value]) {
      callback(new Error('children already exists'));
    }
    if(!this.inMemoryObjectiveDataStore.isExist(id)) {
      callback(new Error('entity not found: ' + id.value));
        return;
    }

    this.dataStore.removeObjective(id, e => {
      if (e) {
        callback(e);
        return;
      }
      this.inMemoryObjectiveDataStore.remove(id);
      this.onUpdate();
      callback(null);
    });
  }
}
