
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

