import { DashboardHeader, DashboardNavigator } from "../../islands/Dashboard.tsx";

export default function DashboardProjects() {
  return (
    <>
      <div class="min-h-full">
        <DashboardNavigator page="Projects" />
        <DashboardHeader page="Projects" />
        <main>
          <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {/*<!-- Your content -->*/}
          </div>
        </main>
      </div>
    </>
  );
}
