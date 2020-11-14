import { Objective } from '../domain/domain';
import { InMemoryDataStore } from './InMemoryDataStore';
import { DataStore } from "./DataStore";


export class ObjectiveRepositoryImpl {
  private inMemoryObjectiveDataStore: InMemoryDataStore<Objective.Id, Objective.Entity>;
  private parentMap: { [key: string]: Objective.Id[]; } = {}; //key:親, value: 子たち

  constructor(private dataStore: DataStore) {
    this.inMemoryObjectiveDataStore = new InMemoryDataStore<Objective.Id, Objective.Entity>(dataStore.findAllObjective());
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

  private isExist(id: Objective.Id, callback: (e: Error, v: boolean) => void) {
    this.dataStore.isExistObjective(id, (e, v) => {
    });
    const inMemoryResult = this.inMemoryObjectiveDataStore.isExist(id);

    this.dataStore.isExistObjective(id, (e, v) => {
      if (e) {
        callback(e, null);
        return;
      }
      if (inMemoryResult != v) {
        callback(new Error(`different result: ${id.value}, inmemoy ${inMemoryResult}, server ${v}`), null);
        return;
      }
      callback(null, inMemoryResult);

    });
  }

  update(entity: Objective.Entity, callback: (e) => void) {
    this.isExist(entity.id, (e, v) => {
      if (e) {
        callback(e);
        return;
      }
      if (!v) {
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
    });
  }

  insert(entity: Objective.Entity, callback: (e) => void) {
    this.isExist(entity.id, (e, v) => {
      if (e) {
        callback(e);
        return;
      }
      if (v) {
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
    });
  }

  remove(id: Objective.Id, callback: (e) => void) {
    if (this.parentMap[id.value]) {
      callback(new Error('children already exists'));
    }
    this.isExist(id, (e, v) => {
      if (e) {
        callback(e);
        return;
      }
      if (!v) {
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
    });
  }
}
