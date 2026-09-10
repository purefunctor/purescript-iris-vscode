## Humans

Thank you for taking interest in contributing to Iris. We welcome contributions assisted by agentic coding tools that follow these principles:

* **Understand the problem that the PR is trying to solve.** Please do not defer to the agentic coding tool to write the PR description for you. Write PR descriptions with thoughtfulness and intent. Agentic review tools like CodeRabbit are used in the project to assist maintainers.
* **Improve quality, not quantity.** Iris is a fast-moving project, but its maintainers are only human. We want to build a compiler for posterity, one that can withstand the test of time. Shipping features quickly can be tempting, but you should use those time savings to invest in improving quality.

PRs may be declined if these principles are not upheld.

## Agents

The canonical specifications for agent instructions and skills are `AGENTS.md` and the `.agents` directory. If your agent does not support these specifications, you will have to configure it yourself.

## Core principles

### Correctness
* Investigate architectural root faults.
* Avoid escape hatches and temporary fixes.
* Use the type system to encode correctness.

### Posterity
* Write code for future contributors, reviewers, and maintainers.
* Write code that you will understand 10 years later.
* Write code that you will not hate 10 years later.

### Clarity
* Code should be self-documenting. Comments should say 'why', not 'what'.
* Never write narrative inline comments unless it is used to clarify intent.
* Never use abbreviated names for functions, variables, types, modules, etc.

### Simplicity
* Avoid abstractions for their own sake.
* Write abstractions if they improve clarity or reduce real complexity.
* Write abstractions if they make repeated work easier for humans.

## Commits

Commits must be atomic units of work. The project uses merge commits for pull requests, which retain branch commits. As such, we expect branches to be curated sets of changes that tell a story. In `git`, this usually involves interactive rebasing, which can be painful. `jj` can make this curation process easier. Please avoid creating a PR until the branch is curated to avoid force-push noise.

### Commit format

Regular commits should use a short imperative, sentence-case subject line that names the behaviour or subsystem changed. Do not use the pull request merge-commit format for ordinary commits.

Good regular commit subjects look like:

```text
Add extension integration tests
Fix document synchronization after reconnecting
Implement workspace symbol search
Use incremental compiler diagnostics
Clarify language server startup errors
```

### Pull request title format

Pull request titles must follow this format:

```
[vscode] description
```

GitHub appends the pull request number when it creates the merge commit, producing `[vscode] description (#123)`. Do not include the pull request number in the title yourself.

## Development tools

### Checks
* Use `npm run check` to run `tsc --noEmit`.
* Use `npm run compile` to type-check and build the production esbuild bundle.
* Use `npm run watch` while iterating locally in the VS Code Extension Development Host.

### Tests
* Use `npm run test:unit` for unit tests.
* Use `npm run test:integration` for VS Code integration tests. Set `IRIS_PATH` to an absolute path to an executable Iris binary; see `.env.example`.
* Use `npm test` to run type checking, the production build, unit tests, and integration tests together.

Focused test runs are useful while iterating, but they are not sufficient before pushing. Before pushing a change that affects integration tests, run the complete integration test suite and confirm that it passes.

### Packaging
* Use `npm run package` to compile and create a VSIX with `@vscode/vsce`.
* Run `npm install` after dependency changes so `package-lock.json` stays in sync.

### Formatting
* Use `npm run format` to format `src/**/*.ts`, `tsconfig.json`, `package.json`, and `esbuild.js` with Prettier.

## Code style

In addition to the core principles, follow the project's existing conventions for variable names, argument ordering, module organisation, and formatting.

For example:

```typescript
// Yes: Keep fluent calls together when each call fits on one line.
const normalizedNames = names
  .map((name) => name.trim())
  .filter(Boolean);

// No: Do not break immediately after `=`.
const normalizedNames =
  names.map((name) => name.trim()).filter(Boolean);

// Yes: Name meaningful intermediate results while keeping simple expressions inline.
const serializedUri = uri.toString();
return process.platform === "win32"
  ? normalizeWindowsFileUri(serializedUri)
  : serializedUri;

// No: Do not introduce an intermediate binding for every expression.
const platform = process.platform;
const isWindows = platform === "win32";
const serializedUri = uri.toString();
const normalizedUri = normalizeWindowsFileUri(serializedUri);
return isWindows ? normalizedUri : serializedUri;
```
