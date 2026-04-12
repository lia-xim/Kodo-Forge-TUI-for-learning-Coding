/**
 * L20 - Beispiel 05: Template Literal Types Review (L18)
 */
type EventMap<T> = {
  [K in keyof T & string as `${K}Changed`]: { prev: T[K]; next: T[K] };
};

interface Settings { theme: "light" | "dark"; lang: string; }
type SE = EventMap<Settings>;

type ExtractParams<T extends string> =
  T extends `${string}:${infer P}/${infer Rest}` ? P | ExtractParams<Rest> :
  T extends `${string}:${infer P}` ? P : never;

type Params = ExtractParams<"/users/:id/posts/:postId">;
// "id" | "postId"

console.log("Template Literal Review loaded.");
