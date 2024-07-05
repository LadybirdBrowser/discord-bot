/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { describe, it, expect } from "bun:test";
import githubAPI from "@/apis/githubAPI";
import { env } from "@/config/env";
import { calculateCommitStats } from "@/commands/commitStatsCommand";
import { CommitClubColor } from "@/util/color";

describe("Github API", () => {
  it("Fetch repositories", async () => {
    const repos = await githubAPI.fetchLadybirdRepos();

    expect(repos.length).toBeGreaterThanOrEqual(1);
  });
  it("Filter repositories", async () => {
    const repos = await githubAPI.fetchLadybirdRepos();

    expect(repos.filter(({ name }) => ["ladybird"].includes(name)).length).toBe(1);
  });
  it("Get commit count", async () => {
    const count = await githubAPI.getCommitsCount("awesomekling");

    expect(count).toBeGreaterThan(15000);
  });
});

describe("Env Validation", () => {
  it("Zod parse", async () => {
    expect(env.GUILD_ID).toBe(process.env.GUILD_ID);
  });
});

describe("Bot Features", () => {
  it("Commit Rank", async () => {
    const result = await calculateCommitStats("awesomekling");
    if (!result.ok) throw new Error();
    const { color } = result.value;
    expect(color?.({})).toBe(CommitClubColor.TenThousand);
  }, 100000);

  // TODO expand features test suite and then break this file up
});
