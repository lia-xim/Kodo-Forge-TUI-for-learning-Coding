import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import CoursesPage from "./CoursesPage";

const BASE_URL = "https://kodoforge.dev";

export async function generateMetadata(
  props: PageProps<"/[lang]/courses">
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.coursesPage.metaTitle,
    description: dict.coursesPage.metaDescription,
    alternates: {
      canonical: `${BASE_URL}/${lang}/courses`,
      languages: {
        en: `${BASE_URL}/en/courses`,
        de: `${BASE_URL}/de/courses`,
        "x-default": `${BASE_URL}/en/courses`,
      },
    },
  };
}

export default async function Page(props: PageProps<"/[lang]/courses">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <CoursesPage dict={dict} lang={lang} />;
}
