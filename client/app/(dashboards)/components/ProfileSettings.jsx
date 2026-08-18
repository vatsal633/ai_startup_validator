import SettingsCard from "./SettingCard";
import InputField from "./InputField";

export default function ProfileSettings() {
  return (
    <div className="space-y-6">

      <SettingsCard
        title="Profile Information"
        description="Update your public founder profile."
      >

        {/* PROFILE IMAGE */}
        <div className="flex items-center gap-4">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            V
          </div>

          <div>

            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Change Photo
            </button>

            <p className="mt-2 text-xs text-slate-400">
              JPG, PNG or WEBP. Maximum 2MB.
            </p>

          </div>

        </div>


        {/* FORM */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">

          <InputField
            label="First Name"
            value="Venture"
          />

          <InputField
            label="Last Name"
            value="Founder"
          />

          <InputField
            label="Email"
            value="founder@example.com"
            type="email"
          />

          <InputField
            label="Phone Number"
            placeholder="+91 XXXXX XXXXX"
          />

        </div>


        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium">
            Bio
          </label>

          <textarea
            rows="4"
            placeholder="Tell investors a little about yourself..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
          />
        </div>


        <div className="mt-6 flex justify-end">
          <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Save Changes
          </button>
        </div>

      </SettingsCard>


      {/* PROFESSIONAL INFORMATION */}
      <SettingsCard
        title="Founder Information"
        description="Information investors can see on your founder profile."
      >

        <div className="grid gap-5 sm:grid-cols-2">

          <InputField
            label="Location"
            placeholder="e.g. Bangalore, India"
          />

          <InputField
            label="Role"
            value="Founder & Entrepreneur"
          />

          <InputField
            label="LinkedIn"
            placeholder="LinkedIn profile URL"
          />

          <InputField
            label="Website"
            placeholder="https://yourwebsite.com"
          />

        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Save Changes
          </button>
        </div>

      </SettingsCard>

    </div>
  );
}