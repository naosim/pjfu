import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";
import { ActionDataStore } from '../ActionDataStore';
import { ObjectiveDataStore } from '../ObjectiveDataStore';

export interface DataStore extends ObjectiveDataStore, ActionDataStore {
  findAll(callback: (err: Error, objectives: Objective.Entity[], actions: Action.Entity[]) => void)
}
