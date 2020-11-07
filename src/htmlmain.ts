import {Objective} from './domain/domain'
import {
  ObjectiveRepositoryImpl,
  DataStore
} from './infra/infra'

try {

const toMermaid = (entities: Objective.Entity[]) => {
  const map = {};
  entities.forEach(v => map[v.id.value] = v);
  const rectText = entities.map(v => `${v.id.value}[${v.title}]`).join('\n');
  const arrowText = entities.filter(v => v.parent && map[v.parent.value]).map(v => `${v.id.value} --> ${v.parent.value}`).join('\n');
  return `
graph LR
${rectText}

${arrowText}
  `.trim()
}

const rep = new ObjectiveRepositoryImpl(new DataStore())
const entities = rep.findUnder(Objective.Id.create(2))
document.getElementById('profu').innerHTML = toMermaid(entities);

} catch(e) {
  console.error(e);
}