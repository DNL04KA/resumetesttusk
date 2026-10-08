import { describe, expect, it, vi } from 'vitest';
import { SortOrder } from '../common/sort-order.enum.js';
import { ExperienceLoader } from './experience.loader.js';
import type { ExperienceService } from './experience.service.js';
import type { Experience } from '../generated/prisma/client.js';

function experience(id: number, profileId: number, startDate: string): Experience {
  return {
    id,
    company: `Компания ${id}`,
    position: 'Developer',
    description: null,
    startDate: new Date(startDate),
    endDate: null,
    profileId,
  };
}

function createLoader(rows: Experience[]) {
  const findByProfileIds = vi.fn().mockResolvedValue(rows);
  const loader = new ExperienceLoader({
    findByProfileIds,
  } as unknown as ExperienceService);
  return { loader, findByProfileIds };
}

describe('ExperienceLoader', () => {
  // сервис всегда отдаёт DESC — это каноническое представление в кэше
  const rows = [experience(2, 1, '2025-09-01'), experience(1, 1, '2024-06-01')];

  it('отдаёт DESC как есть', async () => {
    const { loader } = createLoader(rows);

    const result = await loader.load(1, SortOrder.DESC);

    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });

  it('для ASC разворачивает порядок', async () => {
    const { loader } = createLoader(rows);

    const result = await loader.load(1, SortOrder.ASC);

    expect(result.map((e) => e.id)).toEqual([1, 2]);
  });

  it('ASC не портит кэш: следующий DESC остаётся корректным', async () => {
    const { loader, findByProfileIds } = createLoader(rows);

    const asc = await loader.load(1, SortOrder.ASC);
    const desc = await loader.load(1, SortOrder.DESC);

    expect(asc.map((e) => e.id)).toEqual([1, 2]);
    expect(desc.map((e) => e.id)).toEqual([2, 1]);
    expect(findByProfileIds).toHaveBeenCalledTimes(1);
  });
});
