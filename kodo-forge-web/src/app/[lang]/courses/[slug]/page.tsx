import type { Metadata } from "next";
import { courses, getCourseBySlug } from "@/data/courses";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import CourseDetailPage from "./CourseDetailPage";

const BASE_URL = "https://kodoforge.dev";

export async function generateStaticParams() {
  const langs = ["en", "de"];
  return courses.flatMap((c) => langs.map((lang) => ({ lang, slug: c.slug })));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/courses/[slug]">
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const course = getCourseBySlug(slug);
  if (!course) return {};

  const courseName = course.name;
  const courseData = (dict.coursesData as Record<string, any>)[course.id];
  const description = courseData?.description ?? course.description;
  const t = dict.courseDetail;

  const title = t.metaTitle
    .replace("{courseName}", courseName)
    .replace("{lessons}", String(course.totalLessons));

  const metaDescription = t.metaDescription
    .replace("{courseName}", courseName)
    .replace("{description}", description)
    .replace("{lessons}", String(course.totalLessons))
    .replace("{hours}", String(course.estimatedHours));

  const ogTitle = (t.metaOgTitle ?? t.metaTitle)
    .replace("{courseName}", courseName)
    .replace("{lessons}", String(course.totalLessons));

  const courseUrl = `${BASE_URL}/${lang}/courses/${course.slug}`;

  return {
    title,
    description: metaDescription,
    openGraph: {
      title: ogTitle,
      description: metaDescription,
      type: "website",
      url: courseUrl,
      siteName: "Kodo Forge",
      locale: lang === "de" ? "de_DE" : "en_US",
      images: [
        {
          url: `${BASE_URL}${course.image}`,
          width: 1200,
          height: 630,
          alt: `${courseName} — Kodo Forge Terminal Course`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: metaDescription,
      images: [`${BASE_URL}${course.image}`],
    },
    alternates: {
      canonical: courseUrl,
      languages: {
        en: `${BASE_URL}/en/courses/${course.slug}`,
        de: `${BASE_URL}/de/courses/${course.slug}`,
        "x-default": `${BASE_URL}/en/courses/${course.slug}`,
      },
    },
  };
}

export default async function Page(
  props: PageProps<"/[lang]/courses/[slug]">
) {
  const { lang, slug } = await props.params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  return <CourseDetailPage course={course} dict={dict} lang={lang} />;
}
