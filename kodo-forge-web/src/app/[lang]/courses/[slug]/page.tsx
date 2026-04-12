import type { Metadata } from "next";
import { courses, getCourseBySlug } from "@/data/courses";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import CourseDetailPage from "./CourseDetailPage";

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

  return {
    title: dict.courseDetail.metaTitle
      .replace("{courseName}", courseName),
    description: dict.courseDetail.metaDescription
      .replace("{description}", description)
      .replace("{lessons}", String(course.totalLessons))
      .replace("{hours}", String(course.estimatedHours)),
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
