import {
  Link,
  MetaData,
  Note,
  Task,
  TaskLimitDate,
  TaskStatus
} from '../../domain/domain.ts';

export class MetaDataForm {
  private value = '';
  constructor() {}
  set(metaData: MetaData) {
    this.value = MetaDataConverter.toText(metaData);
  }
  get(now: Date): MetaData {
    return MetaDataConverter.toMetaData(this.value, now);
  }
}

export class MetaDataConverter {
  static toMetaData(text: string, now: Date): MetaData {
    if (text.trim()[0] != '#') {
      return new MetaData(text, [], [], Note.empty(), []);
    }
    const obj = MetaDataConverter.textToObj(text);
    console.log(obj);
    return new MetaData(
      obj['説明'] || '',
      obj['担当'] ? obj['担当'].split(',').map((v:string) => v.trim()) : [],
      obj['リンク'] ? obj['リンク'].map((v:any) => new Link(v.name, v.path)) : [],
      new Note(obj['ノート'] || ''),
      obj['マイルストーン'] ? obj['マイルストーン'].split('\n').map((v:string) => MetaDataConverter.parseTaskLine(v, now)) : []
    );
  }

  static parseTaskLine(line: string, now: Date): Task {
    line = line.trim();
    const limitDate = TaskLimitDate.create(line.slice(0, line.indexOf(' ')), now)
    var title: string;
    var status: TaskStatus;
    if(line[line.length - 1] == ']') {// ステータスあり
      const i = line.lastIndexOf('[');
      title = line.slice(line.indexOf(' '), i).trim();
      status = new TaskStatus(line.slice(i + 1, line.length - 1).trim());
    } else {// ステータスなし
      title = line.slice(line.indexOf(' ')).trim();
      status = new TaskStatus('');
    }
    console.log(status);
    return new Task(
      limitDate,
      title,
      status
    )
  }

  static toText(metaData: MetaData): string {
    return [
      '# 説明: \n' + metaData.description,
      '',
      '# 担当: ' + metaData.members.join(', '),
      '# リンク: \n' + metaData.links.map(v => `- [${v.name}](${v.path})`).join('\n'),
      '# ノート: \n' + metaData.note.value,
      '# マイルストーン: \n' + metaData.tasks.map(v => `${v.limitDate.raw} ${v.title} ${v.status.isNotEmpty() ? '[' + v.status.raw + ']' : ''}`).join('\n')
    ].join('\n');
  }

  static textToObj(text:string): any {
    text = text.trim();
    if(text[0] != '#') {
      throw new Error('不正なテキスト');
    }
    return text.split('\n').reduce((memo: string[][], v) => {
      if(v.indexOf('# ') == 0) {
        memo.push([v])
      } else {
        memo[memo.length - 1].push(v)
      }
      return memo;
    }, []).reduce((memo:any, lines) => {
      const key = lines[0].split('#')[1].split(':')[0].trim();
      lines[0] = lines[0].indexOf(':') != -1 ? lines[0].slice(lines[0].indexOf(':') + 1) : '';
      var value0:string = lines.join('\n').trim();
      var value: any;
      if(value0.indexOf('- [') == 0) {
        value = value0.split('\n').map(v => {
          return {
            name: v.split('[')[1].split(']')[0],
            path: v.split('(')[1].split(')')[0],
          }
        }).reduce((memo:any[], v) => {
          memo.push(v);
          return memo;
        }, [])
      }
      memo[key] = value;
      return memo;
    }, {})
  }
}
