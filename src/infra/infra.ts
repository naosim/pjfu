import {
  Link,
  MetaData,
  Objective,
  Action,
  EntityIf,
  StringValueObject
} from '../domain/domain'

export class ObjectiveRepositoryImpl {
  private onMemoryObjectiveDataStore: OnMemoryDataStore<Objective.Id, Objective.Entity>
  
  constructor(private dataStore: DataStore) {
    this.onMemoryObjectiveDataStore = new OnMemoryDataStore<Objective.Id, Objective.Entity>(dataStore.findAllObjective());
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
    this.dataStore.isExistObjective(entity.id, (e, v) => {
      if(e) {
        callback(e);
        return;
      }
      if(!v) {
        callback(new Error('entity not found: ' + entity.id.value));
        return;
      }
      this.dataStore.updateObjective(entity, (e) => {
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
    this.dataStore.isExistObjective(entity.id, (e, v) => {
      if(e) {
        callback(e);
        return;
      }
      if(v) {
        throw new Error(`entity already exists: ${entity.id.value}`)
        return;
      }
      this.dataStore.insertObjective(entity, (e) => {
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

export class ActionRepositoryImpl {
  private onMemoryObjectiveDataStore: OnMemoryDataStore<Action.Id, Action.Entity>
  
  constructor(private dataStore: DataStore) {
    this.onMemoryObjectiveDataStore = new OnMemoryDataStore<Action.Id, Action.Entity>(dataStore.findAllAction());
  }

  createId(callback: (err: Error, id: Action.Id) => void): void {
    const num = Math.floor(Date.now() / 1000);
    setTimeout(() => callback(null, Action.Id.create(num)), 100);
  }
  
  findAll(): Action.Entity[] {
    return this.onMemoryObjectiveDataStore.findAll();
  }

  findById(id: Action.Id) {
    return this.onMemoryObjectiveDataStore.findById(id);
  }

  update(entity: Action.Entity, callback:(e)=>void) {
    if(!this.onMemoryObjectiveDataStore.isExist(entity.id)) {
      throw new Error(`entity not found: ${entity.id.value}`)
    }
    this.dataStore.isExistAction(entity.id, (e, v) => {
      if(e) {
        callback(e);
        return;
      }
      if(!v) {
        callback(new Error('entity not found: ' + entity.id.value));
        return;
      }
      this.dataStore.updateAction(entity, (e) => {
        if(e) {
          callback(e);
          return;
        }
        this.onMemoryObjectiveDataStore.update(entity);
        callback(null);
      })
    })
  }

  insert(entity: Action.Entity, callback:(e)=>void) {
    if(this.onMemoryObjectiveDataStore.isExist(entity.id)) {
      throw new Error(`entity already exists: ${entity.id.value}`)
    }
    this.dataStore.isExistAction(entity.id, (e, v) => {
      if(e) {
        callback(e);
        return;
      }
      if(v) {
        throw new Error(`entity already exists: ${entity.id.value}`)
        return;
      }
      this.dataStore.insertAction (entity, (e) => {
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


export class OnMemoryDataStore<I extends StringValueObject, E extends EntityIf<I>> {
  private entityMap: {[key:string]: E}

  constructor(entities: E[]) {
    this.entityMap = {};
    entities.forEach(v => this.entityMap[v.id.value] = v);
  }

  findAll(): E[] {
    return Object.keys(this.entityMap).map(key => this.entityMap[key]);
  }

  findById(id: I): E {
    return this.entityMap[id.value];
  }

  isExist(id:I) {
    return this.entityMap[id.value] ? true : false;
  }

  update(entity: E) {
    if(!this.isExist(entity.id)) {
      throw new Error(`entity not found: ${entity.id.value}`)
    }
    this.entityMap[entity.id.value] = entity;
    console.log('update onMemory');
  }
  insert(entity: E) {
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

  findAllAction(): Action.Entity[] {
    if(this.callCount > 0) {
      throw '2回目の呼出です'
    }
    var raw = localStorage.getItem('actionTree');
    if(!raw) {
      raw = '[]';
      localStorage.setItem('actionTree', raw);
    }
    console.log(raw);

    this.actions = JSON.parse(raw).map(v => DataStore.dataToActionEntity(v))

    return this.actions;
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

  insertObjective(entity: Objective.Entity, callback: (err) => void) {
    this.list.push(entity);
    this.saveObjective();
    callback(null);
  }

  insertAction(entity: Action.Entity, callback: (err) => void) {
    this.actions.push(entity);
    this.saveAction();
    callback(null);
  }

  isExistObjective(id:Objective.Id, callback: (err, value: boolean) => void) {
    for(var i = 0; i < this.list.length; i++) {
      if(this.list[i].id.value == id.value) {
        setTimeout(() => callback(null, true), 100)
        return; 
      }
    }
    setTimeout(() => callback(null, false), 100)
  }

  isExistAction(id:Action.Id, callback: (err, value: boolean) => void) {
    for(var i = 0; i < this.actions.length; i++) {
      if(this.actions[i].id.value == id.value) {
        setTimeout(() => callback(null, true), 100)
        return; 
      }
    }
    setTimeout(() => callback(null, false), 100)
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