import type { MetadataRoute } from "next";
import { courses } from "@/data/courses";

const BASE_URL = "https://kodoforge.dev";
const LOCALES = ["en", "de"] as const;

function localizedEntry(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number },
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}/en${path}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]),
      ),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    localizedEntry("", { changeFrequency: "weekly", priority: 1 }),
    localizedEntry("/courses", { changeFrequency: "weekly", priority: 0.9 }),
    ...courses.map((c) =>
      localizedEntry(`/courses/${c.slug}`, { changeFrequency: "monthly", priority: 0.8 }),
    ),
    localizedEntry("/docs", { changeFrequency: "monthly", priority: 0.7 }),
    localizedEntry("/download", { changeFrequency: "monthly", priority: 0.9 }),
    localizedEntry("/create", { changeFrequency: "monthly", priority: 0.6 }),
  ];
}
