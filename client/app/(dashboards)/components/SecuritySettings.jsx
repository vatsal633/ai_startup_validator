"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import SettingsCard from "./SettingCard";
import InputField from "./InputField";
import { changePassword } from "@/lib/endpoints";

const BLANK = { current: "", next: "", confirm: "" };

export default function SecuritySettings() {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (form.next !== form.confirm) {
      setStatus({ type: "error", message: "The new passwords do not match." });
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm(BLANK);
      setStatus({ type: "success", message: "Password updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = form.current && form.next && form.confirm && !saving;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <SettingsCard
          title="Change Password"
          description="Keep your account secure with a strong password."
        >
          <div className="space-y-5">
            <InputField
              label="Current Password"
              type="password"
              autoComplete="current-password"
              value={form.current}
              onChange={update("current")}
            />
            <InputField
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={form.next}
              onChange={update("next")}
              hint="At least 8 characters, and not a password everyone uses."
            />
            <InputField
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={update("confirm")}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-4">
            {status && (
              <p
                role="status"
                className={`text-sm ${
                  status.type === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {saving && <LoaderCircle size={15} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </SettingsCard>
      </form>

      <SettingsCard
        title="Account Security"
        description="Additional security options for your account."
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Two-factor authentication and session management aren&apos;t available yet —
          the API doesn&apos;t support them. Signing out from the profile menu clears
          this device&apos;s tokens.
        </p>
      </SettingsCard>
    </div>
  );
}
