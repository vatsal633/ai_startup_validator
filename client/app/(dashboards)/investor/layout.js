"use client"
import { usePathname } from "next/navigation";
import React from "react";
import TopNavbar from "../components/TopNavbar";
import Sidebar from "../components/Sidebar";


export default function investorDashboardLayout({children}) {
    const pathname = usePathname();
    const role = pathname.split('/')[1];
    console.log(role);
    
  
    return(
        <main>
            <TopNavbar role={role}/>
            <div className="flex">
                <Sidebar role={role}/>
                {children}
            </div>
        </main>
    )   
}