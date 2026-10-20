import { oathForToken } from '@/lib/read-oaths';
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  try { return Response.json(await oathForToken(token), { headers: { 'Cache-Control': 'public, max-age=5', 'Access-Control-Allow-Origin': '*' } }); }
  catch (error) {
    const detail = error instanceof Error ? error.message : 'RPC request failed';
    const status = detail === 'Invalid token address' ? 400 : detail === 'Oath not found' ? 404 : 503;
    return Response.json({ error: detail, source: 'mock-hook', chainId: 99801 }, { status });
  }
}
