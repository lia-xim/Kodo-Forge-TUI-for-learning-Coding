/**
 * Bun-only Bundle-Loader. Wird ausschliesslich von tui-first-run.ts dynamisch
 * importiert, wenn wir in einer Bun-Runtime laufen. Im tsx-Dev-Modus wird
 * dieses Modul nie geladen — dort findet tui-first-run den Bundle-Pfad ueber
 * einen direkten Disk-Lookup.
 *
 * Der statische `import ... with { type: "file" }` sagt Bun beim `build
 * --compile`: "Bette diese Datei mit ein, und gib mir den virtuellen Pfad
 * zur Laufzeit zurueck". Das ist der einzige verlaessliche Weg, einen
 * eingebetteten Asset-Pfad synchron zu erhalten.
 */

// @ts-expect-error — .bin file with type:"file" gibt uns den Pfad-String zurueck
import bundlePath from "./courses-bundle.bin" with { type: "file" };

export const BUNDLE_PATH: string = bundlePath;
