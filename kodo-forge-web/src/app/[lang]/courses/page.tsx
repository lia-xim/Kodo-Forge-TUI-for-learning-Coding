import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import CoursesPage from "./CoursesPage";

export async function generateMetadata(
  props: PageProps<"/[lang]/courses">
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.coursesPage.metaTitle,
    description: dict.coursesPage.metaDescription,
  };
}

export default async function Page(props: PageProps<"/[lang]/courses">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <CoursesPage dict={dict} lang={lang} />;
}
