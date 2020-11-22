
import { PjfuVue } from './infra/view/PjfuVue.ts';
import { MermaidTreeView } from "./infra/view/MermaidTreeView.ts";
import { ActionRepositoryImpl } from "./infra/ActionRepositoryImpl.ts";
import { ObjectiveRepositoryImpl } from "./infra/ObjectiveRepositoryImpl.ts";
import { AnyId } from './infra/view/AnyId.ts';
import { Objective } from './domain/Objective.ts';
import { Action } from './domain/Action.ts';
import { PjfuTextIO } from "./infra/datastore/TextIO.ts";
import { DataStoreServer } from "./infra/datastore/DataStoreServer.ts";
import { LocalStrageKeyValueIO } from 'https://raw.githubusercontent.com/naosim/key-value-io/main/src/LocalStrageKeyValueIO.ts';
import { GithubKeyValueIO, IssueNumber } from 'https://raw.githubusercontent.com/naosim/key-value-io/main/src/GithubKeyValueIO.ts';
import { KeyValueIO } from 'https://raw.githubusercontent.com/naosim/key-value-io/main/src/KeyValueIO.ts';
import { GasKeyValueIO } from "https://raw.githubusercontent.com/naosim/key-value-io/main/src/GasKeyValueIO.ts";
declare global {
  interface Window {
    alert: (message?: any) => void;
    location: any;
    google: any;
    Vue: any;
    mermaid: any;
    mermaidCallback: any;
    LocalStrageKeyValueIO: any;
    GithubKeyValueIO: any;
    IssueNumber: any;
    pjfu: any;
  }
}
// declare const window: any;
declare const location: any;

export function pjfu(keyValueIo: KeyValueIO) {
  const dataStore = new DataStoreServer(new PjfuTextIO(keyValueIo));
  dataStore.findAll((err, objectives, actions) => {
    if(err) {
      console.error(err);
      window.alert(err.message);
      return;
    }
    const objectiveRepository: Objective.Repository = new ObjectiveRepositoryImpl(dataStore, objectives!);
    const actionRepository: Action.Repository = new ActionRepositoryImpl(dataStore, actions!);
    const pjfuVue = new PjfuVue(
      objectiveRepository,
      actionRepository,
      new MermaidTreeView(
        objectiveRepository,
        actionRepository,
        window['mermaid']
      ),
      window['Vue']
    );

    // 編集フォームはURLのハッシュに従う
    const updateFormByHash = () => pjfuVue.applyTargetId(new AnyId(window.location.hash.slice(1)));
    window.addEventListener('hashchange', updateFormByHash);
    if (location.hash) {
      updateFormByHash();
    }

    // mermaidの矩形をクリックした時に呼ばれるメソッド
    // グローバルに定義するしかない
    window['mermaidCallback'] = (id: string) => { pjfuVue.applyTargetId(new AnyId(id)); }
  });
}

// グローバルから使えるようにする
window['LocalStrageKeyValueIO'] = LocalStrageKeyValueIO
window['GithubKeyValueIO'] = GithubKeyValueIO
window['IssueNumber'] = IssueNumber
window['pjfu'] = pjfu;

const keyValueIo: KeyValueIO = window.google ? new GasKeyValueIO() : new LocalStrageKeyValueIO();
pjfu(keyValueIo)