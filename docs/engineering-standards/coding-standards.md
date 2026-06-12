# Coding Standards

These are the language-agnostic engineering standards for this repository. The
language style guides ([TypeScript](style-guide-typescript.md),
[JavaScript](style-guide-javascript.md)) and the project's
[`CLAUDE.md`](../../CLAUDE.md) build on top of these. Deeper rationale lives in
[engineering-principles.md](engineering-principles.md).

Every line of code you write will be read by humans who didn't write it, debugged at 3 AM by someone who's never seen it, and run in an environment where everything that can fail eventually will. Follow these as constraints.

## Structure & Responsibility

- Give every function a single responsibility. If a function does two things, write two functions.
- Keep functions short — under 30 lines for most, under 60 for complex ones.
- Prefer flat control flow. Use early returns and guard clauses instead of deep nesting. Maximum 3 levels of indentation.
- Do not create abstractions, base classes, factories, or generic frameworks unless there are at least two concrete existing use cases. Solve the current problem, not a hypothetical future one.
- Do not write speculative code ("we might need this later"). Do not leave commented-out code. Do not leave TODO comments without a clear description of what's needed.
- Remove dead code. If it's not called, delete it.

## Naming

- Name functions, variables, classes, and modules so that a reader does not need a comment to understand their purpose.
- Booleans read as questions: `is_valid`, `has_permission`, `should_retry`.
- Functions describe actions: `fetch_user`, `validate_address`, `calculate_shipping_cost`.
- Do not abbreviate unless the abbreviation is universal in the domain (`db`, `url`, `id`, `http` are fine).

## Dependencies & Configuration

- Pass dependencies into functions and constructors as arguments. Do not instantiate concrete dependencies (database clients, HTTP clients, external services) inside business logic.
- Business logic must not import from infrastructure or framework modules. The dependency arrow points inward: infrastructure depends on business logic, not the reverse. (In this repo: `src/lib/**` is the pure core — see [architecture.md](../architecture.md).)
- Never hardcode secrets, API keys, connection strings, or environment-specific values. These come from environment variables or configuration injected at startup.
- All configuration values that differ between environments must be overridable without a code change.

## Error Handling

- Fail immediately when invalid state is detected. Do not pass bad data deeper into the call stack.
- Every error must include: what operation was attempted, why it failed, and enough identifiers (request ID, user ID, resource ID) to reproduce the issue.
- Catch only the specific error types you can handle. Do not catch broad exception types unless at a top-level boundary (e.g., an HTTP error handler).
- Never write an empty catch block. Never swallow errors silently. At minimum, log with full context.
- When re-raising or wrapping an error, preserve the original error as the cause.

## Types & Validation

- Type-annotate every public function, method, and class. Do not use `any`/`unknown` (without narrowing) or equivalent escape hatches unless absolutely necessary — and if so, add a comment explaining why.
- Use structured types (interfaces, typed models) for any data with a known shape. Do not pass plain objects or raw maps as structured data between functions.
- Validate all external input at the boundary where it enters the system: API endpoints, message consumers, file parsers, third-party API responses. After validation, trust the data internally — do not re-validate at every layer.

## Observability

- Use structured logging (key-value or JSON), not string concatenation/interpolation for log messages.
- Include correlation/request IDs in all log output so a request can be traced across services.
- Every function that makes an external call (HTTP, database, queue, cache) should be observable: the call, its duration, and its result should be visible in logs or metrics.
- Do not use print statements for logging. Use the project's logging infrastructure.

## Resilience

- Set an explicit timeout on every external call: HTTP requests, database queries, RPC calls, cache lookups. Never rely on the default (usually infinite).
- When retrying failed operations, always use: a maximum retry count (typically 3–5), exponential backoff, and jitter. Never retry in a tight loop. Never retry indefinitely.
- Design every write operation to be idempotent. If the same request is processed twice, the result must be identical. Use idempotency keys, upsert semantics, or deduplication checks.
- Handle process shutdown gracefully: stop accepting new work, complete in-flight operations (with a bounded deadline), close connections, then exit.

## Security

- Use parameterized queries for all database operations. Never interpolate user input into SQL, shell commands, or any structured language.
- Never use `eval()`, `exec()`, or equivalents on untrusted input.
- Never disable SSL/TLS verification.
- Never log secrets, tokens, passwords, or personally identifiable information.
- Use a cryptographically secure random source for tokens and secrets (not a general-purpose RNG).

## Testing

- Write tests alongside the code they cover, in the same change. Do not defer tests.
- Every test must fail when the behavior it covers changes. If you can delete a line of production code and all tests still pass, you're missing a test.
- Prefer pure functions (data in, data out, no side effects) for business logic — they're trivially testable.
- If a function requires complex setup or many mocks to test, that is a signal to refactor: extract dependencies, split responsibilities, or push side effects to the edges.

## How to Apply These Rules

1. **Before writing code:** review the relevant language style guide and this document.
2. **While writing code:** follow the rules as constraints. If a rule conflicts with an explicit instruction in the task or repo `CLAUDE.md`, that takes precedence — but flag the deviation.
3. **After writing code:** review your output against these rules. Check especially for: missing error handling, missing types, hardcoded values, overly complex abstractions, and missing tests.
4. **When uncertain:** choose the simpler approach — fewer abstractions, fewer files, less indirection.

---

*Provenance: vendored and lightly adapted from the maintainers' shared engineering standards so this public repository is self-contained. These are the authoritative coding standards for the repo.*
