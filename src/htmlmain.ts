import {Link, MetaData, Objective} from './domain/domain'

import {
  ObjectiveRepositoryImpl,
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
const toMermaid = (entities: Objective.Entity[]) => {
  const map = {};
  entities.forEach(v => map[v.id.value] = v);
  const rectText = entities.map(v => `${v.id.value}["${v.title}"]`).join('\n');
  const linkText = entities.map(v => `click ${v.id.value} "./index.html#${v.id.value}"`).join('\n');
  const arrowText = entities.filter(v => v.parent && map[v.parent.value]).map(v => `${v.id.value} --> ${v.parent.value}`).join('\n');
  return `
graph LR
${rectText}
${linkText}
${arrowText}
  `.trim()
}
const objectiveRepository = new ObjectiveRepositoryImpl(new DataStore())

const onTreeUpdate = () => {
  const treeRootId = new Objective.Id(q('#rootIdSpan').value);
  var element = document.querySelector("#profu");
  console.log(objectiveRepository.findAll());
  const entities = objectiveRepository.findUnder(treeRootId)
  var text = toMermaid(entities);
  console.log(text);
  const insertSvg = function(svgCode, bindFunctions){
    element.innerHTML = svgCode;
  };
  var graph = mermaid.mermaidAPI.render('graphDiv', text, (svg) => element.innerHTML = svg);
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

qclick('#applyTargetIdButton', () => {
  const id = new Objective.Id(q('#targetId').value);
  const objective = objectiveRepository.findById(id);
  console.log(objective);
  q('#idSpan').innerHTML = objective.id.value;
  q('#titleInput').value = objective.title;
  q('#parentsInput').value = objective.parent.value;
  setMetaDataToTextArea(objective.metaData);
  q('#linkUl').innerHTML = objective.metaData.links.map(v => `<li><a href="${v.path}" target="_blank">${v.name}</a></li>`).join('\n')
})

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
  const newEntity = new Objective.Entity(
    new Objective.Id(q('#idSpan').innerHTML),
    q('#titleInput').value,
    new Objective.Id(q('#parentsInput').value),
    getMetaDataFormTextArea()
  )

  if(newEntity.id.value == newEntity.parent.value) {
    alert('IDとparentが同一です');
    throw new Error('IDとparentが同一です');
  }

  objectiveRepository.update(newEntity, (e) => {
    console.log('callback');
    if(e) {
      console.error(e);
      alert('エラー: ' + e.message);
      return;
    }
    onTreeUpdate();
  });
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

} catch(e) {
  console.error(e);
}

window.addEventListener('hashchange', (e) => {
  q('#targetId').value = window.location.hash.slice(1);
})



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

