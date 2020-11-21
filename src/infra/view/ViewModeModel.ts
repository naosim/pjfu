
export type ViewModeModel = {
  modeType: ModeType,
  treeTargetId: string,
  selectedMembers: string[],
  members: string[],//全員
}

export enum ModeType {
  targetTree = 'targetTree',
  member = 'member'
}