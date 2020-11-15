import {
  Objective,
  Action
} from './domain/domain';


export class MermaidConvertor {
  static toMermaidScript(
    entities: Objective.Entity[],
    actions: Action.Entity[]
  ) {
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
  `.trim();

  }
}
