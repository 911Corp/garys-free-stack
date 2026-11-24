/** Gary (degen vibe coder) and Jarvis (his more reasonable AI). Flavor only: never carries data. */
export type Speaker = 'gary' | 'jarvis';
export interface Line { who: Speaker; text: string }

const L = (who: Speaker, text: string): Line => ({ who, text });

export const VOICE = {
  loading: [L('jarvis', 'counting free tiers. carefully.'), L('gary', 'loading the stack. GM.'), L('jarvis', 'reading pricing pages so you do not have to.')],
  emptySearch: [L('jarvis', 'nothing matches. either it does not exist, or it is not free.'), L('gary', 'zero results. bullish on building it yourself?')],
  emptyFavorites: [L('gary', 'no favorites yet. commitment issues, same.'), L('jarvis', 'tap the star on any resource to keep it here.')],
  emptyStack: [L('gary', 'empty stack. infinite potential. zero dollars.'), L('jarvis', 'start with hosting. everything else hangs off it.')],
  costZero: [L('jarvis', 'your budget is safe. for now.'), L('gary', 'infrastructure: $0. emotional damage: unpriced.')],
  costNear: [L('jarvis', 'you are close to a quota. free tier. expensive ambitions.'), L('gary', 'technically free. financially suspicious.')],
  costOver: [L('jarvis', 'a quota breaks at this usage. see the line items below.'), L('gary', 'we are so back... to paying.')],
  costUnknown: [L('jarvis', 'some numbers are unknown, so the total is a floor, not a promise.')],
  overlap: [L('jarvis', 'gary wants another database. jarvis disagrees.')],
  alternative: [L('jarvis', 'jarvis found alternatives. some are even cheaper than free. somehow.'), L('jarvis', 'jarvis found a cheaper alternative.')],
  notFound: [L('gary', '404. this page did not make it.'), L('jarvis', 'the page you want is not here. the catalog is.')],
  random: [L('gary', 'spinning the wheel of free stuff.'), L('jarvis', 'random, but still verified.')],
  error: [L('jarvis', 'something broke. your data is fine, it lives in your browser.')],
} satisfies Record<string, Line[]>;

export function pick(key: keyof typeof VOICE, seed = 0): Line {
  const arr = VOICE[key];
  return arr[Math.abs(seed) % arr.length];
}
