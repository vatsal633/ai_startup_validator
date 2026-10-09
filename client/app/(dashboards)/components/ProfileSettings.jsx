"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import SettingsCard from "./SettingCard";
import InputField from "./InputField";
import { updateMe } from "@/lib/endpoints";
import { useUser } from "@/lib/userContext";

const ROLE_LABEL = {
  founder: "Founder & Entrepreneur",
  investor: "Investor",
  admin: "Administrator",
};

const EDITABLE = ["first_name", "last_name", "bio", "phone", "location", "linkedin", "website"];

export default function ProfileSettings() {
  const { user, loading, setUser, initial } = useUser();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(null); // which card is saving
  const [status, setStatus] = useState(null); // {card, type, message}

  // seed the form once the profile arrives
  useEffect(() => {
    if (!user) return;
    setForm(
      EDITABLE.reduce((acc, field) => ({ ...acc, [field]: user[field] ?? "" }), {})
    );
  }, [user]);

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = (card, fields) => async () => {
    setSaving(card);
    setStatus(null);
    try {
      const updated = await updateMe(
        fields.reduce((acc, field) => ({ ...acc, [field]: form[field] ?? "" }), {})
      );
      setUser(updated);
      setStatus({ card, type: "success", message: "Saved." });
    } catch (err) {
      setStatus({ card, type: "error", message: err.message });
    } finally {
      setSaving(null);
    }
  };

  const Feedback = ({ card }) =>
    status?.card === card ? (
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
    ) : null;

  const SaveButton = ({ card, fields }) => (
    <button
      type="button"
      onClick={save(card, fields)}
      disabled={saving !== null || loading}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
    >
      {saving === card && <LoaderCircle size={15} className="animate-spin" />}
      Save Changes
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 dark:border-slate-800 dark:bg-slate-900">
        <LoaderCircle size={22} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Profile Information"
        description="Update your public founder profile."
      >
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            {initial}
          </div>
          <div>
            <button
              type="button"
              disabled
              title="Photo upload isn't supported by the API yet"
              className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-700"
            >
              Change Photo
            </button>
            <p className="mt-2 text-xs text-slate-400">Photo uploads are coming soon.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <InputField
            label="First Name"
            value={form.first_name}
            onChange={update("first_name")}
          />
          <InputField
            label="Last Name"
            value={form.last_name}
            onChange={update("last_name")}
          />
          <InputField
            label="Email"
            type="email"
            value={user?.email ?? ""}
            disabled
            hint="Your email is your sign-in and can't be changed here."
          />
          <InputField
            label="Phone Number"
            value={form.phone}
            onChange={update("phone")}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">Bio</label>
          <textarea
            rows="4"
            value={form.bio ?? ""}
            onChange={(event) => update("bio")(event.target.value)}
            placeholder="Tell investors a little about yourself..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Feedback card="profile" />
          <SaveButton card="profile" fields={["first_name", "last_name", "phone", "bio"]} />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Founder Information"
        description="Information investors can see on your founder profile."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Location"
            value={form.location}
            onChange={update("location")}
            placeholder="e.g. Bangalore, India"
          />
          <InputField
            label="Role"
            value={ROLE_LABEL[user?.role] ?? "—"}
            disabled
            hint="Your role is set when you sign up."
          />
          <InputField
            label="LinkedIn"
            type="url"
            value={form.linkedin}
            onChange={update("linkedin")}
            placeholder="https://linkedin.com/in/you"
          />
          <InputField
            label="Website"
            type="url"
            value={form.website}
            onChange={update("website")}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Feedback card="founder" />
          <SaveButton card="founder" fields={["location", "linkedin", "website"]} />
        </div>
      </SettingsCard>
    </div>
  );
}
