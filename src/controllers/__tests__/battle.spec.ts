import app from '../../app';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';

import factories from '../../factories';
import { Monster, Battle } from '../../models';

const server = app.listen();

beforeAll(() => jest.useFakeTimers());
afterAll(() => server.close());

describe('BattleController', () => {
  describe('List', () => {
    test('should list all battles', async () => {
      const response = await request(server).get('/battle');
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Battle', () => {
    test('should fail when trying a battle of monsters with an undefined monster', async () => {
      const response = await request(server)
        .post(`/battle`)
        .send({ monster1Id: 'undenied', monster2Id: 1 });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    test('should fail when trying a battle of monsters with an inexistent monster', async () => {
      const monster = await Monster.query().insert(factories.monster.build());

      const response = await request(server)
        .post(`/battle`)
        .send({ monster1Id: monster.id, monster2Id: 9999 });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    test('should insert a battle of monsters successfully with monster 1 winning', async () => {
      const monster1 = await Monster.query().insert(
        factories.monster.build({ attack: 20, defense: 15, hp: 50, speed: 12 })
      );

      const monster2 = await Monster.query().insert(
        factories.monster.build({ attack: 10, defense: 8, hp: 50, speed: 10 })
      );

      const response = await request(server)
        .post(`/battle`)
        .send({ monster1Id: monster1.id, monster2Id: monster2.id });

      expect(response.status).toBe(StatusCodes.CREATED);
    });

    test('should insert a battle of monsters successfully with monster 2 winning', async () => {
      const monster2 = await Monster.query().insert(
        factories.monster.build({ attack: 20, defense: 15, hp: 50, speed: 12 })
      );

      const monster1 = await Monster.query().insert(
        factories.monster.build({ attack: 10, defense: 8, hp: 50, speed: 10 })
      );

      const response = await request(server)
        .post(`/battle`)
        .send({ monster1Id: monster1.id, monster2Id: monster2.id });

      expect(response.status).toBe(StatusCodes.CREATED);
    });
  });

  describe('Delete Battle', () => {
    test('should delete a battle successfully', async () => {
      const battle = factories.battle.build();
      const { id } = await Battle.query().insert(battle);

      const response = await request(server).delete(`/battle/${id}`);
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });

    test("should return 404 if the battle doesn't exists", async () => {
      const response = await request(server).delete(`/battle/${99999}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
