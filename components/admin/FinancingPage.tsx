// app/admin/financing/page.tsx
"use client";

import {  useState } from "react";
import { Button } from "@/components/ui/button";
import GroupsTab from "@/components/admin/GroupsTab";
import PlansTab from "@/components/admin/PlansTab";


/* ----------------- page ----------------- */
export default function FinancingAdminPage() {
  const [tab, setTab] = useState<"groups" | "plans">("plans");

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financiación</h1>
          <p className="text-sm text-muted-foreground">Gestioná planes de cuotas</p>
        </div>
        <div className="inline-flex rounded-lg border bg-white overflow-hidden">

          <Button
            variant={tab === "plans" ? "default" : "ghost"}
            className="rounded-none border-l"
            onClick={() => setTab("plans")}
          >
            Planes
          </Button>
        </div>
      </div>

      {tab === "groups" ? <GroupsTab /> : <PlansTab />}
    </div>
  );
}

