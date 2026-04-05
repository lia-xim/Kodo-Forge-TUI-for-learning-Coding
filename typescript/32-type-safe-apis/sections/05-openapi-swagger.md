# Sektion 5: OpenAPI/Swagger → TypeScript

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - GraphQL und Code Generation](./04-graphql-codegen.md)
> Naechste Sektion: [06 - Praxis: Angular HttpClient typsicher, React fetch-Hooks](./06-praxis-frameworks.md)

---

## Was du hier lernst

- Wie OpenAPI/Swagger-Spezifikationen in TypeScript-Typen uebersetzt werden
- Welche Tools existieren (openapi-typescript, openapi-fetch, Orval)
- Wie du typsichere REST-Clients aus einer OpenAPI-Spec generierst
- Den Unterschied zwischen "Generate Types" und "Generate Client"

---

## OpenAPI: Das REST-Schema

OpenAPI (frueher Swagger) ist der Standard fuer REST API-Dokumentation.
Eine OpenAPI-Spec ist wie ein detaillierter Stadtplan: REST-APIs ohne
Spec sind wie eine Stadt ohne Karte — du findest dich irgendwie
zurecht, aber es kostet Zeit und Irrtümer. Mit der Spec weiss jedes
Tool genau wo was ist.

Anders als GraphQL ist OpenAPI **optional** — viele REST APIs haben
keine Spec. Aber wenn eine existiert, ist sie Gold wert:

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

> 📖 **Hintergrund: Von Swagger zu OpenAPI**
>
> Swagger wurde 2011 von Tony Tam bei Wordnik entwickelt. 2015 wurde
> es an die Linux Foundation uebergeben und in "OpenAPI Specification"
> umbenannt. Version 3.0 (2017) war ein grosses Redesign. Version 3.1
> (2021) fuehrte volle JSON Schema-Kompatibilitaet ein.
>
> Der Name "Swagger" lebt weiter als Tooling-Name (Swagger UI,
> Swagger Editor), aber die Spezifikation heisst offiziell "OpenAPI".
> Die meisten Backend-Frameworks (NestJS, Spring Boot, FastAPI, ASP.NET)
> koennen OpenAPI-Specs automatisch generieren.

---

## openapi-typescript: Nur Typen generieren

Das leichtgewichtigste Tool — generiert NUR TypeScript-Typen:

```typescript annotated
// Generiert: api-types.d.ts
// npx openapi-typescript ./openapi.yaml -o ./api-types.d.ts

export interface paths {
  "/api/users": {
    get: {
      parameters: {
        query?: { role?: "admin" | "user" | "viewer" };
        // ^ Query-Parameter mit exaktem Typ
      };
      responses: {
        200: {
          content: { "application/json": components["schemas"]["User"][] };
          // ^ Response-Typ referenziert das Schema
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
      // ^ enum wird zu Literal Union — perfekt!
    };
    CreateUserInput: {
      name: string;
      email: string;
      role?: "admin" | "user" | "viewer";
    };
  };
}
```

### openapi-fetch: Typsicherer Client

```typescript annotated
import createClient from 'openapi-fetch';
import type { paths } from './api-types';

const client = createClient<paths>({ baseUrl: 'https://api.example.com' });

// Volle Autocomplete fuer Pfad, Query, Body und Response:
const { data, error } = await client.GET('/api/users', {
  params: { query: { role: 'admin' } },
  // ^ role muss "admin" | "user" | "viewer" sein!
  // ^ Autocomplete zeigt alle verfuegbaren Query-Parameter
});
// ^ data: User[] | undefined
// ^ error: undefined | { /* error shape */ }

const { data: newUser } = await client.POST('/api/users', {
  body: { name: 'Max', email: 'max@test.de' },
  // ^ body muss CreateUserInput sein — Compile-Error bei falschen Feldern
});
// ^ newUser: User | undefined
```

> 💭 **Denkfrage:** openapi-typescript generiert die Typen einmal.
> Was passiert wenn sich die API aendert aber du vergisst die Typen
> neu zu generieren? Wie kannst du das verhindern?
>
> **Antwort:** Die Typen werden stale — wie eine Landkarte von 1990
> in einer Stadt die seitdem gebaut hat. Dein Code kompiliert, aber
> stimmt nicht mehr mit der Realitaet ueberein. Loesung: (1) Typ-Generierung
> in die CI/CD-Pipeline einbauen, (2) Pre-Commit-Hook der die Typen
> generiert, (3) OpenAPI-Spec als Git-Artefakt versionieren, (4)
> Runtime-Validierung als zusaetzliche Sicherheit (Zod aus Sektion 02).

---

## Orval: Client + Hooks generieren

Orval generiert komplette typsichere Clients mit Framework-Integration:

```typescript annotated
// orval.config.ts
export default {
  userApi: {
    input: './openapi.yaml',
    output: {
      target: './src/api/user-api.ts',
      client: 'react-query', // oder 'angular', 'axios'
      // ^ Framework-spezifische Clients generieren!
    },
  },
};

// Generiert: src/api/user-api.ts (React Query)
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

// Verwendung — identisch zu handgeschriebenem Code, aber generiert:
function UserList() {
  const { data: users } = useGetUsers({ role: 'admin' });
  // ^ users: User[] | undefined — volle Typ-Sicherheit
}
```

> ⚡ **Praxis-Tipp fuer Angular:** Orval unterstuetzt Angular mit
> dem `angular` Client-Modus. Es generiert Injectable Services:
>
> ```typescript
> // Generiert von Orval (Angular-Modus)
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
> // Kein manuelles Tippen der HTTP-Calls mehr!
> ```

---

## Vergleich: OpenAPI vs GraphQL vs tRPC

| Kriterium | OpenAPI | GraphQL | tRPC |
|---|---|---|---|
| Schema-Sprache | YAML/JSON | SDL | TypeScript |
| Code-Generation | Ja (Build-Step) | Ja (Build-Step) | Nein (Inferenz!) |
| Backend-Sprache | Beliebig | Beliebig | TypeScript only |
| Partial Selection | Nein | Ja | Nein |
| Oeffentliche APIs | Exzellent | Gut | Nicht geeignet |
| DX (Entwicklererfahrung) | Gut | Sehr gut | Exzellent |
| Setup-Aufwand | Mittel | Mittel | Gering |

> 🧠 **Erklaere dir selbst:** Warum ist tRPC bei DX am besten, aber
> fuer oeffentliche APIs nicht geeignet? Was macht den Unterschied?
>
> **Kernpunkte:** tRPC braucht TypeScript auf beiden Seiten — externe
> Konsumenten koennen Python/Java/Go nutzen | OpenAPI/GraphQL haben
> sprachunabhaengige Schemas | tRPC hat keine API-Dokumentation
> (kein Swagger UI Aequivalent) | Fuer interne Fullstack-Apps ist
> tRPC's DX unschlagbar

---

## Tools im Ueberblick

```typescript
// 1. openapi-typescript — NUR Typen (leichtgewichtig)
// npx openapi-typescript openapi.yaml -o types.d.ts

// 2. openapi-fetch — Typsicherer fetch-Client
// import createClient from 'openapi-fetch';

// 3. Orval — Kompletter Client + Hooks (React/Angular)
// npx orval

// 4. swagger-typescript-api — Alternative zu openapi-typescript
// npx swagger-typescript-api -p openapi.yaml -o ./api

// 5. openapi-generator — Multi-Language (Java, Python, TS...)
// npx @openapitools/openapi-generator-cli generate -i spec.yaml -g typescript-fetch
```

> 🔬 **Experiment:** Wenn du Zugang zu einer OpenAPI-Spec hast (z.B.
> https://petstore3.swagger.io/api/v3/openapi.json), generiere die Typen:
>
> ```bash
> npx openapi-typescript https://petstore3.swagger.io/api/v3/openapi.json \
>   -o petstore-types.d.ts
> ```
>
> Oeffne die generierte Datei und schaue dir an: Welche Typen werden
> fuer die Petstore-Schemas generiert? Sind nullable Felder korrekt
> als `T | null` typisiert?

---

## Was du gelernt hast

- OpenAPI-Spezifikationen sind der REST-Standard fuer API-Dokumentation
- openapi-typescript generiert leichtgewichtige TypeScript-Typen aus der Spec
- openapi-fetch bietet typsichere fetch-Aufrufe mit Autocomplete fuer Pfade und Parameter
- Orval generiert komplette Clients mit Framework-spezifischen Hooks/Services
- Code-Generation muss in die CI/CD-Pipeline — sonst werden Typen stale

**Kernkonzept zum Merken:** OpenAPI ist das "GraphQL fuer REST". Wenn dein Backend eine OpenAPI-Spec hat (und die meisten Frameworks generieren sie automatisch), kannst du daraus typsichere TypeScript-Clients generieren. Kein manuelles Interface-Schreiben mehr.

---

> **Pausenpunkt** — Du kennst jetzt alle drei Wege: tRPC (Inferenz),
> GraphQL (Schema + Codegen), OpenAPI (Spec + Codegen). Die letzte
> Sektion bringt alles in den Framework-Kontext.
>
> Weiter geht es mit: [Sektion 06: Praxis — Angular & React](./06-praxis-frameworks.md)
