import { clinicDatabase } from '@/lib/server-clinics';
import { DatasetChanged, InvalidSearch } from '@/lib/clinic-database';
import { searchResponse } from '@/lib/search-response';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const data = clinicDatabase().search(new URL(request.url).searchParams);
    return searchResponse(data, request);
  } catch (error) {
    if (error instanceof InvalidSearch) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof DatasetChanged) return Response.json({ error: 'Dataset changed; retry search' }, { status: 409 });
    return Response.json({ error: 'Search data unavailable' }, { status: 503 });
  }
}
