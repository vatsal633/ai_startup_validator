"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import RequireRole from "./RequireRole";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { getUnreadCount } from "@/lib/endpoints";
import { UserProvider, useUser } from "@/lib/userContext";

/**
 * The chrome itself. Separate from DashboardShell so that none of its data
 * fetching starts until RequireRole has confirmed there is a session —
 * otherwise a signed-out visit fires requests that can only 401.
 */
function Chrome({ role, children }) {
  const pathname = usePathname();
  const { displayName, initial } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data?.unread_count ?? 0);
    } catch {
      // a badge is not worth surfacing an error for
    }
  }, []);

  // re-check on navigation, so the badge settles after visiting notifications
  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, pathname]);

  const header = pathname.split("/")[2] ?? "";

  return (
    <main>
      <TopNavbar
        header={header}
        role={role}
        displayName={displayName}
        initial={initial}
        unreadCount={unreadCount}
      />
      <div className="flex">
        <Sidebar role={role} unreadCount={unreadCount} />
        {children}
      </div>
    </main>
  );
}

/** Chrome shared by the founder and investor sections. */
export default function DashboardShell({ role, children }) {
  return (
    <RequireRole role={role}>
      <UserProvider>
        <Chrome role={role}>{children}</Chrome>
      </UserProvider>
    </RequireRole>
  );
}
