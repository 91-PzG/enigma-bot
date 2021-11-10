import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Connection } from 'typeorm';

export async function loadFixtures(name: string, dbConnection: Connection): Promise<any> {
  let items: any[] = [];
  try {
    const file: any = yaml.load(fs.readFileSync(`./test/fixtures/${name}.yml`, 'utf8'));
    items = file['fixtures'];
  } catch (e) {
    console.log('fixtures error', e);
  }

  if (!items) {
    return;
  }

  for (const item of items) {
    const entityName = Object.keys(item)[0];
    const data = item[entityName];
    await dbConnection.createQueryBuilder().insert().into(entityName).values(data).execute();
  }
}
