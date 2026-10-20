import { readOath } from '@/lib/read-oaths';
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[1-9]\d{0,20}$/.test(id)) return Response.json({ error: 'Invalid oath ID' }, { status: 400 });
  try { return Response.json(await readOath(BigInt(id)), { headers: { 'Cache-Control': 'public, max-age=5' } }); }
  catch (error) {
    const detail = error instanceof Error ? error.message : 'RPC request failed';
    return Response.json({ error: detail }, { status: detail === 'Oath not found' ? 404 : 503 });
  }
}
