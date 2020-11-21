import { EntityIf, MetaData, StringValueObject } from "./domain";



export module Objective {
  export class Entity implements EntityIf<Id> {
    isRoot: boolean;
    isNotRoot: boolean;
    constructor(
      readonly id: Id,
      readonly title: string,
      readonly parent: Id,
      readonly metaData: MetaData
    ) {
      this.isRoot = parent ? false : true;
      this.isNotRoot = !this.isRoot;
      if (id.eq(parent)) {
        throw new Error('IDとparentが同一です');
      }
      if (!title || title.trim().length == 0) {
        throw new Error('タイトルが空です');
      }
    }

    toObject() {
      return {
        id: this.id.toObject(),
        title: this.title,
        parent: this.parent ? this.parent.toObject() : null,
        metaData: this.metaData.toObject()
      };
    }

    static root(): Entity {
      return new Entity(
        Id.create(0),
        'root',
        null,
        MetaData.empty()
      );
    }
  }
  export class Id implements StringValueObject {
    private _class = 'Objective.Id';
    constructor(
      readonly value: string
    ) { }
    static create(num: number): Id {
      return new Id('O' + num);
    }

    toObject(): any {
      return this.value;
    }

    eq(other: Id): boolean {

      return other && this.value === other.value;
    }
  }

  export interface ReadRepository {
    findAll(): Objective.Entity[];
    findById(id: Objective.Id): Objective.Entity;
    findParentsTree(rootId: Objective.Id): Objective.Entity[];
    findUnder(rootId: Objective.Id): Objective.Entity[];
    findByMembers(members: string[]): Objective.Entity[];
  }

  export interface Repository extends ReadRepository {
    createId(callback: (err: Error, id: Objective.Id) => void): void;
    update(entity: Objective.Entity, callback: (e) => void);
    insert(entity: Objective.Entity, callback: (e) => void);
    remove(id: Objective.Id, callback: (e) => void);
  }
}
