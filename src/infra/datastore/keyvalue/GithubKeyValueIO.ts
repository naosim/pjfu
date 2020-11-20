import { KeyValueIO } from "./KeyValueIO";
import { IssueNumber, IssueRepositoryImpl } from "./IssueRepositoryImpl";


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
  save(key: string, value: string, callback: (err: Error) => void) {
    this.issueRepository.updateBody(this.keyMap[key], value, callback);
  }
  load(key: string, callback: (err: Error, value: string) => void) {
    this.issueRepository.getIssue(this.keyMap[key], (err, issue) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, issue.body);
    });
  }
}
