export const PRICING_CONFIG = {
  baseRateUltra6d: 0.031,

  infillMultipliers: {
    ultra: 1.0,
    light: 1.09,
    solid: 1.25
  },

  leadTimeMultipliers: {
    standard: 1.0,
    express: 1.6
  },

  discountPercent: 10,
  minOrder: 60,
  currency: 'EUR'
};

export function calculatePrice({ volume_cm3, infill, leadTime }) {
  const {
    baseRateUltra6d,
    infillMultipliers,
    leadTimeMultipliers,
    discountPercent,
    minOrder,
    currency
  } = PRICING_CONFIG;

  const infillKey = infill || 'ultra';
  const leadKey = leadTime || 'standard';

  const infillMult = infillMultipliers[infillKey];
  const leadMult = leadTimeMultipliers[leadKey];

  const refPrice =
    volume_cm3 *
    baseRateUltra6d *
    infillMult *
    leadMult;

  const referencePrice = +refPrice.toFixed(2);

  let esPrice = referencePrice * 0.9;
  if (esPrice < minOrder) esPrice = minOrder;

  return {
    currency,
    referencePrice,
    esageniusPrice: +esPrice.toFixed(2),
    discountPercent
  };
}