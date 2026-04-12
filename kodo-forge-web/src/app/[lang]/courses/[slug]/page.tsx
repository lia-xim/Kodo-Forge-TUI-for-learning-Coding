import type { Metadata } from "next";
import { courses, getCourseBySlug } from "@/data/courses";
import { notFound } from "next/navigation";
import CourseDetailPage from "./CourseDetailPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: `${course.name} — Terminal Course`,
    description: `${course.description} ${course.totalLessons} lessons, ${course.estimatedHours} hours of content.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  return <CourseDetailPage course={course} />;
}
