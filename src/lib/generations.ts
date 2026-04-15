export type Generation = {
  id: number;
  name: string;
  region: string;
  startId: number;
  endId: number;
};

export const GENERATIONS: Generation[] = [
  { id: 1, name: 'I', region: 'Kanto', startId: 1, endId: 151 },
  { id: 2, name: 'II', region: 'Johto', startId: 152, endId: 251 },
  { id: 3, name: 'III', region: 'Hoenn', startId: 252, endId: 386 },
  { id: 4, name: 'IV', region: 'Sinnoh', startId: 387, endId: 493 },
  { id: 5, name: 'V', region: 'Unova', startId: 494, endId: 649 },
  { id: 6, name: 'VI', region: 'Kalos', startId: 650, endId: 721 },
  { id: 7, name: 'VII', region: 'Alola', startId: 722, endId: 809 },
  { id: 8, name: 'VIII', region: 'Galar', startId: 810, endId: 905 },
  { id: 9, name: 'IX', region: 'Paldea', startId: 906, endId: 1025 },
];

export function getGenerationById(id: number): Generation | undefined {
  return GENERATIONS.find((gen) => gen.id === id);
}

export function getIdRangesForGenerations(genIds: number[]): Array<{ start: number; end: number }> {
  return genIds
    .map((id) => getGenerationById(id))
    .filter((gen): gen is Generation => gen !== undefined)
    .map((gen) => ({ start: gen.startId, end: gen.endId }));
}

export function isAllGenerationsEnabled(enabledGens: number[]): boolean {
  return enabledGens.length === GENERATIONS.length;
}

export function getDefaultEnabledGenerations(): number[] {
  return GENERATIONS.map((gen) => gen.id);
}
