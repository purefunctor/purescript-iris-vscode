import * as path from "path";

import { runIntegrationTests } from "../runner";

export function run(): Promise<void> {
  return runIntegrationTests(path.resolve(__dirname, "features"));
}
