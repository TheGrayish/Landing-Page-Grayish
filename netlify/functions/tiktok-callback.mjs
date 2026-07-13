import { tiktokStore, exchangeCodeForTokens, saveTokens, refreshFeedCache } from './_shared/tiktok.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || state !== process.env.OAUTH_STATE_SECRET) {
    return new Response('Solicitud invalida.', { status: 400 });
  }

  try {
    const redirectUri = `${url.origin}/.netlify/functions/tiktok-callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const store = tiktokStore();
    await saveTokens(store, tokens);
    await refreshFeedCache(store);
    return new Response('TikTok conectado correctamente. Ya puedes cerrar esta pestana.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return new Response('Error al conectar: ' + err.message, { status: 500 });
  }
};
