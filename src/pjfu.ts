
import { PjfuVue } from './infra/view/PjfuVue';
import { MermaidTreeView } from "./infra/view/MermaidTreeView";
import { ActionRepositoryImpl } from "./infra/ActionRepositoryImpl";
import { ObjectiveRepositoryImpl } from "./infra/ObjectiveRepositoryImpl";
import { AnyId } from './infra/view/AnyId';
import { Objective } from './domain/Objective';
import { Action } from './domain/Action';
import { PjfuTextIO } from "./infra/datastore/TextIO";
import { DataStoreServer } from "./infra/datastore/DataStoreServer";
import { LocalStrageKeyValueIO } from './infra/datastore/keyvalue/LocalStrageKeyValueIO';
import { GithubKeyValueIO } from './infra/datastore/keyvalue/GithubKeyValueIO';
import { KeyValueIO } from './infra/datastore/keyvalue/KeyValueIO';
import { IssueNumber } from './infra/datastore/keyvalue/IssueRepositoryImpl';

export function pjfu(keyValueIo: KeyValueIO) {
  const dataStore = new DataStoreServer(new PjfuTextIO(keyValueIo));
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
    document.querySelector('#applyTreeCenteredFromSelected').addEventListener('click', () => {
      ((document.querySelector('#rootIdSpan') as unknown) as {value:string}).value = document.querySelector('#selectedIdSpan').innerHTML
      mermaidTreeView.update()
    });
  });
}

// グローバルから使えるようにする
window['LocalStrageKeyValueIO'] = LocalStrageKeyValueIO
window['GithubKeyValueIO'] = GithubKeyValueIO
window['IssueNumber'] = IssueNumber
window['pjfu'] = pjfu