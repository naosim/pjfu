import {
  Link,
  MetaData,
  Objective
} from '../domain/domain'

export class ObjectiveRepositoryImpl {
  private onMemoryObjectiveDataStore: OnMemoryObjectiveDataStore
  
  constructor(private dataStore: DataStore) {
    this.onMemoryObjectiveDataStore = new OnMemoryObjectiveDataStore(dataStore.findAllObjective());
  }

  createId(callback: (err: Error, id: Objective.Id) => void): void {
    const num = Math.floor(Date.now() / 1000);
    setTimeout(() => callback(null, Objective.Id.create(num)), 100);
  }
  
  findAll(): Objective.Entity[] {
    return this.onMemoryObjectiveDataStore.findAll();
  }

  findById(id: Objective.Id) {
    return this.onMemoryObjectiveDataStore.findById(id);
  }

  findUnder(rootId: Objective.Id) {
    // 全体のツーリを作る
    var map: {[key: string]: Objective.Id[]} = {}; //key:親, value: 子たち
    this.findAll().filter(v => v.parent).forEach(v => {
      if(!map[v.parent.value]) {
        map[v.parent.value] = [];
      }
      map[v.parent.value].push(v.id);
    })
    var getChildren = (rootId: Objective.Id): Objective.Entity[] => {
      var list = [this.findById(rootId)];
      if(!map[rootId.value]) {
        return list;
      }
      map[rootId.value].forEach(ch => getChildren(ch).forEach(v => list.push(v)))
      return list;
    }
    
    return getChildren(rootId);
  }

  update(entity: Objective.Entity, callback:(e)=>void) {
    if(!this.onMemoryObjectiveDataStore.isExist(entity.id)) {
      throw new Error(`entity not found: ${entity.id.value}`)
    }
    this.dataStore.isExist(entity.id, (e, v) => {
      if(e) {
        callback(e);
        return;
      }
      if(!v) {
        callback(new Error('entity not found: ' + entity.id.value));
        return;
      }
      this.dataStore.update(entity, (e) => {
        if(e) {
          callback(e);
          return;
        }
        this.onMemoryObjectiveDataStore.update(entity);
        callback(null);
      })
    })
  }

  insert(entity: Objective.Entity, callback:(e)=>void) {
    if(this.onMemoryObjectiveDataStore.isExist(entity.id)) {
      throw new Error(`entity already exists: ${entity.id.value}`)
    }
    this.dataStore.isExist(entity.id, (e, v) => {
      if(e) {
        callback(e);
        return;
      }
      if(v) {
        throw new Error(`entity already exists: ${entity.id.value}`)
        return;
      }
      this.dataStore.insert(entity, (e) => {
        if(e) {
          callback(e);
          return;
        }
        this.onMemoryObjectiveDataStore.insert(entity);
        callback(null);
      })
    })
  }

}
export class OnMemoryObjectiveDataStore {
  private entityMap: {[key:string]: Objective.Entity}

  constructor(entities: Objective.Entity[]) {
    this.entityMap = {};
    entities.forEach(v => this.entityMap[v.id.value] = v);
  }

  findAll(): Objective.Entity[] {
    return Object.keys(this.entityMap).map(key => this.entityMap[key]);
  }

  findById(id: Objective.Id) {
    return this.entityMap[id.value];
  }

  isExist(id:Objective.Id) {
    return this.entityMap[id.value] ? true : false;
  }

  update(entity: Objective.Entity) {
    if(!this.isExist(entity.id)) {
      throw new Error(`entity not found: ${entity.id.value}`)
    }
    this.entityMap[entity.id.value] = entity;
    console.log('update onMemory');
  }
  insert(entity: Objective.Entity) {
    if(this.isExist(entity.id)) {
      throw new Error(`entity already exists: ${entity.id.value}`)
    }
    this.entityMap[entity.id.value] = entity;
    console.log('insert onMemory');
  }
}

export class DataStore {
  private callCount = 0;
  private list: Objective.Entity[];

  static dataToObjectiveEntity(v): Objective.Entity {
    return new Objective.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parent ? new Objective.Id(v.parent) : null,
      new MetaData(v.metaData.description, v.metaData.members || [], v.metaData.links.map(v => new Link(v.name, v.path) || [])
    )
  }

  findAllObjective(): Objective.Entity[] {
    if(this.callCount > 0) {
      throw '2回目の呼出です'
    }
    var raw = localStorage.getItem('objectiveTree');
    if(!raw) {
      raw = JSON.stringify([Objective.Entity.root()].map(v => v.toObject()));
      localStorage.setItem('objectiveTree', raw);
    }
    console.log(raw);

    this.list = JSON.parse(raw).map(v => DataStore.dataToObjectiveEntity(v))

    return this.list;
  }

  update(entity: Objective.Entity, callback: (err) => void) {
    for(var i = 0; i < this.list.length; i++) {
      if(this.list[i].id.value == entity.id.value) {
        this.list[i] = entity;
        this.save();
        setTimeout(() => callback(null), 100)
        return;
      }
    }
    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100)
  }

  insert(entity: Objective.Entity, callback: (err) => void) {
    this.list.push(entity);
    this.save();
    callback(null);
  }

  isExist(id:Objective.Id, callback: (err, value: boolean) => void) {
    for(var i = 0; i < this.list.length; i++) {
      if(this.list[i].id.value == id.value) {
        setTimeout(() => callback(null, true), 100)
        return; 
      }
    }
    setTimeout(() => callback(null, false), 100)
  }

  private save() {
    const raw = JSON.stringify(this.list.map(v => v.toObject()));
    console.log(raw);
    localStorage.setItem('objectiveTree', raw);
  }

}