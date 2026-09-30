import { describe, expect, it } from 'vitest';
import { createInterlineJourneyDefinition } from './interline-journey.factory.js';

describe('createInterlineJourneyDefinition', () => {
  it.each([
    ['0222', '2543', ['2호선', '5호선'], 4],
    ['2543', '0222', ['5호선', '2호선'], 4],
    ['0222', '2733', ['2호선', '7호선'], 2],
    ['2733', '0222', ['7호선', '2호선'], 2],
    ['2543', '2733', ['5호선', '7호선'], 1],
    ['2733', '2543', ['7호선', '5호선'], 1],
  ] as const)(
    'connects %s to %s across supported lines',
    (origin, destination, lines, candidateCount) => {
      const definition = createInterlineJourneyDefinition(origin, destination);

      expect(definition?.candidates).toHaveLength(candidateCount);
      expect(definition?.candidates[0].lines).toEqual(lines);
      expect(
        definition?.candidates[0].steps.some(
          (step) => step.type === 'transfer',
        ),
      ).toBe(true);
    },
  );

  it('orders alternatives by station count', () => {
    const definition = createInterlineJourneyDefinition('0222', '2543');
    const distances = definition?.candidates.map((candidate) =>
      Number(candidate.label.match(/(\d+)개 역/u)?.[1]),
    );

    expect(distances).toEqual([...(distances ?? [])].sort((a, b) => a - b));
  });

  it('marks unverified direction-specific transfer paths as unknown', () => {
    const definition = createInterlineJourneyDefinition('0222', '2733');

    expect(
      definition?.candidates.every((candidate) =>
        candidate.facilityGroups.some((group) =>
          group.id.endsWith('-unverified'),
        ),
      ),
    ).toBe(true);
  });

  it('keeps the previously verified Gunja transfer available', () => {
    const definition = createInterlineJourneyDefinition('2543', '2733');

    expect(definition?.candidates[0].transferStation).toBe('군자');
    expect(
      definition?.candidates[0].facilityGroups.some((group) =>
        group.id.startsWith('transfer-5-7-'),
      ),
    ).toBe(false);
  });

  it('boards the destination line directly when starting at an interchange', () => {
    const definition = createInterlineJourneyDefinition('0204', '2543');
    const first = definition?.candidates[0];

    expect(first?.transferStation).toBeNull();
    expect(first?.lines).toEqual(['5호선']);
    expect(first?.steps.some((step) => step.type === 'transfer')).toBe(false);
  });

  it.each([
    ['0328', '0222', ['3호선', '2호선']],
    ['0222', '0328', ['2호선', '3호선']],
    ['0328', '2543', ['3호선', '5호선']],
    ['2543', '0328', ['5호선', '3호선']],
    ['0328', '2733', ['3호선', '7호선']],
    ['2733', '0328', ['7호선', '3호선']],
  ] as const)(
    'connects line 3 journey %s to %s',
    (origin, destination, expectedLines) => {
      const definition = createInterlineJourneyDefinition(origin, destination);

      expect(definition?.candidates.length).toBeGreaterThan(0);
      expect(definition?.candidates[0].lines).toEqual(expectedLines);
      expect(
        definition?.candidates[0].steps.some(
          (step) => step.type === 'transfer',
        ),
      ).toBe(true);
    },
  );

  it.each([
    ['0424', '0222', ['4호선', '2호선']],
    ['0222', '0424', ['2호선', '4호선']],
    ['0424', '0328', ['4호선', '3호선']],
    ['0328', '0424', ['3호선', '4호선']],
    ['0424', '2543', ['4호선', '5호선']],
    ['2543', '0424', ['5호선', '4호선']],
    ['0424', '2733', ['4호선', '7호선']],
    ['2733', '0424', ['7호선', '4호선']],
  ] as const)(
    'connects line 4 journey %s to %s',
    (origin, destination, expectedLines) => {
      const definition = createInterlineJourneyDefinition(origin, destination);

      expect(definition?.candidates.length).toBeGreaterThan(0);
      expect(definition?.candidates[0].lines).toEqual(expectedLines);
      expect(
        definition?.candidates[0].steps.some(
          (step) => step.type === 'transfer',
        ),
      ).toBe(true);
    },
  );
});
