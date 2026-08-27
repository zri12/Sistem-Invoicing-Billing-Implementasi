import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Role } from "@/data/mock";
import type { Page } from "@/App";

interface Props {
  role: Role;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userName: string;
  children: React.ReactNode;
}

export default function Layout({ role, currentPage, onNavigate, onLogout, userName, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <Sidebar
        role={role}
        currentPage={currentPage}
        onNavigate={onNavigate}
        userName={userName}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar userName={userName} role={role} onLogout={onLogout} currentPage={currentPage} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
