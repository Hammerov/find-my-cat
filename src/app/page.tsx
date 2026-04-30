"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ReportModal from "@/components/Modals/ReportModal";
import { useCats } from "@/hooks/useCats";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import { sanitizeWhatsappNumber } from "@/lib/whatsapp";

const MapComponent = dynamic(() => import("@/components/Map/MapComponent"), { ssr: false });

export default function HomePage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 51.5072, lng: -0.1276 });
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const { cats, refetch, error } = useCats();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        // Keep fallback center when geolocation is denied.
      }
    );
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;

    setSearchError(null);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );
    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) {
      setSearchError("Place not found. Try a more specific name.");
      return;
    }
    setMapCenter({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
  };

  const handleSubmit = async (payload: {
    name: string;
    description: string;
    whatsapp: string;
    photo: File | null;
  }) => {
    if (!hasSupabaseEnv) {
      throw new Error(
        "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
      );
    }

    if (!selectedLocation) {
      throw new Error("No map location selected.");
    }
    if (!payload.photo) {
      throw new Error("Please upload a photo.");
    }

    const ext = payload.photo.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `reports/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("cat-images")
      .upload(path, payload.photo, { upsert: false });
    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("cat-images").getPublicUrl(path);

    const { error: insertError } = await supabase.from("cats").insert({
      name: payload.name || null,
      description: payload.description,
      photo_url: publicUrl,
      whatsapp: sanitizeWhatsappNumber(payload.whatsapp),
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    setSelectedLocation(null);
    await refetch();
  };

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Navbar onReportClick={() => setModalOpen(true)} />
      <div className="pointer-events-none fixed left-4 top-28 z-10 w-[22rem] max-w-[calc(100vw-2rem)] space-y-2">
        <form onSubmit={handleSearch} className="pointer-events-auto rounded-lg bg-white/95 p-2 shadow">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search place (city, street, landmark)"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white">
              Search
            </button>
          </div>
        </form>
        {searchError ? (
          <p className="pointer-events-auto rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 shadow">{searchError}</p>
        ) : null}
        {error ? (
          <p className="pointer-events-auto rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 shadow">{error}</p>
        ) : null}
      </div>
      <MapComponent
        cats={cats}
        center={mapCenter}
        selectedLocation={selectedLocation}
        onMapClick={setSelectedLocation}
      />
      <ReportModal
        isOpen={isModalOpen}
        canSubmit={hasSupabaseEnv}
        selectedLocation={selectedLocation}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
