import { describe, expect, it, vi } from 'vitest';
import { SkillCategory } from '../generated/prisma/enums.js';
import { SkillLoader } from './skill.loader.js';
import type { SkillService } from './skill.service.js';
import type { Skill } from '../generated/prisma/client.js';

function skill(id: number, profileId: number, name: string): Skill {
  return { id, name, category: SkillCategory.LANGUAGE, level: 3, profileId };
}

function createLoader(rows: Skill[]) {
  const findByProfileIds = vi.fn().mockResolvedValue(rows);
  const loader = new SkillLoader({ findByProfileIds } as unknown as SkillService);
  return { loader, findByProfileIds };
}

describe('SkillLoader', () => {
  it('объединяет несколько load() в один вызов сервиса', async () => {
    const { loader, findByProfileIds } = createLoader([
      skill(1, 1, 'TypeScript'),
      skill(2, 2, 'NestJS'),
    ]);

    const [first, second] = await Promise.all([loader.load(1), loader.load(2)]);

    expect(findByProfileIds).toHaveBeenCalledTimes(1);
    expect(findByProfileIds).toHaveBeenCalledWith([1, 2]);
    expect(first.map((s) => s.name)).toEqual(['TypeScript']);
    expect(second.map((s) => s.name)).toEqual(['NestJS']);
  });

  it('возвращает пустой массив для профиля без навыков', async () => {
    const { loader } = createLoader([skill(1, 1, 'TypeScript')]);

    await expect(loader.load(2)).resolves.toEqual([]);
  });

  it('раскладывает строки по владельцам, даже если база вернула их вперемешку', async () => {
    const { loader } = createLoader([
      skill(3, 2, 'Docker'),
      skill(1, 1, 'TypeScript'),
      skill(4, 2, 'Git'),
      skill(2, 1, 'SQL'),
    ]);

    const [first, second] = await Promise.all([loader.load(1), loader.load(2)]);

    expect(first.map((s) => s.name)).toEqual(['TypeScript', 'SQL']);
    expect(second.map((s) => s.name)).toEqual(['Docker', 'Git']);
  });
});
