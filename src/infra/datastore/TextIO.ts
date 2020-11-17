import { IssueNumber, IssueRepositoryImpl } from "../infra";

export interface TextIO {
  saveObjectives(raw: string, callback: (err: Error) => void);
  saveActions(raw: string, callback: (err: Error) => void);
  loadObjectives(callback: (err: Error, raw: string) => void);
  loadActions(callback: (err: Error, raw: string) => void);
}

export class LocalStrageIO implements TextIO {
  saveObjectives(raw: string, callback: (err: Error) => void) {
    localStorage.setItem('objectiveTree', raw);
    setTimeout(() => callback(null), 100);
  }
  saveActions(raw: string, callback: (err: Error) => void) {
    localStorage.setItem('actionTree', raw);
    setTimeout(() => callback(null), 100);
  }
  loadObjectives(callback: (err: Error, raw: string) => void) {
    const raw = localStorage.getItem('objectiveTree');
    setTimeout(() => callback(null, raw), 100);
  }
  loadActions(callback: (err: Error, raw: string) => void) {
    const raw = localStorage.getItem('actionTree');
    setTimeout(() => callback(null, raw), 100);
  }

}

export class GithubIssueIO implements TextIO {
  constructor(
    private objectiveIssueNumber: IssueNumber,
    private actionIssueNumber: IssueNumber,
    private issueRepository: IssueRepositoryImpl
    ) {}
  saveObjectives(raw: string, callback: (err: Error) => void) {
    this.issueRepository.updateBody(this.objectiveIssueNumber, raw, callback)
  }
  saveActions(raw: string, callback: (err: Error) => void) {
    this.issueRepository.updateBody(this.actionIssueNumber, raw, callback)
  }
  loadObjectives(callback: (err: Error, raw: string) => void) {
    this.issueRepository.getIssue(this.objectiveIssueNumber, (err, issue) => {
      if(err) {
        callback(err, null);
        return;
      }
      callback(null, issue.body);
    });
  }
  loadActions(callback: (err: Error, raw: string) => void) {
    this.issueRepository.getIssue(this.actionIssueNumber, (err, issue) => {
      if(err) {
        callback(err, null);
        return;
      }
      callback(null, issue.body);
    });
  }

}