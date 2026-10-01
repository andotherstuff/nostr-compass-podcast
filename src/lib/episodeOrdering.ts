/** Positive integer metadata only; reject partial, fractional and unsafe values. */
export function positiveEpisodeInteger(value: unknown): number | undefined {
  if (typeof value === 'string') {
    if (!/^\d+$/.test(value.trim())) return undefined;
    value = Number(value.trim());
  }
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value : undefined;
}

/** Legacy Compass releases have numbered titles but no episode tag. */
export function resolveEpisodeNumber(title: string, explicit?: unknown): number | undefined {
  const tagged = positiveEpisodeInteger(explicit);
  if (tagged !== undefined) return tagged;
  const legacy = title.match(/^(?:Nostr Compass(?: Podcast)?\s*#\s*|Logbook Episode\s+)(\d+)\b(?!\.\d)/i);
  return positiveEpisodeInteger(legacy?.[1]);
}

interface OrderedEpisode {
  title: string;
  episodeNumber?: number;
  seasonNumber?: number;
  publishDate: Date;
  identifier: string;
}

/** Descending season/episode order, independent of backfill or edit timestamps. */
export function compareEpisodeOrder(a: OrderedEpisode, b: OrderedEpisode): number {
  const aNumber = resolveEpisodeNumber(a.title, a.episodeNumber);
  const bNumber = resolveEpisodeNumber(b.title, b.episodeNumber);
  if (aNumber !== undefined && bNumber !== undefined) {
    const season = (positiveEpisodeInteger(b.seasonNumber) ?? 1)
      - (positiveEpisodeInteger(a.seasonNumber) ?? 1);
    if (season) return season;
    if (aNumber !== bNumber) return bNumber - aNumber;
  } else if (aNumber !== undefined || bNumber !== undefined) {
    return aNumber !== undefined ? -1 : 1;
  }
  const timestamp = (episode: OrderedEpisode) => {
    const value = episode.publishDate.getTime();
    return Number.isFinite(value) ? value : 0;
  };
  return timestamp(b) - timestamp(a)
    || (a.identifier < b.identifier ? -1 : a.identifier > b.identifier ? 1 : 0);
}
