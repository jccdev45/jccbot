interface Phonetic {
  text?: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  origin?: string;
  meanings: Meaning[];
}

export async function getDefinition(
  word?: string,
  username?: string
): Promise<string> {
  if (!word) return `@${username}, please provide a word to define`;

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data: DictionaryEntry[] = await response.json();

    // Check if the API returned an error (e.g., word not found)
    if (Array.isArray(data) && data.length === 0) {
      return `@${username} Sorry, no definition found for "${word}"`;
    }

    if (!Array.isArray(data) || data.length === 0 || !data[0]?.meanings) {
      return `@${username} Sorry, couldn't find a definition for "${word}"`;
    }

    const definitionData = data[0];

    // Extract the first definition
    const firstMeaning = definitionData.meanings[0];

    if (!firstMeaning || !firstMeaning.definitions[0]) {
      return `@${username} Sorry, no definitions found for "${word}"`;
    }

    const firstDefinition = firstMeaning.definitions[0].definition;
    const partOfSpeech = firstMeaning.partOfSpeech;

    return `@${username}, "${word}" (${partOfSpeech}): ${firstDefinition}`;
  } catch (error) {
    console.error("Error fetching definition: ", error);
    return `@${username} Sorry, couldn't find a definition for "${word}"`;
  }
}
