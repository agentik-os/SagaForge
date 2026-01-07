import { type Archetype, type Attributes, type Language, type Era, type Item, type NPC } from './gameStore';

// ============================================
// ENCOUNTER TYPES
// ============================================
export type EncounterType =
  | 'exploration'    // Finding something interesting
  | 'combat'         // Fighting an enemy
  | 'social'         // Talking to someone
  | 'puzzle'         // Solving a challenge
  | 'discovery'      // Finding lore/items
  | 'trap'           // Danger/damage
  | 'rest'           // Recovery opportunity
  | 'merchant'       // Trading opportunity
  | 'boss';          // Major encounter

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'deadly';

export interface EncounterChoice {
  id: string;
  text: string;
  requiredAttribute?: keyof Attributes;
  requiredSkill?: string;
  difficultyCheck?: number; // Target number for dice roll
  consequences: {
    success?: EncounterOutcome;
    failure?: EncounterOutcome;
    default?: EncounterOutcome; // If no roll needed
  };
}

export interface EncounterOutcome {
  narration: string;
  healthChange?: number;
  energyChange?: number;
  goldChange?: number;
  experienceGain?: number;
  itemsGained?: Partial<Item>[];
  itemsLost?: string[];
  relationshipChanges?: { npcId: string; change: number }[];
  questProgress?: { questId: string; objectiveId: string };
  unlockLocation?: string;
  triggerEncounter?: string; // Chain to another encounter
  addJournalEntry?: {
    type: 'story' | 'discovery' | 'character' | 'location' | 'item' | 'lore';
    title: string;
    content: string;
  };
}

export interface Encounter {
  id: string;
  type: EncounterType;
  title: string;
  narration: string;
  era: Era;
  location?: string;
  difficulty: DifficultyLevel;
  choices: EncounterChoice[];
  // Conditions for this encounter to appear
  conditions?: {
    minLevel?: number;
    maxLevel?: number;
    requiredQuest?: string;
    requiredItem?: string;
    requiredNpcMet?: string;
    timeOfDay?: 'day' | 'night';
  };
  // Visual/audio hints
  mood?: 'tense' | 'mysterious' | 'peaceful' | 'dangerous' | 'eerie';
  tags?: string[];
}

// ============================================
// ENEMY TYPES (for combat encounters)
// ============================================
export interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  era: Era;
  difficulty: DifficultyLevel;
  lootTable: { itemId: string; chance: number }[];
  experienceReward: number;
  goldReward: { min: number; max: number };
  abilities?: {
    name: string;
    description: string;
    damage?: number;
    effect?: 'stun' | 'poison' | 'fear' | 'drain';
  }[];
  weaknesses?: (keyof Attributes)[];
  resistances?: (keyof Attributes)[];
}

// ============================================
// STRANGER THINGS ERA ENCOUNTERS
// ============================================
export const STRANGER_THINGS_ENCOUNTERS: Encounter[] = [
  {
    id: 'st_flickering_lights',
    type: 'exploration',
    title: 'Flickering Lights',
    narration: `The streetlights around you begin to flicker erratically. One by one, they pulse in a pattern that almost seems... intentional. Your walkie-talkie crackles with white noise, and for a moment, you could swear you hear a voice saying your name.

The temperature drops suddenly. Your breath mists in the air despite it being a warm summer night.

**Something is trying to communicate.**`,
    era: 'stranger_things',
    difficulty: 'easy',
    mood: 'eerie',
    choices: [
      {
        id: 'follow_lights',
        text: 'Follow the pattern of flickering lights',
        requiredAttribute: 'audacity',
        difficultyCheck: 8,
        consequences: {
          success: {
            narration: `You follow the lights deeper into the neighborhood. They lead you to an old storm drain, where you find a small metal box hidden in the debris. Inside is a strange key and a note: "The truth is beneath."`,
            experienceGain: 25,
            itemsGained: [
              { id: 'mysterious_key', name: 'Mysterious Key', type: 'key', rarity: 'uncommon', description: 'A key with strange symbols etched into its surface' }
            ],
            addJournalEntry: {
              type: 'discovery',
              title: 'The Flickering Message',
              content: 'The lights led me to a storm drain where I found a mysterious key. Someone - or something - wanted me to find it.'
            }
          },
          failure: {
            narration: `You try to follow the pattern, but the lights suddenly go dark. In the darkness, you feel something brush past you - something cold. When the lights return, you notice scratches on your arm you don't remember getting.`,
            healthChange: -5,
            experienceGain: 10,
          }
        }
      },
      {
        id: 'use_walkie',
        text: 'Try to communicate through the walkie-talkie',
        requiredAttribute: 'wisdom',
        difficultyCheck: 10,
        consequences: {
          success: {
            narration: `You press the talk button and speak into the static. "Hello? Can you hear me?" After a long pause, a child's voice responds: "Find Eleven. She knows. Hawkins Lab. Danger." Then silence.`,
            experienceGain: 30,
            questProgress: { questId: 'main_mystery', objectiveId: 'obj3' },
            addJournalEntry: {
              type: 'story',
              title: 'Voice in the Static',
              content: 'Someone contacted me through the walkie-talkie. They mentioned "Eleven" and warned about Hawkins Lab. I need to find out more.'
            }
          },
          failure: {
            narration: `The static intensifies, becoming almost painful. You hear fragmented words - "run" - "watching" - "upside" - before your walkie-talkie sparks and dies. You'll need to find another one.`,
            itemsLost: ['walkie_talkie'],
            experienceGain: 10,
          }
        }
      },
      {
        id: 'run_home',
        text: 'This is too creepy - head somewhere safe',
        consequences: {
          default: {
            narration: `You decide discretion is the better part of valor and hurry toward home. The lights return to normal behind you, but you can't shake the feeling that you missed something important. Still, you live to investigate another day.`,
            energyChange: 10,
            experienceGain: 5,
          }
        }
      }
    ],
    tags: ['supernatural', 'communication', 'upside_down']
  },
  {
    id: 'st_school_basement',
    type: 'exploration',
    title: 'The Locked Basement',
    narration: `Hawkins Middle School stands empty during summer break, but you've heard rumors about strange equipment being stored in the basement. The janitor's entrance is unlocked - almost like someone wanted you to find it.

The stairs descend into darkness. You can hear a faint humming sound from below, and the air feels charged with static electricity.

**Do you dare to descend?**`,
    era: 'stranger_things',
    location: 'hawkins_school',
    difficulty: 'medium',
    mood: 'mysterious',
    choices: [
      {
        id: 'sneak_down',
        text: 'Sneak down quietly and investigate',
        requiredSkill: 'stealth',
        difficultyCheck: 12,
        consequences: {
          success: {
            narration: `Moving silently, you descend into the basement. Hidden behind old gym equipment, you find a makeshift radio setup - clearly not school property. On a desk nearby are documents stamped "HAWKINS NATIONAL LABORATORY - CLASSIFIED." You grab what you can before slipping away.`,
            experienceGain: 40,
            itemsGained: [
              { id: 'classified_docs', name: 'Classified Documents', type: 'key', rarity: 'rare', description: 'Stolen documents from Hawkins Lab mentioning "Project Indigo"' }
            ],
            questProgress: { questId: 'main_mystery', objectiveId: 'obj3' },
          },
          failure: {
            narration: `You knock over a bucket halfway down the stairs. The humming stops. Footsteps approach. You barely make it out before a flashlight beam sweeps the stairwell. Someone is using this basement for something secret - and they almost caught you.`,
            experienceGain: 15,
            energyChange: -10,
          }
        }
      },
      {
        id: 'create_distraction',
        text: 'Create a distraction and search quickly',
        requiredAttribute: 'audacity',
        difficultyCheck: 14,
        consequences: {
          success: {
            narration: `You trigger the fire alarm on the first floor, then rush to the basement while chaos erupts above. In the confusion, you find not only documents but also a strange device that pulses with an otherworldly glow. You pocket it and escape in the crowd.`,
            experienceGain: 50,
            itemsGained: [
              { id: 'pulse_device', name: 'Strange Pulse Device', type: 'artifact', rarity: 'rare', description: 'A device that seems to react to proximity to the Upside Down' }
            ],
          },
          failure: {
            narration: `Your distraction works too well - the whole school goes into lockdown. You're caught by a stern-looking man in a suit who "suggests" you forget everything you saw. Your parents get a call, and you're grounded for a week.`,
            healthChange: -5,
            experienceGain: 10,
            energyChange: -20,
          }
        }
      },
      {
        id: 'come_back_later',
        text: 'Mark this location and come back prepared',
        consequences: {
          default: {
            narration: `You note the location and retreat to plan properly. Sometimes the best adventurer is the one who lives to adventure again. You'll return when you have backup or better equipment.`,
            unlockLocation: 'school_basement',
            experienceGain: 10,
            addJournalEntry: {
              type: 'location',
              title: 'School Basement',
              content: 'Something suspicious is going on in the school basement. I need to come back with a plan.'
            }
          }
        }
      }
    ],
    conditions: {
      minLevel: 2
    },
    tags: ['investigation', 'hawkins_lab', 'stealth']
  },
  {
    id: 'st_demodog_encounter',
    type: 'combat',
    title: 'Something in the Woods',
    narration: `A sound like no animal you've ever heard echoes through Mirkwood Forest. The trees seem to close in around you as you spot movement in the undergrowth.

Then you see it - a creature with a flower-like face that opens to reveal rows of teeth. It's the size of a large dog, but it moves wrong, its limbs bending at impossible angles.

**A Demodog blocks your path.**`,
    era: 'stranger_things',
    location: 'mirkwood_forest',
    difficulty: 'hard',
    mood: 'dangerous',
    choices: [
      {
        id: 'fight_demodog',
        text: 'Stand your ground and fight!',
        requiredAttribute: 'resilience',
        difficultyCheck: 15,
        consequences: {
          success: {
            narration: `You grab a fallen branch and swing with all your might. The creature screeches as you connect, ichor spraying from the wound. It retreats into the shadows, leaving behind a trail of strange, glowing blood. You've proven you can survive in this new, terrifying world.`,
            experienceGain: 75,
            healthChange: -15,
            itemsGained: [
              { id: 'demodog_tooth', name: 'Demodog Tooth', type: 'artifact', rarity: 'rare', description: 'A razor-sharp tooth from a creature of the Upside Down' }
            ],
            addJournalEntry: {
              type: 'discovery',
              title: 'First Blood',
              content: 'I fought a monster from the Upside Down and survived. These creatures can be hurt - they can be stopped.'
            }
          },
          failure: {
            narration: `The creature is faster than you expected. Its claws rake across your side before you can react. You manage to escape, but the wound burns with an unnatural cold. You need medical attention - and answers about what that thing was.`,
            healthChange: -30,
            experienceGain: 25,
          }
        }
      },
      {
        id: 'use_fire',
        text: 'Use your lighter to scare it with fire',
        requiredAttribute: 'wisdom',
        difficultyCheck: 12,
        consequences: {
          success: {
            narration: `You remember the stories - creatures of darkness fear the light. You flick your lighter and thrust it toward the beast. It recoils, hissing, the flame reflected in its eyeless face. It retreats into the shadows. Fire is their weakness.`,
            experienceGain: 50,
            addJournalEntry: {
              type: 'lore',
              title: 'Weakness of the Shadow',
              content: 'The creatures from the Upside Down fear fire and light. This knowledge could save my life.'
            }
          },
          failure: {
            narration: `Your hands shake too much - the lighter won't catch. The creature senses your fear and lunges. You barely dodge, losing your lighter in the process as you flee through the trees.`,
            healthChange: -10,
            energyChange: -20,
            itemsLost: ['lighter'],
          }
        }
      },
      {
        id: 'run_climb',
        text: 'Run and climb the nearest tree',
        requiredSkill: 'athletics',
        difficultyCheck: 10,
        consequences: {
          success: {
            narration: `You sprint for the old oak and scramble up faster than you've ever climbed. The creature circles below, unable to follow. After what feels like hours, it loses interest and slinks away. You're safe - for now.`,
            experienceGain: 35,
            energyChange: -15,
          },
          failure: {
            narration: `You run, but trip on a root. The creature pounces, and you feel its teeth graze your leg before you kick free and scramble up the tree. You're alive, but bleeding.`,
            healthChange: -20,
            energyChange: -20,
            experienceGain: 20,
          }
        }
      }
    ],
    conditions: {
      minLevel: 3
    },
    tags: ['combat', 'upside_down', 'demodog', 'mirkwood']
  },
  {
    id: 'st_meet_dustin',
    type: 'social',
    title: 'A Chance Meeting',
    narration: `You nearly collide with a curly-haired kid on a bike. His hat reads "Camp Know Where" and he's carrying a strange-looking radio antenna. His eyes widen when he sees you.

"You're investigating too, aren't you?" he says, looking around nervously. "I'm Dustin. I've seen things... things I can't explain. Nobody believes me except my friends."

He seems eager to share information - but can you trust him?`,
    era: 'stranger_things',
    difficulty: 'easy',
    mood: 'mysterious',
    choices: [
      {
        id: 'share_info',
        text: 'Share what you know and form an alliance',
        requiredAttribute: 'influence',
        difficultyCheck: 8,
        consequences: {
          success: {
            narration: `You exchange stories, and Dustin's eyes grow wider with each revelation. "This is huge. You need to meet the Party - that's what we call ourselves. We've been tracking this stuff for years." He gives you coordinates to their secret meeting spot. You've found allies.`,
            experienceGain: 40,
            relationshipChanges: [{ npcId: 'dustin', change: 30 }],
            unlockLocation: 'party_hq',
            addJournalEntry: {
              type: 'character',
              title: 'Dustin Henderson',
              content: 'Met a kid named Dustin who knows about the supernatural events. He has friends who\'ve been investigating. I should meet "The Party."'
            }
          },
          failure: {
            narration: `You share too much too fast. Dustin backs away. "You're either crazy or a fed. Either way, I don't know you." He pedals away quickly. Maybe a more careful approach would work next time.`,
            relationshipChanges: [{ npcId: 'dustin', change: -10 }],
            experienceGain: 10,
          }
        }
      },
      {
        id: 'listen_only',
        text: 'Listen to his story but keep your cards close',
        requiredAttribute: 'wisdom',
        difficultyCheck: 6,
        consequences: {
          success: {
            narration: `You let Dustin do most of the talking. He tells you about creatures, a girl with powers, and a parallel dimension. It sounds insane, but it matches what you've seen. "Think about it," he says before leaving. "We could use someone like you." He trusts you more for not pushing.`,
            experienceGain: 30,
            relationshipChanges: [{ npcId: 'dustin', change: 15 }],
            addJournalEntry: {
              type: 'story',
              title: 'Dustin\'s Tale',
              content: 'A kid named Dustin told me incredible stories about monsters and psychic powers. He mentioned a parallel dimension. Could this all be connected?'
            }
          },
          failure: {
            narration: `Your poker face isn't as good as you thought. Dustin senses your skepticism and clams up. "Forget it. Another non-believer." He rides off, but you've still learned something.`,
            experienceGain: 15,
          }
        }
      },
      {
        id: 'dismiss',
        text: 'Tell him he sounds crazy and walk away',
        consequences: {
          default: {
            narration: `"You sound like you've watched too many movies, kid." Dustin's face falls, then hardens. "Fine. But when the monsters come for you, don't say I didn't warn you." He rides off. You've made an enemy of someone who might have been useful.`,
            relationshipChanges: [{ npcId: 'dustin', change: -25 }],
            experienceGain: 5,
          }
        }
      }
    ],
    tags: ['social', 'party', 'ally']
  },
];

// ============================================
// ENEMIES
// ============================================
export const STRANGER_THINGS_ENEMIES: Enemy[] = [
  {
    id: 'demodog',
    name: 'Demodog',
    description: 'A quadrupedal creature from the Upside Down with a flower-like face that opens to reveal rows of razor-sharp teeth.',
    health: 40,
    maxHealth: 40,
    attack: 12,
    defense: 6,
    era: 'stranger_things',
    difficulty: 'medium',
    lootTable: [
      { itemId: 'demodog_tooth', chance: 0.3 },
      { itemId: 'strange_slime', chance: 0.5 },
    ],
    experienceReward: 50,
    goldReward: { min: 0, max: 10 },
    abilities: [
      { name: 'Pounce', description: 'Leaps at target', damage: 15 },
      { name: 'Terrifying Screech', description: 'Causes fear', effect: 'fear' },
    ],
    weaknesses: ['wisdom'], // Fire/light
    resistances: ['resilience'],
  },
  {
    id: 'demogorgon',
    name: 'Demogorgon',
    description: 'A towering humanoid monster from the Upside Down. Its face splits open like a deadly flower, and it hunts by the scent of blood.',
    health: 100,
    maxHealth: 100,
    attack: 20,
    defense: 12,
    era: 'stranger_things',
    difficulty: 'deadly',
    lootTable: [
      { itemId: 'demogorgon_claw', chance: 0.5 },
      { itemId: 'void_essence', chance: 0.2 },
    ],
    experienceReward: 200,
    goldReward: { min: 0, max: 0 },
    abilities: [
      { name: 'Portal Shift', description: 'Teleports through the Upside Down', damage: 0 },
      { name: 'Rending Claws', description: 'Devastating slash attack', damage: 25 },
      { name: 'Blood Frenzy', description: 'Attacks become stronger when prey is wounded', damage: 30 },
    ],
    weaknesses: ['audacity'], // Fire/electricity
  },
  {
    id: 'possessed_human',
    name: 'Flayed Victim',
    description: 'A human whose mind has been taken over by the Mind Flayer. They appear normal until they attack.',
    health: 25,
    maxHealth: 25,
    attack: 8,
    defense: 4,
    era: 'stranger_things',
    difficulty: 'easy',
    lootTable: [
      { itemId: 'wallet', chance: 0.4 },
      { itemId: 'keys', chance: 0.3 },
    ],
    experienceReward: 20,
    goldReward: { min: 5, max: 20 },
    abilities: [
      { name: 'Deceptive Appearance', description: 'Looks normal until attacking' },
      { name: 'Hive Mind', description: 'Can alert other Flayed nearby' },
    ],
    weaknesses: ['influence'], // Can sometimes be reasoned with
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getRandomEncounter(era: Era, location?: string, level: number = 1): Encounter | null {
  let encounters: Encounter[] = [];

  if (era === 'stranger_things') {
    encounters = STRANGER_THINGS_ENCOUNTERS;
  }

  // Filter by conditions
  const eligible = encounters.filter(e => {
    if (location && e.location && e.location !== location) return false;
    if (e.conditions?.minLevel && level < e.conditions.minLevel) return false;
    if (e.conditions?.maxLevel && level > e.conditions.maxLevel) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  // Random selection
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function getEncounterById(id: string): Encounter | null {
  const allEncounters = [...STRANGER_THINGS_ENCOUNTERS];
  return allEncounters.find(e => e.id === id) ?? null;
}

export function getEnemyById(id: string): Enemy | null {
  const allEnemies = [...STRANGER_THINGS_ENEMIES];
  return allEnemies.find(e => e.id === id) ?? null;
}

export function calculateDifficultyModifier(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case 'easy': return -2;
    case 'medium': return 0;
    case 'hard': return 3;
    case 'deadly': return 6;
  }
}
