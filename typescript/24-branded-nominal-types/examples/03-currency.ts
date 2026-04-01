// Beispiel 03: Currency-Brands — Typsichere Geldbetraege
// ======================================================
// Zeigt: Cents statt Euro (keine Float-Fehler), Waehrungsschutz
// Ausfuehren: npx tsx examples/03-currency.ts

type Brand<T, B extends string> = T & { readonly __brand: B };

// Waehrungstypen
type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';

// MoneyAmount immer in Cents (keine Float-Probleme!)
type MoneyAmount<C extends Currency> = number & {
  readonly __currency: C;
  readonly __cents: true;
};

type EurCents = MoneyAmount<'EUR'>;
type UsdCents = MoneyAmount<'USD'>;
type GbpCents = MoneyAmount<'GBP'>;

// Smart Constructors:
function eurCents(cents: number): EurCents {
  if (!Number.isInteger(cents)) throw new Error(`Cents muss Ganzzahl sein: ${cents}`);
  if (cents < 0) throw new Error(`Negativ nicht erlaubt: ${cents}`);
  return cents as EurCents;
}

function usdCents(cents: number): UsdCents {
  if (!Number.isInteger(cents)) throw new Error(`Cents muss Ganzzahl sein: ${cents}`);
  if (cents < 0) throw new Error(`Negativ nicht erlaubt: ${cents}`);
  return cents as UsdCents;
}

// Operationen (nur gleiche Waehrung!):
function addMoney<C extends Currency>(a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
}

function subtractMoney<C extends Currency>(a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  if (b > a) throw new Error("Ergebnis waere negativ");
  return (a - b) as MoneyAmount<C>;
}

// Konvertierung zwischen Waehrungen:
function convertEurToUsd(eur: EurCents, rate: number): UsdCents {
  return Math.round(eur * rate) as UsdCents;
}

// Formatierung (cents → "19,99 EUR"):
function formatMoney<C extends Currency>(amount: MoneyAmount<C>, currency: C): string {
  const value = (amount / 100).toFixed(2);
  return `${value} ${currency}`;
}

// Demo:
const price      = eurCents(1999);  // 19,99 EUR
const tax        = eurCents(380);   // 3,80 EUR
const total      = addMoney(price, tax);

console.log(`Preis:  ${formatMoney(price, 'EUR')}`);    // 19.99 EUR
console.log(`MwSt:   ${formatMoney(tax, 'EUR')}`);      // 3.80 EUR
console.log(`Gesamt: ${formatMoney(total, 'EUR')}`);    // 23.79 EUR

// Konvertierung:
const usdTotal = convertEurToUsd(total, 1.09);
console.log(`In USD: ${formatMoney(usdTotal, 'USD')}`); // ca. 25.93 USD

// Arithmetik funktioniert:
const halfPrice = Math.round(price / 2) as EurCents;
console.log(`Halbpreis: ${formatMoney(halfPrice, 'EUR')}`);

// COMPILE-ERRORS (einkommentieren zum Testen):
// addMoney(price, usdTotal);          // EUR + USD verboten
// convertEurToUsd(usdTotal, 1.09);    // USD → USD (nicht EUR)

// Float-Problem ohne Brands (warum Cents?):
console.log("\n--- Float-Problem Demonstration ---");
console.log(0.1 + 0.2);              // 0.30000000000000004 (!)
console.log(10 + 20);                // 30 (Cents: kein Problem)

console.log("\n✅ Currency-Beispiele erfolgreich!");
