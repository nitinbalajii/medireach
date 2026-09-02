const { z } = require("zod");

const dispatchSchema = z.object({
  severity_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  patient_condition: z.string().min(3),
  user_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  requires_life_support: z.boolean(),
});

const hospitalQuerySchema = z.object({
  required_facility_type: z.enum(["ICU", "Trauma", "Maternity", "Burn_Unit", "Cardiac"]),
  search_radius_km: z.number().min(1).max(100).default(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const firstAidSchema = z.object({
  emergency_type: z.string().min(2),
  patient_age_group: z.enum(["INFANT", "CHILD", "ADULT"]),
});

module.exports = { dispatchSchema, hospitalQuerySchema, firstAidSchema };
