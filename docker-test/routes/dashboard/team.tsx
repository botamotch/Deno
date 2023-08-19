import { DashboardHeader, DashboardNavigator } from "../../islands/Dashboard.tsx";
import { Team } from "../../islands/Dashboard/Team.tsx";

export default function DashboardTeam() {
  return (
    <>
      <div class="min-h-full">
        <DashboardNavigator page="Team" />
        <DashboardHeader page="Team" />
        <main>
          <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {/*<!-- Your content -->*/}
            <Team />
          </div>
        </main>
      </div>
    </>
  );
}
