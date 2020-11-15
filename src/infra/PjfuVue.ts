import { Action, Objective } from '../domain/domain';
import { MermaidConvertor } from '../MermaidConvertor';
import { MetaDataConverter, MetaDataForm } from '../MetaDataConverter';
import { ActionRepositoryImpl } from './ActionRepositoryImpl';
import { AnyId } from './AnyId';
import { ObjectiveRepositoryImpl } from './ObjectiveRepositoryImpl';
export class MermaidTreeView {
  constructor(
    private objectiveRepository: ObjectiveRepositoryImpl,
    private actionRepository: ActionRepositoryImpl,
    private mermaid: any,
    private form: {
      rootIdSpan: { value: string }
    }
  ) {
    
  }
  update() {
    const idInHtml = this.form.rootIdSpan.value;
    const anyId = new AnyId(idInHtml);
    const objectiveMap: { [key: string]: Objective.Entity } = {}
    const actionMap: { [key: string]: Action.Entity } = {}
    var objectives: Objective.Entity[] = [];
    var parents: Objective.Id[] = null;
    anyId.forEach(
      id => {
        parents = [new Objective.Id(idInHtml)]
      },
      id => {
        const current: Action.Entity = this.actionRepository.findById(new Action.Id(idInHtml));
        parents = current.parents;
        parents.forEach(p => {
          this.actionRepository.findChildren(p).forEach(v => {
            actionMap[v.id.value] = v;
          })
        })
      }
    )
    
    parents.forEach(p => {
      var underObjectives = this.objectiveRepository.findUnder(p);
      underObjectives.forEach(v => {
        objectiveMap[v.id.value] = v;
        this.actionRepository.findChildren(v.id).forEach(v => {
          actionMap[v.id.value] = v;
        })
      });
      this.objectiveRepository.findParentsTree(p).forEach(v => objectiveMap[v.id.value] = v);
    })
    var element = document.querySelector("#profu");
    var text = MermaidConvertor.toMermaidScript(Object.values(objectiveMap), Object.values(actionMap));  
    this.mermaid.mermaidAPI.render('graphDiv', text, (svg) => element.innerHTML = svg);
  }
}

export class PjfuVue { 
  private app: any;
  private data: {
    message: string,
    treeTargetId: string;
    editTargetId: string;
    editForm: {
      id: string;
      title: string;
      parents: string[];
      detail: MetaDataForm;
      links: { name: string; path: string; }[];
    };
  } = {
      message: 'hoge',
      treeTargetId: '',
      editTargetId: '',
      editForm: {
        id: '',
        title: '',
        parents: [''],
        detail: new MetaDataForm(),
        links: [{ name: '', path: '' }]
      }
    };
  constructor(
    private objectiveRepository: ObjectiveRepositoryImpl,
    private actionRepository: ActionRepositoryImpl,
    private mermaidTreeView: MermaidTreeView,
    Vue: any
  ) {

    this.init(Vue);
  }
  init(Vue: any) {
    try {
    this.app = new Vue({
      el: '#app',
      data: this.data,
      methods: {
        onClickApplyRootIdButton: () => this.applyTreeId(),
        onClickUpdateButton: () => this.update()
      }
    });
    } catch(e) {
      console.error(e);
    }
  }

  applyTreeId() {
    console.log('click', this.data.treeTargetId);
  }
  applyTargetId(id: AnyId) {
    console.log(id);
    id.forEach<void>(
      id => {
        const objective = this.objectiveRepository.findById(id);
        this.data.editTargetId = objective.id.value;
        this.data.editForm.id = objective.id.value;
        this.data.editForm.title = objective.title;
        this.data.editForm.parents = [objective.isNotRoot ? objective.parent.value : ''];
        this.data.editForm.detail.set(objective.metaData)
        this.data.editForm.links = objective.metaData.links.map(v => ({name: v.name, path: v.path}))
      },
      id => {
        const action = this.actionRepository.findById(id);
        this.data.editTargetId = action.id.value;
        this.data.editForm.id = action.id.value;
        this.data.editForm.title = action.title;
        this.data.editForm.parents = action.parents.map(v => v.value);
        this.data.editForm.detail.set(action.metaData)
        this.data.editForm.links = action.metaData.links.map(v => ({name: v.name, path: v.path}))
      }
    )
  }
  update() {
    console.log('update');
    const callbackOnSaved = (e) => {
      if(e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }
      this.mermaidTreeView.update();
    }

    const anyId = new AnyId(this.data.editForm.id);
    if(anyId.isEmpty()) {
      throw new Error('IDが空');
    }
    anyId.forEach(
      id => {
        const newEntity = new Objective.Entity(
          id,
          this.data.editForm.title,
          this.data.editForm.parents.map(v => new Objective.Id(v))[0],
          this.data.editForm.detail.get()
        )
        this.objectiveRepository.update(newEntity, callbackOnSaved);
      },
      id => {
        const newEntity = new Action.Entity(
          id,
          this.data.editForm.title,
          this.data.editForm.parents.map(v => new Objective.Id(v)),
          this.data.editForm.detail.get()
        )
        this.actionRepository.update(newEntity, callbackOnSaved);
      }
    )
  }
}
