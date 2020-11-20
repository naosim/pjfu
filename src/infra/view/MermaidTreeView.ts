import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";
import { MermaidConvertor } from './MermaidConvertor';
import { AnyId } from './AnyId';


export class MermaidTreeView {
  constructor(
    private objectiveRepository: Objective.ReadRepository,
    private actionRepository: Action.ReadRepository,
    private mermaid: any
  ) {
  }
  update(id?: AnyId) {
    const idInHtml = ((document.querySelector('#rootIdSpan') as unknown) as { value: string; }).value;
    const anyId = new AnyId(idInHtml);
    const selectedId: AnyId = id || [document.querySelector('#selectedIdSpan')].filter(v => v).map(v => new AnyId(v.innerHTML))[0];
    const objectiveMap: { [key: string]: Objective.Entity; } = {};
    const actionMap: { [key: string]: Action.Entity; } = {};
    var objectives: Objective.Entity[] = [];
    var parents: Objective.Id[] = null;
    anyId.forEach(
      id => {
        parents = [id];
      },
      id => {
        const current: Action.Entity = this.actionRepository.findById(new Action.Id(idInHtml));
        parents = current.parents;
        parents.forEach(p => {
          this.actionRepository.findChildren(p).forEach(v => {
            actionMap[v.id.value] = v;
          });
        });
      }
    );

    parents.forEach(p => {
      var underObjectives = this.objectiveRepository.findUnder(p);
      underObjectives.forEach(v => {
        objectiveMap[v.id.value] = v;
        this.actionRepository.findChildren(v.id).forEach(v => {
          actionMap[v.id.value] = v;
        });
      });
      this.objectiveRepository.findParentsTree(p).forEach(v => objectiveMap[v.id.value] = v);
    });
    var element = document.querySelector("#profu");
    var text = MermaidConvertor.toMermaidScript(
      Object.values(objectiveMap),
      Object.values(actionMap),
      anyId,
      selectedId
    );
    // console.log(text);
    this.mermaid.mermaidAPI.render(
      'graphDiv', 
      text, 
      (svg, bind) => {
        element.innerHTML = svg;
        bind(element);
      });
  }
}
