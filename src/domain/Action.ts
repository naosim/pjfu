import { Objective } from "./Objective";
import { EntityIf, MetaData, StringValueObject } from "./domain";



export module Action {
  export class Entity implements EntityIf<Id> {
    constructor(
      readonly id: Id,
      readonly title: string,
      readonly parents: Objective.Id[],
      readonly metaData: MetaData
    ) {
      if (!title || title.trim().length == 0) {
        throw new Error('タイトルが空です');
      }
    }
    toObject() {
      return {
        id: this.id.toObject(),
        title: this.title,
        parents: this.parents.map(v => v.toObject()),
        metaData: this.metaData.toObject()
      };
    }
  }
  export class Id implements StringValueObject {
    constructor(
      readonly value: string
    ) { }
    static create(num: number): Id {
      return new Id('A' + num);
    }

    toObject(): any {
      return this.value;
    }

    eq(other: Id): boolean {
      return other && this.value === other.value;
    }
  }

  export interface ReadRepository {
    findAll(): Action.Entity[];
    findById(id: Action.Id);
    /**
     * 指定したIDに子要素はあるか？
     * @param parentId 
     */
    hasChildren(parentId: Objective.Id);
    findChildren(parentId: Objective.Id): Action.Entity[];
  }
  export interface Repository extends ReadRepository {
    createId(callback: (err: Error, id: Action.Id) => void): void;
    
    update(entity: Action.Entity, callback: (e) => void);
    insert(entity: Action.Entity, callback: (e) => void);
    remove(id: Action.Id, callback: (e) => void);
  }
}
