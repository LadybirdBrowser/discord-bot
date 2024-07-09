/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DISCORD_TOKEN: z
    .string({
      // eslint-disable-next-line camelcase -- Param isn't camelcase
      required_error: "DISCORD_TOKEN was not found, either it or the .env file are missing",
    })
    .trim()
    .min(1, "DISCORD_TOKEN was not of the minimum length it is either malformed or incomplete"),
  GITHUB_TOKEN: z
    .string({
      // eslint-disable-next-line camelcase -- Param isn't camelcase
      required_error: "GITHUB_TOKEN was not found, either it or the .env file are missing",
    })
    .trim()
    .min(1, "GITHUB_TOKEN was not of the minimum length it is either malformed or incomplete")
    .optional(),
  GUILD_ID: z
    .string({
      // eslint-disable-next-line camelcase -- Param isn't camelcase
      required_error: "GUILD_ID was not found, either it or the .env file are missing",
    })
    .trim()
    .min(1, "GUILD_ID was not of the minimum length it is either malformed or incomplete"),
});

const envParse = envSchema.safeParse({
  NODE_ENV: process.env["NODE_ENV"],
  DISCORD_TOKEN: process.env["DISCORD_TOKEN"],
  GITHUB_TOKEN: process.env["GITHUB_TOKEN"],
  GUILD_ID: process.env["GUILD_ID"],
});

if (!envParse.success) {
  envParse.error.issues.forEach(issue => console.error(issue.message));
  throw new Error("There was an issue parsing the env vars, check the above errors");
}

export const env = envParse.data;

type EnvSchemaType = z.infer<typeof envSchema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- intentional global override of process.env.
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface -- Just an overwrite of types
    interface ProcessEnv extends EnvSchemaType {}
  }
}
