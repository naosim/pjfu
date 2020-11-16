
export interface StringValueObject {
  readonly value: string;
}

export interface EntityIf<T extends StringValueObject> {
  readonly id: T;
}

export class Note implements StringValueObject {
  constructor(
    readonly value: string
  ) { }
  toObject(): any {
    return this.value;
  }
  isNotEmpty(): boolean {
    return this.value.trim().length > 0;
  }
  static empty(): Note {
    return new Note('');
  }
}

export class MetaData {
  constructor(
    readonly description: string,
    readonly members: string[],
    readonly links: Link[],
    readonly note: Note
  ) {}

  toObject(): any {
    return {
      description: this.description,
      members: this.members,
      links: this.links.map(v => v.toObject()),
      note: this.note.toObject()
    }
  }
  static empty(): MetaData {
    return new MetaData('', [], [], Note.empty())
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

