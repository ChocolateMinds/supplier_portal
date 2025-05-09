"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // Corrected import for App Router
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Assuming DatePickerWithPresets is a custom component that handles date state internally or via props
// For simplicity, we'll use basic date inputs here if DatePickerWithPresets is not fully defined for state handling.
// import { DatePickerWithPresets } from "@/components/ui/date-picker-with-presets"; 
import { createFlight, getFlightById, updateFlight } from "@/lib/apiService";

const aircraftTypes = [
  { id: "Gulfstream G650", name: "Gulfstream G650" },
  { id: "Bombardier Global 7500", name: "Bombardier Global 7500" },
  { id: "Dassault Falcon 8X", name: "Dassault Falcon 8X" },
  { id: "Cessna Citation Longitude", name: "Cessna Citation Longitude" },
  { id: "Embraer Phenom 300", name: "Embraer Phenom 300" },
  { id: "Other", name: "Other (Specify)" },
];

interface FlightFormData {
  departure_airport_code: string;
  departure_city: string;
  departure_country: string;
  departure_datetime: string; // Store as ISO string
  arrival_airport_code: string;
  arrival_city: string;
  arrival_country: string;
  arrival_datetime: string; // Store as ISO string
  aircraft_type: string;
  total_seats: number;
  available_seats: number;
  original_price: number;
  discounted_price: number;
  amenities: string;
  luggage_capacity: string;
  terms_and_conditions: string;
  status: string;
}

export default function NewFlightPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FlightFormData>({
    departure_airport_code: "",
    departure_city: "",
    departure_country: "",
    departure_datetime: new Date().toISOString().slice(0, 16), // Default to current datetime in YYYY-MM-DDTHH:mm format
    arrival_airport_code: "",
    arrival_city: "",
    arrival_country: "",
    arrival_datetime: new Date(Date.now() + 3600 * 1000 * 3).toISOString().slice(0, 16), // Default to 3 hours from now
    aircraft_type: aircraftTypes[0].id,
    total_seats: 10,
    available_seats: 10,
    original_price: 0,
    discounted_price: 0,
    amenities: "",
    luggage_capacity: "",
    terms_and_conditions: "",
    status: "Available",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    if (type === "number") {
        processedValue = value === "" ? "" : parseFloat(value); // Keep as string if empty for controlled input, else parse
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      // Convert date to YYYY-MM-DDTHH:MM format for datetime-local input
      const localDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, [name]: localDateTime }));
    } else {
      setFormData(prev => ({ ...prev, [name]: "" })); // Or handle undefined date as needed
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation (can be expanded with a library like Zod)
    if (formData.discounted_price > formData.original_price) {
        setError("Discounted price cannot be greater than original price.");
        setIsLoading(false);
        return;
    }
    if (formData.available_seats > formData.total_seats) {
        setError("Available seats cannot exceed total seats.");
        setIsLoading(false);
        return;
    }
    if (new Date(formData.arrival_datetime) <= new Date(formData.departure_datetime)) {
        setError("Arrival datetime must be after departure datetime.");
        setIsLoading(false);
        return;
    }

    try {
      // Ensure numeric fields are numbers before sending
      const payload = {
        ...formData,
        total_seats: Number(formData.total_seats),
        available_seats: Number(formData.available_seats),
        original_price: Number(formData.original_price),
        discounted_price: Number(formData.discounted_price),
        // Convert local datetime strings back to ISO strings for backend
        departure_datetime: new Date(formData.departure_datetime).toISOString(),
        arrival_datetime: new Date(formData.arrival_datetime).toISOString(),
      };
      await createFlight(payload);
      // alert("Flight created successfully!"); // Replace with a proper notification system
      router.push("/flights"); // Redirect to flights list
    } catch (err: any) {
      console.error("Failed to create flight:", err);
      setError(err.response?.data?.message || "Failed to create flight. Please check your input and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/flights">
          <Button variant="outline" size="icon" className="h-7 w-7" type="button">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Add New Flight
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Link href="/flights">
            <Button variant="outline" size="sm" type="button">
              Discard
            </Button>
          </Link>
          <Button size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Flight"}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enter Flight Details</CardTitle>
          <CardDescription>
            Please fill in all the required information for the empty leg flight.
            {error && <p className="text-red-500 mt-2">Error: {error}</p>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Route & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="departure_airport_code">Departure Airport Code (e.g., LHR)</Label>
                  <Input id="departure_airport_code" name="departure_airport_code" placeholder="LHR" value={formData.departure_airport_code} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_city">Departure City</Label>
                  <Input id="departure_city" name="departure_city" placeholder="London" value={formData.departure_city} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_country">Departure Country</Label>
                  <Input id="departure_country" name="departure_country" placeholder="United Kingdom" value={formData.departure_country} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_datetime">Departure Date & Time</Label>
                  <Input id="departure_datetime" name="departure_datetime" type="datetime-local" value={formData.departure_datetime} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="arrival_airport_code">Arrival Airport Code (e.g., JFK)</Label>
                  <Input id="arrival_airport_code" name="arrival_airport_code" placeholder="JFK" value={formData.arrival_airport_code} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arrival_city">Arrival City</Label>
                  <Input id="arrival_city" name="arrival_city" placeholder="New York" value={formData.arrival_city} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arrival_country">Arrival Country</Label>
                  <Input id="arrival_country" name="arrival_country" placeholder="USA" value={formData.arrival_country} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arrival_datetime">Arrival Date & Time</Label>
                  <Input id="arrival_datetime" name="arrival_datetime" type="datetime-local" value={formData.arrival_datetime} onChange={handleChange} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aircraft & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="aircraft_type">Aircraft Type</Label>
                  <Select name="aircraft_type" value={formData.aircraft_type} onValueChange={(value) => handleSelectChange("aircraft_type", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aircraft type" />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_seats">Total Seats</Label>
                  <Input id="total_seats" name="total_seats" type="number" placeholder="12" value={formData.total_seats} onChange={handleChange} required min="1"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="available_seats">Available Seats</Label>
                  <Input id="available_seats" name="available_seats" type="number" placeholder="8" value={formData.available_seats} onChange={handleChange} required min="0"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="original_price">Original Price ($)</Label>
                  <Input id="original_price" name="original_price" type="number" placeholder="3000" value={formData.original_price} onChange={handleChange} required min="0"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discounted_price">Discounted Price ($)</Label>
                  <Input id="discounted_price" name="discounted_price" type="number" placeholder="2500" value={formData.discounted_price} onChange={handleChange} required min="0"/>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea id="amenities" name="amenities" placeholder="e.g., Wi-Fi, Catering, Satellite Phone" value={formData.amenities} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="luggage_capacity">Luggage Capacity</Label>
                  <Input id="luggage_capacity" name="luggage_capacity" placeholder="e.g., 2 standard bags per person" value={formData.luggage_capacity} onChange={handleChange} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
                  <Textarea id="terms_and_conditions" name="terms_and_conditions" placeholder="Enter flight-specific terms and conditions" value={formData.terms_and_conditions} onChange={handleChange} />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="status">Flight Status</Label>
                  <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Booked">Booked</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Pending Confirmation">Pending Confirmation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 md:hidden">
            <div className="flex items-center gap-2 w-full">
                <Link href="/flights">
                    <Button variant="outline" size="sm" className="w-full" type="button">Discard</Button>
                </Link>
                <Button size="sm" className="w-full" type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Flight"}</Button>
            </div>
        </CardFooter>
      </Card>
    </form>
  );
}

