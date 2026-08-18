import SettingsCard from "./SettingCard";
import ToggleRow from "./ToggleRow";

export default function NotificationSettings() {
  return (
    <SettingsCard
      title="Notifications"
      description="Choose which notifications you want to receive."
    >

      <ToggleRow
        title="Investor requests"
        description="Get notified when an investor requests access to your startup."
        defaultChecked={true}
      />

      <ToggleRow
        title="New startup views"
        description="Receive updates when your startup gets significant traffic."
        defaultChecked={true}
      />

      <ToggleRow
        title="AI analysis completed"
        description="Get notified when your startup analysis is ready."
        defaultChecked={true}
      />

      <ToggleRow
        title="Email notifications"
        description="Receive important VentureAI updates by email."
        defaultChecked={false}
      />

      <ToggleRow
        title="Product updates"
        description="Receive news about new VentureAI features."
        defaultChecked={false}
      />

    </SettingsCard>
  );
}