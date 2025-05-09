"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  CreditCard,
  DollarSign,
  Plane,
  Users,
  UploadCloud,
  UserCircle,
  LogOut,
  Settings
} from "lucide-react";
import { api } from "@/lib/apiService"; // Import the API service

interface DashboardStats {
  totalFlights: number;
  activeFlights: number; // Assuming backend can provide this
  totalBookings: number;
  pendingBookings: number; // Assuming backend can provide this
  totalRevenue: number;
  upcomingDepartures: number; // Assuming backend can provide this
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Replace with actual API call for dashboard stats
        // const dashboardData = await api.dashboard.getDashboardStats(); 
        // For now, using a mock that resolves after a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData: DashboardStats = {
          totalFlights: 125,
          activeFlights: 80,
          totalBookings: 350,
          pendingBookings: 15,
          totalRevenue: 1250000,
          upcomingDepartures: 5,
        };
        setStats(mockData);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Could not load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickLinks = [
    { href: "/flights/new", label: "Add New Flight", icon: Plane },
    { href: "/flights", label: "Manage Flights", icon: Settings },
    { href: "/bookings", label: "View Bookings", icon: CreditCard },
    { href: "/flights/upload-csv", label: "Upload CSV", icon: UploadCloud },
    { href: "/profile", label: "My Profile", icon: UserCircle },
  ];

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
                        <Plane className="h-6 w-6" />
                        <span className="font-bold sm:inline-block">Supplier Dashboard</span>
                    </Link>
                    <nav className="flex flex-1 items-center space-x-4 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => api.auth.logout().then(() => window.location.href = "/login")}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container py-8">
                <div className="text-center py-10">
                    <Activity className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Loading Dashboard Data...</p>
                </div>
            </main>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
                        <Plane className="h-6 w-6" />
                        <span className="font-bold sm:inline-block">Supplier Dashboard</span>
                    </Link>
                    <nav className="flex flex-1 items-center space-x-4 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => api.auth.logout().then(() => window.location.href = "/login")}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container py-8">
                <div className="text-center py-10 text-red-500">
                    <p>Error loading dashboard: {error}</p>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Plane className="h-6 w-6" />
            <span className="font-bold sm:inline-block">Supplier Dashboard</span>
          </Link>
          {/* Add other nav items if needed, e.g., notifications, user menu */}
          <nav className="flex flex-1 items-center space-x-4 justify-end">
            <Button variant="ghost" size="sm" onClick={() => api.auth.logout().then(() => window.location.href = "/login")}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back, Supplier!</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your operations.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flights Listed</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFlights ?? "N/A"}</div>
              <p className="text-xs text-muted-foreground">Currently {stats?.activeFlights ?? "N/A"} active</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings ?? "N/A"}</div>
              <p className="text-xs text-muted-foreground">{stats?.pendingBookings ?? "N/A"} pending confirmation</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString() ?? "N/A"}</div>
              <p className="text-xs text-muted-foreground">Based on confirmed bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links/Actions */}
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {quickLinks.map((link) => (
                    <Link href={link.href} key={link.href}>
                        <Card className="text-center p-4 hover:bg-accent hover:text-accent-foreground transition-colors h-full flex flex-col justify-center items-center shadow-sm hover:shadow-lg">
                            <link.icon className="h-8 w-8 mb-2 text-primary" />
                            <p className="text-sm font-medium">{link.label}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>

        {/* Placeholder for Recent Activity or Upcoming Departures */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Departures</CardTitle>
            <CardDescription>You have {stats?.upcomingDepartures ?? 0} flights departing soon.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.upcomingDepartures > 0 ? (
                <p>Details about upcoming departures would be listed here.</p> // Replace with actual list
            ) : (
                <p>No upcoming departures in the near future.</p>
            )}
            <Button variant="link" className="p-0 h-auto mt-2">
                <Link href="/flights?status=upcoming">View All Upcoming Flights</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

