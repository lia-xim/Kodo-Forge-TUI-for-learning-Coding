/**
 * Lektion 18 - Loesung 01
 */
type EmailAddress = `${string}@${string}.${string}`;
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Path = "/users" | "/products" | "/orders";
type ApiEndpoint = `${HttpMethod} ${Path}`;
type CssVariable = `--${string}`;
type SemVer = `${number}.${number}.${number}`;
type HexColor = `#${string}`;

const email: EmailAddress = "user@example.com";
const endpoint: ApiEndpoint = "GET /users";
const cssVar: CssVariable = "--primary-color";
const version: SemVer = "1.2.3";
const color: HexColor = "#ff0000";
