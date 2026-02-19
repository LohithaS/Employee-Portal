import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSearch } from "wouter";

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const defaultFirst = nameParts[0] || "";
  const defaultLast = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tabFromUrl = searchParams.get("tab");
  const validTab = tabFromUrl === "profile" || tabFromUrl === "security" || tabFromUrl === "notifications" ? tabFromUrl : "profile";
  const [activeTab, setActiveTab] = useState(validTab);

  useEffect(() => {
    setActiveTab(validTab);
  }, [validTab]);

  const [profile, setProfile] = useState({
    firstName: defaultFirst,
    lastName: defaultLast,
    email: "",
    phone: "",
    department: "",
    designation: "",
    reportingTo: "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    leaveUpdates: true,
    taskAssignments: true,
    meetingReminders: true,
    reimbursementUpdates: true,
    salarySlipAvailable: false,
  });

  const handleSaveProfile = () => {
    const errors: Record<string, string> = {};
    if (!profile.firstName.trim()) errors.firstName = "First name is required";
    if (!profile.lastName.trim()) errors.lastName = "Last name is required";
    if (!profile.email.trim()) errors.email = "Email is required";
    if (!profile.phone.trim()) errors.phone = "Phone is required";
    if (!profile.department.trim()) errors.department = "Department is required";
    if (!profile.designation.trim()) errors.designation = "Designation is required";
    if (!profile.reportingTo.trim()) errors.reportingTo = "Reporting To is required";
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;
    toast({ title: "Profile updated successfully" });
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/auth/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully", description: "Your new password is now active. Use it for your next login." });
      setPasswords({ current: "", newPass: "", confirm: "" });
      setPassErrors({});
    },
    onError: (error: Error) => {
      const msg = error.message;
      if (msg.includes("Current password is incorrect") || msg.includes("incorrect")) {
        setPassErrors({ current: "Current password is incorrect" });
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    },
  });

  const handleUpdatePassword = () => {
    const errors: Record<string, string> = {};
    if (!passwords.current.trim()) errors.current = "Current password is required";
    if (!passwords.newPass.trim()) errors.newPass = "New password is required";
    else if (passwords.newPass.length < 6) errors.newPass = "Password must be at least 6 characters";
    if (!passwords.confirm.trim()) errors.confirm = "Please confirm your new password";
    else if (passwords.newPass !== passwords.confirm) errors.confirm = "Passwords do not match";
    setPassErrors(errors);
    if (Object.keys(errors).length > 0) return;
    changePasswordMutation.mutate({ currentPassword: passwords.current, newPassword: passwords.newPass });
  };

  const handleSaveNotifications = () => {
    toast({ title: "Notification preferences saved" });
  };

  const initials = getInitials(user?.name);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="security">Security & Password</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{user?.name}</p>
                              <p className="text-sm text-muted-foreground">{user?.role}</p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <Input
                                  value={profile.firstName}
                                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                  className={profileErrors.firstName ? "border-red-500" : ""}
                                  data-testid="input-settings-firstname"
                                />
                                {profileErrors.firstName && <span className="text-xs text-red-500">{profileErrors.firstName}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name <span className="text-red-500">*</span></Label>
                                <Input
                                  value={profile.lastName}
                                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                  className={profileErrors.lastName ? "border-red-500" : ""}
                                  data-testid="input-settings-lastname"
                                />
                                {profileErrors.lastName && <span className="text-xs text-red-500">{profileErrors.lastName}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email <span className="text-red-500">*</span></Label>
                                <Input
                                  type="email"
                                  value={profile.email}
                                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                  className={profileErrors.email ? "border-red-500" : ""}
                                  placeholder="you@example.com"
                                  data-testid="input-settings-email"
                                />
                                {profileErrors.email && <span className="text-xs text-red-500">{profileErrors.email}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Phone <span className="text-red-500">*</span></Label>
                                <Input
                                  value={profile.phone}
                                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                  className={profileErrors.phone ? "border-red-500" : ""}
                                  placeholder="+91 98765 43210"
                                  data-testid="input-settings-phone"
                                />
                                {profileErrors.phone && <span className="text-xs text-red-500">{profileErrors.phone}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Department <span className="text-red-500">*</span></Label>
                                <Input
                                  value={profile.department}
                                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                  className={profileErrors.department ? "border-red-500" : ""}
                                  placeholder="e.g. Engineering"
                                  data-testid="input-settings-department"
                                />
                                {profileErrors.department && <span className="text-xs text-red-500">{profileErrors.department}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Designation <span className="text-red-500">*</span></Label>
                                <Input
                                  value={profile.designation}
                                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                                  className={profileErrors.designation ? "border-red-500" : ""}
                                  placeholder="e.g. Software Engineer"
                                  data-testid="input-settings-designation"
                                />
                                {profileErrors.designation && <span className="text-xs text-red-500">{profileErrors.designation}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Reporting To <span className="text-red-500">*</span></Label>
                                <Input
                                  value={profile.reportingTo}
                                  onChange={(e) => setProfile({ ...profile, reportingTo: e.target.value })}
                                  className={profileErrors.reportingTo ? "border-red-500" : ""}
                                  placeholder="e.g. John Doe"
                                  data-testid="input-settings-reporting-to"
                                />
                                {profileErrors.reportingTo && <span className="text-xs text-red-500">{profileErrors.reportingTo}</span>}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSaveProfile} data-testid="button-save-profile">Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Ensure your account is secure by using a strong password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label>Current Password <span className="text-red-500">*</span></Label>
                            <Input
                              type="password"
                              value={passwords.current}
                              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                              className={passErrors.current ? "border-red-500" : ""}
                              data-testid="input-current-password"
                            />
                            {passErrors.current && <span className="text-xs text-red-500">{passErrors.current}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>New Password <span className="text-red-500">*</span></Label>
                            <Input
                              type="password"
                              value={passwords.newPass}
                              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                              className={passErrors.newPass ? "border-red-500" : ""}
                              data-testid="input-new-password"
                            />
                            {passErrors.newPass && <span className="text-xs text-red-500">{passErrors.newPass}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password <span className="text-red-500">*</span></Label>
                            <Input
                              type="password"
                              value={passwords.confirm}
                              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                              className={passErrors.confirm ? "border-red-500" : ""}
                              data-testid="input-confirm-password"
                            />
                            {passErrors.confirm && <span className="text-xs text-red-500">{passErrors.confirm}</span>}
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleUpdatePassword} disabled={changePasswordMutation.isPending} data-testid="button-update-password">
                              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notifications">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Choose which notifications you'd like to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                            </div>
                            <Switch
                              checked={notifSettings.emailNotifications}
                              onCheckedChange={(v) => setNotifSettings({ ...notifSettings, emailNotifications: v })}
                              data-testid="switch-email-notifications"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Leave Updates</p>
                                <p className="text-xs text-muted-foreground">Get notified when leave requests are approved or rejected</p>
                            </div>
                            <Switch
                              checked={notifSettings.leaveUpdates}
                              onCheckedChange={(v) => setNotifSettings({ ...notifSettings, leaveUpdates: v })}
                              data-testid="switch-leave-updates"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Task Assignments</p>
                                <p className="text-xs text-muted-foreground">Get notified when new tasks are assigned to you</p>
                            </div>
                            <Switch
                              checked={notifSettings.taskAssignments}
                              onCheckedChange={(v) => setNotifSettings({ ...notifSettings, taskAssignments: v })}
                              data-testid="switch-task-assignments"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Meeting Reminders</p>
                                <p className="text-xs text-muted-foreground">Get reminded before scheduled meetings</p>
                            </div>
                            <Switch
                              checked={notifSettings.meetingReminders}
                              onCheckedChange={(v) => setNotifSettings({ ...notifSettings, meetingReminders: v })}
                              data-testid="switch-meeting-reminders"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Reimbursement Updates</p>
                                <p className="text-xs text-muted-foreground">Get notified when reimbursements are processed</p>
                            </div>
                            <Switch
                              checked={notifSettings.reimbursementUpdates}
                              onCheckedChange={(v) => setNotifSettings({ ...notifSettings, reimbursementUpdates: v })}
                              data-testid="switch-reimbursement-updates"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Salary Slip Available</p>
                                <p className="text-xs text-muted-foreground">Get notified when new salary slips are available</p>
                            </div>
                            <Switch
                              checked={notifSettings.salarySlipAvailable}
                              onCheckedChange={(v) => setNotifSettings({ ...notifSettings, salarySlipAvailable: v })}
                              data-testid="switch-salary-slip"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">Save Preferences</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
