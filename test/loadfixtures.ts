import * as fs from 'fs';
import yaml from 'js-yaml';
import { Connection } from 'typeorm';

export async function loadFixtures(
  name: string,
  dbConnection: Connection,
): Promise<any> {
  let items: any[] = [];
  try {
    const file: any = yaml.load(fs.readFileSync(`./${name}.yml`, 'utf8'));
    console.log(file);
    items = file['fixtures'];
  } catch (e) {
    console.log('fixtures error', e);
  }

  if (!items) {
    return;
  }

  items.forEach(async (item: any) => {
    const entityName = Object.keys(item)[0];
    const data = item[entityName];
    await dbConnection
      .createQueryBuilder()
      .insert()
      .into(entityName)
      .values(data)
      .execute();
  });
}
