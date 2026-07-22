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

export const planosMock: Plano[] = [
  {
    id: 1,
    name: 'Essencial',
    slug: 'essencial',
    description: 'Ideal para iniciantes ou pequenos negócios.',
    price: 79,
    billingCycle: '/mês',
    features: ['1 conta administrativa', 'Agenda básica', 'Relatórios simples', 'Suporte por e-mail'],
    status: 'Ativo',
    accent: 'from-slate-700 to-slate-900',
  },
  {
    id: 2,
    name: 'Pro',
    slug: 'pro',
    description: 'Mais recursos para expansão e acompanhamento completo.',
    price: 149,
    billingCycle: '/mês',
    features: ['Tudo do Essencial', 'Múltiplos perfis', 'Dashboard avançado', 'Integrations e automações'],
    status: 'Ativo',
    accent: 'from-blue-600 to-cyan-500',
    highlight: true,
  },
  {
    id: 3,
    name: 'Premium',
    slug: 'premium',
    description: 'Planejamento completo para operações maiores.',
    price: 299,
    billingCycle: '/mês',
    features: ['Tudo do Pro', 'Suporte dedicado', 'Relatórios personalizados', 'Prioridade em novas funcionalidades'],
    status: 'Em breve',
    accent: 'from-violet-600 to-fuchsia-500',
  },
];
