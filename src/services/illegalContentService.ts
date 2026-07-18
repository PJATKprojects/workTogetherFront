import api from "./api";

export type IllegalContentCategory =
  | "child_safety"
  | "threats"
  | "hate"
  | "fraud"
  | "privacy"
  | "intellectual_property"
  | "other";

export type IllegalContentNoticeInput = {
  reporterName?: string;
  reporterEmail?: string;
  contentUrl: string;
  category: IllegalContentCategory;
  legalReason: string;
  goodFaithConfirmed: boolean;
  locale: "en" | "pl" | "uk";
};

export type IllegalContentNoticeReceipt = {
  reference: string;
  status: string;
  receivedAt: string;
};

export const illegalContentService = {
  create: async (input: IllegalContentNoticeInput) =>
    (await api.post<IllegalContentNoticeReceipt>("/api/legal/illegal-content-notices", input)).data,
};
