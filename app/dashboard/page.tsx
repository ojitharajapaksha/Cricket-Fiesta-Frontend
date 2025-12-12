"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UtensilsCrossed, Trophy, Award, Activity, Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"

interface DashboardStats {
  players: {
    total: number;
    attended: number;
    attendanceRate: number;
  };
  teams: {
    total: number;
  };
  matches: {
    total: number;
    live: number;
    completed: number;
    upcoming: number;
  };
  food: {
    total: number;
    collected: number;
    pending: number;
    collectionRate: number;
  };
  committee: {
    total: number;
    active: number;
  };
}

interface DepartmentData {
  department: string;
  count: number;
}

interface FoodPreference {
  preference: string;
  count: number;
}

const departmentColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ec4899", "#14b8a6", "#eab308", "#06b6d4"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [foodData, setFoodData] = useState<FoodPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsRes, deptRes, foodRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/registration-by-department`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/food-preferences`, { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartmentData(deptData.data);
      }

      if (foodRes.ok) {
        const foodResData = await foodRes.json();
        setFoodData(foodResData.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the SLT Trainees Cricket Fiesta event management</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Event Active</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.players.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stats?.players.attendanceRate && stats.players.attendanceRate > 0 ? "text-green-500" : "text-gray-500"}>
                    {stats?.players.attended || 0} attended
                  </span>{" "}
                  ({stats?.players.attendanceRate.toFixed(1) || 0}%)
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Food Registrations</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.food.collected || 0} / {stats?.food.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={stats?.food.collectionRate && stats.food.collectionRate === 100 ? "text-green-500" : "text-orange-500"}>
                    {stats?.food.collectionRate?.toFixed(1) || 0}%
                  </span>{" "}
                  collected
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.matches.live || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.matches.completed || 0} completed, {stats?.matches.upcoming || 0} upcoming
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Committee Members</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.committee.active || 0} / {stats?.committee.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.committee.active === stats?.committee.total ? "All" : stats?.committee.active || 0} volunteers checked in
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Players by Department</CardTitle>
                <CardDescription>Distribution of registered players across departments</CardDescription>
              </CardHeader>
              <CardContent>
                {departmentData.length > 0 ? (
                  <ChartContainer
                    config={{
                      count: {
                        label: "Players",
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentData}>
                        <XAxis dataKey="department" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]}>
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={departmentColors[index % departmentColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No department data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food Preference */}
            <Card>
              <CardHeader>
                <CardTitle>Food Preferences</CardTitle>
                <CardDescription>Vegetarian vs Non-Vegetarian distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {foodData.length > 0 ? (
                  <ChartContainer
                    config={{
                      VEGETARIAN: {
                        label: "Vegetarian",
                        color: "#10b981",
                      },
                      NON_VEGETARIAN: {
                        label: "Non-Vegetarian",
                        color: "#ef4444",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={foodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ preference, count }) => `${preference === "VEGETARIAN" ? "Veg" : "Non-Veg"}: ${count}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {foodData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.preference === "VEGETARIAN" ? "#10b981" : "#ef4444"} 
                            />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No food preference data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attendance Timeline - Removed as it requires real-time tracking */}
          
          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/players/new">
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                    <Users className="h-4 w-4" />
                    Register New Player
                  </Button>
                </Link>
                <Link href="/food/scanner">
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                    <UtensilsCrossed className="h-4 w-4" />
                    Open QR Scanner
                  </Button>
                </Link>
                <Link href="/matches/new">
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                    <Trophy className="h-4 w-4" />
                    Schedule New Match
                  </Button>
                </Link>
                <Link href="/committee">
                  <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                    <Award className="h-4 w-4" />
                    Manage Committee
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity - Removed static data */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Player Registration</p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.players.total || 0} players registered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Match Progress</p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.matches.completed || 0} completed, {stats?.matches.live || 0} live
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <UtensilsCrossed className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Food Distribution</p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.food.collected || 0}/{stats?.food.total || 0} meals distributed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Committee Active</p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.committee.active || 0}/{stats?.committee.total || 0} volunteers on duty
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Status Banner */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Event Day Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.matches.live && stats.matches.live > 0
                      ? `${stats.matches.live} match${stats.matches.live > 1 ? "es" : ""} currently live`
                      : "All systems operational"}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  stats?.matches.live && stats.matches.live > 0
                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                }
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {stats?.matches.live && stats.matches.live > 0 ? "Live" : "On Track"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
