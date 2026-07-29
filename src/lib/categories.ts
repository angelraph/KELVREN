import type { DeadlineCategory } from "@/generated/prisma/enums";

export const CATEGORY_LABEL: Record<DeadlineCategory, string> = {
  SUBSCRIPTION: "Subscriptions",
  UTILITY: "Utility bills",
  PHONE_INTERNET: "Phone & internet",
  RENT_MORTGAGE: "Rent & mortgage",
  MEMBERSHIP: "Memberships",
  DOMAIN: "Domain renewals",
  PASSPORT: "Passport renewal",
  VEHICLE_REGISTRATION: "Vehicle registration",
  INSURANCE: "Insurance premiums",
  PROFESSIONAL_LICENSE: "Professional licenses",
  PERMIT: "Permits",
  OTHER: "Other",
};

export const CATEGORY_DEFAULT_LIMIT: Record<DeadlineCategory, number> = {
  SUBSCRIPTION: 20,
  UTILITY: 150,
  PHONE_INTERNET: 80,
  RENT_MORTGAGE: 2000,
  MEMBERSHIP: 60,
  DOMAIN: 20,
  PASSPORT: 250,
  VEHICLE_REGISTRATION: 200,
  INSURANCE: 300,
  PROFESSIONAL_LICENSE: 150,
  PERMIT: 100,
  OTHER: 50,
};

export const CATEGORY_ORDER: DeadlineCategory[] = [
  "SUBSCRIPTION",
  "UTILITY",
  "PHONE_INTERNET",
  "RENT_MORTGAGE",
  "MEMBERSHIP",
  "DOMAIN",
  "PASSPORT",
  "VEHICLE_REGISTRATION",
  "INSURANCE",
  "PROFESSIONAL_LICENSE",
  "PERMIT",
  "OTHER",
];
