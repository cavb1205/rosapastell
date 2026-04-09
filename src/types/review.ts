export interface WooReview {
  id: number;
  date_created: string;
  review: string;
  rating: number;
  reviewer: string;
  reviewer_email: string;
  verified: boolean;
  reviewer_avatar_urls?: Record<string, string>;
  status: "approved" | "hold" | "spam" | "unspam" | "trash" | "untrash";
}
