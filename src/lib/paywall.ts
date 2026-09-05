/**
 * Planes de Pro que enseña el paywall.
 *
 * Los precios viven como **número**, no como cadena ya formateada, para que
 * el ahorro del plan anual se calcule a partir de ellos. Si mañana sube el
 * mensual, el «Save 42%» se mueve solo en vez de quedarse mintiendo — que es
 * justo el error que un paywall no se puede permitir.
 *
 * Son valores de la maqueta, no de una tienda: cuando entre RevenueCat
 * (KAN-9) los precios los dará el SDK ya localizados por país, y este archivo
 * pasa a ser el que traduce ese producto a este tipo.
 */

export type PlanId = 'monthly' | 'annual';

export type Plan = {
  id: PlanId;
  name: string;
  /** Lo que se cobra de una vez, en USD. */
  price: number;
  /** Meses que cubre ese cobro. */
  months: number;
};

/** El primero es la referencia contra la que se mide el ahorro del resto. */
export const PLANS: readonly Plan[] = [
  { id: 'monthly', name: 'Monthly', price: 9.99, months: 1 },
  { id: 'annual', name: 'Annual', price: 69.99, months: 12 },
] as const;

/** El plan que viene marcado al abrir: el que la maqueta trae seleccionado. */
export const DEFAULT_PLAN_ID: PlanId = 'annual';

/** Coste mensual real del plan: el anual sale a menos de lo que cobra al mes. */
export function pricePerMonth(plan: Plan): number {
  return plan.price / plan.months;
}

/**
 * Cuánto ahorra este plan frente al de referencia, en porcentaje entero.
 * Devuelve 0 para el propio plan de referencia y para cualquiera que no
 * ahorre nada, porque un «Save 0%» no se pinta.
 */
export function savingsPercent(plan: Plan, baseline: Plan): number {
  const saved = 1 - pricePerMonth(plan) / pricePerMonth(baseline);
  return Math.max(0, Math.round(saved * 100));
}
