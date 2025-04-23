import {
  users, properties, leases, payments, tenantScores,
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Lease, type InsertLease,
  type Payment, type InsertPayment,
  type TenantScore, type InsertTenantScore
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for our storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Property operations
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByLandlord(landlordId: number): Promise<Property[]>;
  getPropertiesByTenant(tenantId: number): Promise<Property[]>;
  getAvailableProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  
  // Lease operations
  getLease(id: number): Promise<Lease | undefined>;
  getLeasesByLandlord(landlordId: number): Promise<Lease[]>;
  getLeasesByTenant(tenantId: number): Promise<Lease[]>;
  createLease(lease: InsertLease): Promise<Lease>;
  updateLease(id: number, lease: Partial<InsertLease>): Promise<Lease | undefined>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByLandlord(landlordId: number): Promise<Payment[]>;
  getPaymentsByTenant(tenantId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Tenant Score operations
  getTenantScore(id: number): Promise<TenantScore | undefined>;
  getTenantScoresByTenant(tenantId: number): Promise<TenantScore[]>;
  createTenantScore(score: InsertTenantScore): Promise<TenantScore>;
  updateTenantScore(id: number, score: Partial<InsertTenantScore>): Promise<TenantScore | undefined>;
}

// Database implementation of the storage interface
export class DbStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id));
    return result[0];
  }

  async getPropertiesByLandlord(landlordId: number): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.landlordId, landlordId));
  }

  async getPropertiesByTenant(tenantId: number): Promise<Property[]> {
    const userLeases = await db.select().from(leases).where(eq(leases.tenantId, tenantId));
    const propertyIds = userLeases.map(lease => lease.propertyId);
    
    if (propertyIds.length === 0) return [];
    
    const result = await db.select().from(properties).where(
      propertyIds.map(id => eq(properties.id, id)).reduce((acc, condition) => acc || condition)
    );
    return result;
  }

  async getAvailableProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.available, true));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const result = await db.update(properties).set(property).where(eq(properties.id, id)).returning();
    return result[0];
  }

  // Lease operations
  async getLease(id: number): Promise<Lease | undefined> {
    const result = await db.select().from(leases).where(eq(leases.id, id));
    return result[0];
  }

  async getLeasesByLandlord(landlordId: number): Promise<Lease[]> {
    return await db.select().from(leases).where(eq(leases.landlordId, landlordId));
  }

  async getLeasesByTenant(tenantId: number): Promise<Lease[]> {
    return await db.select().from(leases).where(eq(leases.tenantId, tenantId));
  }

  async createLease(lease: InsertLease): Promise<Lease> {
    const result = await db.insert(leases).values(lease).returning();
    return result[0];
  }

  async updateLease(id: number, lease: Partial<InsertLease>): Promise<Lease | undefined> {
    const result = await db.update(leases).set(lease).where(eq(leases.id, id)).returning();
    return result[0];
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id));
    return result[0];
  }

  async getPaymentsByLandlord(landlordId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.landlordId, landlordId));
  }

  async getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.tenantId, tenantId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return result[0];
  }

  // Tenant Score operations
  async getTenantScore(id: number): Promise<TenantScore | undefined> {
    const result = await db.select().from(tenantScores).where(eq(tenantScores.id, id));
    return result[0];
  }

  async getTenantScoresByTenant(tenantId: number): Promise<TenantScore[]> {
    return await db.select().from(tenantScores)
      .where(eq(tenantScores.tenantId, tenantId))
      .orderBy(desc(tenantScores.createdAt));
  }

  async createTenantScore(score: InsertTenantScore): Promise<TenantScore> {
    const result = await db.insert(tenantScores).values(score).returning();
    return result[0];
  }

  async updateTenantScore(id: number, score: Partial<InsertTenantScore>): Promise<TenantScore | undefined> {
    const result = await db.update(tenantScores).set(score).where(eq(tenantScores.id, id)).returning();
    return result[0];
  }
}

// In-memory implementation for development/testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private leases: Map<number, Lease>;
  private payments: Map<number, Payment>;
  private tenantScores: Map<number, TenantScore>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private leaseIdCounter: number;
  private paymentIdCounter: number;
  private tenantScoreIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.leases = new Map();
    this.payments = new Map();
    this.tenantScores = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.leaseIdCounter = 1;
    this.paymentIdCounter = 1;
    this.tenantScoreIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.clerkId === clerkId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByLandlord(landlordId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      property => property.landlordId === landlordId
    );
  }

  async getPropertiesByTenant(tenantId: number): Promise<Property[]> {
    const tenantLeases = Array.from(this.leases.values()).filter(
      lease => lease.tenantId === tenantId
    );
    
    const propertyIds = tenantLeases.map(lease => lease.propertyId);
    return Array.from(this.properties.values()).filter(
      property => propertyIds.includes(property.id)
    );
  }

  async getAvailableProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      property => property.available
    );
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date();
    const newProperty: Property = {
      ...property,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const existingProperty = this.properties.get(id);
    if (!existingProperty) return undefined;
    
    const updatedProperty: Property = {
      ...existingProperty,
      ...propertyData,
      updatedAt: new Date()
    };
    
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  // Lease operations
  async getLease(id: number): Promise<Lease | undefined> {
    return this.leases.get(id);
  }

  async getLeasesByLandlord(landlordId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      lease => lease.landlordId === landlordId
    );
  }

  async getLeasesByTenant(tenantId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      lease => lease.tenantId === tenantId
    );
  }

  async createLease(lease: InsertLease): Promise<Lease> {
    const id = this.leaseIdCounter++;
    const now = new Date();
    const newLease: Lease = {
      ...lease,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.leases.set(id, newLease);
    return newLease;
  }

  async updateLease(id: number, leaseData: Partial<InsertLease>): Promise<Lease | undefined> {
    const existingLease = this.leases.get(id);
    if (!existingLease) return undefined;
    
    const updatedLease: Lease = {
      ...existingLease,
      ...leaseData,
      updatedAt: new Date()
    };
    
    this.leases.set(id, updatedLease);
    return updatedLease;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByLandlord(landlordId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.landlordId === landlordId
    );
  }

  async getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.tenantId === tenantId
    );
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: now
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment: Payment = {
      ...existingPayment,
      ...paymentData
    };
    
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Tenant Score operations
  async getTenantScore(id: number): Promise<TenantScore | undefined> {
    return this.tenantScores.get(id);
  }

  async getTenantScoresByTenant(tenantId: number): Promise<TenantScore[]> {
    const scores = Array.from(this.tenantScores.values()).filter(
      score => score.tenantId === tenantId
    );
    
    // Sort by created date, newest first
    return scores.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createTenantScore(score: InsertTenantScore): Promise<TenantScore> {
    const id = this.tenantScoreIdCounter++;
    const now = new Date();
    const newScore: TenantScore = {
      ...score,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tenantScores.set(id, newScore);
    return newScore;
  }

  async updateTenantScore(id: number, scoreData: Partial<InsertTenantScore>): Promise<TenantScore | undefined> {
    const existingScore = this.tenantScores.get(id);
    if (!existingScore) return undefined;
    
    const updatedScore: TenantScore = {
      ...existingScore,
      ...scoreData,
      updatedAt: new Date()
    };
    
    this.tenantScores.set(id, updatedScore);
    return updatedScore;
  }
}

// Decide which implementation to use
// For now, using in-memory storage as recommended in guidelines
export const storage = new MemStorage();
