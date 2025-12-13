"use client"

import { useEffect, useState } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, UtensilsCrossed, Trophy, Award, Activity, Calendar, Clock, CheckCircle2, Loader2, XCircle, UserCheck, QrCode, Building2 } from "lucide-react"
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
import QRCode from "qrcode"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserData {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  traineeId?: string;
  userType?: 'player' | 'committee' | 'food' | 'user';
  committeeId?: string;
  playerId?: string;
  projectName?: string;
}

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

interface PlayerInfo {
  id: string;
  traineeId: string;
  fullName: string;
  email: string;
  department: string;
  team?: {
    id: string;
    name: string;
    shortName: string;
    color: string;
  };
  foodRegistration?: {
    id: string;
    foodPreference: string;
    foodCollected: boolean;
    foodCollectedAt: string | null;
  };
}

interface UpcomingMatch {
  id: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  scheduledAt: string;
  status: string;
}

const departmentColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ec4899", "#14b8a6", "#eab308", "#06b6d4"];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [foodData, setFoodData] = useState<FoodPreference[]>([]);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  
  // Project Name Modal States
  const [showProjectNameModal, setShowProjectNameModal] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [savingProjectName, setSavingProjectName] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Redirect to login if not authenticated
    if (!storedUser || !token) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Check if player/trainee needs to enter project name
    if (userData.role === 'USER' && !userData.projectName) {
      setShowProjectNameModal(true);
    }
    
    if (userData.role === 'USER') {
      fetchPlayerDashboard(userData);
    } else {
      fetchAdminDashboard();
    }
  }, [router]);

  // Generate QR code when playerInfo is loaded
  useEffect(() => {
    if (playerInfo?.traineeId && playerInfo?.foodRegistration && !playerInfo.foodRegistration.foodCollected) {
      // Generate QR code with trainee ID for food collection
      QRCode.toDataURL(playerInfo.traineeId, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => {
        setQrCodeImage(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [playerInfo]);

  const fetchPlayerDashboard = async (userData: UserData) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Auto check-in if user is a committee member
      if (userData.userType === 'committee') {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/committee/check-in-by-email`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userData.email })
          });
        } catch (checkInError) {
          console.error("Error auto check-in committee member:", checkInError);
        }
      }

      // Fetch player info by email/traineeId
      const [playerRes, matchesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players?email=${encodeURIComponent(userData.email)}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches?status=SCHEDULED&limit=5`, { headers }),
      ]);

      let foundPlayer = false;
      if (playerRes.ok) {
        const playerData = await playerRes.json();
        const players = playerData.data || [];
        // Find exact match by email
        const myPlayer = players.find((p: any) => p.email?.toLowerCase() === userData.email.toLowerCase());
        if (myPlayer) {
          setPlayerInfo(myPlayer);
          foundPlayer = true;
        }
      }

      // If no player found but user is food-only, fetch food registration separately
      if (!foundPlayer && userData.userType === 'food') {
        try {
          const foodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/registrations?email=${encodeURIComponent(userData.email)}`, { headers });
          if (foodRes.ok) {
            const foodData = await foodRes.json();
            const foodRegs = foodData.data || [];
            const myFood = foodRegs.find((f: any) => f.email?.toLowerCase() === userData.email.toLowerCase());
            if (myFood) {
              setPlayerInfo({
                id: myFood.id,
                traineeId: myFood.traineeId,
                fullName: myFood.fullName,
                email: myFood.email || userData.email,
                department: myFood.department,
                team: undefined,
                foodRegistration: {
                  id: myFood.id,
                  foodPreference: myFood.foodPreference,
                  foodCollected: myFood.foodCollected,
                  foodCollectedAt: myFood.foodCollectedAt,
                }
              });
            }
          }
        } catch (e) {
          console.error('Error fetching food registration:', e);
        }
      }

      if (matchesRes.ok) {
        const matchData = await matchesRes.json();
        setUpcomingMatches(matchData.data?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error fetching player dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminDashboard = async () => {
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

  // Save project name
  const handleSaveProjectName = async () => {
    if (!projectNameInput.trim()) {
      toast.error("Please enter your project name");
      return;
    }

    setSavingProjectName(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/project-name`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectName: projectNameInput.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to save project name");
      }

      const data = await res.json();
      
      // Update user in state and localStorage
      const updatedUser = { ...user, projectName: projectNameInput.trim() };
      setUser(updatedUser as UserData);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Project name saved successfully!");
      setShowProjectNameModal(false);
    } catch (error: any) {
      console.error("Error saving project name:", error);
      toast.error(error.message || "Failed to save project name");
    } finally {
      setSavingProjectName(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Project Name Modal Component
  const ProjectNameModal = () => (
    <Dialog open={showProjectNameModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Welcome! Enter Your Project Name
          </DialogTitle>
          <DialogDescription>
            Please enter your project name to complete your profile. This will be displayed on your dashboard and visible to OC members.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g., Project Alpha, Team Phoenix..."
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveProjectName()}
              className="h-12"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSaveProjectName} 
            disabled={savingProjectName || !projectNameInput.trim()}
            className="w-full sm:w-auto"
          >
            {savingProjectName ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              "Save Project Name"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Player Dashboard
  if (user?.role === 'USER') {
    const isTraineeOnly = user.userType === 'food';
    const displayName = playerInfo?.fullName || user.firstName || (isTraineeOnly ? 'Trainee' : 'Player');
    
    return (
      <ResponsiveLayout>
        <ProjectNameModal />
        <div className="container mx-auto p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="mb-1 text-2xl font-bold text-foreground lg:mb-2 lg:text-3xl">
              Welcome, {displayName}!
            </h1>
            <p className="text-sm text-muted-foreground lg:text-base">
              Cricket Fiesta 2026 - Your event dashboard
            </p>
          </div>

          {/* Player Info Card */}
          {playerInfo && (
            <Card className="mb-4 lg:mb-6">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle className="text-base lg:text-xl">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground lg:text-sm">Trainee ID</p>
                    <p className="text-sm font-medium lg:text-base">{playerInfo.traineeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground lg:text-sm">Department</p>
                    <p className="text-sm font-medium lg:text-base">{playerInfo.department}</p>
                  </div>
                  {/* Project Name */}
                  <div>
                    <p className="text-xs text-muted-foreground lg:text-sm">Project</p>
                    {user?.projectName ? (
                      <p className="text-sm font-medium lg:text-base">{user.projectName}</p>
                    ) : (
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-sm text-primary underline"
                        onClick={() => setShowProjectNameModal(true)}
                      >
                        Add Project Name
                      </Button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground lg:text-sm">{isTraineeOnly ? 'Status' : 'Team'}</p>
                    {isTraineeOnly ? (
                      <Badge className="mt-1 bg-purple-500 text-white text-xs">Trainee</Badge>
                    ) : playerInfo.team ? (
                      <Badge 
                        className="mt-1 text-xs"
                        style={{ backgroundColor: playerInfo.team.color, color: '#fff' }}
                      >
                        {playerInfo.team.name}
                      </Badge>
                    ) : (
                      <p className="text-sm font-medium text-muted-foreground lg:text-base">Not assigned yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Food Status Card */}
          <Card className="mb-4 lg:mb-6">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <UtensilsCrossed className="h-4 w-4 lg:h-5 lg:w-5" />
                Food Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              {playerInfo?.foodRegistration ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {playerInfo.foodRegistration.foodCollected ? (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-600">Food Collected</p>
                          <p className="text-xs text-muted-foreground lg:text-sm">
                            Collected at {new Date(playerInfo.foodRegistration.foodCollectedAt!).toLocaleString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                          <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-600">Not Yet Collected</p>
                          <p className="text-xs text-muted-foreground lg:text-sm">
                            Show your QR code at the food counter
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="rounded-lg bg-muted p-3 lg:p-4">
                    <p className="text-xs text-muted-foreground lg:text-sm">Food Preference</p>
                    <p className="text-sm font-medium lg:text-base">
                      {playerInfo.foodRegistration.foodPreference === 'VEGETARIAN' ? 'Vegetarian' : 'Non-Vegetarian'}
                    </p>
                  </div>
                  
                  {/* QR Code for food collection */}
                  {!playerInfo.foodRegistration.foodCollected && qrCodeImage && (
                    <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                        <QrCode className="h-4 w-4" />
                        Your Food Collection QR Code
                      </div>
                      <div className="rounded-lg bg-white p-2">
                        <img 
                          src={qrCodeImage} 
                          alt="Food Collection QR Code" 
                          className="h-40 w-40"
                        />
                      </div>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Show this QR code at the food counter to collect your meal
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <p className="text-sm">No food registration found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card className="mb-4 lg:mb-6">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              {upcomingMatches.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{match.homeTeam.shortName}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-medium">{match.awayTeam.shortName}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(match.scheduledAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/matches">
                    <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent text-xs lg:text-sm">
                      View All Matches
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming matches scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/matches">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" size="sm">
                    <Trophy className="h-4 w-4" />
                    View Matches
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" size="sm">
                    <Users className="h-4 w-4" />
                    View Teams
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }
  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-foreground lg:mb-2 lg:text-3xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground lg:text-base">Welcome to the SLT Trainees Cricket Fiesta event management</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-1.5 sm:px-4 sm:py-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium sm:text-sm">Event Active</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
                <CardTitle className="text-xs font-medium lg:text-sm">Total Players</CardTitle>
                <Users className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="text-xl font-bold lg:text-2xl">{stats?.players.total || 0}</div>
                <p className="text-[10px] text-muted-foreground lg:text-xs">
                  <span className={stats?.players.attendanceRate && stats.players.attendanceRate > 0 ? "text-green-500" : "text-gray-500"}>
                    {stats?.players.attended || 0} attended
                  </span>{" "}
                  ({stats?.players.attendanceRate.toFixed(1) || 0}%)
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
                <CardTitle className="text-xs font-medium lg:text-sm">Food Registrations</CardTitle>
                <UtensilsCrossed className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="text-xl font-bold lg:text-2xl">
                  {stats?.food.collected || 0} / {stats?.food.total || 0}
                </div>
                <p className="text-[10px] text-muted-foreground lg:text-xs">
                  <span className={stats?.food.collectionRate && stats.food.collectionRate === 100 ? "text-green-500" : "text-orange-500"}>
                    {stats?.food.collectionRate?.toFixed(1) || 0}%
                  </span>{" "}
                  collected
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
                <CardTitle className="text-xs font-medium lg:text-sm">Active Matches</CardTitle>
                <Trophy className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="text-xl font-bold lg:text-2xl">{stats?.matches.live || 0}</div>
                <p className="text-[10px] text-muted-foreground lg:text-xs">
                  {stats?.matches.completed || 0} done, {stats?.matches.upcoming || 0} upcoming
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-6 lg:pb-2">
                <CardTitle className="text-xs font-medium lg:text-sm">Committee</CardTitle>
                <Award className="h-3 w-3 text-muted-foreground lg:h-4 lg:w-4" />
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="text-xl font-bold lg:text-2xl">
                  {stats?.committee.active || 0} / {stats?.committee.total || 0}
                </div>
                <p className="text-[10px] text-muted-foreground lg:text-xs">
                  {stats?.committee.active === stats?.committee.total ? "All" : stats?.committee.active || 0} checked in
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="mb-4 grid gap-4 lg:mb-6 lg:grid-cols-2 lg:gap-6">
            {/* Department Distribution */}
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-sm lg:text-base">Players by Department</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Distribution of registered players</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                {departmentData.length > 0 ? (
                  <ChartContainer
                    config={{
                      count: {
                        label: "Players",
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[200px] lg:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentData}>
                        <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
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
                  <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground lg:h-[300px]">
                    No department data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food Preference */}
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-sm lg:text-base">Food Preferences</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Vegetarian vs Non-Vegetarian</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
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
                    className="h-[200px] lg:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={foodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ preference, count }) => `${preference === "VEGETARIAN" ? "Veg" : "Non-Veg"}: ${count}`}
                          outerRadius={80}
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
                  <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground lg:h-[300px]">
                    No food preference data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attendance Timeline - Removed as it requires real-time tracking */}
          
          {/* Bottom Row */}
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-sm lg:text-base">Quick Actions</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0 lg:p-6 lg:pt-0">
                <Link href="/players/new">
                  <Button className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" variant="outline" size="sm">
                    <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                    Register New Player
                  </Button>
                </Link>
                <Link href="/food/scanner">
                  <Button className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" variant="outline" size="sm">
                    <UtensilsCrossed className="h-3 w-3 lg:h-4 lg:w-4" />
                    Open QR Scanner
                  </Button>
                </Link>
                <Link href="/matches/new">
                  <Button className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" variant="outline" size="sm">
                    <Trophy className="h-3 w-3 lg:h-4 lg:w-4" />
                    Schedule New Match
                  </Button>
                </Link>
                <Link href="/committee">
                  <Button className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" variant="outline" size="sm">
                    <Award className="h-3 w-3 lg:h-4 lg:w-4" />
                    Manage Committee
                  </Button>
                </Link>
                {user?.role === 'SUPER_ADMIN' && (
                  <Link href="/admin/user-requests">
                    <Button className="w-full justify-start gap-2 bg-transparent text-xs lg:text-sm" variant="outline" size="sm">
                      <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                      User Login Requests
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity - Removed static data */}
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-sm lg:text-base">System Status</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Current system overview</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 lg:h-8 lg:w-8">
                      <Users className="h-3 w-3 text-primary lg:h-4 lg:w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium lg:text-sm">Player Registration</p>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        {stats?.players.total || 0} players registered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 lg:h-8 lg:w-8">
                      <Trophy className="h-3 w-3 text-primary lg:h-4 lg:w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium lg:text-sm">Match Progress</p>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        {stats?.matches.completed || 0} completed, {stats?.matches.live || 0} live
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 lg:h-8 lg:w-8">
                      <UtensilsCrossed className="h-3 w-3 text-primary lg:h-4 lg:w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium lg:text-sm">Food Distribution</p>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        {stats?.food.collected || 0}/{stats?.food.total || 0} meals distributed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 lg:h-8 lg:w-8">
                      <Award className="h-3 w-3 text-primary lg:h-4 lg:w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium lg:text-sm">Committee Active</p>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        {stats?.committee.active || 0}/{stats?.committee.total || 0} volunteers on duty
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Status Banner */}
          <Card className="mt-4 border-primary/20 bg-primary/5 lg:mt-6">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-6">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 lg:h-12 lg:w-12">
                  <Calendar className="h-5 w-5 text-primary lg:h-6 lg:w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground lg:text-base">Event Day Progress</h3>
                  <p className="text-xs text-muted-foreground lg:text-sm">
                    {stats?.matches.live && stats.matches.live > 0
                      ? `${stats.matches.live} match${stats.matches.live > 1 ? "es" : ""} currently live`
                      : "All systems operational"}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  stats?.matches.live && stats.matches.live > 0
                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 self-start sm:self-auto"
                    : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 self-start sm:self-auto"
                }
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {stats?.matches.live && stats.matches.live > 0 ? "Live" : "On Track"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    
  )
}
