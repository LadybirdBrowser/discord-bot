/*
 * Copyright (c) 2021-2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2022, Filiph Sandström <filiph.sandstrom@filfatstudios.com>
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

/* eslint camelcase: [2, { "properties": "never" }] */
import { Octokit } from "@octokit/rest";
import { throttling as OctokitThrottling } from "@octokit/plugin-throttling";
import config from "../config/botConfig";
import { env } from "../config/env";

export interface ManPage {
  url: string;
  section: string;
  page: string;
  markdown: string;
}

export interface Fortune {
  quote: string;
  author: string;
  utc_time: number;
  url: string;
  context?: string;
}

export interface Repository {
  owner: string;
  name: string;
}

export interface Commit {
  html_url: string;
  sha: string;
  commit: {
    message: string;
  };
}

export const LADYBIRD_REPO = {
  owner: "LadybirdBrowser",
  name: "ladybird",
};

type SearchResultReturnType = Exclude<
  Awaited<ReturnType<Octokit["search"]["issuesAndPullRequests"]>>["data"]["items"],
  number
>;

export interface UserIssuesAndPulls {
  pulls: SearchResultReturnType;
  issues: SearchResultReturnType;
}

class GithubAPI {
  private readonly octokit: Octokit;

  constructor() {
    // @ts-expect-error -- TODO: types need fixes
    this.octokit = new (Octokit.plugin(OctokitThrottling))({
      userAgent: "Ladybird-Bot",
      auth: env.GITHUB_TOKEN,
      throttle: {
        onRateLimit: () => true,
        onSecondaryRateLimit: () => true,
      },
    });
  }

  async searchIssuesOrPulls(query: string, repository: Repository = LADYBIRD_REPO) {
    const qualifiers = [query, `repo:${repository.owner}/${repository.name}`];
    const results = await this.octokit.search.issuesAndPullRequests({
      q: qualifiers.join("+"),
      per_page: 1,
      sort: "updated",
      order: "desc",
    });
    const {
      data: { items },
    } = results;
    return items[0];
  }

  async getIssueOrPull(number: number, repository: Repository = LADYBIRD_REPO) {
    try {
      const results = await this.octokit.issues.get({
        owner: repository.owner,
        repo: repository.name,
        issue_number: number,
      });
      return results.data;
    } catch (e) {
      console.trace(e);
      return undefined;
    }
  }

  async getPull(number: number, repository: Repository = LADYBIRD_REPO) {
    try {
      const results = await this.octokit.pulls.get({
        owner: repository.owner,
        repo: repository.name,
        pull_number: number,
      });
      return results.data;
    } catch (e) {
      console.trace(e);
      return undefined;
    }
  }

  async getUser(author: string) {
    try {
      let username = author;
      if (author.includes("@")) {
        const search = await this.octokit.search.users({
          q: `${author.includes("@") ? `${author} in:email` : `user:${author}`}:`,
          per_page: 1,
        });

        if (search.data.total_count <= 0)
          throw new Error(`A GitHub user with the primary email ${author} was not found`);

        username = search.data.items[0].login;
      }

      const results = await this.octokit.users.getByUsername({
        username,
      });

      return results.data;
      // eslint-disable-next-line -- TODO type properly
    } catch (e: any) {
      if (e.status === 404) return null;

      console.trace(e);
      throw e;
    }
  }

  async getCommitsCount(
    author: string,
    repository: Repository = LADYBIRD_REPO
  ): Promise<number | undefined> {
    try {
      const results = await this.octokit.search.commits({
        q: `${author.includes("@") ? "author-email" : "author"}:${author}+repo:${
          repository.owner
        }/${repository.name}`,
        sort: "committer-date",
        order: "desc",
        per_page: 1,
      });

      return results.data?.total_count;
    } catch (e: unknown) {
      console.trace(e);
      throw e;
    }
  }

  async searchCommit(commitHash?: string, query?: string, repository: Repository = LADYBIRD_REPO) {
    try {
      if (query) {
        const results = await this.octokit.search.commits({
          q: `${query}+repo:${repository.owner}/${repository.name}`,
          sort: "committer-date",
          order: "desc",
        });
        return results.data;
      }

      const results = await this.octokit.request("GET /repos/{owner}/{repo}/commits/{commit_sha}", {
        commit_sha: commitHash,
        owner: repository.owner,
        repo: repository.name,
      });
      return results.data;
    } catch (e) {
      console.trace(e);
      return undefined;
    }
  }

  async fetchUserIssuesAndPulls(username: string): Promise<UserIssuesAndPulls> {
    const queryOpts = {
      repo: `${LADYBIRD_REPO.owner}/${LADYBIRD_REPO.name}`,
      author: username,
    };
    let userPulls: SearchResultReturnType = [];
    const pulls = await this.octokit.search.issuesAndPullRequests({
      q: Object.entries({ ...queryOpts, is: "pr" })
        .map(([k, v]) => k + ":" + v)
        .join("+"),
      per_page: 20,
    });
    if (pulls.status === 200) userPulls = pulls.data.items;
    let userIssues: SearchResultReturnType = [];
    const issues = await this.octokit.search.issuesAndPullRequests({
      q: Object.entries({ ...queryOpts, is: "issue" })
        .map(([k, v]) => k + ":" + v)
        .join("+"),
      per_page: 20,
    });
    if (issues.status === 200) userIssues = issues.data.items;
    return { pulls: userPulls, issues: userIssues };
  }

  async fetchLadybirdRepos(): Promise<Repository[]> {
    const results = await this.octokit.repos.listForOrg({
      org: LADYBIRD_REPO.owner,
    });
    return results.data
      .map(repo => ({
        owner: repo.owner.login,
        name: repo.name,
      }))
      .filter(({ name }) => !config.excludedRepositories.includes(name));
  }
}

const api = new GithubAPI();
export default api;
