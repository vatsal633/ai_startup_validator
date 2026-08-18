"use client"
import React from "react";
import { usePathname } from "next/navigation";
import TopNavbar from "../components/TopNavbar";
import Sidebar from "../components/Sidebar";


export default function FounderDashBoardLayout({ children }) {
    const pathname = usePathname();
    const header = pathname.split('/')[2];
    return (
        <main>
            <TopNavbar header={header}/>
            <div className="flex">

                <Sidebar/>
                {children}
            </div>
        </main>
    );
}