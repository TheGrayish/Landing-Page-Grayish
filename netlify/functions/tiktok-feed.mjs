import { tiktokStore, refreshFeedCache } from './_shared/tiktok.mjs';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export default async () => {
  const store = tiktokStore();
  let cached = await store.get('feed_cache', { type: 'json' });
  const stale = !cached || Date.now() - cached.updated_at > CACHE_TTL_MS;

  if (stale) {
    try {
      cached = await refreshFeedCache(store);
    } catch (err) {
      if (!cached) {
        return new Response(JSON.stringify({ videos: [], error: err.message }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return new Response(JSON.stringify(cached), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
};
