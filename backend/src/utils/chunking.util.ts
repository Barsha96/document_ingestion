interface Chunk {
  content: string;
  pageNumber: number;
  chunkSerial: number;
  sectionTitle?: string;
  layoutMetadata?: any;
}

const MAX_CHUNK_SIZE = 1000; // Maximum tokens per chunk (approximate)

/**
 * Semantic chunking based on markdown headers
 * Splits content by sections while preserving context
 */
export function semanticChunk(markdown: string, filename: string): Chunk[] {
  const chunks: Chunk[] = [];
  let chunkSerial = 0;

  // Split by pages first
  const pages = markdown.split(/## Page (\d+)/);

  for (let i = 1; i < pages.length; i += 2) {
    const pageNumber = parseInt(pages[i]);
    const pageContent = pages[i + 1];

    if (!pageContent) continue;

    // Split page content by headers (H3)
    const sections = pageContent.split(/(###\s+[^\n]+\n)/);

    let currentSection = '';
    let currentSectionTitle = '';

    for (let j = 0; j < sections.length; j++) {
      const part = sections[j].trim();

      if (!part) continue;

      // Check if this is a header
      if (part.startsWith('###')) {
        // Save previous section if exists
        if (currentSection) {
          chunks.push(...splitLargeChunk(currentSection, pageNumber, chunkSerial, currentSectionTitle));
          chunkSerial = chunks.length;
        }

        // Start new section
        currentSectionTitle = part.replace(/^###\s+/, '').trim();
        currentSection = part + '\n';
      } else {
        currentSection += part + '\n';
      }
    }

    // Save last section
    if (currentSection) {
      chunks.push(...splitLargeChunk(currentSection, pageNumber, chunkSerial, currentSectionTitle));
      chunkSerial = chunks.length;
    }
  }

  // If no page markers found, chunk the entire content
  if (chunks.length === 0) {
    chunks.push(...splitLargeChunk(markdown, 1, 0, filename));
  }

  return chunks;
}

/**
 * Split large chunks that exceed MAX_CHUNK_SIZE
 */
function splitLargeChunk(
  content: string,
  pageNumber: number,
  startSerial: number,
  sectionTitle?: string
): Chunk[] {
  const words = content.split(/\s+/);
  const chunks: Chunk[] = [];

  if (words.length <= MAX_CHUNK_SIZE) {
    return [
      {
        content: content.trim(),
        pageNumber,
        chunkSerial: startSerial,
        sectionTitle,
      },
    ];
  }

  // Split into smaller chunks
  for (let i = 0; i < words.length; i += MAX_CHUNK_SIZE) {
    const chunkWords = words.slice(i, i + MAX_CHUNK_SIZE);
    const chunkContent = chunkWords.join(' ');

    chunks.push({
      content: chunkContent.trim(),
      pageNumber,
      chunkSerial: startSerial + chunks.length,
      sectionTitle,
    });
  }

  return chunks;
}
