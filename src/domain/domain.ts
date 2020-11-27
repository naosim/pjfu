
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
  readonly date: Date
  readonly time: number
  constructor(readonly raw: string, readonly dateString: string) {
    this.date = new Date(dateString);
    this.time = this.date.getTime();
  }

  /**
   * 過去2週間から未来2週間以内(だいたい)
   * @param now 
   */
  isIn2Weeks(now: Date): boolean {
    const d = this.time;
    const day = 24 * 60 * 60 * 1000;
    return now.getTime() - 15 * day < d && d < now.getTime() + 15 * day;
  }
  toObject(): any {
    return {
      raw: this.raw,
      dateString: this.date.toLocaleDateString()
    };
  }
  static create(raw: string, now: Date): TaskLimitDate {
    return new TaskLimitDate(raw, TaskLimitDate.textToDate(raw, now).toLocaleDateString())
  }
  static unlimited(): TaskLimitDate {
    return new TaskLimitDate('', '2999/12/31');
  }
  public static textToDate(raw: string, now: Date): Date {
    if(raw.length == 0) {
      return new Date('2999/12/31');
    }
    raw = raw.split('(')[0]
    var segs = raw.split('/')
    if(segs.length == 3) {// yyyy/mm/dd
      return new Date(raw);
    } if(segs.length == 2) {// mm/dd
      if(segs[0].indexOf('FY') == 0 && segs[1] == '1Q') {
        return new Date(`20${segs[0].slice(2)}/6/30`);
      }
      if(segs[0].indexOf('FY') == 0 && segs[1] == '2Q') {
        return new Date(`20${segs[0].slice(2)}/9/30`);
      }
      if(segs[0].indexOf('FY') == 0 && segs[1] == '3Q') {
        return new Date(`20${segs[0].slice(2)}/12/31`);
      }
      if(segs[0].indexOf('FY') == 0 && segs[1] == '4Q') {
        return new Date(`20${parseInt(segs[0].slice(2)) + 1}/3/31`);
      }
      
      const year = now.getFullYear();
      if(segs[1] == '末' || segs[1] == '末日') {
        let d = TaskLimitDate.near(
          now, 
          [
            new Date(`${year-1}/${segs[0]}/1`),
            new Date(`${year}/${segs[0]}/1`),
            new Date(`${year+1}/${segs[0]}/1`)
          ]
        )
        d.setMonth(d.getMonth() + 1);
        d.setDate(d.getDate() - 1);
        return d;
      } else if(segs[1] == '上' || segs[1] == '上旬') {
        return TaskLimitDate.near(
          now, 
          [
            new Date(`${year-1}/${segs[0]}/10`),
            new Date(`${year}/${segs[0]}/10`),
            new Date(`${year+1}/${segs[0]}/10`)
          ]
        );
      } else if(segs[1] == '中' || segs[1] == '中旬') {
        return TaskLimitDate.near(
          now, 
          [
            new Date(`${year-1}/${segs[0]}/20`),
            new Date(`${year}/${segs[0]}/20`),
            new Date(`${year+1}/${segs[0]}/20`)
          ]
        );
      }
      return TaskLimitDate.near(
        now, 
        [
          new Date(`${year-1}/${raw}`),
          new Date(`${year}/${raw}`),
          new Date(`${year+1}/${raw}`)
        ]
      )
    }
    throw new Error('不明: ' + raw);
  }
  private static near(now: Date, dates: Date[]) {
    const diffs = dates.map(v => Math.abs(v.getTime() - now.getTime()));
    if(diffs[0] < diffs[1] && diffs[0] < diffs[2]) {
      return dates[0];
    }
    if(diffs[1] < diffs[0] && diffs[1] < diffs[2]) {
      return dates[1];
    }
    if(diffs[2] < diffs[0] && diffs[2] < diffs[1]) {
      return dates[2];
    }
    throw new Error('予期せぬエラー');
  }
}

export class TaskStatus {
  constructor(readonly raw: string) {}
  toObject(): any {
    return this.raw;
  }
  isDone(): boolean {
    return ['完了'].filter(v => this.raw == v).length > 0;
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

