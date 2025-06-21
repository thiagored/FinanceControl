import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertAccountSchema, 
  insertCategorySchema, 
  insertTransactionSchema,
  insertCardSchema,
  insertTransferSchema,
  insertSimulationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Diagnostic route - must be before other routes
  app.get('/diagnose', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Diagnóstico do Sistema</title>
        <style>
          body { font-family: Arial; margin: 40px; background: #f5f5f5; }
          .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #28a745; }
          .info { background: #e9f7ef; padding: 15px; border-radius: 5px; margin: 10px 0; }
          button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✓ Sistema Funcionando</h1>
          <div class="info">
            <strong>Servidor Express:</strong> OK<br>
            <strong>Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
            <strong>User-Agent:</strong> ${req.get('User-Agent')}<br>
            <strong>Rota acessada:</strong> ${req.path}
          </div>
          <button onclick="alert('JavaScript funcionando!')">Testar JavaScript</button>
          <button onclick="window.location.href='/'">Voltar para App</button>
          <button onclick="fetch('/api/user').then(r => alert('API Status: ' + r.status))">Testar API</button>
        </div>
      </body>
      </html>
    `);
  });

  // Setup authentication routes
  setupAuth(app);

  // Account routes
  app.get("/api/accounts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const accounts = await storage.getUserAccounts(req.user!.id);
      const accountsWithBalance = await Promise.all(
        accounts.map(async (account) => ({
          ...account,
          currentBalance: await storage.getAccountBalance(account.id)
        }))
      );
      res.json(accountsWithBalance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount({
        ...accountData,
        userId: req.user!.id
      });
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const accountData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, accountData);
      if (!account) return res.sendStatus(404);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAccount(id);
      if (!deleted) return res.sendStatus(404);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const categories = await storage.getUserCategories(req.user!.id);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory({
        ...categoryData,
        userId: req.user!.id
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getUserTransactions(req.user!.id, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...transactionData,
        userId: req.user!.id
      });
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Dashboard summary route
  app.get("/api/dashboard/summary", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const summary = await storage.getMonthlyTransactionsSummary(req.user!.id, year, month);
      const accounts = await storage.getUserAccounts(req.user!.id);
      
      let totalBalance = 0;
      for (const account of accounts) {
        totalBalance += await storage.getAccountBalance(account.id);
      }
      
      res.json({
        ...summary,
        totalBalance,
        monthlySavings: summary.totalIncome - summary.totalExpenses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Card routes
  app.get("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const cards = await storage.getUserCards(req.user!.id);
      const cardsWithUsage = await Promise.all(
        cards.map(async (card) => ({
          ...card,
          currentUsage: await storage.getCardUsage(card.id)
        }))
      );
      res.json(cardsWithUsage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.post("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const cardData = insertCardSchema.parse(req.body);
      const card = await storage.createCard({
        ...cardData,
        userId: req.user!.id
      });
      res.status(201).json(card);
    } catch (error) {
      res.status(400).json({ message: "Invalid card data" });
    }
  });

  // Transfer routes
  app.get("/api/transfers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transfers = await storage.getUserTransfers(req.user!.id);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });

  app.post("/api/transfers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transferData = insertTransferSchema.parse(req.body);
      const transfer = await storage.createTransfer({
        ...transferData,
        userId: req.user!.id
      });
      res.status(201).json(transfer);
    } catch (error) {
      res.status(400).json({ message: "Invalid transfer data" });
    }
  });

  // Simulation routes
  app.get("/api/simulations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const simulations = await storage.getUserSimulations(req.user!.id);
      res.json(simulations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch simulations" });
    }
  });

  app.post("/api/simulations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const simulationData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation({
        ...simulationData,
        userId: req.user!.id
      });
      res.status(201).json(simulation);
    } catch (error) {
      res.status(400).json({ message: "Invalid simulation data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
