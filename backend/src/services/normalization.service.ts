import { AnalyzeResult } from '@azure/ai-form-recognizer';

/**
 * Convert Azure Document Intelligence result to Markdown format
 * This ensures fair comparison with Docling (which outputs Markdown)
 */
export function convertAzureToMarkdown(result: AnalyzeResult): string {
  const markdownParts: string[] = [];

  if (!result.pages) {
    return '';
  }

  // Process each page
  for (const page of result.pages) {
    // Add page header
    markdownParts.push(`\n## Page ${page.pageNumber}\n`);

    // Extract text with layout structure
    if (result.paragraphs) {
      const pageParagraphs = result.paragraphs.filter(
        (p) => p.boundingRegions && p.boundingRegions[0]?.pageNumber === page.pageNumber
      );

      for (const paragraph of pageParagraphs) {
        // Check if it's a heading based on role or formatting
        const role = (paragraph as any).role;
        if (role === 'title' || role === 'sectionHeading') {
          markdownParts.push(`\n### ${paragraph.content}\n`);
        } else {
          markdownParts.push(`${paragraph.content}\n`);
        }
      }
    }

    // Extract tables
    if (result.tables) {
      const pageTables = result.tables.filter(
        (t) => t.boundingRegions && t.boundingRegions[0]?.pageNumber === page.pageNumber
      );

      for (const table of pageTables) {
        const markdown = convertTableToMarkdown(table);
        markdownParts.push(`\n${markdown}\n`);
      }
    }
  }

  return markdownParts.join('\n');
}

function convertTableToMarkdown(table: any): string {
  const rows = table.cells;
  if (!rows || rows.length === 0) return '';

  // Group cells by row
  const rowMap = new Map<number, any[]>();
  let maxCol = 0;

  for (const cell of rows) {
    const rowIndex = cell.rowIndex || 0;
    const colIndex = cell.columnIndex || 0;

    if (!rowMap.has(rowIndex)) {
      rowMap.set(rowIndex, []);
    }

    rowMap.get(rowIndex)![colIndex] = cell.content || '';
    maxCol = Math.max(maxCol, colIndex);
  }

  // Build markdown table
  const markdownRows: string[] = [];

  // Sort rows by index
  const sortedRowIndices = Array.from(rowMap.keys()).sort((a, b) => a - b);

  for (let i = 0; i < sortedRowIndices.length; i++) {
    const rowIndex = sortedRowIndices[i];
    const row = rowMap.get(rowIndex)!;

    // Fill missing cells
    const filledRow: string[] = [];
    for (let col = 0; col <= maxCol; col++) {
      filledRow.push(row[col] || '');
    }

    markdownRows.push(`| ${filledRow.join(' | ')} |`);

    // Add header separator after first row
    if (i === 0) {
      const separator = `| ${Array(maxCol + 1).fill('---').join(' | ')} |`;
      markdownRows.push(separator);
    }
  }

  return markdownRows.join('\n');
}
