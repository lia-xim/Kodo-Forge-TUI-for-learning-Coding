import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import CreatePage from "./CreatePage";

const BASE_URL = "https://kodoforge.dev";

export async function generateMetadata(
  props: PageProps<"/[lang]/create">
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.createPage.metaTitle,
    description: dict.createPage.metaDescription,
    alternates: {
      canonical: `${BASE_URL}/${lang}/create`,
      languages: {
        en: `${BASE_URL}/en/create`,
        de: `${BASE_URL}/de/create`,
        "x-default": `${BASE_URL}/en/create`,
      },
    },
  };
}

export default async function Page(props: PageProps<"/[lang]/create">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <CreatePage dict={dict} lang={lang} />;
}
