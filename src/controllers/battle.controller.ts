import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Id } from 'objection';
import { Battle, Monster } from '../models';

const list = async (req: Request, res: Response): Promise<Response> => {
  const battles = await Battle.query();
  return res.status(StatusCodes.OK).json(battles);
};

const start = async (req: Request, res: Response): Promise<Response> => {
  const { monster1Id, monster2Id } = req.body;

  const monsterA = await Monster.query().findById(monster1Id);
  const monsterB = await Monster.query().findById(monster2Id);

  if (!monsterA || !monsterB) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'One or both monsters not found' });
  }

  let [attacker, defender] = determineTurnOrder(monsterA, monsterB);
  while (attacker.hp > 0 && defender.hp > 0) {
    const damage = calculateDamage(attacker.attack, defender.defense);
    defender.hp -= damage;

    if (defender.hp <= 0) {
      break;
    }

    [attacker, defender] = [defender, attacker];
  }

  const winner = attacker.hp > 0 ? attacker : defender;

  const battle = await Battle.query().insert({
    monsterA,
    monsterB,
    winner,
  });

  return res
    .status(StatusCodes.CREATED)
    .json({ message: `${winner.name} won the battle`, battle });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const id: Id = req.params.id;
  const battle = await Battle.query().deleteById(id);

  if (!battle) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Battle not found' });
  }

  return res.sendStatus(StatusCodes.NO_CONTENT);
};

const determineTurnOrder = (
  monsterA: Monster,
  monsterB: Monster
): [Monster, Monster] => {
  if (monsterA.speed > monsterB.speed) return [monsterA, monsterB];
  if (monsterB.speed > monsterA.speed) return [monsterB, monsterA];

  return monsterA.attack >= monsterB.attack
    ? [monsterA, monsterB]
    : [monsterB, monsterA];
};

const calculateDamage = (attack: number, defense: number): number => {
  const damage = attack - defense;
  return damage > 0 ? damage : 1;
};

export const BattleController = {
  list,
  start,
  remove,
};
