import { MetaData } from '../../domain/domain.ts';
import { Action } from "../../domain/Action.ts";
import { Objective } from "../../domain/Objective.ts";
import { MetaDataForm } from './MetaDataConverter.ts';
import { AnyId } from './AnyId.ts';

export class ParentsForm {
  value = '';
  set(parents: Objective.Id[]) {
    this.value = parents.map(v => v.value).join(', ');
  }
  get(): Objective.Id[] {
    if(this.value.trim().length == 0) {
      return []
    }
    return this.value.split(',').map(v => new Objective.Id(v.trim()));
  }
  
}


export class EditForm {
  id: string = '';
  title: string = '';
  parents: ParentsForm = new ParentsForm();
  detail: MetaDataForm = new MetaDataForm();
  links: { name: string; path: string; }[] = [{ name: '', path: '' }];
  getAnyId(): AnyId {
    const anyId = new AnyId(this.id);
    if (anyId.isEmpty()) {
      throw new Error('IDが空');
    }
    return anyId;
  }
  forEachId(
    objectiveCallback: (id: Objective.Id) => void,
    actionCallback: (id: Action.Id) => void
  ) {
    return this.getAnyId().forEach(objectiveCallback, actionCallback);
  }
  createObjectiveEntity(id: Objective.Id): Objective.Entity {
    return new Objective.Entity(
      id!,
      this.title,
      this.detail.get(new Date()),
      this.parents.get()[0]
    );
  }
  setObjectiveEntity(entity: Objective.Entity) {
    this.id = entity.id.value;
    this.title = entity.title;
    this.parents.set(entity.isNotRoot ? [entity.parent!] : []);
    this.detail.set(entity.metaData);
    this.links = entity.metaData.links.map(v => ({ name: v.name, path: v.path }));
  }
  createActionEntity(id: Action.Id): Action.Entity {
    return new Action.Entity(
      id,
      this.title,
      this.parents.get(),
      this.detail.get(new Date())
    );
  }
  setActionEntity(entity: Action.Entity) {
    this.id = entity.id.value;
    this.title = entity.title;
    this.parents.set(entity.parents);
    this.detail.set(entity.metaData);
    this.links = entity.metaData.links.map(v => ({ name: v.name, path: v.path }));
  }
  toEntity(objectiveCallback: (o: Objective.Entity) => void, actionCallback: (a: Action.Entity) => void) {
    const anyId = this.getAnyId();
    anyId.forEach(
      id => {
        objectiveCallback(new Objective.Entity(
          id,
          this.title,
          this.detail.get(new Date()),
          this.parents.get()[0]
        ));
      },
      id => {
        actionCallback(new Action.Entity(
          id,
          this.title,
          this.parents.get(),
          this.detail.get(new Date())
        ));
      }
    );
  }
  setSub() {
    // TODO ガード
    this.parents.set([new Objective.Id(this.id)]);
    this.id = '';
    this.title = '';
    this.detail.set(MetaData.empty());
  }
}
