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

  private static dataToMetaData(mataDataObj, now: Date): MetaData {
    
    return new MetaData(
      mataDataObj.description,
      mataDataObj.members || [],
      mataDataObj.links ? mataDataObj.links.map(v => new Link(v.name, v.path)) : [],
      new Note(mataDataObj.note || ''),
      mataDataObj.tasks ? mataDataObj.tasks.map(v => new Task(v.limitDate.dateString ? new TaskLimitDate(v.limitDate.raw, v.limitDate.dateString) : TaskLimitDate.create(v.limitDate, now), v.title, new TaskStatus(v.status || ''))) : []
    )
  }

  static dataToObjectiveEntity(v, now: Date): Objective.Entity {
    // console.log(DataStoreUtils.dataToMetaData(v.metaData));
    return new Objective.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parent ? new Objective.Id(v.parent) : null,
      DataStoreUtils.dataToMetaData(v.metaData, now)
    );
  }

  static dataToActionEntity(v, now: Date): Action.Entity {
    return new Action.Entity(
      new Objective.Id(v.id),
      v.title,
      v.parents.map(v => new Action.Id(v)),
      DataStoreUtils.dataToMetaData(v.metaData, now)
    );
  }
}
