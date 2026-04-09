import type { Metadata } from "next";
import DocsPage from "./DocsPage";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how Kodo Forge works, how to install it, how to create your own terminal courses, and explore the architecture behind the zero-dependency TUI learning engine.",
};

export default function Page() {
  return <DocsPage />;
}
