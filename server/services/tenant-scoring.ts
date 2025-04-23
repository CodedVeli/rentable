import { 
  TenantScore, 
  InsertTenantScore,
  User,
  Application,
  EmploymentHistory,
  TenantRentalHistory,
  Reference,
  CreditCheck,
  Payment
} from '@shared/schema';
import { storage } from '../storage';

type ScoringMethod = 'comprehensive' | 'basic' | 'credit-only';

interface TenantScoreWeights {
  creditScore: number;
  incomeToRentRatio: number;
  rentalHistory: number;
  employmentStability: number;
  identityVerification: number;
  references: number;
  applicationQuality: number;
  paymentHistory: number;
  promptness: number;
  evictionHistory: number;
}

// Default weights for comprehensive scoring method
const COMPREHENSIVE_WEIGHTS: TenantScoreWeights = {
  creditScore: 25,
  incomeToRentRatio: 20,
  rentalHistory: 15,
  employmentStability: 10,
  identityVerification: 5,
  references: 10,
  applicationQuality: 5,
  paymentHistory: 5,
  promptness: 3,
  evictionHistory: 2
};

// Basic weights - simplified scoring with fewer factors
const BASIC_WEIGHTS: TenantScoreWeights = {
  creditScore: 40,
  incomeToRentRatio: 30,
  rentalHistory: 20,
  employmentStability: 10,
  identityVerification: 0,
  references: 0,
  applicationQuality: 0,
  paymentHistory: 0,
  promptness: 0,
  evictionHistory: 0
};

// Credit-only weights - just focus on credit score
const CREDIT_ONLY_WEIGHTS: TenantScoreWeights = {
  creditScore: 100,
  incomeToRentRatio: 0,
  rentalHistory: 0,
  employmentStability: 0,
  identityVerification: 0,
  references: 0,
  applicationQuality: 0,
  paymentHistory: 0,
  promptness: 0,
  evictionHistory: 0
};

// Get the appropriate weights based on scoring method
function getWeights(method: ScoringMethod): TenantScoreWeights {
  switch (method) {
    case 'comprehensive':
      return COMPREHENSIVE_WEIGHTS;
    case 'basic':
      return BASIC_WEIGHTS;
    case 'credit-only':
      return CREDIT_ONLY_WEIGHTS;
    default:
      return COMPREHENSIVE_WEIGHTS;
  }
}

// Calculate credit score component (0-100)
async function calculateCreditScoreComponent(
  userId: number, 
  applicationId: number | null = null
): Promise<number | null> {
  try {
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) return null;
    
    // Check if user has a credit score directly on their profile
    if (user.creditScore) {
      // Map credit score (typically 300-850) to a 0-100 scale
      return mapCreditScoreTo100(user.creditScore);
    }
    
    // Check for credit check reports
    let creditChecks: CreditCheck[];
    if (applicationId) {
      creditChecks = await storage.getCreditChecksByApplication(applicationId);
    } else {
      creditChecks = await storage.getCreditChecksByUser(userId);
    }
    
    // Find the most recent completed credit check
    const completedChecks = creditChecks
      .filter(check => check.status === 'completed' && check.score !== null)
      .sort((a, b) => b.completedDate?.getTime() || 0 - (a.completedDate?.getTime() || 0));
    
    if (completedChecks.length > 0 && completedChecks[0].score) {
      return mapCreditScoreTo100(completedChecks[0].score);
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating credit score component:', error);
    return null;
  }
}

// Map a standard credit score (300-850) to a 0-100 scale
function mapCreditScoreTo100(creditScore: number): number {
  // Canadian credit scores typically range from 300 to 900
  const MIN_CREDIT_SCORE = 300;
  const MAX_CREDIT_SCORE = 900;
  const RANGE = MAX_CREDIT_SCORE - MIN_CREDIT_SCORE;
  
  // Clamp the credit score to the valid range
  const clampedScore = Math.max(MIN_CREDIT_SCORE, Math.min(creditScore, MAX_CREDIT_SCORE));
  
  // Map to 0-100 scale
  return Math.round(((clampedScore - MIN_CREDIT_SCORE) / RANGE) * 100);
}

// Calculate income-to-rent ratio component (0-100)
async function calculateIncomeToRentRatioComponent(
  userId: number,
  applicationId: number | null = null,
  rentAmount: number | null = null
): Promise<number | null> {
  try {
    // Get employment histories to calculate income
    const employmentHistories = await storage.getEmploymentHistoriesByTenant(userId);
    if (employmentHistories.length === 0) return null;
    
    // Calculate total monthly income from current employment
    const currentEmployments = employmentHistories.filter(history => history.currentEmployer);
    let monthlyIncome = currentEmployments.reduce((total, job) => {
      return total + (job.monthlyIncome || 0);
    }, 0);
    
    // If no current employment, use the most recent past employment
    if (monthlyIncome === 0 && employmentHistories.length > 0) {
      const sortedHistories = [...employmentHistories].sort((a, b) => {
        const aEnd = a.endDate ? new Date(a.endDate).getTime() : Date.now();
        const bEnd = b.endDate ? new Date(b.endDate).getTime() : Date.now();
        return bEnd - aEnd; // Most recent first
      });
      
      monthlyIncome = sortedHistories[0].monthlyIncome || 0;
    }
    
    // If no rent amount is provided, try to get it from the application
    let actualRentAmount = rentAmount;
    if (!actualRentAmount && applicationId) {
      const application = await storage.getApplication(applicationId);
      if (application) {
        const property = await storage.getProperty(application.propertyId);
        if (property) {
          actualRentAmount = property.monthlyRent;
        }
      }
    }
    
    // Cannot calculate without both income and rent
    if (monthlyIncome === 0 || !actualRentAmount) return null;
    
    // Calculate ratio: income / rent
    const ratio = monthlyIncome / actualRentAmount;
    
    // Convert ratio to a score
    // Industry standard suggests income should be at least 3x the rent
    // <2.0 = poor, 2.0-2.5 = fair, 2.5-3.0 = good, >3.0 = excellent
    if (ratio >= 3.5) return 100;  // Excellent
    if (ratio >= 3.0) return 90;   // Very good
    if (ratio >= 2.5) return 75;   // Good
    if (ratio >= 2.0) return 60;   // Fair
    if (ratio >= 1.5) return 40;   // Poor
    return Math.max(0, Math.round(ratio * 25)); // Very poor, scaled
  } catch (error) {
    console.error('Error calculating income-to-rent ratio component:', error);
    return null;
  }
}

// Calculate rental history component (0-100)
async function calculateRentalHistoryComponent(userId: number): Promise<number | null> {
  try {
    const rentalHistories = await storage.getTenantRentalHistoriesByTenant(userId);
    if (rentalHistories.length === 0) return null;
    
    // Calculate weighted average of rental history factors
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const history of rentalHistories) {
      let historyScore = 0;
      let historyWeight = 1;
      
      // Base points for having a rental history
      historyScore += 60;
      
      // Bonus for verified history
      if (history.verified) {
        historyScore += 20;
        historyWeight += 0.5; // Give more weight to verified histories
      }
      
      // Bonus for on-time payments
      if (history.onTimePaymentPercentage !== null) {
        if (history.onTimePaymentPercentage >= 95) historyScore += 20;
        else if (history.onTimePaymentPercentage >= 90) historyScore += 15;
        else if (history.onTimePaymentPercentage >= 80) historyScore += 10;
        else if (history.onTimePaymentPercentage >= 70) historyScore += 5;
        else historyScore -= 10; // Penalty for poor payment history
      }
      
      // Penalty for negative reason for leaving
      if (history.reasonForLeaving) {
        const negativeReasons = ['eviction', 'evicted', 'non-payment', 'damage', 'violations', 'complaints'];
        if (negativeReasons.some(reason => history.reasonForLeaving?.toLowerCase().includes(reason))) {
          historyScore -= 30;
        }
      }
      
      // Bonus for good property condition
      if (history.propertyCondition) {
        switch (history.propertyCondition) {
          case 'excellent':
            historyScore += 10;
            break;
          case 'good':
            historyScore += 5;
            break;
          case 'fair':
            // No bonus or penalty
            break;
          case 'poor':
            historyScore -= 10;
            break;
        }
      }
      
      // Calculate duration of tenancy in months
      if (history.startDate && history.endDate) {
        const start = new Date(history.startDate);
        const end = new Date(history.endDate);
        const durationMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                              (end.getMonth() - start.getMonth());
        
        // Bonus for longer tenancy
        if (durationMonths >= 24) { // 2+ years
          historyScore += 10;
          historyWeight += 0.5; // Give more weight to longer histories
        } else if (durationMonths >= 12) { // 1+ year
          historyScore += 5;
        } else if (durationMonths < 6) { // Less than 6 months
          historyScore -= 5; // Slight penalty for very short tenancy
        }
      }
      
      // Ensure the score is in the 0-100 range
      historyScore = Math.max(0, Math.min(100, historyScore));
      
      totalScore += historyScore * historyWeight;
      totalWeight += historyWeight;
    }
    
    return Math.round(totalScore / totalWeight);
  } catch (error) {
    console.error('Error calculating rental history component:', error);
    return null;
  }
}

// Calculate employment stability component (0-100)
async function calculateEmploymentStabilityComponent(userId: number): Promise<number | null> {
  try {
    const employmentHistories = await storage.getEmploymentHistoriesByTenant(userId);
    if (employmentHistories.length === 0) return null;
    
    // Start with a base score
    let stabilityScore = 50;
    
    // Award points for current employment
    const currentEmployments = employmentHistories.filter(job => job.currentEmployer);
    if (currentEmployments.length > 0) {
      stabilityScore += 20; // Currently employed
      
      // Calculate duration of current employment
      const longestCurrentJob = currentEmployments.reduce((longest, job) => {
        const jobDuration = calculateJobDuration(job);
        const longestDuration = longest ? calculateJobDuration(longest) : 0;
        return jobDuration > longestDuration ? job : longest;
      }, null as EmploymentHistory | null);
      
      if (longestCurrentJob) {
        const durationMonths = calculateJobDuration(longestCurrentJob);
        
        // Bonus for employment duration
        if (durationMonths >= 60) stabilityScore += 30; // 5+ years
        else if (durationMonths >= 36) stabilityScore += 25; // 3+ years
        else if (durationMonths >= 24) stabilityScore += 20; // 2+ years
        else if (durationMonths >= 12) stabilityScore += 15; // 1+ year
        else if (durationMonths >= 6) stabilityScore += 10; // 6+ months
        else stabilityScore += 5; // At least employed
      }
    } else {
      // Penalty for no current employment
      stabilityScore -= 20;
      
      // Check if they have recent past employment (within last 3 months)
      const recentPastEmployment = employmentHistories.some(job => {
        if (!job.endDate) return false;
        const endDate = new Date(job.endDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return endDate >= threeMonthsAgo;
      });
      
      if (recentPastEmployment) {
        stabilityScore += 10; // Recently employed, so not as severe a penalty
      }
    }
    
    // Award points for employment history length
    const totalEmploymentMonths = employmentHistories.reduce((total, job) => {
      return total + calculateJobDuration(job);
    }, 0);
    
    if (totalEmploymentMonths >= 60) stabilityScore += 10; // 5+ years total employment
    else if (totalEmploymentMonths >= 36) stabilityScore += 7; // 3+ years
    else if (totalEmploymentMonths >= 24) stabilityScore += 5; // 2+ years
    
    // Calculate job change frequency (penalty for frequent changes)
    if (employmentHistories.length > 1) {
      const jobsPerYear = employmentHistories.length / (totalEmploymentMonths / 12);
      if (jobsPerYear > 1.5) stabilityScore -= 10; // More than 1.5 jobs per year
      else if (jobsPerYear > 1) stabilityScore -= 5; // More than 1 job per year
    }
    
    // Bonus for verified employment
    const verifiedJobs = employmentHistories.filter(job => job.verified);
    if (verifiedJobs.length > 0) {
      stabilityScore += 10;
    }
    
    // Ensure score is in 0-100 range
    return Math.max(0, Math.min(100, stabilityScore));
  } catch (error) {
    console.error('Error calculating employment stability component:', error);
    return null;
  }
}

// Helper function to calculate job duration in months
function calculateJobDuration(job: EmploymentHistory): number {
  const startDate = new Date(job.startDate);
  const endDate = job.endDate ? new Date(job.endDate) : new Date();
  
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  
  return yearDiff * 12 + monthDiff;
}

// Calculate identity verification component (0-100)
async function calculateIdentityVerificationComponent(userId: number): Promise<number | null> {
  try {
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) return null;
    
    // Start with a base score
    let verificationScore = 0;
    
    // Check verification status
    switch (user.verificationStatus) {
      case 'verified':
        verificationScore = 100;
        break;
      case 'pending':
        verificationScore = 50;
        break;
      case 'rejected':
        verificationScore = 10;
        break;
      case 'unverified':
      default:
        verificationScore = 0;
        break;
    }
    
    // Additional verification checks
    if (user.identityVerification) {
      // If there's structured data in the identity verification field
      const verification = user.identityVerification as any;
      
      // Bonus for having ID verification
      verificationScore += 20;
      
      // Additional checks based on the verification data structure
      if (verification.matchConfidence) {
        const confidence = parseFloat(verification.matchConfidence);
        if (confidence >= 0.9) verificationScore += 20;
        else if (confidence >= 0.8) verificationScore += 15;
        else if (confidence >= 0.7) verificationScore += 10;
        else if (confidence >= 0.6) verificationScore += 5;
      }
      
      // Ensure score is in 0-100 range
      verificationScore = Math.min(100, verificationScore);
    }
    
    return verificationScore;
  } catch (error) {
    console.error('Error calculating identity verification component:', error);
    return null;
  }
}

// Calculate reference component (0-100)
async function calculateReferenceComponent(
  userId: number, 
  applicationId: number | null = null
): Promise<number | null> {
  try {
    // Get references
    let references: Reference[];
    if (applicationId) {
      references = await storage.getReferencesByApplication(applicationId);
    } else {
      references = await storage.getReferencesByTenant(userId);
    }
    
    if (references.length === 0) return null;
    
    // Base score
    let referenceScore = 50;
    
    // Bonus for number of references
    if (references.length >= 3) referenceScore += 15;
    else if (references.length >= 2) referenceScore += 10;
    else referenceScore += 5;
    
    // Analyze reference types
    const hasLandlordReference = references.some(ref => ref.referenceType === 'landlord');
    const hasProfessionalReference = references.some(ref => ref.referenceType === 'professional');
    
    if (hasLandlordReference) referenceScore += 15;
    if (hasProfessionalReference) referenceScore += 10;
    
    // Analyze verification
    const verifiedReferences = references.filter(ref => ref.verified);
    if (verifiedReferences.length === references.length && references.length > 0) {
      referenceScore += 15; // All references verified
    } else if (verifiedReferences.length > 0) {
      referenceScore += 10; // Some references verified
    }
    
    // Analyze ratings (if available)
    const ratingsAvailable = references.filter(ref => ref.rating !== null).length;
    if (ratingsAvailable > 0) {
      const averageRating = references.reduce((sum, ref) => sum + (ref.rating || 0), 0) / ratingsAvailable;
      
      // Rating typically 1-5 or 1-10
      const normalizedRating = averageRating > 5 ? averageRating / 2 : averageRating;
      const ratingScore = (normalizedRating / 5) * 20; // Convert to a 0-20 scale
      referenceScore += ratingScore;
    }
    
    // Ensure score is in 0-100 range
    return Math.max(0, Math.min(100, referenceScore));
  } catch (error) {
    console.error('Error calculating reference component:', error);
    return null;
  }
}

// Calculate application quality component (0-100)
async function calculateApplicationQualityComponent(
  userId: number,
  applicationId: number | null = null
): Promise<number | null> {
  try {
    if (!applicationId) return null;
    
    const application = await storage.getApplication(applicationId);
    if (!application) return null;
    
    // Base score
    let qualityScore = 50;
    
    // Check for completeness
    if (application.income) qualityScore += 10;
    if (application.notes) qualityScore += 5;
    if (application.creditCheck) qualityScore += 10;
    
    // Check for references
    const references = await storage.getReferencesByApplication(applicationId);
    if (references.length >= 3) qualityScore += 15;
    else if (references.length >= 2) qualityScore += 10;
    else if (references.length >= 1) qualityScore += 5;
    
    // Bonus for detailed notes
    if (application.notes && application.notes.length > 100) qualityScore += 5;
    
    // Ensure score is in 0-100 range
    return Math.max(0, Math.min(100, qualityScore));
  } catch (error) {
    console.error('Error calculating application quality component:', error);
    return null;
  }
}

// Calculate payment history component (0-100)
async function calculatePaymentHistoryComponent(userId: number): Promise<number | null> {
  try {
    // Get payments made by this tenant
    const payments = await storage.getPaymentsByTenant(userId);
    if (payments.length === 0) return null;
    
    // Count on-time, late, and missed payments
    const totalPayments = payments.length;
    const onTimePayments = payments.filter(payment => 
      payment.status === 'paid' && 
      payment.paidDate && 
      payment.dueDate && 
      new Date(payment.paidDate) <= new Date(payment.dueDate)
    ).length;
    
    const latePayments = payments.filter(payment => 
      payment.status === 'paid' && 
      payment.paidDate && 
      payment.dueDate && 
      new Date(payment.paidDate) > new Date(payment.dueDate)
    ).length;
    
    const missedPayments = payments.filter(payment => 
      (payment.status === 'failed' || payment.dueDate && new Date(payment.dueDate) < new Date() && payment.status !== 'paid')
    ).length;
    
    // Calculate percentages
    const onTimePercentage = (onTimePayments / totalPayments) * 100;
    const latePercentage = (latePayments / totalPayments) * 100;
    const missedPercentage = (missedPayments / totalPayments) * 100;
    
    // Calculate score
    let paymentHistoryScore = 0;
    
    if (onTimePercentage >= 95) paymentHistoryScore = 100;
    else if (onTimePercentage >= 90) paymentHistoryScore = 90;
    else if (onTimePercentage >= 85) paymentHistoryScore = 80;
    else if (onTimePercentage >= 80) paymentHistoryScore = 70;
    else if (onTimePercentage >= 75) paymentHistoryScore = 60;
    else if (onTimePercentage >= 70) paymentHistoryScore = 50;
    else if (onTimePercentage >= 60) paymentHistoryScore = 40;
    else if (onTimePercentage >= 50) paymentHistoryScore = 30;
    else paymentHistoryScore = 20;
    
    // Severe penalty for missed payments
    if (missedPercentage > 10) paymentHistoryScore -= 20;
    else if (missedPercentage > 5) paymentHistoryScore -= 10;
    
    // Ensure score is in 0-100 range
    return Math.max(0, Math.min(100, paymentHistoryScore));
  } catch (error) {
    console.error('Error calculating payment history component:', error);
    return null;
  }
}

// Calculate promptness score for how quickly the tenant responds/acts (0-100)
async function calculatePromptnessComponent(userId: number): Promise<number | null> {
  try {
    // Get user data: messages, applications, payments
    const user = await storage.getUser(userId);
    if (!user) return null;
    
    // Start with a base promptness score
    let promptnessScore = 50;
    
    // Get payments to check if they typically pay early, on time, or late
    const payments = await storage.getPaymentsByTenant(userId);
    
    if (payments.length > 0) {
      let daysEarlyLateTotal = 0;
      let countWithDates = 0;
      
      for (const payment of payments) {
        if (payment.paidDate && payment.dueDate) {
          const paidDate = new Date(payment.paidDate);
          const dueDate = new Date(payment.dueDate);
          
          // Calculate days early (negative) or late (positive)
          const daysDifference = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          daysEarlyLateTotal += daysDifference;
          countWithDates++;
        }
      }
      
      if (countWithDates > 0) {
        const averageDaysEarlyLate = daysEarlyLateTotal / countWithDates;
        
        // Award points based on average payment timing
        if (averageDaysEarlyLate <= -3) promptnessScore += 30; // 3+ days early on average
        else if (averageDaysEarlyLate <= -1) promptnessScore += 20; // 1-3 days early
        else if (averageDaysEarlyLate <= 0) promptnessScore += 15; // Right on time
        else if (averageDaysEarlyLate <= 3) promptnessScore += 5; // 1-3 days late
        else if (averageDaysEarlyLate <= 7) promptnessScore -= 10; // 4-7 days late
        else promptnessScore -= 20; // More than a week late
      }
    }
    
    // Get applications to check response time
    const applications = await storage.getApplicationsByTenant(userId);
    
    // We would need to check application response times if that data is available
    // This is a placeholder for that logic
    
    // Ensure score is in 0-100 range
    return Math.max(0, Math.min(100, promptnessScore));
  } catch (error) {
    console.error('Error calculating promptness component:', error);
    return null;
  }
}

// Calculate eviction history component (0-100)
async function calculateEvictionHistoryComponent(userId: number): Promise<number | null> {
  try {
    // Get rental histories to check for evictions
    const rentalHistories = await storage.getTenantRentalHistoriesByTenant(userId);
    
    // Default score - no eviction data is neutral
    if (rentalHistories.length === 0) return 70;
    
    // Look for eviction mentions in rental history
    const evictionKeywords = ['evict', 'eviction', 'removed', 'terminated', 'forcibly'];
    
    const evictionHistories = rentalHistories.filter(history => {
      if (!history.reasonForLeaving) return false;
      
      return evictionKeywords.some(keyword => 
        history.reasonForLeaving?.toLowerCase().includes(keyword)
      );
    });
    
    // Calculate score based on eviction history
    if (evictionHistories.length === 0) {
      return 100; // No evictions found
    } else if (evictionHistories.length === 1) {
      // One eviction - check how recent it is
      const evictionHistory = evictionHistories[0];
      if (evictionHistory.endDate) {
        const evictionDate = new Date(evictionHistory.endDate);
        const yearsAgo = (new Date().getFullYear() - evictionDate.getFullYear());
        
        if (yearsAgo >= 7) return 60; // 7+ years ago
        if (yearsAgo >= 5) return 40; // 5-7 years ago
        if (yearsAgo >= 3) return 20; // 3-5 years ago
        return 10; // Less than 3 years ago
      }
      return 10; // Eviction with unknown date
    } else {
      // Multiple evictions
      return 0;
    }
  } catch (error) {
    console.error('Error calculating eviction history component:', error);
    return null;
  }
}

/**
 * Calculate a comprehensive tenant score based on all available data
 */
interface ScoreBreakdown {
  creditScore: number | null;
  incomeToRentRatio: number | null;
  rentalHistory: number | null;
  employmentStability: number | null;
  identityVerificationScore: number | null;
  referenceScore: number | null;
  applicationQualityScore: number | null;
  paymentHistoryScore: number | null;
  promptnessScore: number | null;
  evictionHistoryScore: number | null;
  weights: TenantScoreWeights;
  weightsApplied: number;
  totalComponents: number;
}

interface ScoreResult {
  score: InsertTenantScore;
  scoreBreakdown: ScoreBreakdown;
}

export async function calculateTenantScore(
  tenantId: number,
  propertyId?: number,
  applicationId?: number,
  scoringMethod: ScoringMethod = 'comprehensive'
): Promise<ScoreResult> {
  // Get the weights for the scoring method
  const weights = getWeights(scoringMethod);
  
  // Get rental property information if provided
  let rentAmount: number | null = null;
  let landlordId: number | null = null;
  
  if (propertyId) {
    const property = await storage.getProperty(propertyId);
    if (property) {
      rentAmount = property.monthlyRent;
      landlordId = property.landlordId;
    }
  }
  
  if (applicationId && !propertyId) {
    const application = await storage.getApplication(applicationId);
    if (application) {
      propertyId = application.propertyId;
      landlordId = application.landlordId;
      
      const property = await storage.getProperty(application.propertyId);
      if (property) {
        rentAmount = property.monthlyRent;
      }
    }
  }
  
  // Calculate all the component scores
  const [
    creditScore,
    incomeToRentRatio,
    rentalHistory, 
    employmentStability,
    identityVerificationScore,
    referenceScore,
    applicationQualityScore,
    paymentHistoryScore,
    promptnessScore,
    evictionHistoryScore
  ] = await Promise.all([
    calculateCreditScoreComponent(tenantId, applicationId || null),
    calculateIncomeToRentRatioComponent(tenantId, applicationId || null, rentAmount),
    calculateRentalHistoryComponent(tenantId),
    calculateEmploymentStabilityComponent(tenantId),
    calculateIdentityVerificationComponent(tenantId),
    calculateReferenceComponent(tenantId, applicationId || null),
    calculateApplicationQualityComponent(tenantId, applicationId || null),
    calculatePaymentHistoryComponent(tenantId),
    calculatePromptnessComponent(tenantId),
    calculateEvictionHistoryComponent(tenantId)
  ]);
  
  // Calculate weighted score
  let totalWeightedScore = 0;
  let totalWeightsApplied = 0;
  
  // Helper to add a component to the weighted score if it's not null
  function addComponentToScore(score: number | null, weight: number) {
    if (score !== null) {
      totalWeightedScore += score * weight;
      totalWeightsApplied += weight;
    }
  }
  
  // Add all components
  addComponentToScore(creditScore, weights.creditScore);
  addComponentToScore(incomeToRentRatio, weights.incomeToRentRatio);
  addComponentToScore(rentalHistory, weights.rentalHistory);
  addComponentToScore(employmentStability, weights.employmentStability);
  addComponentToScore(identityVerificationScore, weights.identityVerification);
  addComponentToScore(referenceScore, weights.references);
  addComponentToScore(applicationQualityScore, weights.applicationQuality);
  addComponentToScore(paymentHistoryScore, weights.paymentHistory);
  addComponentToScore(promptnessScore, weights.promptness);
  addComponentToScore(evictionHistoryScore, weights.evictionHistory);
  
  // Calculate final overall score (normalized to 0-100)
  let overallScore = totalWeightsApplied > 0 
    ? Math.round(totalWeightedScore / totalWeightsApplied) 
    : null;
  
  // If we don't have enough data, provide a default neutral score of 50
  // This ensures we can still create a tenant score even with insufficient data
  if (overallScore === null) {
    console.log(`Creating default tenant score for user ${tenantId} with insufficient data`);
    overallScore = 50; // Default neutral score
  }
  
  // Create score breakdown object
  const scoreBreakdown = {
    creditScore,
    incomeToRentRatio,
    rentalHistory,
    employmentStability,
    identityVerificationScore,
    referenceScore,
    applicationQualityScore,
    paymentHistoryScore,
    promptnessScore,
    evictionHistoryScore,
    weights,
    weightsApplied: totalWeightsApplied,
    totalComponents: Object.keys(weights).length
  };
  
  // Create the score object without the breakdown
  const score: InsertTenantScore = {
    tenantId,
    overallScore,
    creditScore: creditScore || undefined,
    incomeToRentRatio: incomeToRentRatio || undefined,
    rentalHistory: rentalHistory || undefined,
    employmentStability: employmentStability || undefined,
    identityVerificationScore: identityVerificationScore || undefined,
    referenceScore: referenceScore || undefined,
    applicationQualityScore: applicationQualityScore || undefined,
    paymentHistoryScore: paymentHistoryScore || undefined,
    promptnessScore: promptnessScore || undefined,
    evictionHistoryScore: evictionHistoryScore || undefined,
    scoringMethod,
    landlordId: landlordId || undefined,
    propertyId: propertyId || undefined,
    applicationId: applicationId || undefined,
    active: true
  };
  
  // Return both the score and the breakdown
  return {
    score,
    scoreBreakdown
  };
}

/**
 * Store a tenant score in the database
 */
export async function saveTenantScore(
  scoreData: InsertTenantScore
): Promise<TenantScore> {
  return storage.createTenantScore(scoreData);
}

/**
 * Get the tenant's most recent active score
 */
export async function getLatestTenantScore(
  tenantId: number
): Promise<TenantScore | null> {
  const scores = await storage.getTenantScoresByTenant(tenantId);
  
  if (scores.length === 0) return null;
  
  // Get active scores and sort by most recent
  const activeScores = scores
    .filter(score => score.active)
    .sort((a, b) => new Date(b.scoredAt).getTime() - new Date(a.scoredAt).getTime());
  
  return activeScores.length > 0 ? activeScores[0] : null;
}

/**
 * Get all tenant scores for a landlord
 */
export async function getLandlordTenantScores(
  landlordId: number
): Promise<TenantScore[]> {
  const scores = await storage.getTenantScoresByLandlord(landlordId);
  
  // Filter to just active scores and most recent for each tenant
  const latestScoresByTenant = new Map<number, TenantScore>();
  
  for (const score of scores) {
    if (!score.active) continue;
    
    const existingScore = latestScoresByTenant.get(score.tenantId);
    
    if (!existingScore || new Date(score.scoredAt) > new Date(existingScore.scoredAt)) {
      latestScoresByTenant.set(score.tenantId, score);
    }
  }
  
  return Array.from(latestScoresByTenant.values());
}

/**
 * Get recommended actions based on tenant ID
 */
export async function getTenantScoreRecommendations(tenantId: number): Promise<string[]> {
  // Get the latest score for this tenant
  const score = await getLatestTenantScore(tenantId);
  
  if (!score) {
    return ["No tenant score found. Please create a tenant score first."];
  }
  const recommendations: string[] = [];
  const components = score.scoreBreakdown as any;
  
  // Overall score recommendations
  if (score.overallScore >= 90) {
    recommendations.push('This is an excellent tenant candidate.');
  } else if (score.overallScore >= 80) {
    recommendations.push('This is a very good tenant candidate.');
  } else if (score.overallScore >= 70) {
    recommendations.push('This is a good tenant candidate with minor concerns.');
  } else if (score.overallScore >= 60) {
    recommendations.push('This tenant has some potential concerns to address.');
  } else if (score.overallScore >= 50) {
    recommendations.push('This tenant has several concerns that should be evaluated.');
  } else {
    recommendations.push('This tenant has serious concerns; proceed with caution.');
  }
  
  // Credit score recommendations
  if (components.creditScore !== null) {
    if (components.creditScore < 60) {
      recommendations.push('Consider requesting a cosigner due to credit concerns.');
    }
  } else {
    recommendations.push('Request a credit check to complete the evaluation.');
  }
  
  // Income recommendations
  if (components.incomeToRentRatio !== null) {
    if (components.incomeToRentRatio < 50) {
      recommendations.push('Income may be insufficient; consider requiring proof of additional income or a cosigner.');
    }
  } else {
    recommendations.push('Verify income to ensure it meets your requirements.');
  }
  
  // Rental history recommendations
  if (components.rentalHistory === null) {
    recommendations.push('Obtain and verify rental history references.');
  } else if (components.rentalHistory < 60) {
    recommendations.push('Contact previous landlords to discuss rental history concerns.');
  }
  
  // Employment recommendations
  if (components.employmentStability === null) {
    recommendations.push('Verify current employment status and history.');
  } else if (components.employmentStability < 60) {
    recommendations.push('Consider requesting additional proof of employment stability.');
  }
  
  // Identity verification
  if (components.identityVerificationScore === null || components.identityVerificationScore < 50) {
    recommendations.push('Complete identity verification before proceeding.');
  }
  
  // References
  if (components.referenceScore === null) {
    recommendations.push('Request additional references to evaluate character and reliability.');
  }
  
  return recommendations;
}