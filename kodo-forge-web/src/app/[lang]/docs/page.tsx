import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import DocsPage from "./DocsPage";

export async function generateMetadata(
  props: PageProps<"/[lang]/docs">
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.docsPage.metaTitle,
    description: dict.docsPage.metaDescription,
  };
}

export default async function Page(props: PageProps<"/[lang]/docs">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <DocsPage dict={dict} lang={lang} />;
}
