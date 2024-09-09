import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';
import { Battle } from '../models';
import monsterFactory from './monster.factory';

export default Factory.define(Battle.tableName).attrs({
  monsterA: () => monsterFactory.build(),
  monsterB: () => monsterFactory.build(),
  winner:  () => faker.helpers.arrayElement(['monsterA', 'monsterB'])
});
