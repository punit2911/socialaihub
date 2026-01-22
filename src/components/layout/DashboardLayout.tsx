import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export function DashboardLayout({ children, userName, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar userName={userName} onLogout={onLogout} />
      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
