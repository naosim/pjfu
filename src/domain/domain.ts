export module Objective {
  export class Entity {
    isRoot: boolean;
    constructor(
      readonly id: Id,
      readonly title: string,
      readonly parent: Id
    ) {
      this.isRoot = parent ? false: true;
    }
    static root(): Entity {
      return new Entity(
        Id.create(0),
        'root',
        null
      );
    }
  }
  export class Id {
    constructor(
      readonly value: string
    ){}
    static create(num: number): Id {
      return new Id('O' + ('0000' + num).slice(-4));
    }
  }
}

