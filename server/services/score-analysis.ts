import { TenantScore, User } from "@shared/schema";
import { storage } from "../storage";
import { createDefaultTenantScoreIfNeeded } from "./create-default-score";

export interface ScoreAnalysisResult {
  score: {
    overall: number;
    credit: number | null;
    incomeToRent: number | null;
    rentalHistory: number | null;
    employment: number | null;
  };
  status: "excellent" | "good" | "fair" | "needs-improvement" | "insufficient-data";
  breakdown: {
    credit: {
      score: number | null;
      rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
      notes: string;
    };
    incomeToRent: {
      score: number | null;
      rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
      notes: string;
    };
    rentalHistory: {
      score: number | null;
      rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
      notes: string;
    };
    employment: {
      score: number | null;
      rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
      notes: string;
    }
  };
  recommendations: string[];
  improvementAreas: string[];
  lastUpdated: Date | null;
}

export class ScoreAnalysisService {
  /**
   * Analyze a tenant's score and provide detailed breakdown and recommendations
   * @param userId The user ID of the tenant
   * @returns Score analysis result with breakdown and recommendations
   */
  async analyzeTenantScore(userId: number): Promise<ScoreAnalysisResult> {
    const user = await storage.getUser(userId);
    if (!user || user.role !== 'tenant') {
      throw new Error("User not found or is not a tenant");
    }
    
    // Create a default score if the tenant doesn't have one
    let tenantScore = await createDefaultTenantScoreIfNeeded(user);
    if (!tenantScore) {
      throw new Error("Could not create or retrieve tenant score");
    }
    
    return this.generateAnalysis(tenantScore, user);
  }
  
  /**
   * Generate score analysis based on tenant score data
   * @param score The tenant score to analyze
   * @param user The user associated with the score
   * @returns Detailed score analysis with recommendations
   */
  private generateAnalysis(score: TenantScore, user: User): ScoreAnalysisResult {
    // Prepare the score data
    const scoreData = {
      overall: score.overallScore,
      credit: score.creditScore,
      incomeToRent: score.incomeToRentScore,
      rentalHistory: score.rentalHistoryScore,
      employment: score.employmentScore
    };
    
    // Determine overall status
    let status: ScoreAnalysisResult['status'] = "good";
    
    if (score.overallScore >= 720) {
      status = "excellent";
    } else if (score.overallScore >= 670) {
      status = "good";
    } else if (score.overallScore >= 580) {
      status = "fair";
    } else {
      status = "needs-improvement";
    }
    
    // Analyze each component
    const creditAnalysis = this.analyzeCreditScore(score.creditScore);
    const incomeAnalysis = this.analyzeIncomeToRentScore(score.incomeToRentScore);
    const rentalAnalysis = this.analyzeRentalHistoryScore(score.rentalHistoryScore);
    const employmentAnalysis = this.analyzeEmploymentScore(score.employmentScore);
    
    // Build breakdown object
    const breakdown = {
      credit: creditAnalysis,
      incomeToRent: incomeAnalysis,
      rentalHistory: rentalAnalysis,
      employment: employmentAnalysis
    };
    
    // Generate recommendations based on analysis
    const recommendations = this.generateRecommendations(score, breakdown);
    
    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(breakdown);
    
    return {
      score: scoreData,
      status,
      breakdown,
      recommendations,
      improvementAreas,
      lastUpdated: score.updatedAt
    };
  }
  
  /**
   * Analyze credit score component
   */
  private analyzeCreditScore(score: number | null): {
    score: number | null;
    rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
    notes: string;
  } {
    if (score === null) {
      return {
        score: null,
        rating: "n/a",
        notes: "No credit score data available. Consider requesting a credit check."
      };
    }
    
    let rating: "excellent" | "good" | "fair" | "needs-improvement";
    let notes: string;
    
    if (score >= 740) {
      rating = "excellent";
      notes = "Excellent credit score that exceeds most landlord requirements. Demonstrates strong financial responsibility.";
    } else if (score >= 670) {
      rating = "good";
      notes = "Good credit score that meets standard landlord requirements. Shows consistent financial management.";
    } else if (score >= 580) {
      rating = "fair";
      notes = "Fair credit score that may meet minimum requirements for many properties, though premium properties may require higher scores.";
    } else {
      rating = "needs-improvement";
      notes = "Credit score below typical rental requirements. May face challenges with approval or require additional security deposit.";
    }
    
    return { score, rating, notes };
  }
  
  /**
   * Analyze income to rent ratio score component
   */
  private analyzeIncomeToRentScore(score: number | null): {
    score: number | null;
    rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
    notes: string;
  } {
    if (score === null) {
      return {
        score: null,
        rating: "n/a",
        notes: "No income-to-rent data available. Consider providing income verification."
      };
    }
    
    let rating: "excellent" | "good" | "fair" | "needs-improvement";
    let notes: string;
    
    if (score >= 90) {
      rating = "excellent";
      notes = "Excellent income-to-rent ratio. Income significantly exceeds typical rent burden recommendations.";
    } else if (score >= 70) {
      rating = "good";
      notes = "Good income-to-rent ratio. Income comfortably covers rent with room for other expenses.";
    } else if (score >= 50) {
      rating = "fair";
      notes = "Fair income-to-rent ratio. Income is sufficient for rent but may be stretched for higher-priced properties.";
    } else {
      rating = "needs-improvement";
      notes = "Income-to-rent ratio below recommended levels. May face affordability challenges or require a guarantor.";
    }
    
    return { score, rating, notes };
  }
  
  /**
   * Analyze rental history score component
   */
  private analyzeRentalHistoryScore(score: number | null): {
    score: number | null;
    rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
    notes: string;
  } {
    if (score === null) {
      return {
        score: null,
        rating: "n/a",
        notes: "No rental history data available. Consider providing references from previous landlords."
      };
    }
    
    let rating: "excellent" | "good" | "fair" | "needs-improvement";
    let notes: string;
    
    if (score >= 90) {
      rating = "excellent";
      notes = "Excellent rental history. Demonstrates consistent on-time payments and property care.";
    } else if (score >= 70) {
      rating = "good";
      notes = "Good rental history. Shows reliable payment record with few or minor issues.";
    } else if (score >= 50) {
      rating = "fair";
      notes = "Fair rental history. May have some late payments or minor issues but generally acceptable.";
    } else {
      rating = "needs-improvement";
      notes = "Rental history shows patterns that may concern landlords. Consider addressing past issues in applications.";
    }
    
    return { score, rating, notes };
  }
  
  /**
   * Analyze employment score component
   */
  private analyzeEmploymentScore(score: number | null): {
    score: number | null;
    rating: "excellent" | "good" | "fair" | "needs-improvement" | "n/a";
    notes: string;
  } {
    if (score === null) {
      return {
        score: null,
        rating: "n/a",
        notes: "No employment stability data available. Consider providing employment history."
      };
    }
    
    let rating: "excellent" | "good" | "fair" | "needs-improvement";
    let notes: string;
    
    if (score >= 90) {
      rating = "excellent";
      notes = "Excellent employment stability. Long-term position with reliable income source.";
    } else if (score >= 70) {
      rating = "good";
      notes = "Good employment record. Steady employment with reasonable job tenure.";
    } else if (score >= 50) {
      rating = "fair";
      notes = "Fair employment history. May have changed jobs but maintains consistent employment.";
    } else {
      rating = "needs-improvement";
      notes = "Employment history shows gaps or instability that may concern landlords.";
    }
    
    return { score, rating, notes };
  }
  
  /**
   * Generate personalized recommendations based on score analysis
   */
  private generateRecommendations(
    score: TenantScore, 
    breakdown: ScoreAnalysisResult['breakdown']
  ): string[] {
    const recommendations: string[] = [];
    
    // Add overall recommendations
    if (score.overallScore >= 700) {
      recommendations.push(
        "Apply for premium properties with confidence. Your strong overall score makes you an attractive tenant.",
        "Consider negotiating rental terms or requesting amenity upgrades when applying."
      );
    } else if (score.overallScore >= 600) {
      recommendations.push(
        "Focus applications on properties in your qualification range to maximize approval chances.",
        "Provide additional references to strengthen your application."
      );
    } else {
      recommendations.push(
        "Consider properties with less competitive application requirements.",
        "Offer a higher security deposit to offset landlord concerns."
      );
    }
    
    // Add specific recommendations based on lowest scores
    const lowestComponent = this.identifyLowestComponent(breakdown);
    
    if (lowestComponent === "credit") {
      recommendations.push(
        "Focus on improving credit score by paying down existing debt.",
        "Check your credit report for errors and dispute any inaccuracies."
      );
    } else if (lowestComponent === "incomeToRent") {
      recommendations.push(
        "Consider properties with lower rent to improve your income-to-rent ratio.",
        "Look for opportunities to increase income or consider a co-signer."
      );
    } else if (lowestComponent === "rentalHistory") {
      recommendations.push(
        "Obtain positive references from previous landlords if possible.",
        "Provide an explanation letter addressing any negative rental history issues."
      );
    } else if (lowestComponent === "employment") {
      recommendations.push(
        "Highlight job stability in your application, even if you've changed employers.",
        "Provide additional employment verification or income documentation."
      );
    }
    
    return recommendations;
  }
  
  /**
   * Identify key areas for improvement based on score breakdown
   */
  private identifyImprovementAreas(breakdown: ScoreAnalysisResult['breakdown']): string[] {
    const areas: string[] = [];
    
    if (breakdown.credit.rating === "needs-improvement" || breakdown.credit.rating === "fair") {
      areas.push("Improve credit score by paying bills on time and reducing debt");
    }
    
    if (breakdown.incomeToRent.rating === "needs-improvement" || breakdown.incomeToRent.rating === "fair") {
      areas.push("Increase income or seek more affordable housing to improve rent-to-income ratio");
    }
    
    if (breakdown.rentalHistory.rating === "needs-improvement" || breakdown.rentalHistory.rating === "fair") {
      areas.push("Build positive rental history by maintaining perfect payment record on current lease");
    }
    
    if (breakdown.employment.rating === "needs-improvement" || breakdown.employment.rating === "fair") {
      areas.push("Improve employment stability by maintaining current position or seeking longer-term employment");
    }
    
    // If no specific areas need improvement, provide general advice
    if (areas.length === 0) {
      areas.push("Maintain your current excellent standing by continuing responsible financial habits");
    }
    
    return areas;
  }
  
  /**
   * Identify the lowest scoring component to target recommendations
   */
  private identifyLowestComponent(breakdown: ScoreAnalysisResult['breakdown']): 
    "credit" | "incomeToRent" | "rentalHistory" | "employment" | null {
    
    const components = [
      { name: "credit" as const, score: breakdown.credit.score },
      { name: "incomeToRent" as const, score: breakdown.incomeToRent.score },
      { name: "rentalHistory" as const, score: breakdown.rentalHistory.score },
      { name: "employment" as const, score: breakdown.employment.score }
    ];
    
    // Filter out null scores
    const validComponents = components.filter(c => c.score !== null);
    
    if (validComponents.length === 0) {
      return null;
    }
    
    // Find the component with the lowest score
    return validComponents.reduce((lowest, current) => {
      if ((current.score as number) < (lowest.score as number)) {
        return current;
      }
      return lowest;
    }, validComponents[0]).name;
  }
}

export const scoreAnalysisService = new ScoreAnalysisService();