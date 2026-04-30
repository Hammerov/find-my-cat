"use client";

import { useCallback, useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import type { Cat } from "@/types";

export function useCats() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = useCallback(async () => {
    if (!hasSupabaseEnv) {
      setError(
        "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("cats")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setCats((data ?? []) as Cat[]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCats();
  }, [fetchCats]);

  return { cats, loading, error, refetch: fetchCats };
}
