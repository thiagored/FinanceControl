import { 
  users, 
  accounts, 
  categories, 
  transactions, 
  cards, 
  cardTransactions, 
  transfers, 
  simulations,
  type User, 
  type InsertUser,
  type Account,
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Card,
  type InsertCard,
  type Transfer,
  type InsertTransfer,
  type Simulation,
  type InsertSimulation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account methods
  getUserAccounts(userId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount & { userId: number }): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  getAccountBalance(accountId: number): Promise<number>;
  
  // Category methods
  getUserCategories(userId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory & { userId: number }): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Transaction methods
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  getMonthlyTransactionsSummary(userId: number, year: number, month: number): Promise<{
    totalIncome: number;
    totalExpenses: number;
    transactionsByCategory: Array<{ categoryId: number; categoryName: string; total: number; }>;
  }>;
  
  // Card methods
  getUserCards(userId: number): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  createCard(card: InsertCard & { userId: number }): Promise<Card>;
  updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  getCardUsage(cardId: number): Promise<number>;
  
  // Transfer methods
  getUserTransfers(userId: number): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer & { userId: number }): Promise<Transfer>;
  
  // Simulation methods
  getUserSimulations(userId: number): Promise<Simulation[]>;
  createSimulation(simulation: InsertSimulation & { userId: number }): Promise<Simulation>;
  updateSimulation(id: number, simulation: Partial<InsertSimulation>): Promise<Simulation | undefined>;
  deleteSimulation(id: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Account methods
  async getUserAccounts(userId: number): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(account: InsertAccount & { userId: number }): Promise<Account> {
    const [newAccount] = await db
      .insert(accounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return result.rowCount > 0;
  }

  async getAccountBalance(accountId: number): Promise<number> {
    const account = await this.getAccount(accountId);
    if (!account) return 0;

    const [result] = await db
      .select({
        income: sum(sql`CASE WHEN ${transactions.type} = 'receita' THEN ${transactions.value} ELSE 0 END`),
        expenses: sum(sql`CASE WHEN ${transactions.type} = 'despesa' THEN ${transactions.value} ELSE 0 END`)
      })
      .from(transactions)
      .where(eq(transactions.accountId, accountId));

    const income = Number(result.income || 0);
    const expenses = Number(result.expenses || 0);
    const initialBalance = Number(account.initialBalance);

    return initialBalance + income - expenses;
  }

  // Category methods
  async getUserCategories(userId: number): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory & { userId: number }): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Transaction methods
  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    let query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount > 0;
  }

  async getMonthlyTransactionsSummary(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [summary] = await db
      .select({
        totalIncome: sum(sql`CASE WHEN ${transactions.type} = 'receita' THEN ${transactions.value} ELSE 0 END`),
        totalExpenses: sum(sql`CASE WHEN ${transactions.type} = 'despesa' THEN ${transactions.value} ELSE 0 END`)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${transactions.date} <= ${endDate.toISOString().split('T')[0]}`
        )
      );

    const categoryData = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        total: sum(transactions.value)
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'despesa'),
          sql`${transactions.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${transactions.date} <= ${endDate.toISOString().split('T')[0]}`
        )
      )
      .groupBy(transactions.categoryId, categories.name);

    return {
      totalIncome: Number(summary.totalIncome || 0),
      totalExpenses: Number(summary.totalExpenses || 0),
      transactionsByCategory: categoryData.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        total: Number(item.total)
      }))
    };
  }

  // Card methods
  async getUserCards(userId: number): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.userId, userId));
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card || undefined;
  }

  async createCard(card: InsertCard & { userId: number }): Promise<Card> {
    const [newCard] = await db
      .insert(cards)
      .values(card)
      .returning();
    return newCard;
  }

  async updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined> {
    const [updatedCard] = await db
      .update(cards)
      .set(card)
      .where(eq(cards.id, id))
      .returning();
    return updatedCard || undefined;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id));
    return result.rowCount > 0;
  }

  async getCardUsage(cardId: number): Promise<number> {
    const [result] = await db
      .select({ total: sum(transactions.value) })
      .from(cardTransactions)
      .innerJoin(transactions, eq(cardTransactions.transactionId, transactions.id))
      .where(eq(cardTransactions.cardId, cardId));

    return Number(result.total || 0);
  }

  // Transfer methods
  async getUserTransfers(userId: number): Promise<Transfer[]> {
    return await db
      .select()
      .from(transfers)
      .where(eq(transfers.userId, userId))
      .orderBy(desc(transfers.date));
  }

  async createTransfer(transfer: InsertTransfer & { userId: number }): Promise<Transfer> {
    const [newTransfer] = await db
      .insert(transfers)
      .values(transfer)
      .returning();
    return newTransfer;
  }

  // Simulation methods
  async getUserSimulations(userId: number): Promise<Simulation[]> {
    return await db
      .select()
      .from(simulations)
      .where(eq(simulations.userId, userId))
      .orderBy(desc(simulations.createdAt));
  }

  async createSimulation(simulation: InsertSimulation & { userId: number }): Promise<Simulation> {
    const [newSimulation] = await db
      .insert(simulations)
      .values(simulation)
      .returning();
    return newSimulation;
  }

  async updateSimulation(id: number, simulation: Partial<InsertSimulation>): Promise<Simulation | undefined> {
    const [updatedSimulation] = await db
      .update(simulations)
      .set(simulation)
      .where(eq(simulations.id, id))
      .returning();
    return updatedSimulation || undefined;
  }

  async deleteSimulation(id: number): Promise<boolean> {
    const result = await db.delete(simulations).where(eq(simulations.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
