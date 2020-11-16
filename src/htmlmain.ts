import {MermaidTreeView, PjfuVue} from './infra/view/PjfuVue'

import {
  DataStoreImpl
} from './infra/infra'
import { DataStore } from "./infra/DataStore";
import { ActionRepositoryImpl } from "./infra/ActionRepositoryImpl";
import { ObjectiveRepositoryImpl } from "./infra/ObjectiveRepositoryImpl";
import { AnyId } from './infra/view/AnyId';
declare const mermaid: any;
declare var Vue: any;

function q(selector) {
  return document.querySelector(selector);
}
function qclick(selector, callback) {
  return document.querySelector(selector).addEventListener('click', callback);
}

const dataStore: DataStore = new DataStoreImpl();
dataStore.findAll((err, objectives, actions) => {
  const objectiveRepository = new ObjectiveRepositoryImpl(dataStore, objectives)
  const actionRepository = new ActionRepositoryImpl(dataStore, actions)
  const mermaidTreeView = new MermaidTreeView(
    objectiveRepository, 
    actionRepository,
    mermaid, {
      rootIdSpan: q('#rootIdSpan')
    }
  );
  const pjfuVue = new PjfuVue(
    objectiveRepository, 
    actionRepository, 
    mermaidTreeView,
    Vue
  );

  // 編集フォームはURLのハッシュに従う
  const updateFormByHash = () => pjfuVue.applyTargetId(new AnyId(window.location.hash.slice(1)))
  window.addEventListener('hashchange', updateFormByHash)
  if(location.hash) {
    updateFormByHash()
  }
  
  mermaidTreeView.update();
  qclick('#applyRootIdButton', () => mermaidTreeView.update())
})

