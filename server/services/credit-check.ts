import { db } from "../db";
import { creditChecks, users, applications, type CreditCheck } from "@shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";

// Interface for credit check request
interface CreditCheckRequest {
  userId: number;
  applicationId?: number;
  consent: {
    provided: boolean;
    date: Date;
  };
  personalInfo?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    sin: string; // Social Insurance Number (Canadian equivalent of SSN)
    currentAddress: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
  };
}

// Interface for credit check response
interface CreditCheckResponse {
  success: boolean;
  referenceId?: string | undefined;
  error?: string;
  creditCheck?: CreditCheck;
}

// Interface for Equifax API configuration
interface EquifaxConfig {
  apiKey: string | undefined;
  clientId: string | undefined;
  clientSecret: string | undefined;
  apiUrl: string;
  environment: 'sandbox' | 'production';
}

// Interface for Equifax report structure
interface EquifaxReport {
  consumerName: {
    firstName: string;
    lastName: string;
  };
  creditScore: number;
  scoreFactors: string[];
  tradelines: {
    accountType: string;
    balance: number;
    openDate: string;
    paymentStatus: string;
    accountNumber?: string;
    creditorName?: string;
    creditLimit?: number;
    monthlyPayment?: number;
    lastPaymentDate?: string;
    pastDue?: number;
  }[];
  inquiries: {
    date: Date;
    inquirer: string;
    inquiryType?: string;
  }[];
  consumerStatements: string[];
  publicRecords?: {
    type: string;
    date: string;
    amount?: number;
    courtName?: string;
    referenceNumber?: string;
  }[];
  reportDate: Date;
  summary?: {
    totalAccounts: number;
    openAccounts: number;
    closedAccounts: number;
    delinquentAccounts: number;
    totalBalance: number;
    totalMonthlyPayments: number;
    utilization: number;
  };
}

export class CreditCheckService {
  private config: EquifaxConfig;
  
  constructor() {
    this.config = {
      apiKey: process.env.EQUIFAX_API_KEY,
      clientId: process.env.EQUIFAX_CLIENT_ID,
      clientSecret: process.env.EQUIFAX_CLIENT_SECRET,
      apiUrl: 'https://api.equifax.com',
      environment: 'sandbox', // Default to sandbox until production credentials are available
    };
  }
  
  /**
   * Request a credit check for a user
   * @param request Credit check request data
   * @returns Response with status and reference ID
   */
  async requestCreditCheck(request: CreditCheckRequest): Promise<CreditCheckResponse> {
    try {
      // First check if user exists
      const [user] = await db.select().from(users).where(eq(users.id, request.userId));
      
      if (!user) {
        return {
          success: false,
          error: "User not found"
        };
      }

      // Verify consent is provided
      if (!request.consent.provided) {
        return {
          success: false,
          error: "User consent is required for credit check"
        };
      }

      // Create a credit check record in the database
      const [creditCheck] = await db.insert(creditChecks)
        .values({
          userId: request.userId,
          applicationId: request.applicationId || null,
          consentProvided: request.consent.provided,
          consentDate: request.consent.date,
          status: "pending",
          // Generate a reference ID - in production this would be from Equifax
          referenceId: `EQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        })
        .returning();

      // Check if we have Equifax credentials
      const hasCredentials = this.config.apiKey && this.config.clientId && this.config.clientSecret;

      if (hasCredentials) {
        // In a real integration, we would make an API call to Equifax here
        this.callEquifaxAPI(creditCheck.id, request).catch(error => {
          console.error("Error calling Equifax API:", error);
          // Update the credit check status to failed if the API call fails
          this.updateCreditCheckStatus(creditCheck.id, "failed").catch(console.error);
        });
      } else {
        // If no Equifax credentials, use the simulated process for development
        console.log("No Equifax credentials found, using simulated credit check process");
        setTimeout(() => {
          this.processPendingCreditCheck(creditCheck.id).catch(console.error);
        }, 5000); // Longer delay to simulate real API call
      }

      return {
        success: true,
        referenceId: creditCheck.referenceId || undefined,
        creditCheck
      };
    } catch (error) {
      console.error("Error requesting credit check:", error);
      return {
        success: false,
        error: "Failed to request credit check"
      };
    }
  }

  /**
   * Make a real API call to Equifax
   * This is where you would integrate with the actual Equifax API
   * @param creditCheckId ID of the credit check
   * @param request Original credit check request with personal info
   */
  private async callEquifaxAPI(creditCheckId: number, request: CreditCheckRequest): Promise<void> {
    try {
      console.log(`Making API call to Equifax for credit check ${creditCheckId}`);
      
      // In a real implementation, you would:
      // 1. Authenticate with Equifax using OAuth or other method
      // 2. Format the request according to Equifax's API specs
      // 3. Make the API call
      // 4. Process the response and update the database
      
      // For now, simulate a successful API call and processing
      await this.processPendingCreditCheck(creditCheckId);
      
    } catch (error) {
      console.error(`Error in Equifax API call for credit check ${creditCheckId}:`, error);
      throw error;
    }
  }

  /**
   * Update the status of a credit check
   * @param creditCheckId ID of the credit check
   * @param status New status value
   */
  private async updateCreditCheckStatus(creditCheckId: number, status: "pending" | "completed" | "failed"): Promise<void> {
    await db.update(creditChecks)
      .set({ status })
      .where(eq(creditChecks.id, creditCheckId));
  }

  /**
   * Process a pending credit check (simulated)
   * In production, this would be called by a webhook from Equifax
   * @param creditCheckId ID of the credit check to process
   */
  async processPendingCreditCheck(creditCheckId: number): Promise<void> {
    try {
      // Get the credit check record
      const [creditCheck] = await db.select().from(creditChecks).where(eq(creditChecks.id, creditCheckId));
      
      if (!creditCheck) {
        console.error(`Credit check with ID ${creditCheckId} not found`);
        return;
      }

      if (creditCheck.status !== "pending") {
        console.log(`Credit check ${creditCheckId} is not pending, status: ${creditCheck.status}`);
        return;
      }

      // Get the user record to use real name if available
      const [user] = await db.select().from(users).where(eq(users.id, creditCheck.userId));
      if (!user) {
        console.error(`User with ID ${creditCheck.userId} not found for credit check ${creditCheckId}`);
        return;
      }

      // In production, we would get the actual result from Equifax
      // Simulate a credit score and report
      const simulatedScore = Math.floor(Math.random() * 300) + 550; // Random score between 550-850
      
      // Current date for the report
      const reportDate = new Date();
      
      // Sample report structure that would come from Equifax
      const simulatedReport: EquifaxReport = {
        consumerName: {
          firstName: user.firstName || "SAMPLE",
          lastName: user.lastName || "REPORT",
        },
        creditScore: simulatedScore,
        scoreFactors: [
          "Length of credit history",
          "Credit utilization",
          "Payment history",
          "Recent inquiries"
        ],
        tradelines: [
          {
            accountType: "Credit Card",
            balance: 2500,
            openDate: "2019-05-15",
            paymentStatus: "Current",
            accountNumber: "XXXX-XXXX-XXXX-1234",
            creditorName: "SCOTIA BANK",
            creditLimit: 5000,
            monthlyPayment: 100,
            lastPaymentDate: "2023-03-01"
          },
          {
            accountType: "Installment Loan",
            balance: 15000,
            openDate: "2020-01-10",
            paymentStatus: "Current",
            accountNumber: "LOAN12345",
            creditorName: "TD BANK",
            monthlyPayment: 350,
            lastPaymentDate: "2023-02-28"
          },
          {
            accountType: "Mortgage",
            balance: 250000,
            openDate: "2018-06-12",
            paymentStatus: "Current",
            creditorName: "ROYAL BANK",
            monthlyPayment: 1200,
            lastPaymentDate: "2023-03-05"
          }
        ],
        inquiries: [
          {
            date: new Date(reportDate.getTime() - 7776000000), // 90 days ago
            inquirer: "CAPITAL ONE",
            inquiryType: "Credit Card Application"
          },
          {
            date: new Date(reportDate.getTime() - 15552000000), // 180 days ago
            inquirer: "ROGERS COMMUNICATIONS",
            inquiryType: "Service Application"
          }
        ],
        consumerStatements: [],
        publicRecords: [],
        reportDate: reportDate,
        summary: {
          totalAccounts: 3,
          openAccounts: 3,
          closedAccounts: 0,
          delinquentAccounts: 0,
          totalBalance: 267500,
          totalMonthlyPayments: 1650,
          utilization: 50 // Percentage
        }
      };

      // Update the credit check record with the results
      await db.update(creditChecks)
        .set({
          status: "completed",
          score: simulatedScore,
          report: simulatedReport,
          completedDate: new Date(),
        })
        .where(eq(creditChecks.id, creditCheckId));

      // If this credit check is for an application, update the application
      if (creditCheck.applicationId) {
        await db.update(applications)
          .set({
            creditCheck: true
          })
          .where(eq(applications.id, creditCheck.applicationId));
      }

      // If there's a user associated, update their credit score
      if (creditCheck.userId) {
        await db.update(users)
          .set({
            creditScore: simulatedScore
          })
          .where(eq(users.id, creditCheck.userId));
      }

      console.log(`Processed credit check ${creditCheckId} with score ${simulatedScore}`);
    } catch (error) {
      console.error("Error processing credit check:", error);
    }
  }

  /**
   * Get a credit check by ID
   * @param id Credit check ID
   * @returns Credit check record if found
   */
  async getCreditCheckById(id: number): Promise<CreditCheck | undefined> {
    const [creditCheck] = await db.select().from(creditChecks).where(eq(creditChecks.id, id));
    return creditCheck;
  }

  /**
   * Get all credit checks for a user
   * @param userId User ID
   * @returns Array of credit check records
   */
  async getCreditChecksByUserId(userId: number): Promise<CreditCheck[]> {
    const checks = await db.select()
      .from(creditChecks)
      .where(eq(creditChecks.userId, userId))
      .orderBy(desc(creditChecks.requestDate));
    return checks;
  }

  /**
   * Get credit check for a specific application
   * @param applicationId Application ID
   * @returns Credit check record if found
   */
  async getCreditCheckByApplicationId(applicationId: number): Promise<CreditCheck | undefined> {
    const [creditCheck] = await db.select().from(creditChecks)
      .where(eq(creditChecks.applicationId, applicationId));
    return creditCheck;
  }

  /**
   * Get most recent credit check for a user
   * @param userId User ID
   * @returns Most recent credit check record if found
   */
  async getMostRecentCreditCheck(userId: number): Promise<CreditCheck | undefined> {
    const [creditCheck] = await db.select()
      .from(creditChecks)
      .where(eq(creditChecks.userId, userId))
      .orderBy(desc(creditChecks.requestDate))
      .limit(1);
    return creditCheck;
  }

  /**
   * Cancel a pending credit check
   * @param id Credit check ID
   * @returns Updated credit check if found
   */
  async cancelCreditCheck(id: number): Promise<CreditCheck | undefined> {
    const [creditCheck] = await db.select().from(creditChecks).where(eq(creditChecks.id, id));
    
    if (!creditCheck || creditCheck.status !== "pending") {
      return undefined;
    }
    
    const [updatedCheck] = await db.update(creditChecks)
      .set({
        status: "failed",
      })
      .where(eq(creditChecks.id, id))
      .returning();
      
    return updatedCheck;
  }

  /**
   * Check if a credit check is available for a user
   * Returns true if the user has a completed credit check within the last 90 days
   * @param userId User ID
   * @returns Boolean indicating if a recent credit check is available
   */
  async isRecentCreditCheckAvailable(userId: number): Promise<boolean> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const [creditCheck] = await db.select()
      .from(creditChecks)
      .where(
        and(
          eq(creditChecks.userId, userId),
          eq(creditChecks.status, "completed"),
          gte(creditChecks.completedDate, ninetyDaysAgo)
        )
      )
      .orderBy(desc(creditChecks.completedDate))
      .limit(1);
      
    return !!creditCheck;
  }
}

export const creditCheckService = new CreditCheckService();