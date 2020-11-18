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
  private issueRepository: IssueRepositoryImpl
  constructor(
    private objectiveIssueNumber: IssueNumber,
    private actionIssueNumber: IssueNumber,
    githubToken: string, 
    owner: string, 
    repo: string,
    GitHub: any
    ) {
      this.issueRepository = new IssueRepositoryImpl(
        githubToken, owner, repo, GitHub
      )
    }
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

class GasIO {
  // TODO
}

export class IssueNumber {
  constructor(readonly value: number) {}
}

class IssueRepositoryImpl {
  private gh: any;
  private issues: any;
  constructor(
    githubToken: string, 
    owner: string, 
    repo: string,
    GitHub: any
  ) {
    this.gh = new GitHub({token: githubToken});
    this.issues = this.gh.getIssues(owner, repo)
  }
  
  getIssue(issueNumber: IssueNumber, callback: (err, issue) => void): void {
    this.issues.getIssue(issueNumber.value, callback);
  }

  updateTitle(issueNumber: IssueNumber, title: string, callback: (err, obj) => any) {
    this.issues.editIssue(issueNumber.value, {title: title}, callback) 
  }

  updateBody(issueNumber: IssueNumber, body: string, callback: (err, obj) => any) {
    this.issues.editIssue(issueNumber.value, {body: body}, callback) 
  }

  createIssue(issue: {title: string, body: string}, callback: (err, obj) => any) {
    this.issues.createIssue(issue, callback);
  }
}