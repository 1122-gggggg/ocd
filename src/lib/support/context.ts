import type { PostSupportMode } from "@prisma/client";

export interface SupportContext {
  postSupportMode?: PostSupportMode | string;
  boardSlug?: string;
  parentPostTitle?: string;
  parentPostSupportMode?: PostSupportMode | string;
  channel?: string;
  isAnonymous?: boolean;
  userPreferences?: {
    preferredSupportMode?: PostSupportMode | string;
    hideSensitiveTopics?: boolean;
    preferredTopics?: string[];
    allowPeerMatching?: boolean;
    showRecoveryPrompts?: boolean;
  };
  [key: string]: unknown;
}
