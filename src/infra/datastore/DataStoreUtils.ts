import {
  Link,
  MetaData,
  Note,
  Task,
  TaskLimitDate
} from '../../domain/domain';
import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";


export class DataStoreUtils {
  static dataToObjectiveEntity(v): Objective.Entity {
    return new Objective.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parent ? new Objective.Id(v.parent) : null,
      new MetaData(
        v.metaData.description,
        v.metaData.members || [],
        v.metaData.links ? v.metaData.links.map(v => new Link(v.name, v.path)) : [],
        new Note(v.note || v.metaData.note || ''),
        v.metaData.tasks ? v.metaData.tasks.map(v => new Task(new TaskLimitDate(v.limitDate), v.title)) : []
      )
    );
  }

  static dataToActionEntity(v): Action.Entity {
    return new Action.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parents.map(v => new Action.Id(v)),
      new MetaData(
        v.metaData.description,
        v.metaData.members || [],
        v.metaData.links ? v.metaData.links.map(v => new Link(v.name, v.path)) : [],
        new Note(v.note || v.metaData.note || ''),
        v.metaData.tasks ? v.metaData.tasks.map(v => new Task(new TaskLimitDate(v.limitDate), v.title)) : []
      )
    );
  }
}
