
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

export class TaskLimitDate {
  constructor(readonly raw: string) {}
  toObject(): any {
    return this.raw;
  }
}

export class TaskStatus {
  constructor(readonly raw: string) {}
  toObject(): any {
    return this.raw;
  }
  isDone(): boolean {
    return false;
  }
  isNotEmpty(): boolean {
    return this.raw.trim().length > 0;
  }
}

export class Task {
  constructor(
    readonly limitDate: TaskLimitDate, 
    readonly title: string,
    readonly status: TaskStatus
  ) {}
  toObject(): any {
    return {
      limitDate: this.limitDate.toObject(),
      title: this.title,
      status: this.status.toObject()
    }
  }
}

export class MetaData {
  constructor(
    readonly description: string,
    readonly members: string[],
    readonly links: Link[],
    readonly note: Note,
    readonly tasks: Task[]
  ) {}

  toObject(): any {
    return {
      description: this.description,
      members: this.members,
      links: this.links.map(v => v.toObject()),
      note: this.note.toObject(),
      tasks: this.tasks.map(v => v.toObject())
    }
  }
  static empty(): MetaData {
    return new MetaData('', [], [], Note.empty(), [])
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

