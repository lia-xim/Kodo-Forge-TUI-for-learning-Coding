/**
 * Lektion 18 - Beispiel 05: Praxis-Patterns
 */

// CSS Length Types
type CssLength = `${number}${"px" | "em" | "rem" | "%"}`;
const width: CssLength = "100px";
const margin: CssLength = "2rem";

// Route Parameter Extraction
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}` ? Param | ExtractParams<Rest> :
  T extends `${string}:${infer Param}` ? Param : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

type RouteHandler<Path extends string> = (params: Record<ExtractParams<Path>, string>) => void;

const handler: RouteHandler<"/users/:id"> = (params) => {
  console.log("User ID:", params.id);
};
handler({ id: "123" });

// i18n Keys
type TranslationKey = `nav.${string}` | `page.${string}.title` | `error.${string}`;

function t(key: TranslationKey): string { return key; }
console.log(t("nav.home"));
console.log(t("page.about.title"));

console.log("Praxis-Patterns loaded.");
