import { db } from "../db/connection";
import { knowledgeItems } from "../db/schema";
import { like, or, and, ne } from "drizzle-orm";
// @ts-ignore - string-similarity doesn't have official types
import { compareTwoStrings } from "string-similarity";

interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarItems: string[];
  similarityScores: Array<{ id: string; title: string; score: number }>;
}

const SIMILARITY_THRESHOLD = 0.7; // 70% similarity threshold
const MIN_SIMILARITY_FOR_WARNING = 0.5; // 50% similarity for warning

/**
 * Extract text content from title and description/content for comparison
 */
function extractTextForComparison(title: string, content?: string): string {
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedContent = content ? content.toLowerCase().trim() : "";
  return `${normalizedTitle} ${normalizedContent}`.trim();
}

/**
 * Calculate similarity score between two texts
 */
function calculateSimilarity(text1: string, text2: string): number {
  return compareTwoStrings(text1, text2);
}

/**
 * Detect duplicates using text similarity
 */
export async function detectDuplicates(
  title: string,
  content: string,
  fileContent?: string
): Promise<DuplicateDetectionResult> {
  const searchText = extractTextForComparison(title, content || fileContent);

  // Get all existing knowledge items (excluding drafts)
  const existingItems = await db
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      description: knowledgeItems.description,
      content: knowledgeItems.content,
    })
    .from(knowledgeItems)
    .where(ne(knowledgeItems.status, "draft"));

  const similarityScores: Array<{ id: string; title: string; score: number }> = [];

  // Calculate similarity with each existing item
  for (const item of existingItems) {
    const itemText = extractTextForComparison(
      item.title,
      item.description || item.content
    );
    const similarity = calculateSimilarity(searchText, itemText);

    if (similarity >= MIN_SIMILARITY_FOR_WARNING) {
      similarityScores.push({
        id: item.id,
        title: item.title,
        score: similarity,
      });
    }
  }

  // Sort by similarity score (highest first)
  similarityScores.sort((a, b) => b.score - a.score);

  // Get items with similarity above threshold
  const duplicateItems = similarityScores
    .filter((item) => item.score >= SIMILARITY_THRESHOLD)
    .map((item) => item.id);

  // Get top 5 similar items for warnings (even if below threshold)
  const similarItems = similarityScores
    .slice(0, 5)
    .map((item) => item.id);

  return {
    isDuplicate: duplicateItems.length > 0,
    similarItems,
    similarityScores: similarityScores.slice(0, 10), // Return top 10 for reference
  };
}

/**
 * Check if content is too similar to existing content (for warnings)
 */
export async function checkSimilarity(
  title: string,
  content: string
): Promise<{ hasSimilarContent: boolean; similarItemIds: string[] }> {
  const result = await detectDuplicates(title, content);
  return {
    hasSimilarContent: result.isDuplicate || result.similarItems.length > 0,
    similarItemIds: result.similarItems,
  };
}

