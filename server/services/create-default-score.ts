import { User, TenantScore, InsertTenantScore } from "@shared/schema";
import { storage } from "../storage";

/**
 * Creates a default tenant score for a user if they don't already have one
 * @param user The user to create a score for
 * @returns The created tenant score or null if creation failed
 */
export async function createDefaultTenantScoreIfNeeded(
  user: User
): Promise<TenantScore | null> {
  if (user.role !== 'tenant') {
    return null; // Only tenants can have scores
  }

  // Check if user already has a score
  const existingScores = await storage.getTenantScoresByTenant(user.id);
  if (existingScores && existingScores.length > 0) {
    return existingScores[0]; // Return the first score if user already has one
  }

  // Create a default score with standard baseline values
  // In a real application, these would be calculated based on verified data
  const defaultScore: InsertTenantScore = {
    tenantId: user.id,
    landlordId: null,
    propertyId: null,
    applicationId: null,
    active: true,
    overallScore: 650, // Middle-range starting score
    creditScore: null, // Requires credit check
    incomeToRentRatio: null, // Requires income verification
    rentalHistory: null, // Requires rental history verification
    employmentStability: null, // Requires employment verification
    identityVerificationScore: null,
    referenceScore: null,
    applicationQualityScore: null,
    paymentHistoryScore: null, 
    promptnessScore: null,
    evictionHistoryScore: null,
    criminalCheckScore: null,
    scoringMethod: 'standard',
    scoreBreakdown: JSON.stringify({
      credit: { score: null, weight: 0.25, status: 'pending' },
      income: { score: null, weight: 0.25, status: 'pending' },
      rentalHistory: { score: null, weight: 0.25, status: 'pending' },
      employment: { score: null, weight: 0.25, status: 'pending' }
    }),
  };

  try {
    const newScore = await storage.createTenantScore(defaultScore);
    return newScore;
  } catch (error) {
    console.error("Failed to create default tenant score:", error);
    return null;
  }
}