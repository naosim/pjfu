import { Action } from "../../domain/Action.ts";
import { Objective } from "../../domain/Objective.ts";
import { MermaidConvertor } from './MermaidConvertor.ts';
import { AnyId } from './AnyId.ts';
import { ModeType, ViewModeModel } from "./ViewModeModel.ts";

declare global {
  interface Window {
    document: any;
  }
}
type ObjectivesAndActionsMap = {objectiveMap: { [key: string]: Objective.Entity; }, actionMap:{ [key: string]: Action.Entity; }}

function merge(a: ObjectivesAndActionsMap, b: ObjectivesAndActionsMap) {
  var c:ObjectivesAndActionsMap = {objectiveMap:{}, actionMap:{}}
  Object.keys(a.objectiveMap).forEach(k => c.objectiveMap[k] = a.objectiveMap[k]);
  Object.keys(b.objectiveMap).forEach(k => c.objectiveMap[k] = b.objectiveMap[k]);
  Object.keys(a.actionMap).forEach(k => c.actionMap[k] = a.actionMap[k]);
  Object.keys(b.actionMap).forEach(k => c.actionMap[k] = b.actionMap[k]);
  return c;
}

export class MermaidTreeView {
  constructor(
    private objectiveRepository: Objective.ReadRepository,
    private actionRepository: Action.ReadRepository,
    private mermaid: any
  ) {
  }
  findRelated(anyId: AnyId): ObjectivesAndActionsMap {
    const objectiveMap: { [key: string]: Objective.Entity; } = {};
    const actionMap: { [key: string]: Action.Entity; } = {};
    var parents: Objective.Id[] = [];
    anyId.forEach(
      id => {
        parents = [id];
      },
      id => {
        const current: Action.Entity = this.actionRepository.findById(id);
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

    return {objectiveMap, actionMap}
  }

  update(viewMode:ViewModeModel, selectedId?: AnyId) {
    const anyId = new AnyId(viewMode.treeTargetId);
    selectedId = selectedId || [viewMode.treeTargetId].filter(v => v).map(v => new AnyId(v))[0];
    var related: ObjectivesAndActionsMap = {objectiveMap:{}, actionMap:{}};
    if(viewMode.modeType == ModeType.targetTree) {
      related = this.findRelated(anyId);
    } else if(viewMode.modeType == ModeType.member) {
      related = {objectiveMap: {}, actionMap: {}};
      this.objectiveRepository.findByMembers(viewMode.selectedMembers).forEach(e => {related = merge(related, this.findRelated(new AnyId(e.id.value)))})
      this.actionRepository.findByMembers(viewMode.selectedMembers).forEach(e => {related = merge(related, this.findRelated(new AnyId(e.id.value)))})
      console.log(related);
      // related = this.findRelated(new AnyId('O0'));
    }
    

    var element = window.document.querySelector("#profu");// 全ての中でquerySelectorを使っていいのはここだけ！
    var text = MermaidConvertor.toMermaidScript(
      Object.values(related.objectiveMap),
      Object.values(related.actionMap),
      anyId,
      selectedId
    );
    // console.log(text);
    this.mermaid.mermaidAPI.render(
      'graphDiv', 
      text, 
      (svg:any, bind:any) => {
        element.innerHTML = svg;
        bind(element);
      });
  }
}
