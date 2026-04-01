/**
 * Lektion 21 — Loesung 03: Interface-Implementierung
 */

// ═══ Aufgabe 1: Mehrere Interfaces implementieren ═══

interface Serializable {
  serialize(): string;
}

interface Comparable<T> {
  compareTo(other: T): number;
}

class Task implements Serializable, Comparable<Task> {
  constructor(
    public title: string,
    public priority: number,
    public done: boolean
  ) {}

  serialize(): string {
    return JSON.stringify({
      title: this.title,
      priority: this.priority,
      done: this.done,
    });
  }

  compareTo(other: Task): number {
    if (this.priority > other.priority) return 1;
    if (this.priority < other.priority) return -1;
    return 0;
  }
}

// ═══ Aufgabe 2: Generisches Repository ═══

interface Repository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  delete(id: string): boolean;
}

class InMemoryTaskRepo implements Repository<Task & { id: string }> {
  private tasks: Map<string, Task & { id: string }> = new Map();

  findById(id: string): (Task & { id: string }) | undefined {
    return this.tasks.get(id);
  }

  findAll(): (Task & { id: string })[] {
    return [...this.tasks.values()];
  }

  save(entity: Task & { id: string }): void {
    this.tasks.set(entity.id, entity);
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}

// ═══ Aufgabe 3: Structural Typing demonstrieren ═══

function printSerializable(item: Serializable): void {
  console.log(`Serialized: ${item.serialize()}`);
}

// Funktioniert OHNE 'implements Serializable'!
const pseudoSerializable = {
  serialize(): string {
    return '{"type": "plain-object", "note": "kein implements noetig!"}';
  },
};

printSerializable(pseudoSerializable); // OK! Structural Typing

// ═══ Tests ═══

const t1 = new Task("Dringend", 5, false);
const t2 = new Task("Spaeter", 2, false);
console.assert(t1.compareTo(t2) > 0, "t1 should be higher priority");
console.assert(t1.compareTo(t1) === 0, "Same should be 0");
console.assert(JSON.parse(t1.serialize()).title === "Dringend", "Serialize failed");

const repo = new InMemoryTaskRepo();
repo.save({ ...t1, id: "1" });
repo.save({ ...t2, id: "2" });
console.assert(repo.findAll().length === 2, "Should have 2 tasks");
console.assert(repo.findById("1")?.title === "Dringend", "Should find task");
console.assert(repo.delete("1") === true, "Should delete task");
console.assert(repo.findAll().length === 1, "Should have 1 task");

console.log("\n--- Loesung 03 erfolgreich ---");
