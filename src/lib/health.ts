/**
 * Pure liveness/readiness status. Lives in the pure core (src/lib) so it is trivially
 * testable; the route handler (app/api/health) is a thin wrapper over it.
 */
export interface HealthStatus {
  readonly status: "ok";
}

export function healthStatus(): HealthStatus {
  return { status: "ok" };
}
