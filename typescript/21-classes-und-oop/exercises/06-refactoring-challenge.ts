/**
 * Lektion 21 — Exercise 06: Refactoring Challenge
 *
 * Der folgende Code nutzt tiefe Vererbung.
 * Refactore ihn zu Komposition (Interfaces + Injection).
 *
 * Ausfuehren: npx tsx exercises/06-refactoring-challenge.ts
 * Hinweise:   hints.json → "exercises/06-refactoring-challenge.ts"
 */

// ═══ VORHER: Tiefe Vererbungshierarchie (schlecht) ═══

class BaseNotifier {
  send(message: string): void {
    console.log(`Sending: ${message}`);
  }
}

class EmailNotifier extends BaseNotifier {
  override send(message: string): void {
    console.log(`[EMAIL] ${message}`);
  }
}

class UrgentEmailNotifier extends EmailNotifier {
  override send(message: string): void {
    super.send(`!!! URGENT: ${message} !!!`);
  }
}

class LoggedUrgentEmailNotifier extends UrgentEmailNotifier {
  override send(message: string): void {
    console.log(`[LOG] About to send urgent email`);
    super.send(message);
    console.log(`[LOG] Urgent email sent`);
  }
}

// Problem: 4 Stufen tief! Schwer erweiterbar.
// Was wenn du einen "LoggedUrgentSlackNotifier" brauchst?
// Oder "LoggedNormalEmailNotifier"?
// Die Hierarchie explodiert!

// ═══ AUFGABE: Refactore zu Komposition ═══
// 1. Definiere ein Interface 'NotificationChannel' mit send(message: string): void
// 2. Definiere ein Interface 'MessageFormatter' mit format(message: string): string
// 3. Definiere ein Interface 'NotificationLogger' mit log(action: string): void
// 4. Erstelle eine 'NotificationService' Klasse die alle drei per Constructor nimmt
// 5. Erstelle konkrete Implementierungen:
//    - EmailChannel, SlackChannel (implements NotificationChannel)
//    - UrgentFormatter, NormalFormatter (implements MessageFormatter)
//    - ConsoleLogger, NoopLogger (implements NotificationLogger)
// 6. Kombiniere sie flexibel!

// TODO: Dein refactored Code hier

// ═══ Tests ═══
function testRefactoring(): void {
  // Vorher: tiefe Hierarchie
  const oldNotifier = new LoggedUrgentEmailNotifier();
  oldNotifier.send("Server down");

  // Nachher: flexible Komposition
  // const service = new NotificationService(
  //   new EmailChannel(),
  //   new UrgentFormatter(),
  //   new ConsoleLogger()
  // );
  // service.send("Server down");

  // Einfach austauschbar:
  // const slackService = new NotificationService(
  //   new SlackChannel(),
  //   new NormalFormatter(),
  //   new NoopLogger()
  // );
  // slackService.send("Info: Deploy abgeschlossen");

  console.log("Exercise 06: Refactore den Code und kommentiere die Tests ein!");
}

testRefactoring();
