

export class IssueNumber {
  constructor(readonly value: number) {}
}

export class IssueRepositoryImpl {
  private issueMap;// cache
  private gh: any;
  private issues: any;
  constructor(
    githubToken: string, 
    owner: string, 
    repo: string,
    readonly isOnlyOpenIssue: boolean,
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