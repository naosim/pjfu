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

  qclick('#createSubButton', () => {
    q('#parentsInput').value = q('#idSpan').innerHTML;
  
    q('#idSpan').innerHTML = '';
    q('#titleInput').value = '';
    // setMetaDataToTextArea(MetaData.empty());
    q('#detailTextArea').value = MetaDataConverter.toText(MetaData.empty());
  })
  
  qclick('#insertButton', () => {
    objectiveRepository.createId((err, id) => {
      const newEntity = new Objective.Entity(
        id,
        q('#titleInput').value,
        new Objective.Id(q('#parentsInput').value),
        MetaDataConverter.toMetaData(q('#detailTextArea').value)
      )
      objectiveRepository.insert(newEntity, (e) => {
        console.log('callback');
        if(e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }
        mermaidTreeView.update();
      });
    })
  })
  
  qclick('#insertActionButton', () => {
    actionRepository.createId((err, id) => {
      const newEntity = new Action.Entity(
        id,
        q('#titleInput').value,
        q('#parentsInput').value.split(',').map(v => new Objective.Id(v.trim())),
        MetaDataConverter.toMetaData(q('#detailTextArea').value)
      )
      actionRepository.insert(newEntity, (e) => {
        console.log('callback');
        if(e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }
        mermaidTreeView.update();
      });
    })
  })
  
  qclick('#removeButton', () => {
    const idInHtml = q('#idSpan').innerHTML.trim();
    if(isObjectiveId(idInHtml)) {// 目標削除
      const objectiveId = new Objective.Id(idInHtml);
      if(actionRepository.hasChildren(objectiveId)) {
        alert('子要素を消してください');
        throw new Error('子要素を消してください');
      }
      objectiveRepository.remove(
        objectiveId,
        (e) => {
          if(e) {
            alert(e.message);
            throw e;
          }
          mermaidTreeView.update();
          // onTreeUpdate();
        }
      )
      
    } else if(isActionId(idInHtml)) {// 施策削除
      actionRepository.remove(
        new Action.Id(idInHtml),
        (e) => {
          if(e) {
            alert(e.message);
            throw e;
          }
          mermaidTreeView.update();
        }
      )
    }
  })

  
}) // dataStore.findAll callback

if(location.hash) {
  q('#targetId').value = window.location.hash.slice(1);
}

/* 特殊な記法
キー、バリューになっている
ネスト不可
バリューはテキスト or リンク配列

# key: value

# key: line1
line2
line3

# key:
- [name](url)

*/ 
export function textToObj(text) {
  text = text.trim();
  if(text[0] != '#') {
    throw new Error('不正なテキスト');
  }
  return text.split('\n').reduce((memo: string[][], v) => {
    if(v.indexOf('# ') == 0) {
      memo.push([v])
    } else {
      memo[memo.length - 1].push(v)
    }
    return memo;
  }, []).reduce((memo, lines) => {
    const key = lines[0].split('#')[1].split(':')[0].trim();
    lines[0] = lines[0].indexOf(':') != -1 ? lines[0].slice(lines[0].indexOf(':') + 1) : '';
    var value = lines.join('\n').trim();
    if(value.indexOf('- [') == 0) {
      value = value.split('\n').map(v => {
        return {
          name: v.split('[')[1].split(']')[0],
          path: v.split('(')[1].split(')')[0],
        }
      }).reduce((memo, v) => {
        memo.push(v);
        return memo;
      }, [])
    }
    memo[key] = value;
    return memo;
  }, {})
}
