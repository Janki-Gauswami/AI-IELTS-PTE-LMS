import { Outlet } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";

const TeacherDashboardLayout = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default TeacherDashboardLayout;