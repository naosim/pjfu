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
  export class Entity {
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
  export class Id {
    constructor(
      readonly value: string
    ){}
    static create(num: number): Id {
      return new Id('O' + num);
    }

    toObject(): any {
      return this.value
    }
  }
  
  
}

