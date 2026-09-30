import { verifyEvent, type Event } from 'nostr-tools';

/** Preserve signed historical episode revisions through temporary relay outages. */
export function mergeEpisodeEvents(candidates: Event[], creator: string): Event[] {
  const revisions = new Map<string, Event>();
  for (const event of candidates) {
    if (event.kind !== 30054 || event.pubkey !== creator || !verifyEvent(event)) {
      throw new Error(`Invalid episode archive event ${event.id}`);
    }
    const identifier = event.tags.find(t => t[0] === 'd')?.[1];
    const audio = event.tags.find(t => t[0] === 'audio')?.[1]?.trim();
    if (!identifier || !audio || !event.tags.find(t => t[0] === 'title')?.[1]) {
      throw new Error(`Incomplete episode ${event.id}`);
    }
    if (new URL(audio).protocol !== 'https:') throw new Error('Episode audio must use HTTPS');
    const prior = revisions.get(identifier);
    // NIP-01: lowest event ID wins an equal-timestamp replaceable-event tie.
    if (!prior || event.created_at > prior.created_at ||
        (event.created_at === prior.created_at && event.id < prior.id)) revisions.set(identifier, event);
  }
  return [...revisions.values()];
}

export async function audioByteLength(url: string, declaredSize?: string): Promise<number> {
  const declared = Number(declaredSize);
  if (new URL(url.trim()).protocol !== 'https:') throw new Error('Media must use HTTPS');
  const response = await fetch(url.trim(), { method: 'HEAD', headers: {'User-Agent':'Nostr Compass RSS verification'}, signal: AbortSignal.timeout(20000) });
  const size = Number(response.headers.get('content-length'));
  if (!response.ok || !Number.isSafeInteger(size) || size <= 0) {
    throw new Error(`Cannot verify nonzero audio enclosure length: ${url}`);
  }
  if (Number.isSafeInteger(declared) && declared > 0 && size !== declared) {
    throw new Error(`Hosted enclosure size differs from verified audio: ${url}`);
  }
  return size;
}
