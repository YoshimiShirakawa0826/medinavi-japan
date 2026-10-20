import { nabiiClinicUrl } from '@/lib/clinic-contact';
import { clinicDatabase } from '@/lib/server-clinics';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!nabiiClinicUrl(id)) return Response.json({ error: 'Not found' }, { status: 404 });
  try {
    const record = clinicDatabase().detail(id);
    if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(record, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' } });
  } catch {
    return Response.json({ error: 'Facility data unavailable' }, { status: 503 });
  }
}
