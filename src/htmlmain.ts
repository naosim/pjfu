import {
  Link, 
  MetaData, 
  StringValueObject,
  Objective, Action} from './domain/domain'

import {
  ObjectiveRepositoryImpl,
  ActionRepositoryImpl,
  DataStore
} from './infra/infra'
declare const mermaid: any;
function q(selector) {
  return document.querySelector(selector);
}
function qclick(selector, callback) {
  return document.querySelector(selector).addEventListener('click', callback);
}

try {
const toMermaid = (entities: Objective.Entity[], actions: Action.Entity[]) => {
  const map = {};
  entities.forEach(v => map[v.id.value] = v);
  const rectText = entities.map(v => `${v.id.value}["${v.title}"]`).join('\n');
  const linkText = entities.map(v => `click ${v.id.value} "./index.html#${v.id.value}"`).join('\n');
  const arrowText = entities.filter(v => v.parent && map[v.parent.value]).map(v => `${v.id.value} --> ${v.parent.value}`).join('\n');

  const roundText = actions.map(v => `${v.id.value}("${v.title}"):::action`).join('\n');
  const actionLinkText = actions.map(v => `click ${v.id.value} "./index.html#${v.id.value}"`).join('\n');
  const actionArrowText = actions.map(v => v.parents.map(p => `${v.id.value} --> ${p.value}`).join('\n')).join('\n');
  return `
graph LR
classDef action fill:#ECFFEC, stroke: #93DB70;
${rectText}
${linkText}
${arrowText}
${roundText}
${actionLinkText}
${actionArrowText}
  `.trim()
}
const dataStore = new DataStore();
const objectiveRepository = new ObjectiveRepositoryImpl(dataStore)
const actionRepository = new ActionRepositoryImpl(dataStore)

const onTreeUpdate = () => {
  const treeRootId = new Objective.Id(q('#rootIdSpan').value);
  var element = document.querySelector("#profu");
  console.log(objectiveRepository.findAll());
  const entities = objectiveRepository.findUnder(treeRootId)
  const actions = actionRepository.findAll()
  var text = toMermaid(entities, actions);
  console.log(text);
  mermaid.mermaidAPI.render('graphDiv', text, (svg) => element.innerHTML = svg);
}
onTreeUpdate();

qclick('#applyRootIdButton', () => {
  onTreeUpdate()
})

const getMetaDataFormTextArea: () => MetaData = () => {
  var text = q('#detailTextArea').value;
  if(text.trim()[0] != '#') {
    return new MetaData(text, [], []);
  }
  const obj = textToObj(text);
  console.log(obj);
  return new MetaData(
    obj['説明'] || '', 
    obj['担当'] ? obj['担当'].split(',').map(v => v.trim()) : [],
    obj['リンク'] ? obj['リンク'].map(v => new Link(v.name, v.path)) : []
  );
}

const setMetaDataToTextArea = (metaData: MetaData) => {
  q('#detailTextArea').value = [
    '# 説明: \n' + metaData.description, 
    '', // 空行
    '# 担当: ' + metaData.members.join(', '),
    '# リンク: \n' + metaData.links.map(v => `- [${v.name}](${v.path})`)
  ].join('\n');
}

const isObjectiveId = (id: string) => id[0] == 'O';
const isActionId = (id: string) => id[0] == 'A';

const applyTargetId = () => {
  if(isObjectiveId(q('#targetId').value)) {
    const id = new Objective.Id(q('#targetId').value);
    const objective = objectiveRepository.findById(id);
    console.log(objective);
    q('#idSpan').innerHTML = objective.id.value;
    q('#titleInput').value = objective.title;
    q('#parentsInput').value = objective.parent.value;
    setMetaDataToTextArea(objective.metaData);
    q('#linkUl').innerHTML = objective.metaData.links.map(v => `<li><a href="${v.path}" target="_blank">${v.name}</a></li>`).join('\n')
  } else if(isActionId(q('#targetId').value)) {
    const id = new Action.Id(q('#targetId').value);
    const action = actionRepository.findById(id);
    console.log(action);
    q('#idSpan').innerHTML = action.id.value;
    q('#titleInput').value = action.title;
    q('#parentsInput').value = action.parents.map(v => v.value);
    setMetaDataToTextArea(action.metaData);
    q('#linkUl').innerHTML = action.metaData.links.map(v => `<li><a href="${v.path}" target="_blank">${v.name}</a></li>`).join('\n')
  } else {
    alert('未知のID');
    throw new Error('未知のID');
  }
}

qclick('#applyTargetIdButton', applyTargetId)

qclick('#createSubButton', () => {
  q('#parentsInput').value = q('#idSpan').innerHTML;

  q('#idSpan').innerHTML = '';
  q('#titleInput').value = '';
  setMetaDataToTextArea(MetaData.empty());
})

qclick('#saveButton', () => {
  if(q('#idSpan').innerHTML.trim().length == 0) {
    alert('ID未確定のため更新できません');
    throw new Error('ID未確定のため更新できません');
  }
  const callbackOnSaved = (e) => {
    if(e) {
      console.error(e);
      alert('エラー: ' + e.message);
      return;
    }
    onTreeUpdate();
  }
  const idInHtml = q('#idSpan').innerHTML.trim();
  if(idInHtml == q('#parentsInput').value) {
    alert('IDとparentが同一です');
    throw new Error('IDとparentが同一です');
  }
  if(isObjectiveId(idInHtml)) {// 目標の保存
    const newEntity = new Objective.Entity(
      new Objective.Id(idInHtml),
      q('#titleInput').value,
      new Objective.Id(q('#parentsInput').value),
      getMetaDataFormTextArea()
    )
    objectiveRepository.update(newEntity, callbackOnSaved);
  } else if(isActionId(idInHtml)) {// 施策の保存
    const newEntity = new Action.Entity(
      new Action.Id(q('#idSpan').innerHTML),
      q('#titleInput').value,
      q('#parentsInput').value.split(',').map(v => new Action.Id(v.trim())),
      getMetaDataFormTextArea()
    )
    actionRepository.update(newEntity, callbackOnSaved);
  } else {
    alert('未知のID');
    throw new Error('未知のID');
  }

  
})

qclick('#insertButton', () => {
  objectiveRepository.createId((err, id) => {
    const newEntity = new Objective.Entity(
      id,
      q('#titleInput').value,
      new Objective.Id(q('#parentsInput').value),
      getMetaDataFormTextArea()
    )
    objectiveRepository.insert(newEntity, (e) => {
      console.log('callback');
      if(e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }
      onTreeUpdate();
    });
  })
})

qclick('#insertActionButton', () => {
  actionRepository.createId((err, id) => {
    const newEntity = new Action.Entity(
      id,
      q('#titleInput').value,
      q('#parentsInput').value.split(',').map(v => new Objective.Id(v.trim())),
      getMetaDataFormTextArea()
    )
    actionRepository.insert(newEntity, (e) => {
      console.log('callback');
      if(e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }
      onTreeUpdate();
    });
  })
})

window.addEventListener('hashchange', (e) => {
  q('#targetId').value = window.location.hash.slice(1);
  applyTargetId();
})

} catch(e) {
  console.error(e);
}





if(location.hash) {
  q('#targetId').value = window.location.hash.slice(1);
}

/* 特殊な記法
キー、バリューになっている
ネスト不可
バリューはテキスト or リンク配列

# key: value

# key: line1
line2
line3

# key:
- [name](url)

*/ 
function textToObj(text) {
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

