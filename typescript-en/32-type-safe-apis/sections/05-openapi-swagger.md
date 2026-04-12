# Section 5: OpenAPI/Swagger → TypeScript

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - GraphQL and Code Generation](./04-graphql-codegen.md)
> Next section: [06 - Practice: Angular HttpClient Type-Safe, React fetch Hooks](./06-praxis-frameworks.md)

---

## What you'll learn here

- How OpenAPI/Swagger specifications are translated into TypeScript types
- Which tools exist (openapi-typescript, openapi-fetch, Orval)
- How to generate type-safe REST clients from an OpenAPI spec
- The difference between "Generate Types" and "Generate Client"

---

## OpenAPI: The REST Schema

OpenAPI (formerly Swagger) is the standard for REST API documentation.
An OpenAPI spec is like a detailed city map: REST APIs without a
spec are like a city without a map — you find your way somehow,
but it costs time and mistakes. With the spec, every
tool knows exactly where everything is.

Unlike GraphQL, OpenAPI is **optional** — many REST APIs have
no spec. But when one exists, it's worth its weight in gold:

```yaml
# openapi.yaml
openapi: "3.1.0"
info:
  title: User API
  version: "1.0.0"
paths:
  /api/users:
    get:
      operationId: getUsers
      parameters:
        - name: role
          in: query
          schema:
            type: string
            enum: [admin, user, viewer]
      responses:
        "200":
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/User"
    post:
      operationId: createUser
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserInput"
      responses:
        "201":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
components:
  schemas:
    User:
      type: object
      required: [id, name, email, role]
      properties:
        id: { type: string, format: uuid }
        name: { type: string }
        email: { type: string, format: email }
        role: { type: string, enum: [admin, user, viewer] }
```

> 📖 **Background: From Swagger to OpenAPI**
>
> Swagger was developed in 2011 by Tony Tam at Wordnik. In 2015 it was
> transferred to the Linux Foundation and renamed "OpenAPI Specification".
> Version 3.0 (2017) was a major redesign. Version 3.1
> (2021) introduced full JSON Schema compatibility.
>
> The name "Swagger" lives on as a tooling name (Swagger UI,
> Swagger Editor), but the specification is officially called "OpenAPI".
> Most backend frameworks (NestJS, Spring Boot, FastAPI, ASP.NET)
> can generate OpenAPI specs automatically.

---

## openapi-typescript: Generate Types Only

The most lightweight tool — generates ONLY TypeScript types:

```typescript annotated
// Generated: api-types.d.ts
// npx openapi-typescript ./openapi.yaml -o ./api-types.d.ts

export interface paths {
  "/api/users": {
    get: {
      parameters: {
        query?: { role?: "admin" | "user" | "viewer" };
        // ^ Query parameters with exact type
      };
      responses: {
        200: {
          content: { "application/json": components["schemas"]["User"][] };
          // ^ Response type references the schema
        };
      };
    };
    post: {
      requestBody: {
        content: { "application/json": components["schemas"]["CreateUserInput"] };
      };
      responses: {
        201: {
          content: { "application/json": components["schemas"]["User"] };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    User: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "user" | "viewer";
      // ^ enum becomes literal union — perfect!
    };
    CreateUserInput: {
      name: string;
      email: string;
      role?: "admin" | "user" | "viewer";
    };
  };
}
```

### openapi-fetch: Type-Safe Client

```typescript annotated
import createClient from 'openapi-fetch';
import type { paths } from './api-types';

const client = createClient<paths>({ baseUrl: 'https://api.example.com' });

// Full autocomplete for path, query, body, and response:
const { data, error } = await client.GET('/api/users', {
  params: { query: { role: 'admin' } },
  // ^ role must be "admin" | "user" | "viewer"!
  // ^ Autocomplete shows all available query parameters
});
// ^ data: User[] | undefined
// ^ error: undefined | { /* error shape */ }

const { data: newUser } = await client.POST('/api/users', {
  body: { name: 'Max', email: 'max@test.de' },
  // ^ body must be CreateUserInput — compile error on wrong fields
});
// ^ newUser: User | undefined
```

> 💭 **Think about it:** openapi-typescript generates the types once.
> What happens when the API changes but you forget to regenerate the types?
> How can you prevent this?
>
> **Answer:** The types become stale — like a map from 1990
> in a city that's been built up since then. Your code compiles, but
> no longer matches reality. Solution: (1) build type generation
> into the CI/CD pipeline, (2) a pre-commit hook that generates the types,
> (3) version the OpenAPI spec as a Git artifact, (4)
> runtime validation as an additional safety net (Zod from Section 02).

---

## Orval: Generate Client + Hooks

Orval generates complete type-safe clients with framework integration:

```typescript annotated
// orval.config.ts
export default {
  userApi: {
    input: './openapi.yaml',
    output: {
      target: './src/api/user-api.ts',
      client: 'react-query', // or 'angular', 'axios'
      // ^ Generate framework-specific clients!
    },
  },
};

// Generated: src/api/user-api.ts (React Query)
export function useGetUsers(params?: { role?: 'admin' | 'user' | 'viewer' }) {
  return useQuery<User[], Error>({
    queryKey: ['users', params],
    queryFn: () => axios.get('/api/users', { params }).then(r => r.data),
  });
}

export function useCreateUser() {
  return useMutation<User, Error, CreateUserInput>({
    mutationFn: (data) => axios.post('/api/users', data).then(r => r.data),
  });
}

// Usage — identical to hand-written code, but generated:
function UserList() {
  const { data: users } = useGetUsers({ role: 'admin' });
  // ^ users: User[] | undefined — full type safety
}
```

> ⚡ **Practical tip for Angular:** Orval supports Angular with
> the `angular` client mode. It generates injectable services:
>
> ```typescript
> // Generated by Orval (Angular mode)
> @Injectable({ providedIn: 'root' })
> export class UserApiService {
>   constructor(private http: HttpClient) {}
>
>   getUsers(params?: { role?: Role }): Observable<User[]> {
>     return this.http.get<User[]>('/api/users', { params });
>   }
>
>   createUser(body: CreateUserInput): Observable<User> {
>     return this.http.post<User>('/api/users', body);
>   }
> }
> // No more manual typing of HTTP calls!
> ```

---

## Comparison: OpenAPI vs GraphQL vs tRPC

| Criterion | OpenAPI | GraphQL | tRPC |
|---|---|---|---|
| Schema language | YAML/JSON | SDL | TypeScript |
| Code generation | Yes (build step) | Yes (build step) | No (inference!) |
| Backend language | Any | Any | TypeScript only |
| Partial selection | No | Yes | No |
| Public APIs | Excellent | Good | Not suitable |
| DX (developer experience) | Good | Very good | Excellent |
| Setup effort | Medium | Medium | Low |

> 🧠 **Explain it to yourself:** Why does tRPC have the best DX, but
> isn't suitable for public APIs? What makes the difference?
>
> **Key points:** tRPC requires TypeScript on both sides — external
> consumers may use Python/Java/Go | OpenAPI/GraphQL have
> language-agnostic schemas | tRPC has no API documentation
> (no Swagger UI equivalent) | For internal fullstack apps,
> tRPC's DX is unbeatable

---

## Tools at a Glance

```typescript
// 1. openapi-typescript — ONLY types (lightweight)
// npx openapi-typescript openapi.yaml -o types.d.ts

// 2. openapi-fetch — Type-safe fetch client
// import createClient from 'openapi-fetch';

// 3. Orval — Complete client + hooks (React/Angular)
// npx orval

// 4. swagger-typescript-api — Alternative to openapi-typescript
// npx swagger-typescript-api -p openapi.yaml -o ./api

// 5. openapi-generator — Multi-language (Java, Python, TS...)
// npx @openapitools/openapi-generator-cli generate -i spec.yaml -g typescript-fetch
```

> 🔬 **Experiment:** If you have access to an OpenAPI spec (e.g.
> https://petstore3.swagger.io/api/v3/openapi.json), generate the types:
>
> ```bash
> npx openapi-typescript https://petstore3.swagger.io/api/v3/openapi.json \
>   -o petstore-types.d.ts
> ```
>
> Open the generated file and look at: What types are generated
> for the Petstore schemas? Are nullable fields correctly
> typed as `T | null`?

---

## What you've learned

- OpenAPI specifications are the REST standard for API documentation
- openapi-typescript generates lightweight TypeScript types from the spec
- openapi-fetch provides type-safe fetch calls with autocomplete for paths and parameters
- Orval generates complete clients with framework-specific hooks/services
- Code generation must be integrated into the CI/CD pipeline — otherwise types become stale

**Core concept to remember:** OpenAPI is "GraphQL for REST". If your backend has an OpenAPI spec (and most frameworks generate it automatically), you can generate type-safe TypeScript clients from it. No more manually writing interfaces.

---

> **Break point** — You now know all three approaches: tRPC (inference),
> GraphQL (schema + codegen), OpenAPI (spec + codegen). The final
> section puts everything into the framework context.
>
> Continue with: [Section 06: Practice — Angular & React](./06-praxis-frameworks.md)