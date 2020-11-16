import {
  Link,
  MetaData,
  Note,
  Task,
  TaskLimitDate,
  TaskStatus
} from '../../domain/domain';
import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";



export class DataStoreUtils {

  private static dataToMetaData(mataDataObj): MetaData {
    return new MetaData(
      mataDataObj.description,
      mataDataObj.members || [],
      mataDataObj.links ? mataDataObj.links.map(v => new Link(v.name, v.path)) : [],
      new Note(mataDataObj.note || ''),
      mataDataObj.tasks ? mataDataObj.tasks.map(v => new Task(new TaskLimitDate(v.limitDate), v.title, new TaskStatus(v.status || ''))) : []
    )
  }

  static dataToObjectiveEntity(v): Objective.Entity {
    return new Objective.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parent ? new Objective.Id(v.parent) : null,
      DataStoreUtils.dataToMetaData(v.metaData)
    );
  }

  static dataToActionEntity(v): Action.Entity {
    return new Action.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parents.map(v => new Action.Id(v)),
      DataStoreUtils.dataToMetaData(v.metaData)
    );
  }
}
