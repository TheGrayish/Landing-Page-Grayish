import { getStore } from '@netlify/blobs';

const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const VIDEO_LIST_URL =
  'https://open.tiktokapis.com/v2/video/list/?fields=id,cover_image_url,share_url,create_time,title,video_description';
const MAX_VIDEOS = 6;

export function tiktokStore() {
  return getStore('tiktok');
}

export async function exchangeCodeForTokens(code, redirectUri) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error('Token exchange failed: ' + JSON.stringify(data));
  return data;
}

async function refreshTokens(refreshToken) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error('Token refresh failed: ' + JSON.stringify(data));
  return data;
}

export async function saveTokens(store, tokens) {
  const now = Date.now();
  await store.setJSON('tokens', {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    access_token_expires_at: now + tokens.expires_in * 1000,
    refresh_token_expires_at: now + tokens.refresh_expires_in * 1000,
  });
}

async function getValidAccessToken(store) {
  const stored = await store.get('tokens', { type: 'json' });
  if (!stored) throw new Error('Not authorized yet, visit the one-time authorize link first.');

  const now = Date.now();
  if (!stored.access_token || now >= stored.access_token_expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshTokens(stored.refresh_token);
    await saveTokens(store, refreshed);
    return refreshed.access_token;
  }
  return stored.access_token;
}

export async function fetchLatestVideos(store) {
  const accessToken = await getValidAccessToken(store);
  const res = await fetch(VIDEO_LIST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_count: MAX_VIDEOS }),
  });
  const data = await res.json();
  if (!res.ok || (data.error && data.error.code !== 'ok')) {
    throw new Error('video.list failed: ' + JSON.stringify(data));
  }
  const videos = (data.data && data.data.videos) || [];
  return videos
    .sort((a, b) => b.create_time - a.create_time)
    .slice(0, MAX_VIDEOS)
    .map((v) => ({
      id: v.id,
      url: v.share_url,
      title: v.title || v.video_description || '',
      cover: v.cover_image_url,
      created_at: v.create_time,
    }));
}

export async function refreshFeedCache(store) {
  const videos = await fetchLatestVideos(store);
  const payload = { videos, updated_at: Date.now() };
  await store.setJSON('feed_cache', payload);
  return payload;
}
