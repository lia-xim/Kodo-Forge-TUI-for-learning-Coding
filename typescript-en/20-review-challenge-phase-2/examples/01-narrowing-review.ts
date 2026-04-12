/**
 * L20 - Beispiel 01: Narrowing Review (L11-L12)
 */
type Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.w * shape.h;
  }
}

console.log("Circle:", area({ kind: "circle", radius: 5 }));
console.log("Rect:", area({ kind: "rect", w: 3, h: 4 }));
