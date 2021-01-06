import {
  EntityIf,
  StringValueObject
} from '../domain/domain.ts';

export class InMemoryDataStore<I extends StringValueObject, E extends EntityIf<I>> {
  private entityMap: { [key: string]: E; };

  constructor(entities: E[]) {
    this.entityMap = {};
    entities.forEach(v => {
      if(this.entityMap[v.id.value]) {// なぜか同一IDが2つある時がある。バグが治るまで、先勝ちにする
        return
      }
      this.entityMap[v.id.value] = v
    });
  }

  findAll(): E[] {
    return Object.keys(this.entityMap).map(key => this.entityMap[key]);
  }

  findById(id: I): E {
    return this.entityMap[id.value];
  }

  isExist(id: I) {
    return this.entityMap[id.value] ? true : false;
  }

  update(entity: E) {
    if (!this.isExist(entity.id)) {
      throw new Error(`entity not found: ${entity.id.value}`);
    }
    this.entityMap[entity.id.value] = entity;
    console.log('update inMemory');
  }
  insert(entity: E) {
    if (this.isExist(entity.id)) {
      throw new Error(`entity already exists: ${entity.id.value}`);
    }
    this.entityMap[entity.id.value] = entity;
    console.log('insert inMemory');
  }

  remove(id: I) {
    delete this.entityMap[id.value];
  }
}
