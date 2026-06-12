# TypeScript Style & Standards

Covers naming, formatting, layout, idioms, type system patterns, documentation, and practices not addressed in the engineering principles. All JavaScript standards apply; this document covers TypeScript-specific additions and overrides.

---

## Naming

### Casing Rules

| Construct | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `userName`, `orderTotal`, `isActive` |
| Functions | `camelCase` | `getUser()`, `calculateTotal()` |
| Classes | `PascalCase` | `UserService`, `HttpClient` |
| Interfaces | `PascalCase` (no `I` prefix) | `UserRepository`, `Serializable` |
| Type aliases | `PascalCase` | `UserId`, `ApiResponse`, `Result` |
| Enums (if used) | `PascalCase` type, `PascalCase` members | `enum Direction { Up, Down }` |
| Const objects (preferred) | `PascalCase` key, `UPPER` values | `const Status = { ACTIVE: 'ACTIVE' } as const` |
| Generic type parameters | Single letter or short `PascalCase` | `T`, `K`, `V`, `TResult`, `TInput` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Branded types | `PascalCase` | `UserId`, `OrderId`, `Email` |
| Files | `kebab-case` | `user-service.ts`, `http-client.ts` |
| Test files | `.test.ts` or `.spec.ts` suffix | `user-service.test.ts` |

### Key Practices

- No `I` prefix on interfaces: `UserRepository`, not `IUserRepository`.
- No `Type` suffix on type aliases: `User`, not `UserType`.
- Type guards: `isUser()`, `isApiError()` — `is` + type name.
- Assertion functions: `assertDefined()`, `assertIsUser()` — `assert` + condition.
- Acronyms as words: `HttpClient`, not `HTTPClient`; `loadHttpUrl`, not `loadHTTPURL`.
- Generic parameters: `T` for simple, `TInput`/`TOutput` when multiple parameters need clarity.

---

## Formatting

Use Prettier (or Biome) with a shared config. Same rules as JavaScript, with these additions:

### Type Annotation Spacing

```typescript
// Space after colon in type annotations
const name: string = 'Alice';
function getUser(id: string): Promise<User> { ... }

// No space before colon
const name : string = 'Alice';  // Wrong

// Space around union and intersection operators
type Result = Success | Failure;
type AdminUser = User & { permissions: Permission[] };

// Generics — no space before angle bracket
Array<string>        // Good
Array <string>       // Wrong
```

### Multi-line Types

```typescript
// Short — single line
type Point = { x: number; y: number };

// Long — multi-line with semicolons (not commas) for object types
interface HttpClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// Union types — one per line when more than two
type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

---

## Imports

### Order

Same groups as JavaScript, plus a dedicated group for type-only imports:

1. Node.js built-ins
2. External packages
3. Internal modules
4. Type-only imports (can also be inline with their group)

```typescript
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import express from 'express';
import { z } from 'zod';
import pino from 'pino';

import { UserService } from './services/user-service.js';
import { validateRequest } from './middleware/validation.js';

import type { User, UserId } from './models/user.js';
import type { ApiResponse } from './types/api.js';
```

### Practices

- Use `import type` for anything that exists only at compile time. This helps bundlers tree-shake and makes the intent explicit.
- Use inline type imports when importing both values and types from the same module: `import { UserService, type UserConfig } from './services/user-service.js'`.
- Named exports only — no default exports. Default exports harm refactoring (the name is assigned at import, not at export) and make auto-import tooling less reliable.
- Never use `namespace`. Use ES modules.

---

## Code Layout

### Module Structure

```typescript
// 1. Imports (grouped as above)
import ...;
import type ...;

// 2. Constants
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30_000;

// 3. Types (exported types used by other modules)
export interface OrderCreateInput {
  userId: UserId;
  items: OrderItem[];
}

export type OrderResult = Result<Order, OrderError>;

// 4. Exported classes / functions (public API)
export class OrderService { ... }
export function createOrder(input: OrderCreateInput): OrderResult { ... }

// 5. Private helpers
function validateItems(items: OrderItem[]): void { ... }
function calculateTotal(items: OrderItem[]): Cents { ... }
```

### File and Directory Structure

```
src/
├── index.ts                # Entry point, re-exports
├── app.ts                  # Application setup
├── config.ts               # Configuration types and loading
├── models/
│   ├── user.ts             # User type + schema
│   ├── order.ts            # Order type + schema
│   └── index.ts            # Barrel re-exports
├── services/
│   ├── user-service.ts
│   ├── order-service.ts
│   └── index.ts
├── repositories/
│   └── user-repository.ts
├── middleware/
│   ├── auth.ts
│   ├── error-handler.ts
│   └── validation.ts
├── routes/
│   ├── user-routes.ts
│   └── order-routes.ts
├── types/
│   ├── branded.ts          # Branded types (UserId, OrderId, etc.)
│   ├── api.ts              # Shared API types
│   └── index.ts
└── utils/
    ├── result.ts           # Result type helpers
    └── retry.ts

tests/
├── services/
│   ├── user-service.test.ts
│   └── order-service.test.ts
└── utils/
    └── retry.test.ts
```

---

## Type System Patterns

### Compiler Configuration

Non-negotiable baseline for production code:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ES2022"
  }
}
```

### Interface vs Type Alias

| Use case | Choice |
|---|---|
| Object shapes that may be extended | `interface` (supports declaration merging and `extends`) |
| Unions, intersections, mapped types, conditional types | `type` (interfaces can't express these) |
| Function types | `type` (`type Handler = (req: Request) => Response`) |
| Simple object shapes where extension is not needed | Either — be consistent per project |

```typescript
// Interface — extendable object shape
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Type — union (interface can't do this)
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppError };

// Type — function signature
type EventHandler<T> = (event: T) => void | Promise<void>;

// Type — mapped / conditional
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type NonNullableFields<T> = { [K in keyof T]: NonNullable<T[K]> };
```

### Discriminated Unions

Use for state modeling. Pick a consistent discriminant field name (`status`, `kind`, `type`, or `tag`) per domain.

```typescript
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Always add exhaustive check
function renderState(state: LoadingState<User>) {
  switch (state.status) {
    case 'idle':    return renderPlaceholder();
    case 'loading': return renderSpinner();
    case 'success': return renderUser(state.data);
    case 'error':   return renderError(state.error);
    default: {
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

### Branded Types

Prevent mixing structurally identical types that are semantically distinct:

```typescript
// Define the brand
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };
type Cents = number & { readonly __brand: 'Cents' };

// Constructor functions validate and brand
function UserId(value: string): UserId {
  if (!value || value.length === 0) {
    throw new ValidationError('UserId must not be empty');
  }
  return value as UserId;
}

function Cents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new ValidationError('Cents must be an integer');
  }
  return value as Cents;
}

// Now the compiler prevents mixing them up
function getOrder(userId: UserId, orderId: OrderId): Promise<Order> { ... }
// getOrder(orderId, userId) → compiler error
```

### Const Objects Over Enums

Enums have runtime overhead, poor tree-shaking, and surprising bidirectional mapping behavior. Prefer const objects with derived union types:

```typescript
// Preferred
const OrderStatus = {
  Pending: 'PENDING',
  Confirmed: 'CONFIRMED',
  Shipped: 'SHIPPED',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
// Result: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

// Usage — same ergonomics as enum
function processOrder(status: OrderStatus) {
  if (status === OrderStatus.Shipped) { ... }
}

// Avoid — enum
enum OrderStatus { Pending, Confirmed, Shipped }
// OrderStatus[0] === 'Pending' — bidirectional mapping is surprising
```

### Schema-Driven Types

Define the runtime validation schema first, derive the TypeScript type from it. This makes the schema the single source of truth:

```typescript
import { z } from 'zod';

// Schema is the source of truth
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'member', 'viewer']),
});

// Type is derived — always in sync
type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Use safeParse (returns Result), not parse (throws)
function handleCreateUser(body: unknown): Result<User, ValidationError> {
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return err(new ValidationError('Invalid input', parsed.error.flatten()));
  }
  return ok(createUser(parsed.data));
}
```

### Result Pattern

Use a Result type for expected, recoverable errors. Reserve `throw` for programmer errors and truly exceptional conditions.

```typescript
// Simple Result type
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage — caller is forced to handle both cases
function divide(a: number, b: number): Result<number, 'division_by_zero'> {
  if (b === 0) return err('division_by_zero');
  return ok(a / b);
}

const result = divide(10, 0);
if (!result.ok) {
  console.error(result.error);
} else {
  console.log(result.value);
}

// Or use a library: neverthrow, ts-results, oxide.ts
```

### Utility Type Usage

Use built-in utility types judiciously:

```typescript
// Good — precise types
type UserUpdate = Partial<Pick<User, 'name' | 'email' | 'avatar'>>;
type PublicUser = Omit<User, 'passwordHash' | 'internalNotes'>;
type ReadonlyConfig = Readonly<Config>;
type UserLookup = Record<UserId, User>;

// Extract string literal union from const object
const ROLES = ['admin', 'member', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'member' | 'viewer'

// Avoid — overly broad
type AnyObject = Record<string, any>;  // just use unknown or define shape
type Flexible = Partial<User>;          // everything optional = nothing guaranteed
```

### Narrowing and Type Guards

```typescript
// typeof narrowing
function process(input: string | number) {
  if (typeof input === 'string') {
    return input.toUpperCase(); // input is string here
  }
  return input.toFixed(2); // input is number here
}

// instanceof narrowing
if (error instanceof NotFoundError) {
  return { status: 404, message: error.message };
}

// Discriminated union narrowing (see above)

// Custom type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    typeof (value as User).id === 'string'
  );
}

// Assertion function
function assertDefined<T>(
  value: T | null | undefined,
  name: string,
): asserts value is T {
  if (value == null) {
    throw new Error(`${name} must be defined`);
  }
}
```

---

## Documentation

### TSDoc

Use TSDoc (superset of JSDoc) for public APIs. Type information comes from annotations, so don't duplicate types in docs.

```typescript
/**
 * Fetches a user by their unique identifier.
 *
 * @param userId - The unique user identifier.
 * @param options - Optional query parameters.
 * @returns The user if found, or null.
 * @throws {@link DatabaseError} If the connection fails.
 *
 * @example
 * ```ts
 * const user = await repo.findById(UserId('abc-123'));
 * ```
 */
async findById(
  userId: UserId,
  options?: FindOptions,
): Promise<User | null> { ... }
```

### When to Document Types

- Document *why* a type exists, not *what* it contains (the shape is self-documenting).
- Document branded types with their invariants.
- Document non-obvious generic constraints.
- Document discriminated unions with the expected state machine.

```typescript
/**
 * Represents an amount in the smallest currency unit (e.g., cents for USD).
 * Always a non-negative integer.
 */
type Cents = number & { readonly __brand: 'Cents' };

/**
 * Order lifecycle states. Transitions:
 * Pending → Confirmed → Shipped → Delivered
 * Pending → Cancelled (from any pre-shipped state)
 */
type OrderState =
  | { status: 'pending'; createdAt: Date }
  | { status: 'confirmed'; confirmedAt: Date }
  | { status: 'shipped'; trackingNumber: string }
  | { status: 'delivered'; deliveredAt: Date }
  | { status: 'cancelled'; reason: string };
```

---

## Idioms and Patterns

### Readonly by Default

```typescript
// Readonly properties — anything not reassigned after construction
interface User {
  readonly id: UserId;
  readonly email: string;
  readonly createdAt: Date;
  name: string;  // mutable — can be updated
}

// Readonly arrays and maps for immutable data
function getActiveUsers(): readonly User[] { ... }
function getConfig(): ReadonlyMap<string, string> { ... }

// as const for literal types
const PERMISSIONS = ['read', 'write', 'admin'] as const;
type Permission = (typeof PERMISSIONS)[number];
```

### Null Handling

```typescript
// Prefer undefined over null for optional values (aligns with TS optional properties)
interface UserProfile {
  bio?: string;         // string | undefined
  avatar?: string;      // string | undefined
}

// Use null when "explicitly absent" is semantically different from "not set"
interface SearchResult {
  user: User | null;    // we looked; the user doesn't exist
}

// Non-null assertion (!) — avoid. Use narrowing instead.
const name = user!.name;  // Dangerous — use a type guard or assertion

// Nullish coalescing for defaults
const timeout = config.timeout ?? DEFAULT_TIMEOUT;
const name = user?.name ?? 'Anonymous';
```

### Overloads

Use overloads when a function's return type depends on its input type. Prefer union types or generics when possible — overloads are a last resort.

```typescript
// Overloads — when return type depends on input
function parse(input: string): JsonObject;
function parse(input: Buffer): JsonObject;
function parse(input: string | Buffer): JsonObject {
  const text = typeof input === 'string' ? input : input.toString('utf-8');
  return JSON.parse(text);
}

// Prefer generics when they work
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

### Module Augmentation

For extending third-party types (use sparingly):

```typescript
// Extend Express Request with custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: UserId;
      requestId: string;
    }
  }
}
```

Put these in a dedicated `types/` directory. Never scatter declaration merging across the codebase.

---

## Testing Style

### Type-Level Testing

Test that your types behave correctly at compile time:

```typescript
// Use @ts-expect-error to verify type errors occur where expected
// @ts-expect-error — OrderId is not assignable to UserId
const result: UserId = OrderId('abc');

// Use satisfies to verify type compatibility without widening
const config = {
  port: 8080,
  host: 'localhost',
} satisfies ServerConfig;

// Use expectTypeOf (from vitest) for complex type assertions
import { expectTypeOf } from 'vitest';

test('CreateUserSchema infers correct type', () => {
  expectTypeOf<z.infer<typeof CreateUserSchema>>().toEqualTypeOf<{
    email: string;
    name: string;
    role: 'admin' | 'member' | 'viewer';
  }>();
});
```

### Test Naming and Structure

Same conventions as JavaScript, with typed test utilities:

```typescript
// Typed factory functions
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: UserId('test-user-1'),
    name: 'Alice',
    email: 'alice@example.com',
    role: 'member',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: OrderId('test-order-1'),
    userId: UserId('test-user-1'),
    items: [makeOrderItem()],
    status: OrderStatus.Pending,
    ...overrides,
  };
}
```

---

## Common Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| `any` anywhere | `unknown` + narrowing, or define the actual type |
| `as Type` to silence errors | Runtime validation (Zod `.parse()`, type guard) |
| `@ts-ignore` | `@ts-expect-error` with comment and issue link |
| `enum` for constants | `as const` object + derived union type |
| `I` prefix on interfaces | Drop it — `UserRepository`, not `IUserRepository` |
| `Type` suffix on type aliases | Drop it — `User`, not `UserType` |
| `namespace` | ES modules |
| `String`, `Number`, `Boolean` | Lowercase primitives: `string`, `number`, `boolean` |
| `object` as a type | Define the shape, or use `Record<string, unknown>` |
| `Function` as a type | Typed signature: `(event: Event) => void` |
| Default exports | Named exports exclusively |
| Duplicating types and schemas | Derive types from schemas with `z.infer<>` |
| `!` non-null assertion | Narrowing, assertion function, or `?? fallback` |
| Generics with single use | Use the concrete type directly |
| `as const` forgotten on const objects | Values widen to `string` instead of literal types |
| Business logic in type guards | Type guards must be pure validation, no side effects |
| Deeply nested conditional types | Extract to named type aliases for readability |
