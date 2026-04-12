import type { Metadata } from "next";
import CoursesPage from "./CoursesPage";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse all available Kodo Forge terminal courses: TypeScript Deep Learning, Angular Mastery, React mit TypeScript, and Next.js Production.",
};

export default function Page() {
  return <CoursesPage />;
}
