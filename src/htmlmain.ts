import {MetaData, Objective} from './domain/domain'

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

qclick('#applyTargetIdButton', () => {
  const id = new Objective.Id(q('#targetId').value);
  const objective = objectiveRepository.findById(id);
  console.log(objective);
  q('#idSpan').innerHTML = objective.id.value;
  q('#titleInput').value = objective.title;
  q('#parentsInput').value = objective.parent.value;
  q('#detailTextArea').value = objective.metaData.description;
})

qclick('#saveButton', () => {
  const newEntity = new Objective.Entity(
    new Objective.Id(q('#idSpan').innerHTML),
    q('#titleInput').value,
    new Objective.Id(q('#parentsInput').value),
    new MetaData(q('#detailTextArea').value, [])
  )
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
  if(!confirm("新規作成します。よろしいですか？")) {
    return;
  }
  objectiveRepository.createId((err, id) => {
    const newEntity = new Objective.Entity(
      id,
      q('#titleInput').value,
      new Objective.Id(q('#parentsInput').value),
      new MetaData(q('#detailTextArea').value, [])
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