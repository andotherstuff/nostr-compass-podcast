import { nip19 } from 'nostr-tools';

/**
 * Podcast configuration for PODSTR 2.0
 * 
 * Edit this file directly to configure your podcast.
 * All values are hardcoded - no environment variables needed!
 * 
 * TIP: Use Shakespeare.diy (https://shakespeare.diy) to easily configure
 * these settings with AI assistance. See README.md for the configuration prompt.
 */

export interface PodcastConfig {
  /** The npub of the podcast creator */
  creatorNpub: string;

  /** Podcast metadata */
  podcast: {
    title: string;
    description: string;
    author: string;
    email: string;
    image: string;
    language: string;
    categories: string[];
    explicit: boolean;
    website: string;
    copyright: string;
    funding: string[];
    locked: boolean;
    value: {
      amount: number;
      currency: string;
      recipients: Array<{
        name: string;
        type: 'node' | 'lnaddress';
        address: string;
        split: number;
        customKey?: string;
        customValue?: string;
        fee?: boolean;
      }>;
    };
    type: 'episodic' | 'serial';
    complete: boolean;
    // Podcasting 2.0 fields
    guid: string;
    medium: 'podcast' | 'music' | 'video' | 'film' | 'audiobook' | 'newsletter' | 'blog';
    publisher: string;
    location?: {
      name: string;
      geo?: string;
      osm?: string;
    };
    person: Array<{
      name: string;
      role: string;
      group?: string;
      img?: string;
      href?: string;
    }>;
    license: {
      identifier: string;
      url?: string;
    };
    txt?: Array<{
      purpose: string;
      content: string;
    }>;
    remoteItem?: Array<{
      feedGuid: string;
      feedUrl?: string;
      itemGuid?: string;
      medium?: string;
    }>;
    block?: {
      id: string;
      reason?: string;
    };
    newFeedUrl?: string;
    useOP3: boolean;
  };

  /** RSS feed configuration */
  rss: {
    ttl: number;
  };
}

// =============================================================================
// PODCAST CONFIGURATION
// =============================================================================
// Edit the values below to configure your podcast.
// Use Shakespeare.diy for AI-assisted configuration - see README.md
// =============================================================================

export const PODCAST_CONFIG: PodcastConfig = {
  // ===========================================================================
  // CREATOR IDENTITY
  // ===========================================================================
  creatorNpub: "npub1wav4fae3gyfy3xj298kxj2mj8phavz7vavps34przq02j7w902qq902923",

  podcast: {
    // =========================================================================
    // BASIC PODCAST INFO
    // =========================================================================
    title: "Nostr Compass Podcast",
    description: "Weekly conversations with the developers building on Nostr. Companion podcast to the Nostr Compass newsletter covering NIP proposals, client updates, relay developments, and protocol changes.",
    author: "Nostr Compass",
    email: "nostrcompass@nostrcompass.org",
    image: "https://nostrcompass.org/assets/images/profile.png",
    language: "en-us",
    categories: ["Technology", "Software How-To", "Society & Culture"],
    explicit: false,
    website: "https://podcast.nostrcompass.org",
    copyright: "2025-2026 Nostr Compass. CC BY 4.0",

    // =========================================================================
    // PODCASTING 2.0 SETTINGS
    // =========================================================================
    guid: "npub1wav4fae3gyfy3xj298kxj2mj8phavz7vavps34przq02j7w902qq902923",
    medium: "podcast",
    publisher: "Nostr Compass",
    type: "episodic",
    complete: false,
    locked: false,

    // =========================================================================
    // LICENSE
    // =========================================================================
    license: {
      identifier: "CC BY 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/",
    },

    // =========================================================================
    // LIGHTNING VALUE-FOR-VALUE
    // =========================================================================
    value: {
      amount: 1000,
      currency: "sats",
      recipients: [
        {
          name: "Nostr Compass",
          type: "lnaddress",
          address: "nostrcompass@npub.cash",
          split: 100,
          fee: false,
        },
      ],
    },

    // =========================================================================
    // FUNDING LINKS
    // =========================================================================
    funding: ["/about"],

    // =========================================================================
    // PODCAST PEOPLE
    // =========================================================================
    person: [
      {
        name: "Nostr Compass",
        role: "host",
        group: "cast",
      },
    ],

    // =========================================================================
    // ANALYTICS
    // =========================================================================
    useOP3: false,
  },

  // ===========================================================================
  // RSS FEED SETTINGS
  // ===========================================================================
  rss: {
    ttl: 60,
  },
};

/**
 * Nostr event kinds used by PODSTR
 */
export const PODCAST_KINDS = {
  /** Addressable Podcast episodes (editable, replaceable) */
  EPISODE: 30054,
  /** Addressable Podcast trailers (editable, replaceable) */
  TRAILER: 30055,
  /** NIP-22: Comments on podcast episodes */
  COMMENT: 1111,
  /** Standard text notes that may reference episodes */
  NOTE: 1,
  /** Profile metadata */
  PROFILE: 0,
  /** Podcast metadata - using addressable event for podcast-specific config */
  PODCAST_METADATA: 30078
} as const;

/**
 * Get the creator's pubkey in hex format (for Nostr queries)
 */
export function getCreatorPubkeyHex(): string {
  try {
    const decoded = nip19.decode(PODCAST_CONFIG.creatorNpub);
    if (decoded.type === 'npub') {
      return decoded.data;
    }
    throw new Error('Invalid npub format');
  } catch (error) {
    console.error('Failed to decode creator npub:', error);
    // Fallback to the original value in case it's already hex
    return PODCAST_CONFIG.creatorNpub;
  }
}

/**
 * Check if a pubkey is the podcast creator
 */
export function isPodcastCreator(pubkey: string): boolean {
  const creatorHex = getCreatorPubkeyHex();
  return pubkey === creatorHex;
}
