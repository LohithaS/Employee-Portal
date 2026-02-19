import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import TaskManagement from "@/pages/tasks";
import CRM from "@/pages/crm";
import LeadManagement from "@/pages/lead-management";
import ServiceManagement from "@/pages/service-management";
import MinutesOfMeeting from "@/pages/mom";
import MeetingManagement from "@/pages/meeting-management";
import BusinessTripReports from "@/pages/business-trips";
import Reimbursements from "@/pages/reimbursements";
import LeaveManagement from "@/pages/leave-management";
import SalarySlip from "@/pages/salary-slip";
import Reports from "@/pages/reports";
import CompanyInformation from "@/pages/company-info";
import Settings from "@/pages/settings";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute 
        path="/" 
        component={() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )} 
      />
      <ProtectedRoute path="/tasks" component={TaskManagement} />
      <ProtectedRoute path="/crm" component={CRM} />
      <ProtectedRoute path="/leads" component={LeadManagement} />
      <ProtectedRoute path="/service" component={ServiceManagement} />
      <ProtectedRoute path="/mom" component={MinutesOfMeeting} />
      <ProtectedRoute path="/meetings" component={MeetingManagement} />
      <ProtectedRoute path="/trips" component={BusinessTripReports} />
      <ProtectedRoute path="/reimbursements" component={Reimbursements} />
      <ProtectedRoute path="/leaves" component={LeaveManagement} />
      <ProtectedRoute path="/salary" component={SalarySlip} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/company" component={CompanyInformation} />
      <ProtectedRoute path="/settings" component={Settings} />
      {/* Fallback routes for demo purposes that redirect to dashboard or show not found */}
      <ProtectedRoute 
        path="/:any*" 
        component={(params: { any: string }) => {
          // If it's one of the sidebar links, show dashboard for now as they are placeholders
          const validRoutes = ["tasks", "crm", "mom", "trips", "reimbursements", "leaves", "salary", "reports", "company", "settings"];
          if (validRoutes.includes(params.any)) {
            return (
              <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                  <h2 className="text-2xl font-bold capitalize">{params.any.replace("-", " ")}</h2>
                  <p className="text-muted-foreground">This module is under construction.</p>
                </div>
              </DashboardLayout>
            );
          }
          return <NotFound />;
        }} 
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
