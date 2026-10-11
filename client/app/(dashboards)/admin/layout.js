import DashboardShell from "../components/DashboardShell";

export default function AdminDashboardLayout({ children }) {
    return <DashboardShell role="admin">{children}</DashboardShell>;
}
