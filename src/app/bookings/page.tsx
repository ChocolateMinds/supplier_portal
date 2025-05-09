"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft, AlertCircle, Ticket } from "lucide-react";
import { api } from "@/lib/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Booking {
  id: string; // or number
  flight_id: string;
  flight_number: string; // Added for better display
  user_id: string;
  user_name: string; // Added for better display (e.g., "John Doe")
  booking_date: string;
  status: string; // e.g., "Confirmed", "Pending", "Cancelled"
  seats_booked: number;
  total_price: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.dashboard.getBookings(); // Uses tenantDashboardService.getBookings
        setBookings(data.bookings || []); // Assuming API returns { bookings: [...] }
      } catch (err: any) {
        console.error("Failed to fetch bookings:", err);
        setError(err.message || "Could not load booking information.");
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center justify-between mb-2">
                <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
                </Link>
            </div>
          <CardTitle className="text-2xl font-bold">Flight Bookings</CardTitle>
          <CardDescription>
            View and manage all bookings for your listed flights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center text-muted-foreground py-4">Loading bookings...</p>}
          {error && (
            <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>Error: {error}</span>
            </div>
          )}

          {!isLoading && !error && bookings.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">There are currently no bookings for your flights.</p>
            </div>
          )}

          {!isLoading && bookings.length > 0 && (
            <div className="border shadow-sm rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Flight No.</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead className="text-center">Seats</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.flight_number || booking.flight_id}</TableCell>
                      <TableCell>{booking.user_name || booking.user_id}</TableCell>
                      <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">{booking.seats_booked}</TableCell>
                      <TableCell className="text-right">${booking.total_price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status || "Unknown"}</Badge>
                      </TableCell>
                      {/* <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => alert("View details for booking " + booking.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

