export interface PointsActivity {
  action: string
  points: number
}

export const pointsSystem: Record<string, number> = {
  createKnowledge: 50,
  validateKnowledge: 25,
  commentOnItem: 5,
  receivestar: 10,
  editKnowledge: 15,
  helpfulComment: 20,
  trendingItem: 100,
  dailyStreak: 30,
}

export function calculatePoints(action: string): number {
  return pointsSystem[action] || 0
}

export function getLevelFromPoints(points: number): { level: number; nextLevelPoints: number; progress: number } {
  const pointsPerLevel = 500
  const level = Math.floor(points / pointsPerLevel) + 1
  const currentLevelPoints = (level - 1) * pointsPerLevel
  const nextLevelPoints = level * pointsPerLevel
  const progress = ((points - currentLevelPoints) / pointsPerLevel) * 100

  return { level, nextLevelPoints, progress }
}

export function getBadge(contributions: number, validations: number, points: number): string[] {
  const badges: string[] = []

  if (contributions >= 1) badges.push("First Contribution")
  if (contributions >= 50) badges.push("Prolific Creator")
  if (contributions >= 100) badges.push("Knowledge Master")

  if (validations >= 10) badges.push("Validator")
  if (validations >= 50) badges.push("Knowledge Champion")
  if (validations >= 100) badges.push("Master Validator")

  if (points >= 1000) badges.push("Rising Star")
  if (points >= 5000) badges.push("Super Contributor")
  if (points >= 10000) badges.push("Legend")

  return badges
}
