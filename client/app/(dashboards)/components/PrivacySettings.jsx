import SettingsCard from "./SettingCard";
import ToggleRow from "./ToggleRow";

export default function PrivacySettings() {
  return (
    <SettingsCard
      title="Privacy"
      description="Control who can access your startup information."
    >

      <ToggleRow
        title="Public startup profile"
        description="Allow your published startups to appear in the discovery feed."
        defaultChecked={true}
      />

      <ToggleRow
        title="Show funding requirement"
        description="Display your funding requirement publicly."
        defaultChecked={true}
      />

      <ToggleRow
        title="Show AI validation score"
        description="Allow investors to see your startup's AI validation score."
        defaultChecked={true}
      />

      <ToggleRow
        title="Require access approval"
        description="Investors must request permission before viewing sensitive startup information."
        defaultChecked={true}
      />

    </SettingsCard>
  );
}