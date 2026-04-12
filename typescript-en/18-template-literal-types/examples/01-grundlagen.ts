/**
 * Lektion 18 - Beispiel 01: Template Literal Types Grundlagen
 */

type Greeting = `Hello, ${string}!`;
const a: Greeting = "Hello, World!";
const b: Greeting = "Hello, Max!";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiPath = "/users" | "/products";
type Endpoint = `${HttpMethod} ${ApiPath}`;

const endpoint: Endpoint = "GET /users";
console.log("Endpoint:", endpoint);

type Prefix = "get" | "set";
type Name = "Name" | "Age";
type Methods = `${Prefix}${Name}`;
// "getName" | "getAge" | "setName" | "setAge"

console.log("Template Literal Types loaded.");
