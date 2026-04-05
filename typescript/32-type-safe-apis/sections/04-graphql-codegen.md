# Sektion 4: GraphQL und Code Generation

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - End-to-End Type Safety (tRPC)](./03-end-to-end-type-safety.md)
> Naechste Sektion: [05 - OpenAPI/Swagger → TypeScript](./05-openapi-swagger.md)

---

## Was du hier lernst

- Wie GraphQL Schemas automatisch in TypeScript-Typen uebersetzt werden
- Wie `graphql-codegen` typsichere Queries, Mutations und Hooks generiert
- Den Unterschied zwischen Schema-First und Code-First Ansaetzen
- Warum GraphQL von Natur aus besser fuer Typ-Sicherheit geeignet ist als REST

---

## Warum GraphQL natuerlich typsicher ist

GraphQL hat ein eingebautes Schema — jeder Server MUSS sein Schema
definieren. Das macht es zum idealen Kandidaten fuer Type Safety:

```graphql
# GraphQL Schema — eine formale Sprach-Definition
type User {
  id: ID!        # ! = non-nullable
  name: String!
  email: String!
  role: Role!
  posts: [Post!]! # Array von non-nullable Posts
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

> 📖 **Hintergrund: GraphQL's Typ-System**
>
> GraphQL wurde 2015 von Facebook (Meta) veroeffentlicht. Lee Byron
> und sein Team designten ein eigenes Typ-System — inspiriert von
> Haskell und OCaml. Das GraphQL-Schema ist ein **Vertrag**: Jeder
> Server der das Schema implementiert, MUSS diese Typen einhalten.
> Das ist der fundamentale Unterschied zu REST, wo das "Schema"
> (OpenAPI) optional und nachtraeglich ist.
>
> GraphQL's Typ-System hat Scalars (String, Int, Float, Boolean, ID),
> Object Types, Input Types, Enums, Unions und Interfaces — aehnlich
> wie TypeScript, aber fuer APIs designed.

---

## graphql-codegen: Schema → TypeScript

`graphql-codegen` liest das GraphQL-Schema und generiert TypeScript:

```typescript annotated
// Generierter Code (automatisch, nicht manuell!)
// __generated__/types.ts

export type User = {
  __typename?: 'User';
  id: string;
  // ^ ID! wird zu string
  name: string;
  email: string;
  role: Role;
  posts: Array<Post>;
  // ^ [Post!]! wird zu Array<Post> (non-nullable Array, non-nullable Elemente)
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

### Query-spezifische Typen

Das Besondere: `graphql-codegen` generiert Typen fuer JEDE Query:

```typescript annotated
// Deine Query:
// query GetUser($id: ID!) {
//   user(id: $id) {
//     id
//     name
//     email
//   }
// }

// Generierter Typ — nur die angeforderten Felder!
export type GetUserQuery = {
  user: {
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
    // role und posts FEHLEN — nicht in der Query angefordert!
  } | null;
};

export type GetUserQueryVariables = {
  id: string;
  // ^ Die Query-Variablen — typsicher!
};
```

> 💭 **Denkfrage:** Warum generiert graphql-codegen Typen PRO Query
> statt einen globalen User-Typ? Was ist der Vorteil?
>
> **Antwort:** GraphQL erlaubt Partial Selection — du fragst nur die
> Felder ab die du brauchst. Der generierte Typ reflektiert EXAKT
> was die Query zurueckgibt. Wenn du `role` nicht abfragst, ist es
> nicht im Typ. Das verhindert, dass du auf Felder zugreifst die
> gar nicht geladen wurden — ein haeufiger Bug mit globalem User-Typ.

---

## React: Generated Hooks

graphql-codegen kann React-Hooks generieren:

```typescript annotated
// Generiert: __generated__/hooks.ts
import { useQuery, useMutation } from '@apollo/client';

export function useGetUserQuery(variables: GetUserQueryVariables) {
  return useQuery<GetUserQuery, GetUserQueryVariables>(GET_USER, { variables });
  // ^ data: GetUserQuery | undefined
  // ^ variables: { id: string } — typsicher!
}

export function useCreateUserMutation() {
  return useMutation<CreateUserMutation, CreateUserMutationVariables>(CREATE_USER);
  // ^ mutate({ variables: { input: CreateUserInput } }) — typsicher!
}

// Verwendung in der Component:
function UserProfile({ userId }: { userId: string }) {
  const { data, loading } = useGetUserQuery({ id: userId });
  // ^ data?.user?.name — volle Autocomplete
  // ^ userId muss string sein (GetUserQueryVariables)

  if (loading) return <div>Loading...</div>;
  if (!data?.user) return <div>Not found</div>;

  return <div>{data.user.name}</div>;
  // ^ data.user.name: string — garantiert nach null-Check
}
```

---

## Angular: Apollo Angular mit Code Generation

```typescript annotated
// Generiert: __generated__/graphql.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({ providedIn: 'root' })
export class GetUserGQL extends Apollo.Query<GetUserQuery, GetUserQueryVariables> {
  document = gql`query GetUser($id: ID!) { user(id: $id) { id name email } }`;
}

// Verwendung im Component:
@Component({ /* ... */ })
export class UserProfileComponent {
  constructor(private getUserGql: GetUserGQL) {}

  user$ = this.getUserGql.watch({ id: this.userId }).valueChanges.pipe(
    map(result => result.data.user)
    // ^ result.data: GetUserQuery — typsicher!
    // ^ result.data.user: { id: string; name: string; email: string } | null
  );
}
```

> ⚡ **Praxis-Tipp fuer Angular:** Apollo Angular's Code Generation
> erzeugt Injectable Services die du direkt in Components injecten
> kannst. Das fuehlt sich sehr "Angular-natuerlich" an — keine
> manuelle Query-Definition im Component noetig.

---

## Schema-First vs Code-First

```typescript annotated
// SCHEMA-FIRST: Schema definieren → Code generieren
// schema.graphql
// type User { id: ID! name: String! }
// ↓ graphql-codegen
// types.ts (generiert)

// CODE-FIRST: TypeScript definieren → Schema generieren
// server.ts (TypeGraphQL oder Pothos)
@ObjectType()
class User {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;
}
// ↓ TypeGraphQL/Pothos generiert das GraphQL-Schema

// Pothos (modernere Alternative):
const UserType = builder.objectRef<User>('User').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
});
```

> 🧠 **Erklaere dir selbst:** Was ist der Tradeoff zwischen
> Schema-First und Code-First? Wann wuerdest du welchen Ansatz waehlen?
>
> **Kernpunkte:** Schema-First: Schema ist "Vertrag", gut fuer Teams |
> Code-First: TypeScript ist Source of Truth, weniger Dateien |
> Schema-First: Besser wenn nicht-TypeScript-Clients existieren |
> Code-First: Besser in reinen TypeScript-Projekten

---

## codegen.ts Konfiguration

```typescript
// codegen.ts — Konfiguration fuer graphql-codegen
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  // ^ Schema-Quelle: URL, Datei, oder Glob
  documents: 'src/**/*.graphql',
  // ^ Wo liegen die Queries/Mutations?
  generates: {
    'src/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
    'src/__generated__/hooks.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      // ^ React Apollo Hooks generieren
    },
  },
};

export default config;
```

> 🔬 **Experiment:** Wenn du ein GraphQL-Schema hast, probiere
> graphql-codegen aus:
>
> ```bash
> npx graphql-codegen init
> # Beantworte die Fragen: Schema-URL, Query-Dateien, Output-Pfad
> # Dann:
> npx graphql-codegen
> # Schaue dir die generierten Typen an.
> # Frage: Welche Typen werden fuer eine Query mit Fragmenten generiert?
> # Antwort: Fragment-Typen werden separat generiert und in der Query-Typ
> # als Intersection (&) eingebunden.
> ```

---

## Was du gelernt hast

- GraphQL hat ein eingebautes Schema — das macht es natuerlich typsicher
- graphql-codegen generiert TypeScript-Typen fuer Schema, Queries und Mutations
- Query-spezifische Typen reflektieren EXAKT die angeforderten Felder
- React und Angular haben spezifische Code-Gen-Plugins fuer typsichere Hooks/Services
- Schema-First vs Code-First: Tradeoff zwischen Vertrag und Entwicklererfahrung

**Kernkonzept zum Merken:** GraphQL + Code Generation = automatische Typ-Sicherheit. Jede Aenderung am Schema wird sofort im generierten Code reflektiert. Das ist naeher an tRPC's Ideal als REST — aber mit dem Overhead einer Build-Pipeline.

---

> **Pausenpunkt** — GraphQL ist elegant, aber nicht immer die Antwort.
> Viele APIs sind REST — und dafuer gibt es OpenAPI.
>
> Weiter geht es mit: [Sektion 05: OpenAPI/Swagger → TypeScript](./05-openapi-swagger.md)
