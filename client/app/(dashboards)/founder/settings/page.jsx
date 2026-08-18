"use client";
import React, { useState } from "react";
import Link from "next/link";
import SettingsTab from "../../components/SettingTab";
import PrivacySettings from "../../components/PrivacySettings";
import ProfileSettings from "../../components/ProfileSettings";
import AccountSettings from "../../components/AccountSettings";
import NotificationSettings from "../../components/NotificationSettings";
import SecuritySettings from "../../components/SecuritySettings";



export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white w-full">


      <div className="flex">

        {/* MAIN */}
        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">

            {/* PAGE HEADER */}
            <div className="mb-8">

              <p className="text-sm font-medium text-indigo-600">
                Settings
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Account Settings
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage your profile, account preferences and security.
              </p>

            </div>


            {/* SETTINGS LAYOUT */}
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">

              {/* SETTINGS MENU */}
              <div className="h-fit rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">

                <SettingsTab
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                  icon="👤"
                  label="Profile"
                />

                <SettingsTab
                  active={activeTab === "account"}
                  onClick={() => setActiveTab("account")}
                  icon="⚙"
                  label="Account"
                />

                <SettingsTab
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                  icon="🔔"
                  label="Notifications"
                />

                <SettingsTab
                  active={activeTab === "privacy"}
                  onClick={() => setActiveTab("privacy")}
                  icon="🔒"
                  label="Privacy"
                />

                <SettingsTab
                  active={activeTab === "security"}
                  onClick={() => setActiveTab("security")}
                  icon="🛡"
                  label="Security"
                />

              </div>


              {/* SETTINGS CONTENT */}
              <div>

                {activeTab === "profile" && <ProfileSettings />}

                {activeTab === "account" && <AccountSettings />}

                {activeTab === "notifications" && (
                  <NotificationSettings />
                )}

                {activeTab === "privacy" && <PrivacySettings />}

                {activeTab === "security" && <SecuritySettings />}

              </div>

            </div>

          </div>

        </main>

      </div>

    </main>
  );
}






