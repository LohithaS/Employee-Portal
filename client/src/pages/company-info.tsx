import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Megaphone } from "lucide-react";

export default function CompanyInformation() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Information</h1>

        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-l-4 border-primary pl-4 py-1">
                            <h3 className="font-semibold">Annual Company Retreat</h3>
                            <p className="text-sm text-muted-foreground mt-1">We are happy to announce this year's retreat location is Bali! Dates: April 15-20.</p>
                            <p className="text-xs text-muted-foreground mt-2">Posted: Feb 15, 2026</p>
                        </div>
                        <div className="border-l-4 border-primary pl-4 py-1">
                            <h3 className="font-semibold">New Health Insurance Policy</h3>
                            <p className="text-sm text-muted-foreground mt-1">We have upgraded our health insurance partner to secure better coverage for all employees.</p>
                            <p className="text-xs text-muted-foreground mt-2">Posted: Feb 01, 2026</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Policies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Leave Policy</AccordionTrigger>
                                <AccordionContent>
                                    All employees are entitled to 20 days of paid leave annually. Sick leaves require a medical certificate if exceeding 2 days.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Work from Home</AccordionTrigger>
                                <AccordionContent>
                                    Hybrid model allows for 2 days of WFH per week with manager approval. Core hours must be maintained.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Expense Reimbursement</AccordionTrigger>
                                <AccordionContent>
                                    All business-related expenses must be filed within 30 days of occurrence with valid receipts.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Code of Conduct</AccordionTrigger>
                                <AccordionContent>
                                    We maintain a zero-tolerance policy towards harassment and discrimination. Professional conduct is expected at all times.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
