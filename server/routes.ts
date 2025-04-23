import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreAnalysisService } from "./services/score-analysis";
import { scoreRecommendationsService } from "./services/score-recommendations";
import { personalityMatchService } from "./services/personality-match";
import { createDefaultTenantScoreIfNeeded } from "./services/create-default-score";
import { z } from "zod";
import {
  insertUserSchema,
  insertPropertySchema,
  insertLeaseSchema,
  insertPaymentSchema,
  insertTenantScoreSchema,
  type User
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes

  // User routes
  app.get('/api/user/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.post('/api/user', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.patch('/api/user/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  // Property routes
  app.get('/api/property/:id', async (req, res) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    try {
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ error: 'Failed to fetch property' });
    }
  });

  app.get('/api/properties', async (req, res) => {
    try {
      const landlordId = req.query.landlordId ? parseInt(req.query.landlordId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      let properties;
      if (landlordId) {
        properties = await storage.getPropertiesByLandlord(landlordId);
      } else if (tenantId) {
        properties = await storage.getPropertiesByTenant(tenantId);
      } else {
        properties = await storage.getAvailableProperties();
      }
      
      res.json(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  });

  app.post('/api/property', async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const newProperty = await storage.createProperty(propertyData);
      res.status(201).json(newProperty);
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(400).json({ error: 'Invalid property data' });
    }
  });

  app.patch('/api/property/:id', async (req, res) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    try {
      const propertyData = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(propertyId, propertyData);
      if (!updatedProperty) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.json(updatedProperty);
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(400).json({ error: 'Invalid property data' });
    }
  });

  // Lease routes
  app.get('/api/lease/:id', async (req, res) => {
    const leaseId = parseInt(req.params.id);
    if (isNaN(leaseId)) {
      return res.status(400).json({ error: 'Invalid lease ID' });
    }

    try {
      const lease = await storage.getLease(leaseId);
      if (!lease) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.json(lease);
    } catch (error) {
      console.error('Error fetching lease:', error);
      res.status(500).json({ error: 'Failed to fetch lease' });
    }
  });

  app.get('/api/leases', async (req, res) => {
    try {
      const landlordId = req.query.landlordId ? parseInt(req.query.landlordId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      let leases;
      if (landlordId) {
        leases = await storage.getLeasesByLandlord(landlordId);
      } else if (tenantId) {
        leases = await storage.getLeasesByTenant(tenantId);
      } else {
        return res.status(400).json({ error: 'Either landlordId or tenantId is required' });
      }
      
      res.json(leases);
    } catch (error) {
      console.error('Error fetching leases:', error);
      res.status(500).json({ error: 'Failed to fetch leases' });
    }
  });

  app.post('/api/lease', async (req, res) => {
    try {
      const leaseData = insertLeaseSchema.parse(req.body);
      const newLease = await storage.createLease(leaseData);
      res.status(201).json(newLease);
    } catch (error) {
      console.error('Error creating lease:', error);
      res.status(400).json({ error: 'Invalid lease data' });
    }
  });

  app.patch('/api/lease/:id', async (req, res) => {
    const leaseId = parseInt(req.params.id);
    if (isNaN(leaseId)) {
      return res.status(400).json({ error: 'Invalid lease ID' });
    }

    try {
      const leaseData = insertLeaseSchema.partial().parse(req.body);
      const updatedLease = await storage.updateLease(leaseId, leaseData);
      if (!updatedLease) {
        return res.status(404).json({ error: 'Lease not found' });
      }
      res.json(updatedLease);
    } catch (error) {
      console.error('Error updating lease:', error);
      res.status(400).json({ error: 'Invalid lease data' });
    }
  });

  // Payment routes
  app.get('/api/payment/:id', async (req, res) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    try {
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  });

  app.get('/api/payments', async (req, res) => {
    try {
      const landlordId = req.query.landlordId ? parseInt(req.query.landlordId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      let payments;
      if (landlordId) {
        payments = await storage.getPaymentsByLandlord(landlordId);
      } else if (tenantId) {
        payments = await storage.getPaymentsByTenant(tenantId);
      } else {
        return res.status(400).json({ error: 'Either landlordId or tenantId is required' });
      }
      
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.post('/api/payment', async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const newPayment = await storage.createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(400).json({ error: 'Invalid payment data' });
    }
  });

  app.patch('/api/payment/:id', async (req, res) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    try {
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const updatedPayment = await storage.updatePayment(paymentId, paymentData);
      if (!updatedPayment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(updatedPayment);
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(400).json({ error: 'Invalid payment data' });
    }
  });

  // Tenant Score routes
  app.get('/api/tenant-score/:id', async (req, res) => {
    const scoreId = parseInt(req.params.id);
    if (isNaN(scoreId)) {
      return res.status(400).json({ error: 'Invalid score ID' });
    }

    try {
      const score = await storage.getTenantScore(scoreId);
      if (!score) {
        return res.status(404).json({ error: 'Tenant score not found' });
      }
      res.json(score);
    } catch (error) {
      console.error('Error fetching tenant score:', error);
      res.status(500).json({ error: 'Failed to fetch tenant score' });
    }
  });

  app.get('/api/tenant-scores', async (req, res) => {
    try {
      const tenantId = parseInt(req.query.tenantId as string);
      if (isNaN(tenantId)) {
        return res.status(400).json({ error: 'Invalid tenant ID' });
      }
      
      const scores = await storage.getTenantScoresByTenant(tenantId);
      res.json(scores);
    } catch (error) {
      console.error('Error fetching tenant scores:', error);
      res.status(500).json({ error: 'Failed to fetch tenant scores' });
    }
  });

  app.post('/api/tenant-score', async (req, res) => {
    try {
      const scoreData = insertTenantScoreSchema.parse(req.body);
      const newScore = await storage.createTenantScore(scoreData);
      res.status(201).json(newScore);
    } catch (error) {
      console.error('Error creating tenant score:', error);
      res.status(400).json({ error: 'Invalid tenant score data' });
    }
  });

  app.patch('/api/tenant-score/:id', async (req, res) => {
    const scoreId = parseInt(req.params.id);
    if (isNaN(scoreId)) {
      return res.status(400).json({ error: 'Invalid score ID' });
    }

    try {
      const scoreData = insertTenantScoreSchema.partial().parse(req.body);
      const updatedScore = await storage.updateTenantScore(scoreId, scoreData);
      if (!updatedScore) {
        return res.status(404).json({ error: 'Tenant score not found' });
      }
      res.json(updatedScore);
    } catch (error) {
      console.error('Error updating tenant score:', error);
      res.status(400).json({ error: 'Invalid tenant score data' });
    }
  });

  // Tenant Score Analysis route
  app.get('/api/tenant-score-analysis/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'tenant') {
        return res.status(400).json({ error: 'User is not a tenant' });
      }

      const analysis = await scoreAnalysisService.analyzeTenantScore(userId);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing tenant score:', error);
      res.status(500).json({ error: 'Failed to analyze tenant score' });
    }
  });

  // Property Match Recommendations route
  app.get('/api/property-recommendations/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'tenant') {
        return res.status(400).json({ error: 'User is not a tenant' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recommendations = await scoreRecommendationsService.recommendProperties(userId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting property recommendations:', error);
      res.status(500).json({ error: 'Failed to get property recommendations' });
    }
  });

  // Score Improvement Recommendations route
  app.get('/api/score-improvement-recommendations/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'tenant') {
        return res.status(400).json({ error: 'User is not a tenant' });
      }

      const recommendations = await scoreRecommendationsService.recommendScoreImprovements(userId);
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting score improvement recommendations:', error);
      res.status(500).json({ error: 'Failed to get score improvement recommendations' });
    }
  });

  // Create default tenant score if needed
  app.post('/api/create-default-tenant-score/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'tenant') {
        return res.status(400).json({ error: 'User is not a tenant' });
      }

      const score = await createDefaultTenantScoreIfNeeded(user);
      if (!score) {
        return res.status(500).json({ error: 'Failed to create default tenant score' });
      }
      res.json(score);
    } catch (error) {
      console.error('Error creating default tenant score:', error);
      res.status(500).json({ error: 'Failed to create default tenant score' });
    }
  });

  // Tenant Personality Profile route
  app.get('/api/tenant-personality-profile/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'tenant') {
        return res.status(400).json({ error: 'User is not a tenant' });
      }

      const profile = await personalityMatchService.generateTenantPersonalityProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error('Error generating tenant personality profile:', error);
      res.status(500).json({ error: 'Failed to generate tenant personality profile' });
    }
  });

  // Property Compatibility Analysis route
  app.get('/api/property-compatibility/:tenantId/:propertyId', async (req, res) => {
    const tenantId = parseInt(req.params.tenantId);
    const propertyId = parseInt(req.params.propertyId);
    
    if (isNaN(tenantId) || isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or property ID' });
    }

    try {
      const tenant = await storage.getUser(tenantId);
      if (!tenant || tenant.role !== 'tenant') {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const compatibility = await personalityMatchService.analyzePropertyCompatibility(
        tenantId,
        propertyId
      );
      res.json(compatibility);
    } catch (error) {
      console.error('Error analyzing property compatibility:', error);
      res.status(500).json({ error: 'Failed to analyze property compatibility' });
    }
  });

  // Landlord Compatibility Analysis route
  app.get('/api/landlord-compatibility/:tenantId/:landlordId', async (req, res) => {
    const tenantId = parseInt(req.params.tenantId);
    const landlordId = parseInt(req.params.landlordId);
    
    if (isNaN(tenantId) || isNaN(landlordId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or landlord ID' });
    }

    try {
      const tenant = await storage.getUser(tenantId);
      if (!tenant || tenant.role !== 'tenant') {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const landlord = await storage.getUser(landlordId);
      if (!landlord || landlord.role !== 'landlord') {
        return res.status(404).json({ error: 'Landlord not found' });
      }

      const compatibility = await personalityMatchService.analyzeLandlordCompatibility(
        tenantId,
        landlordId
      );
      res.json(compatibility);
    } catch (error) {
      console.error('Error analyzing landlord compatibility:', error);
      res.status(500).json({ error: 'Failed to analyze landlord compatibility' });
    }
  });

  // Authentication routes (simplified for demo)
  app.post('/api/login', async (req, res) => {
    const loginSchema = z.object({
      username: z.string(),
      password: z.string()
    });

    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // In a real app, we would check the password hash
      // For demo purposes, we'll just check the plain password
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Set user in session
      if (req.session) {
        (req.session as any).user = { id: user.id, username: user.username, role: user.role };
      }
      
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: 'Invalid login data' });
    }
  });

  app.post('/api/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.session && (req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  app.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Create the new user
      const newUser = await storage.createUser(userData);
      
      // If the user is a tenant, create a default tenant score
      if (newUser.role === 'tenant') {
        await createDefaultTenantScoreIfNeeded(newUser);
      }
      
      // Set user in session
      if (req.session) {
        (req.session as any).user = { 
          id: newUser.id, 
          username: newUser.username, 
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email
        };
      }
      
      // Return the user data
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Invalid registration data' });
    }
  });

  app.get('/api/user', (req, res) => {
    if (req.session && (req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
