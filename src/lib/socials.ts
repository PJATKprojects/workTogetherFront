import type { SocialLink } from "@/types";

/**
 * Social networks users can attach to their profile (v1.3). `urlTemplate`
 * builds the outbound link from a handle; `null` means the network has no
 * public handle URL (Discord) — the profile page offers copy-to-clipboard.
 * Ids must match the backend whitelist (Common/SocialLinks.cs).
 */
export const SOCIAL_NETWORKS: readonly {
  id: string;
  label: string;
  urlTemplate: string | null;
}[] = [
  { id: "telegram", label: "Telegram", urlTemplate: "https://t.me/{handle}" },
  { id: "discord", label: "Discord", urlTemplate: null },
  { id: "instagram", label: "Instagram", urlTemplate: "https://instagram.com/{handle}" },
  { id: "x", label: "X (Twitter)", urlTemplate: "https://x.com/{handle}" },
  { id: "tiktok", label: "TikTok", urlTemplate: "https://tiktok.com/@{handle}" },
  { id: "youtube", label: "YouTube", urlTemplate: "https://youtube.com/@{handle}" },
  { id: "behance", label: "Behance", urlTemplate: "https://behance.net/{handle}" },
  { id: "dribbble", label: "Dribbble", urlTemplate: "https://dribbble.com/{handle}" },
];

export function socialLabel(type: string): string {
  return SOCIAL_NETWORKS.find((n) => n.id === type)?.label ?? type;
}

/** Outbound URL for a handle, or null when the network is copy-only. */
export function socialUrl(link: SocialLink): string | null {
  const template = SOCIAL_NETWORKS.find((n) => n.id === link.type)?.urlTemplate;
  return template ? template.replace("{handle}", encodeURIComponent(link.handle)) : null;
}
