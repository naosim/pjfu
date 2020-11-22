import { KeyValueIO } from "./KeyValueIO.ts";


export class GithubKeyValueIO implements KeyValueIO {
  private issueRepository: IssueRepositoryImpl;
  constructor(
    private keyMap: { [key: string]: IssueNumber; },
    githubToken: string,
    owner: string,
    repo: string,
    GitHub: any
  ) {
    this.issueRepository = new IssueRepositoryImpl(
      githubToken, owner, repo, GitHub
    );
  }
  save(key: string, value: string, callback: (err?: Error) => void): void {
    this.issueRepository.updateBody(this.keyMap[key], value, callback);
  }
  load(key: string, callback: (err?: Error, value?: string) => void): void {
    this.issueRepository.getIssue(this.keyMap[key], (err, issue) => {
      if (err) {
        callback(err);
        return;
      }
      callback(undefined, issue.body);
    });
  }
}

export class IssueNumber {
  constructor(readonly value: number) {}
}

export class IssueRepositoryImpl {
  private gh: any;
  private issues: any;
  constructor(
    githubToken: string,
    owner: string,
    repo: string,
    GitHub: any
  ) {
    this.gh = new GitHub({ token: githubToken });
    this.issues = this.gh.getIssues(owner, repo);
  }

  getIssue(issueNumber: IssueNumber, callback: (err?: Error, issue?: any) => void): void {
    this.issues.getIssue(issueNumber.value, callback);
  }

  updateTitle(issueNumber: IssueNumber, title: string, callback: (err?: Error, obj?: any) => any) {
    this.issues.editIssue(issueNumber.value, { title: title }, callback);
  }

  updateBody(issueNumber: IssueNumber, body: string, callback: (err?: Error, obj?: any) => any) {
    this.issues.editIssue(issueNumber.value, { body: body }, callback);
  }

  createIssue(issue: { title: string; body: string; }, callback: (err?:Error, obj?: any) => any) {
    this.issues.createIssue(issue, callback);
  }
}
