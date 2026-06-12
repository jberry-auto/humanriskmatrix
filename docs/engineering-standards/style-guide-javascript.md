# JavaScript Style & Standards

Covers naming, formatting, layout, idioms, documentation, and patterns not addressed in the engineering principles. Based on the Airbnb Style Guide, Google Style Guide, and Node.js best practices.

---

## Naming

### Casing Rules

| Construct | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `userName`, `orderTotal`, `isActive` |
| Functions | `camelCase` | `getUser()`, `calculateTotal()` |
| Classes | `PascalCase` | `UserService`, `HttpClient` |
| Constants (true compile-time) | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`, `API_BASE_URL` |
| Constants (runtime-assigned) | `camelCase` with `const` | `const startTime = Date.now()` |
| Enum-like objects | `PascalCase` key, `UPPER` values | `const Status = { ACTIVE: 'ACTIVE' }` |
| Private class fields | `#` prefix | `#connection`, `#cache` |
| Files | `kebab-case` (preferred) or `camelCase` | `user-service.js` |

### Key Practices

- Variables are nouns: `activeUsers`, `retryCount`, `requestHeaders`.
- Booleans: `isValid`, `hasPermission`, `shouldRetry`, `canAccess`.
- Functions are verbs: `fetchUser()`, `validateEmail()`, `sendNotification()`.
- Event handlers: `handleSubmit()`, `handleUserCreated()`, `onConnectionClose()`.
- Factories: `createHttpClient()`, `createLogger()`.
- Predicates: `isExpired()`, `hasEnoughBalance()`.
- Avoid: `data`, `info`, `temp`, `stuff`, `Util`, `Helper`, `Manager`.
- Acronyms as words: `HttpClient` not `HTTPClient`, `parseJsonResponse` not `parseJSONResponse`.

---

## Formatting

Use Prettier (or Biome) with a shared config. Do not fight the formatter.

### Key Defaults

- 2-space indentation (Airbnb, Google, most JS projects) or 4-space (project-dependent).
- Semicolons: always (Airbnb) or never (Standard). Pick one per project.
- Single quotes for strings (Airbnb) or double quotes (Prettier default). Be consistent.
- Max line length: 80-100 characters.
- Trailing commas on multi-line constructs (ES5+).

### Braces and Spacing

```javascript
// Braces on same line — always use braces, even for single-line bodies
if (isValid) {
  process(data);
}

// Space after keywords, before braces
if (condition) { ... }
for (const item of items) { ... }
while (running) { ... }

// No space before function parens in declarations
function fetchUser(id) { ... }
const getUser = (id) => { ... };

// Spaces around operators
const total = price + tax;
const isEligible = age >= 18 && hasConsent;
```

### Object and Array Formatting

```javascript
// Short — single line
const point = { x: 10, y: 20 };
const colors = ['red', 'green', 'blue'];

// Long — multi-line with trailing commas
const config = {
  host: 'localhost',
  port: 8080,
  debug: true,
  retries: 3,
};

const middleware = [
  authenticate,
  rateLimit,
  validateInput,
  logRequest,
];
```

---

## Imports

### Order

Group imports, separated by a blank line:

1. Node.js built-ins (`node:fs`, `node:path`, `node:crypto`)
2. External packages (`express`, `zod`, `pino`)
3. Internal modules (`./services`, `../utils`)

```javascript
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import express from 'express';
import { z } from 'zod';
import pino from 'pino';

import { UserService } from './services/user-service.js';
import { validateRequest } from './middleware/validation.js';
```

### Practices

- Use ES modules (`import`/`export`) exclusively. No `require()` in new code.
- Prefer named exports over default exports.
- Use the `node:` protocol prefix for Node.js built-ins (Node 16+): `import { readFile } from 'node:fs/promises'`.
- Import only what you use — no unused imports.
- Sort imports alphabetically within each group. Automate with ESLint or Prettier plugin.

---

## Code Layout

### Module Structure

```javascript
// 1. Imports (grouped as above)
import ...;

// 2. Constants
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30_000;

// 3. Module-scoped setup (logger, config parsing)
const logger = createLogger('user-service');

// 4. Classes or exported functions (public API)
export class UserService { ... }
export function createUser(data) { ... }

// 5. Private helpers (not exported)
function validateInput(data) { ... }
function formatResponse(user) { ... }
```

### Class Structure

```javascript
export class OrderService {
  // Private fields
  #db;
  #notifier;
  #logger;

  constructor(db, notifier, logger) {
    this.#db = db;
    this.#notifier = notifier;
    this.#logger = logger;
  }

  // Public methods
  async createOrder(userId, items) { ... }
  async cancelOrder(orderId) { ... }

  // Getters/setters
  get pendingCount() { ... }

  // Private methods
  #validateItems(items) { ... }
  #notifyUser(userId, message) { ... }
}
```

### File and Directory Structure

```
src/
├── index.js                # Entry point
├── app.js                  # Application setup (Express, Koa, etc.)
├── config.js               # Configuration loading
├── models/
│   ├── user.js
│   └── order.js
├── services/
│   ├── user-service.js
│   └── order-service.js
├── repositories/
│   └── user-repository.js
├── middleware/
│   ├── auth.js
│   ├── error-handler.js
│   └── validation.js
├── routes/
│   ├── user-routes.js
│   └── order-routes.js
└── utils/
    ├── date-helpers.js
    └── retry.js

tests/
├── services/
│   ├── user-service.test.js
│   └── order-service.test.js
└── middleware/
    └── auth.test.js
```

---

## Documentation

### JSDoc

Use JSDoc for public API documentation, especially in libraries and shared modules.

```javascript
/**
 * Fetches a user by their ID.
 *
 * @param {string} userId - The unique user identifier.
 * @param {Object} [options] - Optional parameters.
 * @param {boolean} [options.includeDeleted=false] - Include soft-deleted users.
 * @returns {Promise<User|null>} The user, or null if not found.
 * @throws {DatabaseError} If the database connection fails.
 *
 * @example
 * const user = await fetchUser('abc-123');
 * console.log(user.name);
 */
export async function fetchUser(userId, options = {}) { ... }
```

### Comments

- Explain *why*, not *what*.
- `// TODO:` with owner or ticket number.
- `// HACK:` or `// FIXME:` with explanation of the constraint.
- Don't comment obvious code.
- Prefer self-documenting code (descriptive names, small functions) over comments.

---

## Idioms and Patterns

### Variable Declarations

```javascript
// const by default
const user = await fetchUser(id);
const config = loadConfig();

// let only when reassignment is needed
let retryCount = 0;
let currentPage = 1;

// Never var
// var leaks scope, hoists, and causes subtle bugs

// One declaration per line
const name = 'Alice';
const age = 30;
// Not: const name = 'Alice', age = 30;
```

### Destructuring

```javascript
// Object destructuring
const { name, email, role = 'member' } = user;

// Array destructuring
const [first, second, ...rest] = items;
const [, , third] = coordinates; // skip first two

// Parameter destructuring
function createUser({ name, email, role = 'member' }) { ... }

// Rename during destructuring
const { name: userName, email: userEmail } = response.data;

// Nested (keep it shallow — one level is usually enough)
const { address: { city } } = user; // acceptable
// Don't go deeper — extract to a variable first
```

### Spread and Rest

```javascript
// Shallow copy objects
const updated = { ...user, name: 'Bob' };

// Shallow copy arrays
const withNew = [...items, newItem];

// Rest parameters
function log(message, ...args) {
  console.log(message, ...args);
}

// Object rest (extract specific keys)
const { password, ...safeUser } = user;
```

### Equality and Comparisons

```javascript
// Always use strict equality
if (x === 0) { ... }
if (name === 'admin') { ... }

// Only exception: == null checks both null and undefined
if (value == null) {
  // value is null or undefined
}

// Prefer early returns over nested if/else
function processOrder(order) {
  if (!order) return null;
  if (!order.items.length) return null;
  if (order.status !== 'pending') return null;

  // Happy path continues here, unindented
  return submitOrder(order);
}
```

### Async Patterns

```javascript
// async/await — preferred
async function processOrders(orderIds) {
  const results = [];
  for (const id of orderIds) {
    const order = await fetchOrder(id);
    results.push(await processOrder(order));
  }
  return results;
}

// Parallel execution
const [user, orders, preferences] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
  fetchPreferences(id),
]);

// Error handling with async/await
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await sleep(backoff(attempt));
    }
  }
}

// allSettled — when you need all results regardless of failures
const results = await Promise.allSettled(urls.map(fetch));
const successes = results
  .filter((r) => r.status === 'fulfilled')
  .map((r) => r.value);
```

### Error Classes

```javascript
export class AppError extends Error {
  constructor(message, { code, statusCode = 500, cause } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id, options = {}) {
    super(`${resource} not found: ${id}`, {
      ...options,
      code: 'NOT_FOUND',
      statusCode: 404,
    });
    this.resource = resource;
    this.resourceId = id;
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = [], options = {}) {
    super(message, { ...options, code: 'VALIDATION_ERROR', statusCode: 400 });
    this.errors = errors;
  }
}
```

### Optional Chaining and Nullish Coalescing

```javascript
// Optional chaining — safe navigation
const city = user?.address?.city;
const firstItem = order?.items?.[0];
const result = callback?.();

// Nullish coalescing — default only for null/undefined
const port = config.port ?? 3000;      // 0 is kept (not null/undefined)
const name = user.name ?? 'Anonymous'; // '' is kept

// Don't confuse with ||
const port = config.port || 3000;      // 0 becomes 3000 (probably wrong)
```

### Iteration

```javascript
// Arrays — use for...of (not for...in)
for (const item of items) { ... }

// Arrays with index — use entries()
for (const [index, item] of items.entries()) { ... }

// Objects — use Object.entries, Object.keys, or Object.values
for (const [key, value] of Object.entries(config)) { ... }

// Functional — use array methods for transformations
const names = users.map((u) => u.name);
const active = users.filter((u) => u.isActive);
const total = items.reduce((sum, item) => sum + item.price, 0);

// Don't use
for (const key in obj) { ... }  // iterates prototype chain
items.forEach((item) => { ... }); // can't break/await, confusing with returns
```

---

## Testing Style

### File and Function Naming

- Test files: `<module>.test.js` or `<module>.spec.js` mirroring source structure.
- Test descriptions: `describe` for the unit, `it` or `test` for the behavior.

```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('creates a user with valid input', async () => {
      // Arrange
      const input = { name: 'Alice', email: 'alice@example.com' };

      // Act
      const user = await service.createUser(input);

      // Assert
      expect(user.name).toBe('Alice');
      expect(user.id).toBeDefined();
    });

    it('throws ValidationError when email is missing', async () => {
      await expect(service.createUser({ name: 'Alice' }))
        .rejects
        .toThrow(ValidationError);
    });

    it('throws ValidationError when name exceeds 100 characters', async () => {
      const input = { name: 'a'.repeat(101), email: 'a@b.com' };
      await expect(service.createUser(input))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### Test Practices

- Arrange-Act-Assert structure.
- Each test covers one behavior.
- Tests are independent — no shared mutable state between tests.
- Use factory functions for test data: `makeUser({ name: 'Alice' })`.
- Prefer `toThrow`, `toReject` matchers over try/catch in tests.

---

## Common Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| `var` declarations | `const` or `let` |
| `==` comparisons | `===` (except `== null`) |
| `for...in` on arrays | `for...of` or array methods |
| `console.log` in production | Structured logger (Pino, Winston) |
| `forEach` with async callbacks | `for...of` with `await` |
| Nested ternaries | `if/else` or extract to function |
| `throw 'error message'` | `throw new Error('message')` |
| `.then().catch()` chains | `async/await` with `try/catch` |
| `arguments` object | Rest parameters: `...args` |
| `new Array(n)` for creation | Array literal `[]` or `Array.from()` |
| Mutating function parameters | Return new values; use spread to copy |
| `typeof x === 'undefined'` | `x === undefined` or `x == null` |
| Default export for everything | Named exports |
| Large files (>300 lines) | Split by responsibility |
