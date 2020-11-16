import { MermaidTreeView, PjfuVue } from './infra/view/PjfuVue';
import { DataStore } from "./infra/datastore/DataStore";
import { ActionRepositoryImpl } from "./infra/ActionRepositoryImpl";
import { ObjectiveRepositoryImpl } from "./infra/ObjectiveRepositoryImpl";
import { AnyId } from './infra/view/AnyId';
import { Objective } from './domain/Objective';
import { Action } from './domain/Action';

export function main(dataStore: DataStore) {
  dataStore.findAll((err, objectives, actions) => {
    const objectiveRepository: Objective.Repository = new ObjectiveRepositoryImpl(dataStore, objectives);
    const actionRepository: Action.Repository = new ActionRepositoryImpl(dataStore, actions);
    const mermaidTreeView = new MermaidTreeView(
      objectiveRepository,
      actionRepository,
      window['mermaid']
    );
    const pjfuVue = new PjfuVue(
      objectiveRepository,
      actionRepository,
      mermaidTreeView,
      window['Vue']
    );

    // 編集フォームはURLのハッシュに従う
    const updateFormByHash = () => pjfuVue.applyTargetId(new AnyId(window.location.hash.slice(1)));
    window.addEventListener('hashchange', updateFormByHash);
    if (location.hash) {
      updateFormByHash();
    }

    mermaidTreeView.update();
    document.querySelector('#applyRootIdButton').addEventListener('click', () => mermaidTreeView.update());
  });
}