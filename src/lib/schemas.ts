import { z } from "zod";

// Helper for numeric inputs that converts empty string to NaN/undefined for clean error messages
const numericField = (label: string, min = 0, max?: number) => {
  let rule = z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: `${label} is required and must be a number` })
  );

  if (min > 0) {
    rule = rule.refine((v) => v >= min, { message: `${label} must be at least ${min}` });
  } else {
    rule = rule.refine((v) => v >= 0, { message: `${label} cannot be negative` });
  }

  if (max !== undefined) {
    rule = rule.refine((v) => v <= max, { message: `${label} cannot exceed ${max}` });
  }

  return rule;
};

export const propertyFormSchema = z.object({
  property_name: z.string().trim().min(1, "Property name is required"),
  square_footage: numericField("Square footage", 1),
  bedrooms: numericField("Bedrooms", 0).refine((v) => Number.isInteger(v), { message: "Bedrooms must be an integer" }),
  bathrooms: numericField("Bathrooms", 0),
  year_built: numericField("Year built", 1801, 2026).refine((v) => Number.isInteger(v), { message: "Year must be an integer" }),
  lot_size: numericField("Lot size", 1),
  distance_to_city_center: numericField("Distance to city center", 0),
  school_rating: numericField("School rating", 0, 10),
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