import { listOaths } from '@/lib/read-oaths';
export async function GET() {
  try { return Response.json({ ...await listOaths(), source: 'mock-hook', chainId: 99801 }, { headers: { 'Cache-Control': 'public, max-age=5' } }); }
  catch (error) { return Response.json({ error: 'Chain data unavailable', detail: error instanceof Error ? error.message : 'RPC request failed' }, { status: 503 }); }
}
