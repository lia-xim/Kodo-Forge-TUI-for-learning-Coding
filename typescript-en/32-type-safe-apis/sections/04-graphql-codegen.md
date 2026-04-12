# Section 4: GraphQL and Code Generation

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - End-to-End Type Safety (tRPC)](./03-end-to-end-type-safety.md)
> Next section: [05 - OpenAPI/Swagger → TypeScript](./05-openapi-swagger.md)

---

## What you'll learn here

- How GraphQL schemas are automatically translated into TypeScript types
- How `graphql-codegen` generates type-safe queries, mutations, and hooks
- The difference between schema-first and code-first approaches
- Why GraphQL is inherently better suited for type safety than REST

---

## Why GraphQL is naturally type-safe

GraphQL has a built-in schema — every server MUST define its schema.
The GraphQL schema is like a DIN standard for a screw: whoever builds
the screw and whoever builds the nut work from the same specification.
Whether client or server — both speak about the same thing, with the
same field names and types. This makes GraphQL the ideal candidate for
type safety:

```graphql
# GraphQL Schema — a formal language definition
type User {
  id: ID!        # ! = non-nullable
  name: String!
  email: String!
  role: Role!
  posts: [Post!]! # Array of non-nullable Posts
}

enum Role {
  ADMIN
  USER
  VIEWER
}

type Query {
  user(id: ID!): User
  users(role: Role): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

> 📖 **Background: GraphQL's type system**
>
> GraphQL was released in 2015 by Facebook (Meta). Lee Byron and his
> team designed their own type system — inspired by Haskell and OCaml.
> The GraphQL schema is a **contract**: every server that implements
> the schema MUST adhere to these types. That is the fundamental
> difference from REST, where the "schema" (OpenAPI) is optional and
> added after the fact.
>
> GraphQL's type system has Scalars (String, Int, Float, Boolean, ID),
> Object Types, Input Types, Enums, Unions, and Interfaces — similar
> to TypeScript, but designed for APIs.

---

## graphql-codegen: Schema → TypeScript

`graphql-codegen` reads the GraphQL schema and generates TypeScript:

```typescript annotated
// Generated code (automatic, not manual!)
// __generated__/types.ts

export type User = {
  __typename?: 'User';
  id: string;
  // ^ ID! becomes string
  name: string;
  email: string;
  role: Role;
  posts: Array<Post>;
  // ^ [Post!]! becomes Array<Post> (non-nullable array, non-nullable elements)
};

export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  Viewer = 'VIEWER',
}

export type CreateUserInput = {
  name: string;
  email: string;
  role?: Role;
};
```

### Query-specific types

What's special: `graphql-codegen` generates types for EVERY query:

```typescript annotated
// Your query:
// query GetUser($id: ID!) {
//   user(id: $id) {
//     id
//     name
//     email
//   }
// }

// Generated type — only the requested fields!
export type GetUserQuery = {
  user: {
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
    // role and posts are MISSING — not requested in the query!
  } | null;
};

export type GetUserQueryVariables = {
  id: string;
  // ^ The query variables — type-safe!
};
```

> 💭 **Think about it:** Why does graphql-codegen generate types PER query
> instead of a single global User type? What is the advantage?
>
> **Answer:** GraphQL allows partial selection — you only request the
> fields you need. The generated type reflects EXACTLY what the query
> returns. If you don't query `role`, it's not in the type. This
> prevents you from accessing fields that were never loaded — a common
> bug with a global User type.

---

## React: Generated Hooks

graphql-codegen can generate React hooks:

```typescript annotated
// Generated: __generated__/hooks.ts
import { useQuery, useMutation } from '@apollo/client';

export function useGetUserQuery(variables: GetUserQueryVariables) {
  return useQuery<GetUserQuery, GetUserQueryVariables>(GET_USER, { variables });
  // ^ data: GetUserQuery | undefined
  // ^ variables: { id: string } — type-safe!
}

export function useCreateUserMutation() {
  return useMutation<CreateUserMutation, CreateUserMutationVariables>(CREATE_USER);
  // ^ mutate({ variables: { input: CreateUserInput } }) — type-safe!
}

// Usage in the component:
function UserProfile({ userId }: { userId: string }) {
  const { data, loading } = useGetUserQuery({ id: userId });
  // ^ data?.user?.name — full autocomplete
  // ^ userId must be string (GetUserQueryVariables)

  if (loading) return <div>Loading...</div>;
  if (!data?.user) return <div>Not found</div>;

  return <div>{data.user.name}</div>;
  // ^ data.user.name: string — guaranteed after null-check
}
```

---

## Angular: Apollo Angular with Code Generation

```typescript annotated
// Generated: __generated__/graphql.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({ providedIn: 'root' })
export class GetUserGQL extends Apollo.Query<GetUserQuery, GetUserQueryVariables> {
  document = gql`query GetUser($id: ID!) { user(id: $id) { id name email } }`;
}

// Usage in the component:
@Component({ /* ... */ })
export class UserProfileComponent {
  constructor(private getUserGql: GetUserGQL) {}

  user$ = this.getUserGql.watch({ id: this.userId }).valueChanges.pipe(
    map(result => result.data.user)
    // ^ result.data: GetUserQuery — type-safe!
    // ^ result.data.user: { id: string; name: string; email: string } | null
  );
}
```

> ⚡ **Practical tip for Angular:** Apollo Angular's code generation
> produces injectable services you can inject directly into components.
> This feels very "Angular-natural" — no manual query definition needed
> in the component.

---

## Schema-First vs Code-First

```typescript annotated
// SCHEMA-FIRST: Define schema → generate code
// schema.graphql
// type User { id: ID! name: String! }
// ↓ graphql-codegen
// types.ts (generated)

// CODE-FIRST: Define TypeScript → generate schema
// server.ts (TypeGraphQL or Pothos)
@ObjectType()
class User {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;
}
// ↓ TypeGraphQL/Pothos generates the GraphQL schema

// Pothos (more modern alternative):
const UserType = builder.objectRef<User>('User').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
});
```

> 🧠 **Explain it to yourself:** What is the tradeoff between
> schema-first and code-first? When would you choose which approach?
>
> **Key points:** Schema-First: schema is the "contract", good for teams |
> Code-First: TypeScript is the source of truth, fewer files |
> Schema-First: Better when non-TypeScript clients exist |
> Code-First: Better in pure TypeScript projects

---

## codegen.ts Configuration

```typescript
// codegen.ts — configuration for graphql-codegen
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  // ^ Schema source: URL, file, or glob
  documents: 'src/**/*.graphql',
  // ^ Where are the queries/mutations?
  generates: {
    'src/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
    'src/__generated__/hooks.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      // ^ Generate React Apollo hooks
    },
  },
};

export default config;
```

> 🔬 **Experiment:** If you have a GraphQL schema, try out
> graphql-codegen:
>
> ```bash
> npx graphql-codegen init
> # Answer the questions: schema URL, query files, output path
> # Then:
> npx graphql-codegen
> # Look at the generated types.
> # Question: What types are generated for a query with fragments?
> # Answer: Fragment types are generated separately and included in the
> # query type as an intersection (&).
> ```

---

## What you've learned

- GraphQL has a built-in schema — that makes it naturally type-safe
- graphql-codegen generates TypeScript types for schemas, queries, and mutations
- Query-specific types reflect EXACTLY the requested fields
- React and Angular have specific code-gen plugins for type-safe hooks/services
- Schema-First vs Code-First: tradeoff between contract and developer experience

**Core concept to remember:** GraphQL + Code Generation = automatic type safety. The code generator acts like an interpreter who is always present: every change to the GraphQL schema is immediately translated into TypeScript. This is closer to tRPC's ideal than REST — but with the overhead of a build pipeline.

---

> **Pause point** — GraphQL is elegant, but not always the answer.
> Many APIs are REST — and for that there's OpenAPI.
>
> Continue with: [Section 05: OpenAPI/Swagger → TypeScript](./05-openapi-swagger.md)