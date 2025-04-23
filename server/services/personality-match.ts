import { type User, type TenantScore } from "@shared/schema";
import { storage } from "../storage";
import { createDefaultTenantScoreIfNeeded } from "./create-default-score";

// Interfaces for tenant personality profiles
export interface TenantPersonalityProfile {
  tenantId: number;
  overallProfile: string;  // Brief overall description
  lifestylePreferences: string[];
  communicationStyle: string;
  maintenanceExpectations: string;
  cleanliness: string;
  noiseTolerance: string;
  socialInteraction: string;
  financialReliability: number; // 1-10 scale
}

// Property compatibility analysis
export interface PropertyCompatibilityAnalysis {
  propertyId: number;
  tenantId: number;
  overallScore: number; // 0-100
  matchReasons: string[];
  potentialIssues: string[];
  recommendations: string[];
}

// Landlord compatibility analysis
export interface LandlordCompatibilityAnalysis {
  landlordId: number;
  tenantId: number;
  overallScore: number; // 0-100
  matchReasons: string[];
  potentialIssues: string[];
  recommendations: string[];
}

export class PersonalityMatchService {
  /**
   * Generate a personality profile for a tenant based on their data
   * and any application responses.
   */
  async generateTenantPersonalityProfile(userId: number): Promise<TenantPersonalityProfile> {
    const user = await storage.getUser(userId);
    if (!user || user.role !== 'tenant') {
      throw new Error("User not found or is not a tenant");
    }
    
    // Ensure tenant has a score
    let tenantScore = await createDefaultTenantScoreIfNeeded(user);
    if (!tenantScore) {
      throw new Error("Could not create or retrieve tenant score");
    }
    
    // This would normally be based on actual data points, surveys, etc.
    // For now, we're simulating personality data with some standard profiles
    const lifestyleOptions = [
      "Early riser", "Night owl", "Enjoys quiet time", "Socially active",
      "Environmentally conscious", "Minimalist", "Home-oriented"
    ];
    
    const communicationOptions = [
      "Direct communicator", "Prefers text messages", "Responsive to emails",
      "Appreciates advance notice", "Comfortable with digital tools"
    ];
    
    // Create a deterministic profile based on tenant ID to ensure consistency
    const seed = userId % 100;
    
    // Select lifestyle preferences (2-4 based on tenant ID)
    const numLifestylePrefs = 2 + (seed % 3);
    const lifestylePreferences = [];
    for (let i = 0; i < numLifestylePrefs; i++) {
      const idx = (seed + i * 7) % lifestyleOptions.length;
      lifestylePreferences.push(lifestyleOptions[idx]);
    }
    
    // Select communication style
    const communicationStyle = communicationOptions[seed % communicationOptions.length];
    
    // Generate other profile elements
    const cleanlinessLevel = ["Very clean", "Tidy", "Average", "Relaxed"][seed % 4];
    const maintenanceExp = ["High expectations", "Reasonable", "Minimal", "Self-sufficient"][seed % 4];
    const noiseLevel = ["Prefers silence", "Tolerates moderate noise", "Adaptable", "Doesn't mind noise"][seed % 4];
    const socialLevel = ["Very private", "Occasionally social", "Neighborly", "Highly social"][seed % 4];
    
    // Financial reliability - use tenant score if available or generate one
    const financialReliability = tenantScore ? 
      Math.min(10, Math.max(1, Math.floor(tenantScore.overallScore / 70))) : // Scale 0-700 to 1-10
      5 + (seed % 5); // Default 5-9 range
    
    // Generate an overall profile description
    const profileParts = [
      lifestylePreferences[0],
      `with ${cleanlinessLevel.toLowerCase()} living standards`,
      `and ${maintenanceExp.toLowerCase()} maintenance expectations`
    ];
    const overallProfile = `${profileParts.join(' ')} tenant who is a ${communicationStyle.toLowerCase()}.`;
    
    return {
      tenantId: userId,
      overallProfile,
      lifestylePreferences,
      communicationStyle,
      maintenanceExpectations: maintenanceExp,
      cleanliness: cleanlinessLevel,
      noiseTolerance: noiseLevel,
      socialInteraction: socialLevel,
      financialReliability
    };
  }

  /**
   * Analyze property compatibility with a tenant
   */
  async analyzePropertyCompatibility(
    propertyId: number,
    tenantId: number
  ): Promise<PropertyCompatibilityAnalysis> {
    const [property, tenantProfile] = await Promise.all([
      storage.getProperty(propertyId),
      this.generateTenantPersonalityProfile(tenantId)
    ]);
    
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Generate a compatibility score and reasons
    // This would typically involve complex matching algorithms
    const seed = (propertyId + tenantId) % 100;
    
    // Calculate overall score - in a real system this would be based on
    // actual matching of characteristics
    const baseScore = 50 + (seed % 31); // 50-80 range
    const bonusScore = tenantProfile.financialReliability * 2; // 0-20 bonus
    const overallScore = Math.min(100, baseScore + bonusScore);
    
    // Generate match reasons
    const matchReasons = [];
    
    // Add reasons based on property features and tenant preferences
    if (property.bedrooms >= 2) {
      matchReasons.push("Property size meets tenant's space preferences");
    }
    
    if (property.rent <= 2000) { // This would be compared to tenant's budget in a real system
      matchReasons.push("Rent aligns with tenant's financial profile");
    }
    
    if (tenantProfile.lifestylePreferences.includes("Environmentally conscious")) {
      matchReasons.push("Property's location supports tenant's environmental values");
    }
    
    // Ensure we have a minimum number of reasons
    while (matchReasons.length < 3) {
      const defaultReasons = [
        "Property amenities align with tenant preferences",
        "Location matches tenant's commute preferences",
        "Property style complements tenant's lifestyle",
        "Property age fits tenant's maintenance expectations"
      ];
      
      const idx = (seed + matchReasons.length) % defaultReasons.length;
      const reason = defaultReasons[idx];
      if (!matchReasons.includes(reason)) {
        matchReasons.push(reason);
      }
    }
    
    // Generate potential issues
    const potentialIssues = [];
    if (overallScore < 70) {
      const possibleIssues = [
        "Property may require more maintenance than tenant prefers",
        "Neighborhood noise levels may not match tenant's preferences",
        "Distance to amenities might not align with tenant's lifestyle",
        "Storage space may be less than tenant's ideal"
      ];
      
      // Add 1-2 issues
      const numIssues = 1 + (overallScore < 60 ? 1 : 0);
      for (let i = 0; i < numIssues; i++) {
        const idx = (seed + i * 13) % possibleIssues.length;
        potentialIssues.push(possibleIssues[idx]);
      }
    }
    
    // Generate recommendations
    const recommendations = [
      "Schedule a viewing during tenant's preferred time of day",
      "Highlight the property's quiet spaces given tenant's noise preferences",
      "Discuss maintenance expectations clearly before signing"
    ];
    
    return {
      propertyId,
      tenantId,
      overallScore,
      matchReasons,
      potentialIssues,
      recommendations
    };
  }

  /**
   * Analyze landlord compatibility with a tenant
   */
  async analyzeLandlordCompatibility(
    landlordId: number,
    tenantId: number
  ): Promise<LandlordCompatibilityAnalysis> {
    const [landlord, tenant, tenantProfile] = await Promise.all([
      storage.getUser(landlordId),
      storage.getUser(tenantId),
      this.generateTenantPersonalityProfile(tenantId)
    ]);
    
    if (!landlord || landlord.role !== 'landlord') {
      throw new Error("Landlord not found or user is not a landlord");
    }
    
    if (!tenant || tenant.role !== 'tenant') {
      throw new Error("Tenant not found or user is not a tenant");
    }
    
    // Generate a compatibility score
    // This would normally involve comparing communication preferences,
    // management styles, etc.
    const seed = (landlordId + tenantId) % 100;
    
    // Calculate overall score
    const baseScore = 60 + (seed % 26); // 60-85 range
    const bonusScore = tenantProfile.financialReliability; // 0-10 bonus
    const overallScore = Math.min(100, baseScore + bonusScore);
    
    // Generate match reasons
    const matchReasons = [
      `Landlord's communication style complements tenant's ${tenantProfile.communicationStyle.toLowerCase()}`,
      "Expectations for property care align well",
      "Similar views on prompt resolution of maintenance issues"
    ];
    
    // Generate potential issues
    const potentialIssues = [];
    if (overallScore < 75) {
      const possibleIssues = [
        "Different expectations about communication frequency",
        "Potential misalignment on maintenance response times",
        "Different perspectives on property improvements",
        "Varying expectations about lease flexibility"
      ];
      
      // Add 1-2 issues
      const numIssues = 1 + (overallScore < 65 ? 1 : 0);
      for (let i = 0; i < numIssues; i++) {
        const idx = (seed + i * 11) % possibleIssues.length;
        potentialIssues.push(possibleIssues[idx]);
      }
    }
    
    // Generate recommendations
    const recommendations = [
      "Discuss and document communication preferences before lease signing",
      "Clarify maintenance request processes and timelines",
      "Consider a detailed property condition report to align expectations"
    ];
    
    return {
      landlordId,
      tenantId,
      overallScore,
      matchReasons,
      potentialIssues,
      recommendations
    };
  }
}

export const personalityMatchService = new PersonalityMatchService();