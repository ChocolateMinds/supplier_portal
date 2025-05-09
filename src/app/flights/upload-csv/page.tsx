"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/apiService";

export default function UploadCsvPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null); // Clear previous errors when a new file is selected
      setSuccessMessage(null); // Clear previous success messages
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file); // Ensure backend expects "file" as the key

    try {
      const response = await api.flights.uploadFlightsCSV(formData);
      console.log("CSV Upload successful:", response);
      setSuccessMessage(response.message || "CSV file uploaded and processed successfully!");
      setFile(null); // Clear the file input
      // Optionally, redirect or provide a link to view imported flights
    } catch (err: any) {
      console.error("CSV Upload failed:", err);
      setError(err.message || "An error occurred during CSV upload. Please ensure the file is valid and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link href="/flights" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Flights
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center mt-2">Upload Flights CSV</CardTitle>
          <CardDescription className="text-center">
            Select a CSV file containing your flight data to upload it to the system.
            Ensure the CSV format matches the required template.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Upload Successful</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="csvFile" className="text-base">CSV File</Label>
              <Input 
                id="csvFile" 
                type="file" 
                accept=".csv"
                onChange={handleFileChange} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isLoading}
              />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>
            <div className="text-xs text-muted-foreground">
                <p><strong>Required CSV Columns:</strong> flight_number, departure_airport, arrival_airport, departure_datetime (YYYY-MM-DD HH:MM:SS), arrival_datetime (YYYY-MM-DD HH:MM:SS), aircraft_type, seats_available, original_price, reduced_price, status.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

