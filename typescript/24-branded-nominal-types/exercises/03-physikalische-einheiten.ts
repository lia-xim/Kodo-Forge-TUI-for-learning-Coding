// Exercise 03: Physikalische Einheiten mit Brand-Typen
// =====================================================
// Ziel: Vermeide den Mars-Orbiter-Bug mit typisierten Einheiten

type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO 1: Definiere Brand-Typen für Einheiten:
//   - Meter (number)
//   - Kilogram (number)
//   - Second (number)
//   - MeterPerSecond (number)   — Geschwindigkeit

// TODO 2: Smart Constructors (alle validieren: muss positiv sein):
//   - createMeter(n: number): Meter
//   - createKilogram(n: number): Kilogram
//   - createSecond(n: number): Second

// TODO 3: Schreibe physikalische Formeln die die Typen erzwingen:
//   - velocity(distance: Meter, time: Second): MeterPerSecond
//   - kineticEnergy(mass: Kilogram, velocity: MeterPerSecond): number  (in Joule)

// Formeln:
//   v = Δs / Δt
//   Ekin = 0.5 * m * v²

// TODO 4: Demo-Anwendung:
// Ein Auto fährt 100 Meter in 10 Sekunden.
// Berechne die Geschwindigkeit und kinetische Energie (Masse: 1000 kg).

// Erwartetes Ergebnis:
// Geschwindigkeit: 10 m/s
// Kinetische Energie: 50000 J (= 50 kJ)

// TODO 5 (Bonus): Schreibe Konversionsfunktionen:
//   - meterToFoot(m: Meter): Foot  (1 m = 3.28084 ft)
//   - kilogramToPound(kg: Kilogram): Pound  (1 kg = 2.20462 lbs)

// Und zeige dass:
// velocity(foot, second)   // MUSS Compile-Error geben!

export {};
