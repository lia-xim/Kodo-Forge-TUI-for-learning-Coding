import type { Metadata } from "next";
import DownloadPage from "./DownloadPage";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download Kodo Forge for Windows, macOS, or Linux. A single zero-dependency executable — no installation required.",
};

export default function Page() {
  return <DownloadPage />;
}
