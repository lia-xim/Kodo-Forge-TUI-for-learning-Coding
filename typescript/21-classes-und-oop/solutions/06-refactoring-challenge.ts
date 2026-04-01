/**
 * Lektion 21 — Loesung 06: Refactoring Challenge
 *
 * Von tiefer Vererbung zu flexibler Komposition.
 */

// ═══ Schritt 1: Interfaces definieren ═══

interface NotificationChannel {
  send(message: string): void;
}

interface MessageFormatter {
  format(message: string): string;
}

interface NotificationLogger {
  log(action: string): void;
}

// ═══ Schritt 2: Konkrete Implementierungen ═══

// Channels
class EmailChannel implements NotificationChannel {
  send(message: string): void {
    console.log(`[EMAIL] ${message}`);
  }
}

class SlackChannel implements NotificationChannel {
  send(message: string): void {
    console.log(`[SLACK] ${message}`);
  }
}

class SmsChannel implements NotificationChannel {
  send(message: string): void {
    console.log(`[SMS] ${message}`);
  }
}

// Formatters
class UrgentFormatter implements MessageFormatter {
  format(message: string): string {
    return `!!! URGENT: ${message} !!!`;
  }
}

class NormalFormatter implements MessageFormatter {
  format(message: string): string {
    return message;
  }
}

class TimestampFormatter implements MessageFormatter {
  format(message: string): string {
    return `[${new Date().toISOString()}] ${message}`;
  }
}

// Loggers
class ConsoleLogger implements NotificationLogger {
  log(action: string): void {
    console.log(`[LOG] ${action}`);
  }
}

class NoopLogger implements NotificationLogger {
  log(_action: string): void {
    // Intentionally empty — kein Logging
  }
}

// ═══ Schritt 3: NotificationService mit Komposition ═══

class NotificationService {
  constructor(
    private channel: NotificationChannel,
    private formatter: MessageFormatter,
    private logger: NotificationLogger
  ) {}

  send(message: string): void {
    this.logger.log(`About to send: ${message}`);
    const formatted = this.formatter.format(message);
    this.channel.send(formatted);
    this.logger.log(`Sent: ${formatted}`);
  }
}

// ═══ Flexibel kombinieren! ═══

console.log("--- Urgent Email mit Logging ---");
const urgentEmail = new NotificationService(
  new EmailChannel(),
  new UrgentFormatter(),
  new ConsoleLogger()
);
urgentEmail.send("Server down");

console.log("\n--- Normal Slack ohne Logging ---");
const normalSlack = new NotificationService(
  new SlackChannel(),
  new NormalFormatter(),
  new NoopLogger()
);
normalSlack.send("Deploy abgeschlossen");

console.log("\n--- Timestamp SMS mit Logging ---");
const timestampSms = new NotificationService(
  new SmsChannel(),
  new TimestampFormatter(),
  new ConsoleLogger()
);
timestampSms.send("Code: 123456");

// ═══ Vorteile gegenueber Vererbung ═══
// - Jede Kombination moeglich (3 Channels × 3 Formatters × 2 Loggers = 18 Varianten)
// - Mit Vererbung brauchtest du 18 Klassen, mit Komposition 8 Klassen
// - Neue Channel/Formatter/Logger erfordern nur 1 neue Klasse, keine Hierarchie-Aenderung
// - Einfach testbar: Mock-Channel, Mock-Formatter, Mock-Logger

console.log("\n--- Loesung 06 erfolgreich ---");
