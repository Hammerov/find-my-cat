"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ReportModalProps = {
  isOpen: boolean;
  canSubmit: boolean;
  selectedLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string;
    whatsapp: string;
    photo: File | null;
  }) => Promise<void>;
};

export default function ReportModal({
  isOpen,
  canSubmit,
  selectedLocation,
  onClose,
  onSubmit
}: ReportModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart npm run dev."
      );
      return;
    }
    if (!selectedLocation) {
      setError("Click on the map first to set the cat's last seen location.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name, description, whatsapp, photo });
      setName("");
      setDescription("");
      setWhatsapp("");
      setPhoto(null);
      onClose();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to submit report.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 p-4">
      <div className="pointer-events-auto mx-auto mt-8 w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report a Lost Cat</h2>
          <button type="button" onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <input
            className="w-full rounded-md border p-2"
            placeholder="Cat name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <textarea
            className="w-full rounded-md border p-2"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
          <input
            className="w-full rounded-md border p-2"
            placeholder="Owner WhatsApp (+971...)"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            required
          />
          <input
            className="w-full rounded-md border p-2"
            type="file"
            accept="image/*"
            onChange={(event) => setPhoto(event.target.files?.[0] || null)}
            required
          />
          <p className="text-xs text-gray-600">
            {selectedLocation
              ? `Selected coordinates: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`
              : "Leave this modal open and click on the map to select coordinates."}
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={loading || !canSubmit}
          >
            {loading ? "Submitting..." : canSubmit ? "Submit Report" : "Configure Supabase To Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
