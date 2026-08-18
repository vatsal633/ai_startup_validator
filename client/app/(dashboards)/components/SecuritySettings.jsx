import SettingsCard from "./SettingCard";
import ToggleRow from "./ToggleRow";
import InputField from "./InputField";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">

      <SettingsCard
        title="Change Password"
        description="Keep your account secure with a strong password."
      >

        <div className="space-y-5">

          <InputField
            label="Current Password"
            type="password"
          />

          <InputField
            label="New Password"
            type="password"
          />

          <InputField
            label="Confirm New Password"
            type="password"
          />

        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Update Password
          </button>
        </div>

      </SettingsCard>


      <SettingsCard
        title="Account Security"
        description="Additional security options for your account."
      >

        <ToggleRow
          title="Two-factor authentication"
          description="Add an additional layer of security to your account."
          defaultChecked={false}
        />

      </SettingsCard>


      <SettingsCard
        title="Active Sessions"
        description="Manage devices that are currently logged into your account."
      >

        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-700">
              💻
            </div>

            <div>
              <p className="text-sm font-semibold">
                Windows PC
              </p>

              <p className="text-xs text-slate-400">
                Current session · India
              </p>
            </div>

          </div>

          <span className="text-xs font-medium text-emerald-600">
            Active
          </span>

        </div>

      </SettingsCard>

    </div>
  );
}
