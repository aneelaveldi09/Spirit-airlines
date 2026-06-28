import type { Metadata } from "next";
import Dashboard3D from "@/components/Dashboard3D";

export const metadata: Metadata = {
  title: "3D Analytics Dashboard — Spirit Airlines",
  description: "Interactive 3D dashboard with live KPI widgets",
};

export default function DashboardPage() {
  return <Dashboard3D />;
}
