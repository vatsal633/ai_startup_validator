import SettingsCard from "./SettingCard";
import ToggleRow from "./ToggleRow";

export default function AccountSettings() {
  return (
    <div className="space-y-6">

      <SettingsCard
        title="Account Preferences"
        description="Manage your account preferences."
      >

        <ToggleRow
          title="Show profile publicly"
          description="Allow investors to discover your founder profile."
          defaultChecked={true}
        />

        <ToggleRow
          title="Show startup statistics"
          description="Allow investors to see views and engagement statistics."
          defaultChecked={true}
        />

        <ToggleRow
          title="Allow investor messages"
          description="Allow verified investors to contact you."
          defaultChecked={true}
        />

      </SettingsCard>


      <SettingsCard
        title="Danger Zone"
        description="Permanent actions for your VentureAI account."
      >

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">

          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
            Delete Account
          </h3>

          <p className="mt-1 text-xs leading-5 text-red-600 dark:text-red-400">
            Permanently delete your account and all associated
            startup data. This action cannot be undone.
          </p>

          <button className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900 dark:hover:bg-red-950">
            Delete Account
          </button>

        </div>

      </SettingsCard>

    </div>
  );
}