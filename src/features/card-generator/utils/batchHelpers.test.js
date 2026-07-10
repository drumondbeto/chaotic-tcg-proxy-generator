import { filterCreaturesByTribe } from './batchHelpers';

describe('filterCreaturesByTribe', () => {
  const creatures = [
    { name: 'A', tribe: 'OverWorld' },
    { name: 'B', tribe: 'UnderWorld' },
    { name: 'C', tribe: 'Mipedian' }
  ];

  it('returns all creatures when tribe filter is all', () => {
    expect(filterCreaturesByTribe(creatures, 'all')).toHaveLength(3);
  });

  it('filters creatures by the selected tribe', () => {
    const result = filterCreaturesByTribe(creatures, 'underworld');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('B');
  });
});
