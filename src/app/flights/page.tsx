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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, FileUp, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/apiService";
import { useRouter } from "next/navigation";

interface Flight {
  id: string; // or number, depending on your backend
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
  arrival_datetime: string;
  aircraft_type: string;
  seats_available: number;
  original_price: number;
  reduced_price: number;
  status: string; // e.g., "Scheduled", "Departed", "Arrived", "Cancelled"
}

export default function FlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.flights.getFlights();
      setFlights(data.flights || []); // Assuming API returns { flights: [...] }
    } catch (err: any) {
      console.error("Failed to fetch flights:", err);
      setError(err.message || "Could not load flights.");
      setFlights([]); // Clear flights on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleDeleteFlight = async (flightId: string) => {
    if (window.confirm("Are you sure you want to delete this flight?")) {
      try {
        await api.flights.deleteFlight(flightId);
        setFlights(flights.filter((flight) => flight.id !== flightId));
        // Optionally, show a success notification
      } catch (err: any) {
        console.error("Failed to delete flight:", err);
        setError(err.message || "Could not delete flight.");
        // Optionally, show an error notification
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "secondary";
      case "active": // Assuming active means it is bookable
      case "on time":
        return "success";
      case "delayed":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Flights</h1>
        <div className="flex items-center space-x-2">
          <Link href="/flights/upload-csv">
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" /> Upload CSV
            </Button>
          </Link>
          <Link href="/flights/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Flight
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-center text-muted-foreground">Loading flights...</p>}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error: {error}</span>
        </div>
      )}

      {!isLoading && !error && flights.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <Plane className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No flights found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new flight or uploading a CSV.</p>
        </div>
      )}

      {!isLoading && flights.length > 0 && (
        <div className="border shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight No.</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Aircraft</TableHead>
                <TableHead className="text-center">Seats</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell className="font-medium">{flight.flight_number}</TableCell>
                  <TableCell>{flight.departure_airport} <span className="text-muted-foreground">to</span> {flight.arrival_airport}</TableCell>
                  <TableCell>{new Date(flight.departure_datetime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(flight.arrival_datetime).toLocaleString()}</TableCell>
                  <TableCell>{flight.aircraft_type}</TableCell>
                  <TableCell className="text-center">{flight.seats_available}</TableCell>
                  <TableCell className="text-right">
                    {flight.reduced_price < flight.original_price && (
                        <span className="line-through text-muted-foreground text-xs mr-1">${flight.original_price.toFixed(2)}</span>
                    )}
                    ${flight.reduced_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(flight.status)}>{flight.status || "Unknown"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/flights/${flight.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/flights/${flight.id}/edit`)}>
                           {/* Assuming edit is /flights/[flightId]/edit or similar, adjust if using the (form) group for edit too */}
                           {/* For now, let's assume the form page /flights/(form)/[flightId] handles edit */}
                          <Edit className="mr-2 h-4 w-4" /> Edit Flight
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:!text-red-600 hover:!bg-red-50" onClick={() => handleDeleteFlight(flight.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Flight
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

