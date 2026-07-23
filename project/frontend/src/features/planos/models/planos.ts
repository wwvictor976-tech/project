export type PlanoStatus = 'Ativo' | 'Em breve' | 'Descontinuado';

export interface Plano {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  highlight?: boolean;
  status: PlanoStatus;
  accent: string;
}

