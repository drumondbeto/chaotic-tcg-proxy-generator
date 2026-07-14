import {
  convertAttackToBatchEntry,
  convertMugicToBatchEntry,
  filterCreaturesByTribe
} from './batchHelpers';

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

describe('batch entry adapters', () => {
  it('maps attack database fields to batch shape', () => {
    const entry = convertAttackToBatchEntry({
      id: '12/100',
      name: 'Flame Orb',
      set: 'op',
      bp: 2,
      base: 15,
      fire: 5,
      air: null,
      earth: 0,
      water: null
    });

    expect(entry.type).toBe('attack');
    expect(entry.buildPoints).toBe(2);
    expect(entry.base).toBe(15);
    expect(entry.serialNumber).toBe('12/100');
    expect(entry.elements).toEqual({
      fire: 5,
      air: null,
      earth: 0,
      water: null
    });
  });

  it('maps mugic fields and defaults mugic notes array', () => {
    const entry = convertMugicToBatchEntry({
      id: 'M-01',
      name: 'Song of Stasis',
      tribe: 'overworld',
      mugicCost: 1
    });

    expect(entry.type).toBe('mugic');
    expect(entry.mugicCost).toBe(1);
    expect(entry.mugicNotes).toEqual([]);
    expect(entry.serialNumber).toBe('M-01');
  });
});
