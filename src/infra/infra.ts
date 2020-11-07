import {Objective} from '../domain/domain'

export class ObjectiveRepositoryImpl {
  private entities: Objective.Entity[]
  private entityMap: {[key:string]: Objective.Entity}
  
  constructor(private dataStore: DataStore) {
  }
  
  findAll(): Objective.Entity[] {
    if(!this.entities) {
      this.entities = this.dataStore.findAllObjective();
      this.entityMap = {};
      this.entities.forEach(v => this.entityMap[v.id.value] = v);
    }
    return this.entities;
  }

  findById(id: Objective.Id) {
    return this.entityMap[id.value];
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

}

export class DataStore {
  private callCount = 0;
  findAllObjective(): Objective.Entity[] {
    if(this.callCount > 0) {
      throw '2回目の呼出です'
    }
    var root = Objective.Entity.root();
    var num = 1;
    return [
      root,
      new Objective.Entity(
        Objective.Id.create(1),
        '大目標',
        root.id
      ),
      new Objective.Entity(
        Objective.Id.create(2),
        '中目標1',
        Objective.Id.create(1)
      ),
      new Objective.Entity(
        Objective.Id.create(3),
        '中目標2',
        Objective.Id.create(1)
      ),
      new Objective.Entity(
        Objective.Id.create(4),
        '小目標1',
        Objective.Id.create(2)
      ),
      new Objective.Entity(
        Objective.Id.create(5),
        '小目標2',
        Objective.Id.create(2)
      ),
      new Objective.Entity(
        Objective.Id.create(6),
        '小目標3',
        Objective.Id.create(3)
      ),
      new Objective.Entity(
        Objective.Id.create(7),
        '小目標4',
        Objective.Id.create(3)
      )
    ]
  }

}