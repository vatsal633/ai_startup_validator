// Blank analyze form. Keys match the API payload exactly, so the form state
// can be posted as-is apart from funding_requirement, which is a string here.
export const initialForm = {
  title: "",
  industry: "SaaS",
  idea: "",
  problem: "",
  solution: "",
  target_customer: "",
  differentiator: "",
  country: "",
  business_model: "",
  stage: "",
  funding_requirement: "",
  competitors: "",
};

/** Fields the API will reject if empty (everything but competitors). */
export const REQUIRED_FIELDS = [
  "title",
  "industry",
  "idea",
  "problem",
  "solution",
  "target_customer",
  "differentiator",
  "country",
  "business_model",
  "stage",
  "funding_requirement",
];

export function isFormComplete(form) {
  return REQUIRED_FIELDS.every((field) => String(form[field] ?? "").trim() !== "");
}
