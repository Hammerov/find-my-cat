"use client";

import type { Cat } from "@/types";
import { buildWhatsappLink } from "@/lib/whatsapp";

type CatCardProps = {
  cat: Cat;
};

const DEFAULT_MESSAGE =
  "Hi, I think I may have seen your cat from the Find My Cat map.";

export default function CatCard({ cat }: CatCardProps) {
  const whatsappHref =
    cat.whatsapp && cat.whatsapp.length > 0
      ? buildWhatsappLink(cat.whatsapp, DEFAULT_MESSAGE)
      : null;

  return (
    <div className="w-56 space-y-2 text-sm">
      {cat.photo_url ? (
        <img
          src={cat.photo_url}
          alt={cat.name ? `${cat.name} photo` : "Cat photo"}
          className="h-36 w-full rounded-md object-cover"
        />
      ) : null}
      <p className="font-semibold">{cat.name || "Lost cat"}</p>
      <p className="text-gray-700">{cat.description || "No description provided."}</p>
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-white"
        >
          Contact on WhatsApp
        </a>
      ) : (
        <p className="text-xs text-gray-500">No WhatsApp number provided.</p>
      )}
    </div>
  );
}
