// Exercise 05: ID-System für Repository-Pattern
// ==============================================
// Ziel: Typsicheres Repository-System mit generischen IDs bauen

// TODO 1: Definiere den generischen Id-Typ:
//   type Id<Entity extends string> = string & { readonly __idType: Entity };

// TODO 2: Definiere konkrete IDs:
//   - UserId    = Id<'User'>
//   - ArticleId = Id<'Article'>
//   - CommentId = Id<'Comment'>

// TODO 3: Definiere die Domain-Entities:
//   interface User    { id: UserId; name: string; email: string; }
//   interface Article { id: ArticleId; title: string; authorId: UserId; content: string; }
//   interface Comment { id: CommentId; authorId: UserId; articleId: ArticleId; text: string; }

// TODO 4: Schreibe ein generisches Repository-Interface:
//   interface Repository<T, TId extends string> {
//     findById(id: Id<TId>): T | undefined;
//     findAll(): T[];
//     save(entity: T): void;
//     delete(id: Id<TId>): boolean;
//   }

// TODO 5: Implementiere InMemoryRepository<T, TId extends string>:
//   - Nutze Map<string, T> intern
//   - findById, findAll, save, delete implementieren
//   - HINWEIS: 'id as string' nötig für Map-Key (intern OK!)

// Für User müsste die Entity eine 'id: Id<TId>' Property haben.
// Tipp: Nutze ein Interface-Constraint:
//   class InMemoryRepository<T extends { id: Id<TId> }, TId extends string>

// TODO 6: Erstelle konkrete Repositories:
//   const userRepo: Repository<User, 'User'> = new InMemoryRepository<User, 'User'>();

// TODO 7: Testet typsicher:
// const userId    = 'user-001' as UserId;
// const articleId = 'art-001' as ArticleId;
//
// userRepo.findById(userId);    // ✅
// userRepo.findById(articleId); // ❌ COMPILE-ERROR — ArticleId ≠ Id<'User'>

// TODO 8 (Bonus): Schreibe ein typsicheres "Verlinkungs"-Assertion:
//   function assertUserExists(
//     repo: Repository<User, 'User'>,
//     id: UserId
//   ): User {
//     const user = repo.findById(id);
//     if (!user) throw new Error(`User nicht gefunden: ${id}`);
//     return user;
//   }

export {};
