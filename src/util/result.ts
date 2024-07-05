/** Result type where error type is optional and if not set is a string */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
