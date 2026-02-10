import type { PokemonCard, Binder } from "./types"

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

// ~60 Pokemon cards with real pokemontcg.io images
export const MOCK_CARDS: PokemonCard[] = [
  { id: "base1-4", name: "Charizard", set: "Base", rarity: "Rare Holo", type: "Fire", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/4.png", owned: true, liked: true },
  { id: "base1-2", name: "Blastoise", set: "Base", rarity: "Rare Holo", type: "Water", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/2.png", owned: false, liked: true },
  { id: "base1-15", name: "Venusaur", set: "Base", rarity: "Rare Holo", type: "Grass", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/15.png", owned: true, liked: false },
  { id: "base1-58", name: "Pikachu", set: "Base", rarity: "Common", type: "Lightning", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/58.png", owned: true, liked: true },
  { id: "base1-44", name: "Bulbasaur", set: "Base", rarity: "Common", type: "Grass", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/44.png", owned: true, liked: false },
  { id: "base1-46", name: "Charmander", set: "Base", rarity: "Common", type: "Fire", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/46.png", owned: false, liked: false },
  { id: "base1-63", name: "Squirtle", set: "Base", rarity: "Common", type: "Water", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/63.png", owned: false, liked: true },
  { id: "base1-17", name: "Beedrill", set: "Base", rarity: "Rare", type: "Grass", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/17.png", owned: false, liked: false },
  { id: "base1-5", name: "Clefairy", set: "Base", rarity: "Rare Holo", type: "Colorless", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/5.png", owned: false, liked: false },
  { id: "base1-1", name: "Alakazam", set: "Base", rarity: "Rare Holo", type: "Psychic", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/1.png", owned: false, liked: false },
  { id: "base1-8", name: "Machamp", set: "Base", rarity: "Rare Holo", type: "Fighting", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/8.png", owned: true, liked: false },
  { id: "base1-10", name: "Mewtwo", set: "Base", rarity: "Rare Holo", type: "Psychic", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/10.png", owned: false, liked: true },
  { id: "base1-3", name: "Chansey", set: "Base", rarity: "Rare Holo", type: "Colorless", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/3.png", owned: false, liked: false },
  { id: "base1-7", name: "Hitmonchan", set: "Base", rarity: "Rare Holo", type: "Fighting", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/7.png", owned: false, liked: false },
  { id: "base1-9", name: "Magneton", set: "Base", rarity: "Rare Holo", type: "Lightning", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/9.png", owned: false, liked: false },
  { id: "base1-11", name: "Nidoking", set: "Base", rarity: "Rare Holo", type: "Grass", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/11.png", owned: false, liked: false },
  { id: "base1-12", name: "Ninetales", set: "Base", rarity: "Rare Holo", type: "Fire", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/12.png", owned: false, liked: true },
  { id: "base1-14", name: "Raichu", set: "Base", rarity: "Rare Holo", type: "Lightning", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/14.png", owned: false, liked: false },
  { id: "base1-6", name: "Gyarados", set: "Base", rarity: "Rare Holo", type: "Water", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/6.png", owned: true, liked: true },
  { id: "base1-13", name: "Poliwrath", set: "Base", rarity: "Rare Holo", type: "Water", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/13.png", owned: false, liked: false },
  // Jungle set
  { id: "jungle-1", name: "Clefable", set: "Jungle", rarity: "Rare Holo", type: "Colorless", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/jungle/1.png", owned: false, liked: false },
  { id: "jungle-2", name: "Electrode", set: "Jungle", rarity: "Rare Holo", type: "Lightning", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/jungle/2.png", owned: false, liked: false },
  { id: "jungle-3", name: "Flareon", set: "Jungle", rarity: "Rare Holo", type: "Fire", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/jungle/3.png", owned: true, liked: true },
  { id: "jungle-4", name: "Jolteon", set: "Jungle", rarity: "Rare Holo", type: "Lightning", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/jungle/4.png", owned: false, liked: true },
  { id: "jungle-5", name: "Kangaskhan", set: "Jungle", rarity: "Rare Holo", type: "Colorless", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/jungle/5.png", owned: false, liked: false },
  { id: "jungle-7", name: "Nidoqueen", set: "Jungle", rarity: "Rare Holo", type: "Grass", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/jungle/7.png", owned: false, liked: false },
  { id: "jungle-9", name: "Pinsir", set: "Jungle", rarity: "Rare Holo", type: "Grass", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/jungle/9.png", owned: false, liked: false },
  { id: "jungle-11", name: "Snorlax", set: "Jungle", rarity: "Rare Holo", type: "Colorless", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/jungle/11.png", owned: true, liked: false },
  { id: "jungle-12", name: "Vaporeon", set: "Jungle", rarity: "Rare Holo", type: "Water", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/jungle/12.png", owned: false, liked: true },
  { id: "jungle-16", name: "Wigglytuff", set: "Jungle", rarity: "Rare Holo", type: "Colorless", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/jungle/16.png", owned: false, liked: false },
  // Fossil set
  { id: "fossil-1", name: "Aerodactyl", set: "Fossil", rarity: "Rare Holo", type: "Fighting", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/fossil/1.png", owned: false, liked: true },
  { id: "fossil-2", name: "Articuno", set: "Fossil", rarity: "Rare Holo", type: "Water", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/fossil/2.png", owned: true, liked: true },
  { id: "fossil-3", name: "Ditto", set: "Fossil", rarity: "Rare Holo", type: "Colorless", artist: "Keiji Kinebuchi", imageUrl: "https://images.pokemontcg.io/fossil/3.png", owned: false, liked: false },
  { id: "fossil-5", name: "Gengar", set: "Fossil", rarity: "Rare Holo", type: "Psychic", artist: "Keiji Kinebuchi", imageUrl: "https://images.pokemontcg.io/fossil/5.png", owned: false, liked: true },
  { id: "fossil-6", name: "Haunter", set: "Fossil", rarity: "Rare Holo", type: "Psychic", artist: "Keiji Kinebuchi", imageUrl: "https://images.pokemontcg.io/fossil/6.png", owned: false, liked: false },
  { id: "fossil-7", name: "Hitmonlee", set: "Fossil", rarity: "Rare Holo", type: "Fighting", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/fossil/7.png", owned: false, liked: false },
  { id: "fossil-8", name: "Hypno", set: "Fossil", rarity: "Rare Holo", type: "Psychic", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/fossil/8.png", owned: false, liked: false },
  { id: "fossil-10", name: "Lapras", set: "Fossil", rarity: "Rare Holo", type: "Water", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/fossil/10.png", owned: true, liked: true },
  { id: "fossil-12", name: "Moltres", set: "Fossil", rarity: "Rare Holo", type: "Fire", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/fossil/12.png", owned: false, liked: true },
  { id: "fossil-13", name: "Muk", set: "Fossil", rarity: "Rare Holo", type: "Grass", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/fossil/13.png", owned: false, liked: false },
  { id: "fossil-15", name: "Zapdos", set: "Fossil", rarity: "Rare Holo", type: "Lightning", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/fossil/15.png", owned: false, liked: true },
  // Team Rocket
  { id: "rocket-1", name: "Dark Alakazam", set: "Team Rocket", rarity: "Rare Holo", type: "Psychic", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base5/1.png", owned: false, liked: false },
  { id: "rocket-2", name: "Dark Arbok", set: "Team Rocket", rarity: "Rare Holo", type: "Grass", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base5/2.png", owned: false, liked: false },
  { id: "rocket-3", name: "Dark Blastoise", set: "Team Rocket", rarity: "Rare Holo", type: "Water", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/base5/3.png", owned: false, liked: true },
  { id: "rocket-4", name: "Dark Charizard", set: "Team Rocket", rarity: "Rare Holo", type: "Fire", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base5/4.png", owned: true, liked: true },
  { id: "rocket-7", name: "Dark Golbat", set: "Team Rocket", rarity: "Rare Holo", type: "Grass", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base5/7.png", owned: false, liked: false },
  { id: "rocket-8", name: "Dark Gyarados", set: "Team Rocket", rarity: "Rare Holo", type: "Water", artist: "Kagemaru Himeno", imageUrl: "https://images.pokemontcg.io/base5/8.png", owned: false, liked: false },
  { id: "rocket-9", name: "Dark Hypno", set: "Team Rocket", rarity: "Rare Holo", type: "Psychic", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base5/9.png", owned: false, liked: false },
  { id: "rocket-10", name: "Dark Machamp", set: "Team Rocket", rarity: "Rare Holo", type: "Fighting", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base5/10.png", owned: false, liked: false },
  { id: "rocket-13", name: "Dark Vileplume", set: "Team Rocket", rarity: "Rare Holo", type: "Grass", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base5/13.png", owned: false, liked: false },
  // Base commons/uncommons for variety
  { id: "base1-23", name: "Arcanine", set: "Base", rarity: "Uncommon", type: "Fire", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/23.png", owned: true, liked: false },
  { id: "base1-25", name: "Dewgong", set: "Base", rarity: "Uncommon", type: "Water", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/25.png", owned: false, liked: false },
  { id: "base1-26", name: "Dratini", set: "Base", rarity: "Uncommon", type: "Colorless", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/26.png", owned: false, liked: false },
  { id: "base1-18", name: "Dragonair", set: "Base", rarity: "Rare", type: "Colorless", artist: "Mitsuhiro Arita", imageUrl: "https://images.pokemontcg.io/base1/18.png", owned: false, liked: true },
  { id: "base1-34", name: "Machoke", set: "Base", rarity: "Uncommon", type: "Fighting", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/34.png", owned: false, liked: false },
  { id: "base1-36", name: "Magmar", set: "Base", rarity: "Uncommon", type: "Fire", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/36.png", owned: false, liked: false },
  { id: "base1-41", name: "Seel", set: "Base", rarity: "Uncommon", type: "Water", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/41.png", owned: false, liked: false },
  { id: "base1-49", name: "Drowzee", set: "Base", rarity: "Common", type: "Psychic", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/49.png", owned: false, liked: false },
  { id: "base1-52", name: "Growlithe", set: "Base", rarity: "Common", type: "Fire", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/52.png", owned: false, liked: false },
  { id: "base1-55", name: "Nidoran M", set: "Base", rarity: "Common", type: "Grass", artist: "Ken Sugimori", imageUrl: "https://images.pokemontcg.io/base1/55.png", owned: false, liked: false },
]

// Derived filter options
export const MOCK_RARITIES = [...new Set(MOCK_CARDS.map((c) => c.rarity))]
export const MOCK_ARTISTS = [...new Set(MOCK_CARDS.map((c) => c.artist))]
export const MOCK_SETS = [...new Set(MOCK_CARDS.map((c) => c.set))]
export const MOCK_TYPES = [...new Set(MOCK_CARDS.map((c) => c.type))]

// Helper to create empty slots
function createEmptySlots(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    cardId: null,
    position: i,
  }))
}

// Default binders array with one pre-created binder
export const DEFAULT_BINDERS: Binder[] = [
  {
    id: "binder-1",
    name: "Main Binder",
    color: "red",
    pages: [
      {
        id: "page-1",
        slots: [
          { id: "s1-0", cardId: "base1-4", position: 0 },
          { id: "s1-1", cardId: "base1-2", position: 1 },
          { id: "s1-2", cardId: "base1-15", position: 2 },
          { id: "s1-3", cardId: "base1-58", position: 3 },
        ],
      },
      {
        id: "page-2",
        slots: [
          { id: "s2-0", cardId: "base1-6", position: 0 },
          { id: "s2-1", cardId: null, position: 1 },
          { id: "s2-2", cardId: "fossil-2", position: 2 },
          { id: "s2-3", cardId: null, position: 3 },
        ],
      },
      { id: "page-3", slots: createEmptySlots(4) },
      { id: "page-4", slots: createEmptySlots(4) },
    ],
  },
]
