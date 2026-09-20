import type { SelectedReference } from '../types';

const PREFIX = 'Referenced passages from earlier responses:';

function quote(text: string): string {
  return text
    .trim()
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

export function formatReferences(references: SelectedReference[]): string {
  const sections = references.map((reference, index) => {
    const lines = [`[${index + 1}]`, quote(reference.text)];
    const comment = reference.comment.trim();
    if (comment) lines.push('', `Note: ${comment}`);
    return lines.join('\n');
  });

  return `\n\n---\n${PREFIX}\n\n${sections.join('\n\n')}`;
}

export function hasFormattedReferences(text: string): boolean {
  return text.includes(PREFIX);
}

export const referenceFormatPrefix = PREFIX;
