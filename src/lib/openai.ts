import { fetch } from 'expo/fetch';
import { LANGUAGES, ERAS, GENRES, TONES, type Language, type Era, type Genre, type Tone } from './gameStore';

const API_KEY = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

// Get full language name for prompts
function getLanguageInstruction(language: Language): string {
  const lang = LANGUAGES[language];
  if (language === 'en') return '';
  return `\n\nCRITICAL LANGUAGE REQUIREMENT: You MUST respond ENTIRELY in ${lang.name} (${lang.nativeName}). Every single word of your response must be in ${lang.name}. Do NOT use any English words.`;
}

export async function generateBackstory(
  characterName: string,
  archetypeName: string,
  archetypeTitle: string,
  archetypeStrength: string,
  archetypeWeakness: string,
  language: Language = 'en'
): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const languageInstruction = getLanguageInstruction(language);

  const prompt = `You are a creative fantasy writer. Generate a compelling, mysterious backstory for a hero named "${characterName}" who is "${archetypeTitle}" (${archetypeName} archetype).

Their strength: ${archetypeStrength}
Their weakness: ${archetypeWeakness}

The setting is 1986 Hawkins, Indiana - a small town with dark secrets, government experiments, and parallel dimensions (Stranger Things vibes).

Write a 2-3 sentence backstory that:
- Hints at a mysterious past
- Connects to their archetype's traits
- Sets up potential adventure hooks
- Has a dark, nostalgic 80s atmosphere

Keep it under 150 words. Be evocative and dramatic. Write in third person.${languageInstruction}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        input: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate backstory');
    }

    const data = await response.json();

    // Extract text from the response
    const output = data.output;
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'output_text') {
              return content.text.trim();
            }
          }
        }
      }
    }

    // Fallback: try to get text directly
    if (typeof data.output_text === 'string') {
      return data.output_text.trim();
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating backstory:', error);
    throw error;
  }
}

export async function generateGameNarration(
  characterName: string,
  archetypeName: string,
  currentScene: string,
  playerAction: string,
  language: Language = 'en'
): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const languageInstruction = getLanguageInstruction(language);

  const prompt = `You are an AI Game Master running a narrative RPG set in 1986 Hawkins, Indiana (Stranger Things setting).

The player is "${characterName}", a ${archetypeName}.
Current scene: ${currentScene}
Player action: ${playerAction}

Respond with:
1. A vivid description of what happens (2-3 sentences)
2. Present 2-3 choices for what the player can do next

Keep responses under 200 words. Be atmospheric and suspenseful.${languageInstruction}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        input: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate narration');
    }

    const data = await response.json();

    const output = data.output;
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'output_text') {
              return content.text.trim();
            }
          }
        }
      }
    }

    if (typeof data.output_text === 'string') {
      return data.output_text.trim();
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating narration:', error);
    throw error;
  }
}

export interface StoryContext {
  characterName: string;
  archetypeName: string;
  era: Era;
  genre: Genre;
  tone: Tone;
  language: Language;
  conversationHistory: Array<{ role: 'player' | 'narrator'; content: string }>;
}

export async function generateStoryResponse(
  context: StoryContext,
  playerAction: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const eraInfo = ERAS[context.era];
  const genreInfo = GENRES[context.genre];
  const toneInfo = TONES[context.tone];
  const languageInstruction = getLanguageInstruction(context.language);
  const langName = LANGUAGES[context.language].name;

  // Build conversation context from history (last 6 exchanges)
  const recentHistory = context.conversationHistory.slice(-6);
  const historyText = recentHistory.length > 0
    ? `\n\nRecent story context:\n${recentHistory.map(h => `${h.role === 'player' ? 'Player' : 'Narrator'}: ${h.content}`).join('\n')}`
    : '';

  const prompt = `You are an AI Game Master running a narrative RPG.

SETTING:
- Era: ${eraInfo.name} (${eraInfo.year}) - ${eraInfo.description}
- Atmosphere: ${eraInfo.atmosphere}
- Genre: ${genreInfo.name} - ${genreInfo.description}
- Tone: ${toneInfo.name} - ${toneInfo.description}
- Mood: ${toneInfo.mood}

CHARACTER:
- Name: ${context.characterName}
- Archetype: ${context.archetypeName}
${historyText}

PLAYER ACTION: "${playerAction}"

INSTRUCTIONS:
1. Narrate what happens as a result of the player's action (2-4 sentences)
2. Be vivid, atmospheric, and match the ${toneInfo.name} tone
3. Stay true to the ${eraInfo.name} setting and ${genreInfo.name} genre
4. If the action requires a skill check (combat, stealth, persuasion, athletics, investigation, etc.), include a dice roll request using this EXACT format on its own line:
   [DICE_CHECK: attribute_name DC:difficulty_number]
   Example: [DICE_CHECK: audacity DC:12] or [DICE_CHECK: wisdom DC:15]
   Valid attributes: vision, resilience, influence, wisdom, audacity, integrity
   Only request ONE dice check per response, and only when the outcome is uncertain.
5. After the dice check line (if any), end with 2-3 clear choices formatted as:
   **A)** First option
   **B)** Second option
   **C)** Third option (optional)

Keep your response under 250 words. Be engaging and immersive.${languageInstruction}

${context.language !== 'en' ? `REMINDER: Your ENTIRE response must be in ${langName}. Do not use English. But keep the [DICE_CHECK: ...] format in English.` : ''}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        input: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate story');
    }

    const data = await response.json();

    const output = data.output;
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'output_text') {
              return content.text.trim();
            }
          }
        }
      }
    }

    if (typeof data.output_text === 'string') {
      return data.output_text.trim();
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating story response:', error);
    throw error;
  }
}

export async function generateInitialStory(
  context: Omit<StoryContext, 'conversationHistory'>
): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const eraInfo = ERAS[context.era];
  const genreInfo = GENRES[context.genre];
  const toneInfo = TONES[context.tone];
  const languageInstruction = getLanguageInstruction(context.language);
  const langName = LANGUAGES[context.language].name;

  const prompt = `You are an AI Game Master starting a new narrative RPG adventure.

SETTING:
- Era: ${eraInfo.name} (${eraInfo.year}) - ${eraInfo.description}
- Atmosphere: ${eraInfo.atmosphere}
- Genre: ${genreInfo.name} - ${genreInfo.description}
- Tone: ${toneInfo.name} - ${toneInfo.description}
- Mood: ${toneInfo.mood}

CHARACTER:
- Name: ${context.characterName}
- Archetype: ${context.archetypeName}

INSTRUCTIONS:
Write an opening scene that:
1. Sets the atmosphere and introduces the setting (2-3 sentences)
2. Places the character in an intriguing situation
3. Creates immediate tension or mystery fitting the ${toneInfo.name} tone
4. Ends with a question or prompt asking what the player does

Keep it under 200 words. Be evocative and draw the player in immediately.${languageInstruction}

${context.language !== 'en' ? `REMINDER: Your ENTIRE response must be in ${langName}. Do not use English.` : ''}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        input: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate initial story');
    }

    const data = await response.json();

    const output = data.output;
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'output_text') {
              return content.text.trim();
            }
          }
        }
      }
    }

    if (typeof data.output_text === 'string') {
      return data.output_text.trim();
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating initial story:', error);
    throw error;
  }
}
