export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 3,
  team: 10
};

export const PRICE_TO_PLAN: Record<string, "pro" | "team"> = {
  [process.env.STRIPE_PRICE_PRO || "price_pro_placeholder"]: "pro",
  [process.env.STRIPE_PRICE_TEAM || "price_team_placeholder"]: "team"
};
