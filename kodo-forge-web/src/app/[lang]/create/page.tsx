import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import CreatePage from "./CreatePage";

export async function generateMetadata(
  props: PageProps<"/[lang]/create">
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.createPage.metaTitle,
    description: dict.createPage.metaDescription,
  };
}

export default async function Page(props: PageProps<"/[lang]/create">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <CreatePage dict={dict} lang={lang} />;
}
