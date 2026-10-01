import { z } from "zod";

export const propertyFormSchema = z.object({
  property_name: z.string().min(1, "Property name is required").default("Sample Property"),
  square_footage: z.coerce.number().positive("Square footage must be > 0"),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms cannot be negative"),
  bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative"),
  year_built: z.coerce.number().int().min(1801, "Year must be > 1800").max(2026, "Year cannot be in the future"),
  lot_size: z.coerce.number().positive("Lot size must be > 0"),
  distance_to_city_center: z.coerce.number().min(0, "Distance cannot be negative"),
  school_rating: z.coerce.number().min(0, "Min rating is 0").max(10, "Max rating is 10"),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

export interface PropertyRecord extends PropertyFormData {
  id: number;
  predicted_price: number;
  currency: string;
  created_at: string;
}

export interface HistoryResponse {
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: PropertyRecord[];
}
