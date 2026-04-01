// parsons-data.ts — L24: Branded/Nominal Types
// 3 Parson's Problems (Code-Reihenfolge-Aufgaben)

export interface ParsonsBlock {
  id: string;
  code: string;
  isDistractor?: boolean;
}

export interface ParsonsProblem {
  id: number;
  title: string;
  description: string;
  blocks: ParsonsBlock[];
  solution: string[];  // Korrekte Reihenfolge der IDs
  explanation: string;
}

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: 1,
    title: "Brand-Typ und Smart Constructor aufbauen",
    description: "Bringe die Codeblöcke in die richtige Reihenfolge um einen vollständigen typisierten UserId-Smart-Constructor zu erstellen.",
    blocks: [
      { id: "a", code: "type Brand<T, B extends string> = T & { readonly __brand: B };" },
      { id: "b", code: "type UserId = Brand<string, 'UserId'>;" },
      { id: "c", code: "function createUserId(raw: string): UserId {" },
      { id: "d", code: "  if (!raw || raw.trim().length < 5) {" },
      { id: "e", code: "    throw new Error(`Ungültige UserId: \"${raw}\"`);" },
      { id: "f", code: "  }" },
      { id: "g", code: "  return raw.trim() as UserId;" },
      { id: "h", code: "}" },
      { id: "i", code: "function getUser(id: UserId): void {}", isDistractor: true }, // Distraktor
      { id: "j", code: "const userId = createUserId('user-abc');" }
    ],
    solution: ["a", "b", "c", "d", "e", "f", "g", "h", "j"],
    explanation: "1. Brand-Helfer definieren 2. Konkreten UserId-Typ definieren (nutzt Brand) 3. Smart Constructor mit Validierung 4. Verwendung. Der Distraktor 'getUser' gehört nicht zur Basis-Sequenz."
  },
  {
    id: 2,
    title: "Result-Typ für Email-Validierung",
    description: "Ordne die Blöcke um eine parseEmail-Funktion mit Result-Typ zu erstellen.",
    blocks: [
      { id: "a", code: "type Email = string & { readonly __brand: 'Email' };" },
      { id: "b", code: "type Result<T> = { ok: true; value: T } | { ok: false; error: string };" },
      { id: "c", code: "function parseEmail(raw: string): Result<Email> {" },
      { id: "d", code: "  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;" },
      { id: "e", code: "  const normalized = raw.trim().toLowerCase();" },
      { id: "f", code: "  if (!emailRegex.test(normalized)) {" },
      { id: "g", code: "    return { ok: false, error: `Ungültige E-Mail: \"${raw}\"` };" },
      { id: "h", code: "  }" },
      { id: "i", code: "  return { ok: true, value: normalized as Email };" },
      { id: "j", code: "}" },
      { id: "k", code: "type Email = Brand<string, 'Email'>;", isDistractor: true } // Alternative (falsch hier)
    ],
    solution: ["a", "b", "c", "e", "d", "f", "g", "h", "i", "j"],
    explanation: "1. Email-Typ 2. Result-Typ 3. Funktion 4. Normalisierung VOR der Validierung 5. Regex 6. Fehler-Zweig 7. Erfolgs-Zweig. Normalisierung (Schritt e) muss VOR der Regex-Prüfung passieren."
  },
  {
    id: 3,
    title: "Generisches ID-Repository aufbauen",
    description: "Baue ein typsicheres Repository-System mit generischen IDs auf.",
    blocks: [
      { id: "a", code: "type Id<E extends string> = string & { readonly __idType: E };" },
      { id: "b", code: "type UserId = Id<'User'>;" },
      { id: "c", code: "interface User { id: UserId; name: string; }" },
      { id: "d", code: "class UserRepository {" },
      { id: "e", code: "  private db = new Map<string, User>();" },
      { id: "f", code: "  findById(id: UserId): User | undefined {" },
      { id: "g", code: "    return this.db.get(id as string);" },
      { id: "h", code: "  }" },
      { id: "i", code: "  save(user: User): void {" },
      { id: "j", code: "    this.db.set(user.id as string, user);" },
      { id: "k", code: "  }" },
      { id: "l", code: "}" },
      { id: "m", code: "const repo = new UserRepository();", isDistractor: false },
      { id: "n", code: "type OrderId = Id<'Order'>;", isDistractor: true } // Nicht für User-Repo nötig
    ],
    solution: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"],
    explanation: "1. Generischer Id-Typ 2. Konkreter UserId 3. User-Entity mit UserId 4. Repository-Klasse 5. Map-Speicher 6. findById mit UserId (Typ) aber string als Map-Key 7. save-Methode 8. Instanziierung. OrderId (Distraktor) ist nicht Teil dieses User-Repository."
  }
];
