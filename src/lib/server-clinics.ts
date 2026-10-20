import path from 'node:path';
import { openClinicDatabase } from './clinic-database';

let connection: ReturnType<typeof openClinicDatabase> | undefined;
export function clinicDatabase() {
  connection ??= openClinicDatabase(path.join(process.cwd(), 'data', 'generated', 'clinics.sqlite'));
  return connection;
}
