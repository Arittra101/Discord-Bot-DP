import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '.env') });

const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [join(__dirname, `**/*.entity${ext}`)],
  migrations: [join(__dirname, `migrations/*${ext}`)],
});
