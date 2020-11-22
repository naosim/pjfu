import { Action } from "../../domain/Action.ts";
import { StringValueObject } from "../../domain/domain.ts";
import { Objective } from "../../domain/Objective.ts";

export class AnyId {
  constructor(private id: string) { }
  forEach<T>(
    objectiveCallback: (id: Objective.Id) => T,
    actionCallback: (id: Action.Id) => T
  ): T {
    if (this.id[0] == 'O') {
      return objectiveCallback(new Objective.Id(this.id));
    } else if (this.id[0] == 'A') {
      return actionCallback(new Action.Id(this.id));
    } else {
      throw new Error('未知のID: ' + this.id);
    }
  }
  getValue() {
    return this.id.trim();
  }
  isEmpty(): boolean {
    return this.getValue().length == 0;
  }

  static create(id: StringValueObject): AnyId {
    return new AnyId(id.value);
  }
}
