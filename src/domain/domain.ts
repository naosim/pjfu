
export interface StringValueObject {
  readonly value: string;
}

export interface EntityIf<T extends StringValueObject> {
  readonly id: T;
}

export class MetaData {
  constructor(
    readonly description: string,
    readonly members: string[],
    readonly links: Link[]
  ) {}

  toObject(): any {
    return {
      description: this.description,
      members: this.members,
      links: this.links.map(v => v.toObject())
    }
  }
  static empty(): MetaData {
    return new MetaData('', [], [])
  }
}

export class Link {
  constructor(readonly name: string, readonly path: string) {
  }
  toObject(): any {
    return {
      name: this.name,
      path: this.path
    }
  }
}


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
      this.isRoot = parent ? false: true;
      this.isNotRoot = !this.isRoot;
      if(id.eq(parent)) {
        throw new Error('IDとparentが同一です');
      }
      if(!title || title.trim().length == 0) {
        throw new Error('タイトルが空です');
      }
    }

    toObject() {
      return {
        id: this.id.toObject(),
        title: this.title,
        parent: this.parent ? this.parent.toObject() : null,
        metaData: this.metaData.toObject()
      }
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
    private _class = 'Objective.Id'
    constructor(
      readonly value: string
    ){}
    static create(num: number): Id {
      return new Id('O' + num);
    }

    toObject(): any {
      return this.value
    }

    eq(other: Id): boolean {
      
      return other && this.value === other.value
    }
  }
  
  
}

export module Action {
  export class Entity implements EntityIf<Id> {
    constructor(
      readonly id: Id,
      readonly title: string,
      readonly parents: Objective.Id[],
      readonly metaData: MetaData
    ) {
      if(!title || title.trim().length == 0) {
        throw new Error('タイトルが空です');
      }
    }
    toObject() {
      return {
        id: this.id.toObject(),
        title: this.title,
        parents: this.parents.map(v => v.toObject()),
        metaData: this.metaData.toObject()
      }
    }
  }
  export class Id implements StringValueObject {
    constructor(
      readonly value: string
    ){}
    static create(num: number): Id {
      return new Id('A' + num);
    }

    toObject(): any {
      return this.value
    }

    eq(other: Id): boolean {
      return other && this.value === other.value
    }
  }
  
  
}
