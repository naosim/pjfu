import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";
import { AnyId } from "./AnyId";

export class MermaidConvertor {
  static toMermaidScript(
    entities: Objective.Entity[],
    actions: Action.Entity[],
    treeCenterId: AnyId,
    selectedId?: AnyId
  ) {
    const isSelected = (id: string) => id == treeCenterId.getValue() || (selectedId && id == selectedId.getValue())
    const map = {};
    entities.forEach(v => map[v.id.value] = v);
    const rectText = entities.map(v => `${v.id.value}["${v.title}"]${isSelected(v.id.value) ? ':::objective_select' : ''}`).join('\n');
    const linkText = entities.map(v => `click ${v.id.value} mermaidCallback`).join('\n');
    const arrowText = entities.filter(v => v.parent && map[v.parent.value]).map(v => `${v.id.value} --> ${v.parent.value}`).join('\n');

    const roundText = actions.map(v => `${v.id.value}("${v.title}<br>${v.metaData.members.join(', ')}"):::action${isSelected(v.id.value) ? '_select' : ''}`).join('\n');
    const actionLinkText = actions.map(v => `click ${v.id.value} mermaidCallback`).join('\n');
    const actionArrowText = actions.map(v => v.parents.map(p => `${v.id.value} --> ${p.value}`).join('\n')).join('\n');
    const noteText = actions.filter(v => v.metaData.note.isNotEmpty()).map(v => `${v.id.value}_note["${v.metaData.note.value.split('\n').join('<br>')}"]:::note`).join('\n');
    const noteArrowText = actions.filter(v => v.metaData.note.isNotEmpty()).map(v => `${v.id.value}_note --- ${v.id.value}`).join('\n');
    return `
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '10px', 'lineColor': '#888'}}}%%
graph LR
classDef objective_select stroke-width:4px;
classDef action fill:#ECFFEC, stroke: #93DB70;
classDef action_select fill:#ECFFEC, stroke: #93DB70, stroke-width:4px;
classDef note fill:#FFFFEC, stroke: #DBDB93;
${rectText}
${linkText}
${arrowText}
${roundText}
${actionLinkText}
${actionArrowText}
${noteText}
${noteArrowText}
  `.trim();

  }
}
