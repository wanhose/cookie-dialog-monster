import { Octokit } from 'octokit';
import environment from './environment';

export const octokit = new Octokit({ auth: environment.github.token });
