import { Objective } from "../domain/Objective.ts";
import { InMemoryDataStore } from './InMemoryDataStore.ts';
import { ObjectiveDataStore } from "./datastore/ObjectiveDataStore.ts";

export class ObjectiveRepositoryImpl implements Objective.Repository {
  private inMemoryObjectiveDataStore: InMemoryDataStore<Objective.Id, Objective.Entity>;
  private parentMap: { [key: string]: Objective.Id[]; } = {}; //key:親, value: 子たち

  constructor(private dataStore: ObjectiveDataStore, objectives: Objective.Entity[]) {
    this.inMemoryObjectiveDataStore = new InMemoryDataStore<Objective.Id, Objective.Entity>(objectives);
    this.onUpdate();
  }

  createId(callback: (err?: Error, id?: Objective.Id) => void): void {
    const num = Math.floor(Date.now() / 1000);
    setTimeout(() => callback(undefined, Objective.Id.create(num)), 100);
  }

  findAll(): Objective.Entity[] {
    return this.inMemoryObjectiveDataStore.findAll();
  }

  findById(id: Objective.Id): Objective.Entity {
    const result = this.inMemoryObjectiveDataStore.findById(id);
    if(!result) {
      throw new Error('objective not found: ' + id.value);
    }
    return result;
  }

  findParentsTree(rootId: Objective.Id): Objective.Entity[] {
    const parentTrunkList: Objective.Id[] = [];
    const findParentTrunk = (id: Objective.Id) => {
      parentTrunkList.push(id);
      const entity = this.findById(id);
      if(entity.isNotRoot) {
        findParentTrunk(entity.parent!)
      }
    };
    var current = this.findById(rootId);
    if(current.isRoot) {
      return [];
    }
    findParentTrunk(current.parent!);
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
  findByMembers(members: string[]): Objective.Entity[] {
    console.log(members);
    const map:{[key:string]: Objective.Entity} = {}
    var list = this.findAll().filter(v => v.metaData.members.length > 0);// メンバー有りだけにする
    list.forEach(e => e.metaData.members.forEach(m => members.forEach(v => {
      if(m == v) {
        map[e.id.value] = e;
      }
    })))
    return Object.keys(map).map(k => map[k]);
  }
  private onUpdate() {
    this.parentMap = {}
    this.findAll().filter(v => v.parent).forEach(v => {
      if (!this.parentMap[v.parent!.value]) {
        this.parentMap[v.parent!.value] = [];
      }
      this.parentMap[v.parent!.value].push(v.id);
    });
  }

  update(entity: Objective.Entity, callback: (e?:Error) => void) {
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
      callback();
    });
  }

  insert(entity: Objective.Entity, callback: (e?:Error) => void) {
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
      callback();
    });
  }

  remove(id: Objective.Id, callback: (e?:Error) => void) {
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
      callback();
    });
  }
}
