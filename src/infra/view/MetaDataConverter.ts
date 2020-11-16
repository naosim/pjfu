import {
  Link,
  MetaData,
  Note,
  Task,
  TaskLimitDate,
  TaskStatus
} from '../../domain/domain';

export class MetaDataForm {
  private value = '';
  set(metaData: MetaData) {
    this.value = MetaDataConverter.toText(metaData);
  }
  get(): MetaData {
    return MetaDataConverter.toMetaData(this.value);
  }
}

export class MetaDataConverter {
  static toMetaData(text: string): MetaData {
    if (text.trim()[0] != '#') {
      return new MetaData(text, [], [], Note.empty(), []);
    }
    const obj = MetaDataConverter.textToObj(text);
    console.log(obj);
    return new MetaData(
      obj['説明'] || '',
      obj['担当'] ? obj['担当'].split(',').map(v => v.trim()) : [],
      obj['リンク'] ? obj['リンク'].map(v => new Link(v.name, v.path)) : [],
      new Note(obj['ノート'] || ''),
      obj['マイルストーン'] ? obj['マイルストーン'].split('\n').map(MetaDataConverter.parseTaskLine) : []
    );
  }

  static parseTaskLine(line: string): Task {
    line = line.trim();
    const limitDate = new TaskLimitDate(line.slice(0, line.indexOf(' ')))
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
      '# リンク: \n' + metaData.links.map(v => `- [${v.name}](${v.path})`),
      '# ノート: \n' + metaData.note.value,
      '# マイルストーン: \n' + metaData.tasks.map(v => `${v.limitDate.raw} ${v.title} ${v.status.isNotEmpty() ? '[' + v.status.raw + ']' : ''}`)
    ].join('\n');
  }

  static textToObj(text): any {
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
    }, []).reduce((memo, lines) => {
      const key = lines[0].split('#')[1].split(':')[0].trim();
      lines[0] = lines[0].indexOf(':') != -1 ? lines[0].slice(lines[0].indexOf(':') + 1) : '';
      var value = lines.join('\n').trim();
      if(value.indexOf('- [') == 0) {
        value = value.split('\n').map(v => {
          return {
            name: v.split('[')[1].split(']')[0],
            path: v.split('(')[1].split(')')[0],
          }
        }).reduce((memo, v) => {
          memo.push(v);
          return memo;
        }, [])
      }
      memo[key] = value;
      return memo;
    }, {})
  }
}
