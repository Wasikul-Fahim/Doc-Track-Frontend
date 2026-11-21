"use client";

import {
  Activity,
  HeartPulse,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/use-analytics";
import { formatMonth, formatNumber } from "@/lib/utils";
import type { PatientStatus } from "@/lib/types";

const STATUS_COLORS: Record<PatientStatus, string> = {
  admitted: "#E3CFAF",
  discharged: "#6b7280",
  critical: "#ef4444",
};

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${accent ?? "bg-muted"}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  const overview = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-destructive">Failed to load the dashboard</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <button onClick={() => refetch()} className="text-primary underline">
          Retry
        </button>
      </div>
    );
  }

  const { totals, statusBreakdown, admissionsByMonth, topConditions, patientsPerDoctor, specializationBreakdown } =
    overview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of doctors, patients and activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doctors"
          value={formatNumber(totals.doctors)}
          icon={Stethoscope}
          accent="bg-[#E3CFAF] text-[#141105]"
        />
        <StatCard
          title="Patients"
          value={formatNumber(totals.patients)}
          icon={Users}
          accent="bg-[#E3CFAF] text-[#141105]"
        />
        <StatCard
          title="Critical"
          value={formatNumber(totals.critical)}
          icon={HeartPulse}
          accent="bg-red-500/10 text-red-600"
        />
        <StatCard
          title="Avg. Age"
          value={totals.avgAge == null ? "—" : totals.avgAge.toFixed(1)}
          icon={Activity}
          accent="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Admissions by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={admissionsByMonth}>
                <defs>
                  <linearGradient id="admissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E3CFAF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E3CFAF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip labelFormatter={(label) => formatMonth(String(label))} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#E3CFAF"
                  strokeWidth={2}
                  fill="url(#admissions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {statusBreakdown.map((entry) => (
                <div key={entry.status} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                  />
                  <span className="capitalize text-muted-foreground">{entry.status}</span>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topConditions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="condition"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#E3CFAF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patients per Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
{patientsPerDoctor.length === 0 && (
              <p className="text-sm text-muted-foreground">No doctors yet.</p>
            )}
            {patientsPerDoctor.map((doctor) => (
              <div
                key={doctor.doctorId}
                className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{doctor.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {doctor.specialization} · {doctor.area}
                  </p>
                </div>
                <Badge variant="secondary">{doctor.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {specializationBreakdown.length === 0 && (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          )}
          {specializationBreakdown.map((item) => (
            <Badge key={item.specialization} variant="outline" className="gap-2">
              {item.specialization}
              <span className="font-mono text-muted-foreground">{item.count}</span>
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
