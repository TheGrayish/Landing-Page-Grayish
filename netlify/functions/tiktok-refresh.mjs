import { tiktokStore, refreshFeedCache } from './_shared/tiktok.mjs';

export default async () => {
  try {
    await refreshFeedCache(tiktokStore());
  } catch (err) {
    console.error('Scheduled TikTok refresh failed:', err.message);
  }
};

export const config = { schedule: '0 */6 * * *' };
