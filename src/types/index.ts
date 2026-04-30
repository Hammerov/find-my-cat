export type CatStatus = "lost";

export interface Cat {
  id: string;
  name: string | null;
  description: string | null;
  photo_url: string | null;
  whatsapp: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface NewCatReport {
  name: string;
  description: string;
  whatsapp: string;
  photo: File | null;
  lat: number | null;
  lng: number | null;
  status: CatStatus;
}
export type CatStatus = "lost" | "found" | "seen";

export interface Cat {
  id: string;
  name: string | null;
  description: string;
  imageUrl: string | null;
  status: CatStatus;
  latitude: number;
  longitude: number;
  lastSeenAt: string;
  createdAt: string;
}
