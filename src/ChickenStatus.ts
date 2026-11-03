export const CHICKEN_STATUSES = [
    'active',
    'broody',
    'molting',
    'sick',
    'rehomed',
    'deceased',
  ] as const;
  
  export type ChickenStatus = (typeof CHICKEN_STATUSES)[number];