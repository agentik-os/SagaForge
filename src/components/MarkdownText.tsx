import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

type MarkdownTextProps = {
  children: string;
  className?: string;
  baseColor?: string;
};

type TextSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

type ParsedBlock = {
  type: 'paragraph' | 'heading' | 'list-item' | 'code-block';
  content: TextSegment[];
  level?: number; // For headings (1-3) or list nesting
};

function parseInlineMarkdown(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;

  // Regex patterns for inline markdown
  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/g, bold: true, italic: true }, // ***bold italic***
    { regex: /\*\*(.+?)\*\*/g, bold: true }, // **bold**
    { regex: /__(.+?)__/g, bold: true }, // __bold__
    { regex: /\*(.+?)\*/g, italic: true }, // *italic*
    { regex: /_(.+?)_/g, italic: true }, // _italic_
    { regex: /`(.+?)`/g, code: true }, // `code`
  ];

  // Combined regex to find all markdown
  const combinedRegex = /(\*\*\*.+?\*\*\*|\*\*.+?\*\*|__.+?__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)|`.+?`)/g;

  let lastIndex = 0;
  let match;

  // Simple approach: process text character by character tracking state
  let i = 0;
  while (i < remaining.length) {
    // Check for bold italic ***text***
    if (remaining.slice(i, i + 3) === '***') {
      const endIdx = remaining.indexOf('***', i + 3);
      if (endIdx !== -1) {
        if (i > lastIndex) {
          segments.push({ text: remaining.slice(lastIndex, i) });
        }
        segments.push({
          text: remaining.slice(i + 3, endIdx),
          bold: true,
          italic: true,
        });
        lastIndex = endIdx + 3;
        i = endIdx + 3;
        continue;
      }
    }

    // Check for bold **text** or __text__
    if (remaining.slice(i, i + 2) === '**') {
      const endIdx = remaining.indexOf('**', i + 2);
      if (endIdx !== -1) {
        if (i > lastIndex) {
          segments.push({ text: remaining.slice(lastIndex, i) });
        }
        segments.push({
          text: remaining.slice(i + 2, endIdx),
          bold: true,
        });
        lastIndex = endIdx + 2;
        i = endIdx + 2;
        continue;
      }
    }

    if (remaining.slice(i, i + 2) === '__') {
      const endIdx = remaining.indexOf('__', i + 2);
      if (endIdx !== -1) {
        if (i > lastIndex) {
          segments.push({ text: remaining.slice(lastIndex, i) });
        }
        segments.push({
          text: remaining.slice(i + 2, endIdx),
          bold: true,
        });
        lastIndex = endIdx + 2;
        i = endIdx + 2;
        continue;
      }
    }

    // Check for code `text`
    if (remaining[i] === '`' && remaining[i + 1] !== '`') {
      const endIdx = remaining.indexOf('`', i + 1);
      if (endIdx !== -1) {
        if (i > lastIndex) {
          segments.push({ text: remaining.slice(lastIndex, i) });
        }
        segments.push({
          text: remaining.slice(i + 1, endIdx),
          code: true,
        });
        lastIndex = endIdx + 1;
        i = endIdx + 1;
        continue;
      }
    }

    // Check for italic *text* (but not ** which is bold)
    if (
      remaining[i] === '*' &&
      remaining[i + 1] !== '*' &&
      (i === 0 || remaining[i - 1] !== '*')
    ) {
      let endIdx = -1;
      for (let j = i + 1; j < remaining.length; j++) {
        if (remaining[j] === '*' && remaining[j - 1] !== '*' && remaining[j + 1] !== '*') {
          endIdx = j;
          break;
        }
      }
      if (endIdx !== -1) {
        if (i > lastIndex) {
          segments.push({ text: remaining.slice(lastIndex, i) });
        }
        segments.push({
          text: remaining.slice(i + 1, endIdx),
          italic: true,
        });
        lastIndex = endIdx + 1;
        i = endIdx + 1;
        continue;
      }
    }

    // Check for italic _text_ (but not __ which is bold)
    if (
      remaining[i] === '_' &&
      remaining[i + 1] !== '_' &&
      (i === 0 || remaining[i - 1] !== '_')
    ) {
      let endIdx = -1;
      for (let j = i + 1; j < remaining.length; j++) {
        if (remaining[j] === '_' && remaining[j - 1] !== '_' && remaining[j + 1] !== '_') {
          endIdx = j;
          break;
        }
      }
      if (endIdx !== -1) {
        if (i > lastIndex) {
          segments.push({ text: remaining.slice(lastIndex, i) });
        }
        segments.push({
          text: remaining.slice(i + 1, endIdx),
          italic: true,
        });
        lastIndex = endIdx + 1;
        i = endIdx + 1;
        continue;
      }
    }

    i++;
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    segments.push({ text: remaining.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
}

function parseMarkdownBlocks(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join('\n');
      blocks.push({
        type: 'paragraph',
        content: parseInlineMarkdown(content),
      });
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line - flush paragraph
    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: parseInlineMarkdown(headingMatch[2]),
      });
      continue;
    }

    // List items (-, *, or numbered)
    const listMatch = trimmed.match(/^[-*•]\s+(.+)$/) || trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      blocks.push({
        type: 'list-item',
        content: parseInlineMarkdown(listMatch[1]),
      });
      continue;
    }

    // Lettered list items (A), B), etc.)
    const letterListMatch = trimmed.match(/^[A-Z][.)]\s+(.+)$/);
    if (letterListMatch) {
      flushParagraph();
      blocks.push({
        type: 'list-item',
        content: parseInlineMarkdown(letterListMatch[1]),
      });
      continue;
    }

    // Regular text - add to paragraph
    currentParagraph.push(line);
  }

  flushParagraph();
  return blocks;
}

export function MarkdownText({ children, className, baseColor }: MarkdownTextProps) {
  const blocks = parseMarkdownBlocks(children);

  return (
    <View>
      {blocks.map((block, blockIndex) => {
        const isLastBlock = blockIndex === blocks.length - 1;

        if (block.type === 'heading') {
          const fontSize = block.level === 1 ? 'text-xl' : block.level === 2 ? 'text-lg' : 'text-base';
          return (
            <Text
              key={blockIndex}
              className={cn(fontSize, 'font-bold', !isLastBlock && 'mb-2', className)}
              style={baseColor ? { color: baseColor } : undefined}
            >
              {block.content.map((segment, i) => (
                <Text
                  key={i}
                  className={cn(
                    segment.italic && 'italic',
                    segment.code && 'font-mono bg-black/20 px-1'
                  )}
                >
                  {segment.text}
                </Text>
              ))}
            </Text>
          );
        }

        if (block.type === 'list-item') {
          return (
            <View key={blockIndex} className={cn('flex-row', !isLastBlock && 'mb-1')}>
              <Text className={cn('mr-2', className)} style={baseColor ? { color: baseColor } : undefined}>
                •
              </Text>
              <Text className={cn('flex-1 leading-6', className)} style={baseColor ? { color: baseColor } : undefined}>
                {block.content.map((segment, i) => (
                  <Text
                    key={i}
                    className={cn(
                      segment.bold && 'font-bold',
                      segment.italic && 'italic',
                      segment.code && 'font-mono bg-black/20'
                    )}
                  >
                    {segment.text}
                  </Text>
                ))}
              </Text>
            </View>
          );
        }

        // Paragraph
        return (
          <Text
            key={blockIndex}
            className={cn('text-base leading-6', !isLastBlock && 'mb-3', className)}
            style={baseColor ? { color: baseColor } : undefined}
          >
            {block.content.map((segment, i) => (
              <Text
                key={i}
                className={cn(
                  segment.bold && 'font-bold',
                  segment.italic && 'italic',
                  segment.code && 'font-mono bg-black/20 rounded px-1'
                )}
              >
                {segment.text}
              </Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
}
