import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import DownloadPage from "./DownloadPage";

export async function generateMetadata(
  props: PageProps<"/[lang]/download">
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.downloadPage.metaTitle,
    description: dict.downloadPage.metaDescription,
  };
}

export default async function Page(props: PageProps<"/[lang]/download">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <DownloadPage dict={dict} lang={lang} />;
}
