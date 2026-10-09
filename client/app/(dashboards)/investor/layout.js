import DashboardShell from "../components/DashboardShell";

export default function InvestorDashboardLayout({ children }) {
    return <DashboardShell role="investor">{children}</DashboardShell>;
}
