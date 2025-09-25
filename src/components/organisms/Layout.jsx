import React from "react";
import LogoutButton from "@/components/organisms/LogoutButton";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <div className="pt-16 lg:pt-0 px-4 lg:px-8 py-6 lg:py-8">
          <div className="flex justify-end mb-4">
            <LogoutButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
