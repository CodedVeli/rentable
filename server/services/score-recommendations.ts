import { TenantScore, User, Property } from "@shared/schema";
import { storage } from "../storage";
import { createDefaultTenantScoreIfNeeded } from "./create-default-score";
import { ScoreAnalysisResult, scoreAnalysisService } from "./score-analysis";

/**
 * Interface for property match recommendations
 */
export interface PropertyMatchRecommendation {
  propertyId: number;
  propertyTitle: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  address: string;
  city: string;
  state: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
}

/**
 * Interface for tenant score improvement recommendations
 */
export interface ScoreImprovementRecommendation {
  area: "credit" | "incomeToRent" | "rentalHistory" | "employment" | "overall";
  currentScore: number | null;
  targetScore: number;
  improvement: string;
  impact: "high" | "medium" | "low";
  timeframe: "short-term" | "medium-term" | "long-term";
  description: string;
}

/**
 * Tenant score recommendations service
 * Provides recommendations for property matches and score improvements
 */
export class ScoreRecommendationsService {
  /**
   * Recommend properties that match well with tenant's profile and score
   * @param userId The tenant user ID
   * @param limit Maximum number of recommendations to return
   * @returns Array of property match recommendations
   */
  async recommendProperties(
    userId: number,
    limit: number = 5
  ): Promise<PropertyMatchRecommendation[]> {
    const user = await storage.getUser(userId);
    
    if (!user || user.role !== 'tenant') {
      throw new Error("User not found or is not a tenant");
    }
    
    // Get tenant score (create if doesn't exist)
    const tenantScore = await createDefaultTenantScoreIfNeeded(user);
    if (!tenantScore) {
      throw new Error("Could not create or retrieve tenant score");
    }
    
    // Get available properties
    const properties = await storage.getAvailableProperties();
    
    if (!properties || properties.length === 0) {
      return [];
    }
    
    // Calculate match scores for each property
    const matchedProperties = await Promise.all(
      properties.map(async (property) => {
        const matchScore = this.calculatePropertyMatchScore(property, tenantScore, user);
        const matchReasons = this.generatePropertyMatchReasons(property, tenantScore, user);
        
        return {
          propertyId: property.id,
          propertyTitle: property.title,
          matchScore,
          matchReasons,
          address: property.address,
          city: property.city,
          state: property.state,
          rent: property.rent,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms
        };
      })
    );
    
    // Sort by match score (descending) and take the top 'limit' matches
    return matchedProperties
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }
  
  /**
   * Provide recommendations for improving tenant score
   * @param userId The tenant user ID
   * @returns Array of score improvement recommendations
   */
  async recommendScoreImprovements(
    userId: number
  ): Promise<ScoreImprovementRecommendation[]> {
    const user = await storage.getUser(userId);
    
    if (!user || user.role !== 'tenant') {
      throw new Error("User not found or is not a tenant");
    }
    
    // Get score analysis
    const scoreAnalysis = await scoreAnalysisService.analyzeTenantScore(userId);
    
    // Generate recommendations based on score analysis
    const recommendations: ScoreImprovementRecommendation[] = [];
    
    // Add credit score recommendations if applicable
    if (scoreAnalysis.breakdown.credit.rating === "needs-improvement" || 
        scoreAnalysis.breakdown.credit.rating === "fair") {
      recommendations.push(this.generateCreditScoreRecommendation(scoreAnalysis));
    }
    
    // Add income-to-rent recommendations if applicable
    if (scoreAnalysis.breakdown.incomeToRent.rating === "needs-improvement" || 
        scoreAnalysis.breakdown.incomeToRent.rating === "fair") {
      recommendations.push(this.generateIncomeToRentRecommendation(scoreAnalysis));
    }
    
    // Add rental history recommendations if applicable
    if (scoreAnalysis.breakdown.rentalHistory.rating === "needs-improvement" || 
        scoreAnalysis.breakdown.rentalHistory.rating === "fair") {
      recommendations.push(this.generateRentalHistoryRecommendation(scoreAnalysis));
    }
    
    // Add employment recommendations if applicable
    if (scoreAnalysis.breakdown.employment.rating === "needs-improvement" || 
        scoreAnalysis.breakdown.employment.rating === "fair") {
      recommendations.push(this.generateEmploymentRecommendation(scoreAnalysis));
    }
    
    // If no specific areas need improvement, add general recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        area: "overall",
        currentScore: scoreAnalysis.score.overall,
        targetScore: Math.min(850, Math.round(scoreAnalysis.score.overall * 1.05)), // 5% improvement
        improvement: "Maintain excellent tenant profile",
        impact: "medium",
        timeframe: "medium-term",
        description: "Continue your excellent financial habits and rental practices to maintain your strong tenant profile."
      });
    }
    
    return recommendations;
  }
  
  /**
   * Calculate match score between a property and tenant
   * @param property The property to evaluate
   * @param tenantScore The tenant's score
   * @param user The tenant user
   * @returns Match score (0-100)
   */
  private calculatePropertyMatchScore(
    property: Property,
    tenantScore: TenantScore,
    user: User
  ): number {
    // Base score starts at 50
    let score = 50;
    
    // Adjust score based on tenant's financial profile
    // Higher income-to-rent score increases match
    if (tenantScore.incomeToRentScore) {
      // Measure how well the tenant can afford this property
      const affordabilityFactor = tenantScore.incomeToRentScore / 10; // 0-10 scale
      score += affordabilityFactor * 2; // Up to 20 points
    }
    
    // Credit score impacts financing approval
    if (tenantScore.creditScore) {
      if (tenantScore.creditScore >= 700) {
        score += 10;
      } else if (tenantScore.creditScore >= 650) {
        score += 5;
      }
    }
    
    // Strong rental history is important
    if (tenantScore.rentalHistoryScore && tenantScore.rentalHistoryScore > 70) {
      score += 5;
    }
    
    // Adjust based on property characteristics
    // This would normally involve more complex matching with tenant preferences
    // For demo purposes, we're using some simple heuristics
    
    // Use deterministic match based on property and user IDs
    const matchSeed = property.id * user.id % 100;
    score += (matchSeed % 21) - 10; // -10 to +10 points
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Generate reasons for property match
   * @param property The property to evaluate
   * @param tenantScore The tenant's score
   * @param user The tenant user
   * @returns Array of match reasons
   */
  private generatePropertyMatchReasons(
    property: Property,
    tenantScore: TenantScore,
    user: User
  ): string[] {
    const reasons: string[] = [];
    
    // Add financial compatibility reasons
    if (tenantScore.incomeToRentScore && tenantScore.incomeToRentScore >= 70) {
      reasons.push("Your income-to-rent ratio indicates this property is within your budget");
    }
    
    if (tenantScore.creditScore && tenantScore.creditScore >= 670) {
      reasons.push("Your credit score meets typical requirements for this property");
    }
    
    // Add property feature reasons (using deterministic approach for demo)
    const featureSeed = (property.id + user.id) % 10;
    
    // Property size match
    if (featureSeed % 3 === 0) {
      reasons.push(`${property.bedrooms} bedroom layout matches your space preferences`);
    }
    
    // Location match
    if (featureSeed % 3 === 1) {
      reasons.push(`${property.city} location aligns with your preferred area`);
    }
    
    // Amenity match
    if (featureSeed % 3 === 2) {
      reasons.push("Property features align with your preferences");
    }
    
    // Add a default reason if we don't have enough
    if (reasons.length < 2) {
      reasons.push("Property matches your overall tenant profile");
    }
    
    return reasons;
  }
  
  /**
   * Generate credit score improvement recommendation
   */
  private generateCreditScoreRecommendation(
    analysis: ScoreAnalysisResult
  ): ScoreImprovementRecommendation {
    const currentScore = analysis.score.credit;
    const targetScore = currentScore ? Math.min(850, currentScore + 50) : 650;
    
    return {
      area: "credit",
      currentScore,
      targetScore,
      improvement: "Improve credit score",
      impact: "high",
      timeframe: "medium-term",
      description: "Pay down existing debt, ensure on-time payments, and reduce credit utilization to below 30%. Consider requesting credit report corrections if there are errors."
    };
  }
  
  /**
   * Generate income-to-rent ratio improvement recommendation
   */
  private generateIncomeToRentRecommendation(
    analysis: ScoreAnalysisResult
  ): ScoreImprovementRecommendation {
    const currentScore = analysis.score.incomeToRent;
    const targetScore = currentScore ? Math.min(100, currentScore + 20) : 70;
    
    return {
      area: "incomeToRent",
      currentScore,
      targetScore,
      improvement: "Improve income-to-rent ratio",
      impact: "high",
      timeframe: "medium-term",
      description: "Focus on properties with lower rent relative to your income, seek additional income sources, or consider a co-signer for applications to higher-rent properties."
    };
  }
  
  /**
   * Generate rental history improvement recommendation
   */
  private generateRentalHistoryRecommendation(
    analysis: ScoreAnalysisResult
  ): ScoreImprovementRecommendation {
    const currentScore = analysis.score.rentalHistory;
    const targetScore = currentScore ? Math.min(100, currentScore + 25) : 65;
    
    return {
      area: "rentalHistory",
      currentScore,
      targetScore,
      improvement: "Improve rental history",
      impact: "medium",
      timeframe: "long-term",
      description: "Maintain a perfect payment record with your current lease, request positive reference letters from previous landlords, and ensure you leave your current rental in excellent condition."
    };
  }
  
  /**
   * Generate employment improvement recommendation
   */
  private generateEmploymentRecommendation(
    analysis: ScoreAnalysisResult
  ): ScoreImprovementRecommendation {
    const currentScore = analysis.score.employment;
    const targetScore = currentScore ? Math.min(100, currentScore + 20) : 70;
    
    return {
      area: "employment",
      currentScore,
      targetScore,
      improvement: "Improve employment stability",
      impact: "medium",
      timeframe: "long-term",
      description: "Maintain your current position for at least 1-2 years to demonstrate employment stability. If changing jobs, ensure it's for better pay or advancement rather than lateral moves."
    };
  }
}

export const scoreRecommendationsService = new ScoreRecommendationsService();