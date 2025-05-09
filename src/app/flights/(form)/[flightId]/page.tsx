"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation"; // Corrected import for App Router
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
import { getFlightById, updateFlight } from "@/lib/apiService";

const aircraftTypes = [
  { id: "Gulfstream G650", name: "Gulfstream G650" },
  { id: "Bombardier Global 7500", name: "Bombardier Global 7500" },
  { id: "Dassault Falcon 8X", name: "Dassault Falcon 8X" },
  { id: "Cessna Citation Longitude", name: "Cessna Citation Longitude" },
  { id: "Embraer Phenom 300", name: "Embraer Phenom 300" },
  { id: "Other", name: "Other (Specify)" },
];

interface FlightFormData {
  id?: string;
  departure_airport_code: string;
  departure_city: string;
  departure_country: string;
  departure_datetime: string; 
  arrival_airport_code: string;
  arrival_city: string;
  arrival_country: string;
  arrival_datetime: string; 
  aircraft_type: string;
  total_seats: number | string; // Allow string for input control
  available_seats: number | string;
  original_price: number | string;
  discounted_price: number | string;
  amenities: string;
  luggage_capacity: string;
  terms_and_conditions: string;
  status: string;
}

export default function EditFlightPage() {
  const router = useRouter();
  const params = useParams();
  const flightId = params?.flightId as string | undefined;
  const isEditMode = !!flightId;

  const [formData, setFormData] = useState<FlightFormData>({
    departure_airport_code: "",
    departure_city: "",
    departure_country: "",
    departure_datetime: "",
    arrival_airport_code: "",
    arrival_city: "",
    arrival_country: "",
    arrival_datetime: "",
    aircraft_type: aircraftTypes[0].id,
    total_seats: "",
    available_seats: "",
    original_price: "",
    discounted_price: "",
    amenities: "",
    luggage_capacity: "",
    terms_and_conditions: "",
    status: "Available",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("Edit Flight");

  useEffect(() => {
    if (isEditMode && flightId) {
      setPageTitle(`Edit Flight ${flightId.substring(0,8)}...`);
      setIsLoading(true);
      getFlightById(flightId)
        .then(response => {
          const flightData = response.data.flight || response.data; // Adjust based on actual API response
          // Format dates for datetime-local input
          const formatDateTimeLocal = (isoString: string) => {
            if (!isoString) return "";
            try {
                return new Date(new Date(isoString).getTime() - (new Date(isoString).getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            } catch (e) {
                return ""; // Or handle invalid date string appropriately
            }
          };
          setFormData({
            ...flightData,
            departure_datetime: formatDateTimeLocal(flightData.departure_datetime),
            arrival_datetime: formatDateTimeLocal(flightData.arrival_datetime),
            // Ensure numeric fields are strings for input display if they might be null/undefined
            total_seats: flightData.total_seats?.toString() || "",
            available_seats: flightData.available_seats?.toString() || "",
            original_price: flightData.original_price?.toString() || "",
            discounted_price: flightData.discounted_price?.toString() || "",
          });
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch flight data:", err);
          setError("Failed to load flight data for editing.");
          setIsLoading(false);
        });
    } else {
        setPageTitle("This page is for editing existing flights.");
        setError("No Flight ID provided or invalid access.");
    }
  }, [flightId, isEditMode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    // Keep numeric inputs as strings for controlled input, parse on submit
    // if (type === "number") {
    //     processedValue = value === "" ? "" : parseFloat(value);
    // }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditMode || !flightId) {
        setError("Cannot save, no flight ID specified for editing.");
        return;
    }
    setIsLoading(true);
    setError(null);

    if (Number(formData.discounted_price) > Number(formData.original_price)) {
        setError("Discounted price cannot be greater than original price.");
        setIsLoading(false);
        return;
    }
    if (Number(formData.available_seats) > Number(formData.total_seats)) {
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
      const payload = {
        ...formData,
        total_seats: Number(formData.total_seats),
        available_seats: Number(formData.available_seats),
        original_price: Number(formData.original_price),
        discounted_price: Number(formData.discounted_price),
        departure_datetime: new Date(formData.departure_datetime).toISOString(),
        arrival_datetime: new Date(formData.arrival_datetime).toISOString(),
      };
      await updateFlight(flightId, payload);
      // alert("Flight updated successfully!"); // Replace with a proper notification system
      router.push("/flights");
    } catch (err: any) {
      console.error("Failed to update flight:", err);
      setError(err.response?.data?.message || "Failed to update flight. Please check your input and try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isEditMode && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-lg text-red-500 mb-4">{error || "This page is intended for editing existing flights. Please select a flight to edit from the list."}</p>
            <Link href="/flights">
                <Button variant="outline">Back to Flights</Button>
            </Link>
        </div>
    );
  }

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
          {pageTitle}
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Link href="/flights">
            <Button variant="outline" size="sm" type="button">
              Discard
            </Button>
          </Link>
          <Button size="sm" type="submit" disabled={isLoading || !isEditMode}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      {isLoading && !formData.id && <p>Loading flight data...</p>} 
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {(!isLoading || formData.id) && (
      <Card>
        <CardHeader>
          <CardTitle>Edit Flight Details</CardTitle>
          <CardDescription>
            Modify the flight information below.
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
                  <Label htmlFor="departure_airport_code">Departure Airport Code</Label>
                  <Input id="departure_airport_code" name="departure_airport_code" value={formData.departure_airport_code} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_city">Departure City</Label>
                  <Input id="departure_city" name="departure_city" value={formData.departure_city} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_country">Departure Country</Label>
                  <Input id="departure_country" name="departure_country" value={formData.departure_country} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_datetime">Departure Date & Time</Label>
                  <Input id="departure_datetime" name="departure_datetime" type="datetime-local" value={formData.departure_datetime} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="arrival_airport_code">Arrival Airport Code</Label>
                  <Input id="arrival_airport_code" name="arrival_airport_code" value={formData.arrival_airport_code} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arrival_city">Arrival City</Label>
                  <Input id="arrival_city" name="arrival_city" value={formData.arrival_city} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arrival_country">Arrival Country</Label>
                  <Input id="arrival_country" name="arrival_country" value={formData.arrival_country} onChange={handleChange} required />
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
                  <Input id="total_seats" name="total_seats" type="number" value={formData.total_seats} onChange={handleChange} required min="1"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="available_seats">Available Seats</Label>
                  <Input id="available_seats" name="available_seats" type="number" value={formData.available_seats} onChange={handleChange} required min="0"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="original_price">Original Price ($)</Label>
                  <Input id="original_price" name="original_price" type="number" value={formData.original_price} onChange={handleChange} required min="0"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discounted_price">Discounted Price ($)</Label>
                  <Input id="discounted_price" name="discounted_price" type="number" value={formData.discounted_price} onChange={handleChange} required min="0"/>
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
                  <Textarea id="amenities" name="amenities" value={formData.amenities} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="luggage_capacity">Luggage Capacity</Label>
                  <Input id="luggage_capacity" name="luggage_capacity" value={formData.luggage_capacity} onChange={handleChange} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="terms_and_conditions">Terms & Conditions</Label>
                  <Textarea id="terms_and_conditions" name="terms_and_conditions" value={formData.terms_and_conditions} onChange={handleChange} />
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
                <Button size="sm" className="w-full" type="submit" disabled={isLoading || !isEditMode}>{isLoading ? "Saving..." : "Save Changes"}</Button>
            </div>
        </CardFooter>
      </Card>
      )}
    </form>
  );
}

