export const CREDIT_PACKAGES = [
  { id: 'pack_50',   credits: 50,   price_rub: 79,   price_stars: 40  },
  { id: 'pack_200',  credits: 200,  price_rub: 249,  price_stars: 125 },
  { id: 'pack_1000', credits: 1000, price_rub: 999,  price_stars: 500 },
];

export const TIER_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_rub: 0,
    price_stars: 0,
    credits: 10,
    credits_label: '10 при регистрации',
    features: ['1 активный проект', '1 час превью', 'Базовый AI'],
    cta: 'Начать бесплатно',
    popular: false,
  },
  {
    id: 'start',
    name: 'Старт',
    price_rub: 299,
    price_stars: 150,
    credits: 100,
    credits_label: '100 кредитов / мес',
    features: ['3 активных проекта', '1 час превью', '1 постоянный деплой', 'Базовый AI'],
    cta: 'Выбрать Старт',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Про',
    price_rub: 799,
    price_stars: 400,
    credits: 400,
    credits_label: '400 кредитов / мес',
    features: ['Безлимитные проекты', '1 час превью', '3 постоянных деплоя', 'Приоритетный AI'],
    cta: 'Выбрать Про',
    popular: true,
  },
  {
    id: 'business',
    name: 'Бизнес',
    price_rub: 1999,
    price_stars: 1000,
    credits: 1500,
    credits_label: '1500 кредитов / мес',
    features: ['Безлимитные проекты', 'Безлимитные деплои', 'Приоритетный AI', 'Поддержка 24/7', 'API доступ'],
    cta: 'Выбрать Бизнес',
    popular: false,
  },
];

export const TIER_MONTHLY_CREDITS: Record<string, number> = {
  free: 0,
  start: 100,
  pro: 400,
  business: 1500,
};
