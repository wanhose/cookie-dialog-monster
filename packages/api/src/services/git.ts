import environment from './environment';

const API_URL = 'https://api.github.com/repos/wanhose/cookie-dialog-monster';

export async function createIssue(params: CreateIssueParams): Promise<Issue> {
  const { description, title } = params;
  const body: { [key: string]: number[] | string | string[] } = {
    assignees: ['wanhose'],
    body: description,
    labels: [],
    title,
  };
  const headers = new Headers({
    Authorization: `token ${environment.github.token}`,
    'Content-Type': 'application/json',
  });

  if (params.labels) {
    const response = await fetch(`${API_URL}/labels`, { headers });
    const labels = (await response.json()) as readonly Label[];

    for (const label of labels) {
      if (params.labels.includes(label.name)) {
        (body.labels as number[]).push(label.id);
      }
    }
  }

  const response = await fetch(`${API_URL}/issues`, {
    body: JSON.stringify(body),
    headers,
    method: 'POST',
  });
  const issue = await response.json();

  return issue as unknown as Issue;
}

export async function createIssueComment(params: CreateIssueCommentParams): Promise<Issue | null> {
  const { description, id } = params;
  const headers = new Headers({
    Authorization: `token ${environment.github.token}`,
    'Content-Type': 'application/json',
  });

  const response = await fetch(`${API_URL}/issues/${id}/comments`, {
    body: JSON.stringify({ body: description }),
    headers,
    method: 'POST',
  });
  const issue = await response.json();

  return issue as unknown as Issue | null;
}

export async function getIssue(params: GetIssueParams): Promise<Issue | null> {
  const { labels, state, title } = params;
  const headers = new Headers({
    Authorization: `token ${environment.github.token}`,
    'Content-Type': 'application/json',
  });
  const search = new URLSearchParams({
    q: title,
    state: 'all',
    type: 'issues',
  });

  if (labels) {
    search.append('labels', `${labels}`);
  }

  if (state) {
    search.append('state', state);
  }

  const response = await fetch(`${API_URL}/issues?${search}`, { headers });
  const issues: readonly Issue[] = (await response.json()) as unknown as readonly Issue[];

  return issues.find((issue) => issue.title === title) || null;
}

export async function updateIssue(params: UpdateIssueParams): Promise<Issue | null> {
  const { id, labels, state } = params;
  const body: { [key: string]: string } = {};
  const headers = new Headers({
    Authorization: `token ${environment.github.token}`,
    'Content-Type': 'application/json',
  });

  if (labels) {
    await fetch(`${API_URL}/issues/${id}/labels`, {
      headers,
      method: 'DELETE',
    });
    await fetch(`${API_URL}/issues/${id}/labels`, {
      body: JSON.stringify({ labels }),
      headers,
      method: 'POST',
    });
  }

  if (state) {
    body['state'] = state;
  }

  const response = await fetch(`${API_URL}/issues/${id}`, {
    body: JSON.stringify(body),
    headers,
    method: 'PATCH',
  });
  const issue = await response.json();

  return issue as unknown as Issue | null;
}

export interface CreateIssueParams {
  readonly description: string;
  readonly labels?: readonly string[];
  readonly title: string;
}

export interface CreateIssueCommentParams {
  readonly description: string;
  readonly id: number;
}

export interface GetIssueParams {
  readonly labels?: readonly string[];
  readonly state?: string;
  readonly title: string;
}

export interface Issue {
  readonly html_url: string;
  readonly id: number;
  readonly labels: readonly Label[];
  readonly state: string;
  readonly title: string;
}

export interface Label {
  readonly id: number;
  readonly name: string;
}

export interface UpdateIssueParams {
  readonly id: number;
  readonly labels?: readonly string[];
  readonly state?: string;
}
