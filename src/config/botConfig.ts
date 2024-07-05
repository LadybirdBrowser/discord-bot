/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { env } from "./env";

type BotConfig = {
  production: boolean;
  excludedRepositories: string[];
};

const config: BotConfig = {
  production: env.NODE_ENV === "production",
  excludedRepositories: [],
};

export default config;
