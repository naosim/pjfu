import {
  Link, 
  MetaData, 
  Objective, 
  Action
} from './domain/domain'

import {MermaidTreeView, PjfuVue} from './infra/PjfuVue'

import {
  DataStoreImpl
} from './infra/infra'
import { DataStore } from "./infra/DataStore";
import { ActionRepositoryImpl } from "./infra/ActionRepositoryImpl";
import { ObjectiveRepositoryImpl } from "./infra/ObjectiveRepositoryImpl";
import { AnyId } from './infra/AnyId';
import { MetaDataConverter } from './MetaDataConverter';
declare const mermaid: any;
declare var Vue: any;

function q(selector) {
  return document.querySelector(selector);
}
function qclick(selector, callback) {
  return document.querySelector(selector).addEventListener('click', callback);
}

const isObjectiveId = (id: string) => id[0] == 'O';
const isActionId = (id: string) => id[0] == 'A';

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
  window.addEventListener('hashchange', (e) => {
    pjfuVue.applyTargetId(new AnyId(window.location.hash.slice(1)))
  })
  
  mermaidTreeView.update();
  
  qclick('#applyRootIdButton', () => {
    mermaidTreeView.update();
  })
}) // dataStore.findAll callback

if(location.hash) {
  // q('#targetId').value = window.location.hash.slice(1);
}
