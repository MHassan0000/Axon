import React from "react";
import Navbar from "@/components/shared/Navbar";
// import Footer from "@/components/ui/shared/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex flex-col min-h-screen">
            <div>
                <Navbar />
            </div>
            <div className="flex-1">{children}</div>
            {/* <Footer /> */}
        </main>
    )
}