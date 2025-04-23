import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";

import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  LineChart,
  PiggyBank,
  Wallet,
  CircleAlert,
  TrendingUp,
  BarChart,
  Filter,
  Clock,
  MoreHorizontal,
  Briefcase,
  Home,
  CreditCardIcon,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  rentToIncomeRatio: number;
  creditUtilization: number;
  savingsGoal: number;
  savingsProgress: number;
  nextRentDue: string;
  rentAmount: number;
  creditScore: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  color: string;
}

interface MonthlyExpense {
  month: string;
  housing: number;
  utilities: number;
  groceries: number;
  transportation: number;
  entertainment: number;
  other: number;
}

// Sample data for development
const demoFinancialSummary: FinancialSummary = {
  totalIncome: 4500,
  totalExpenses: 3200,
  savingsRate: 28.9,
  rentToIncomeRatio: 32.2,
  creditUtilization: 15.8,
  savingsGoal: 15000,
  savingsProgress: 6500,
  nextRentDue: "2025-04-15",
  rentAmount: 1450,
  creditScore: 720,
};

const demoTransactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-04-10",
    description: "Paycheck - Acme Corp",
    amount: 2250,
    category: "Income",
    type: "income",
  },
  {
    id: "t2",
    date: "2025-04-07",
    description: "Superstore - Groceries",
    amount: 115.87,
    category: "Groceries",
    type: "expense",
  },
  {
    id: "t3",
    date: "2025-04-05",
    description: "Monthly Transit Pass",
    amount: 75,
    category: "Transportation",
    type: "expense",
  },
  {
    id: "t4",
    date: "2025-04-03",
    description: "Electricity Bill",
    amount: 85.32,
    category: "Utilities",
    type: "expense",
  },
  {
    id: "t5",
    date: "2025-04-01",
    description: "Rent Payment",
    amount: 1450,
    category: "Housing",
    type: "expense",
  },
  {
    id: "t6",
    date: "2025-03-30",
    description: "Internet Service",
    amount: 65.99,
    category: "Utilities",
    type: "expense",
  },
  {
    id: "t7",
    date: "2025-03-28",
    description: "Dining Out - Bistro",
    amount: 42.75,
    category: "Food",
    type: "expense",
  },
  {
    id: "t8",
    date: "2025-03-27",
    description: "Paycheck - Acme Corp",
    amount: 2250,
    category: "Income",
    type: "income",
  },
];

const demoBudgetCategories: BudgetCategory[] = [
  { name: "Housing", allocated: 1500, spent: 1450, remaining: 50, color: "#3b82f6" },
  { name: "Utilities", allocated: 250, spent: 180, remaining: 70, color: "#10b981" },
  { name: "Groceries", allocated: 400, spent: 325, remaining: 75, color: "#f59e0b" },
  { name: "Transportation", allocated: 200, spent: 175, remaining: 25, color: "#8b5cf6" },
  { name: "Entertainment", allocated: 200, spent: 150, remaining: 50, color: "#ec4899" },
  { name: "Savings", allocated: 600, spent: 600, remaining: 0, color: "#6366f1" },
  { name: "Other", allocated: 250, spent: 120, remaining: 130, color: "#64748b" },
];

const demoMonthlyExpenseData: MonthlyExpense[] = [
  { month: "Nov", housing: 1450, utilities: 175, groceries: 340, transportation: 180, entertainment: 120, other: 200 },
  { month: "Dec", housing: 1450, utilities: 195, groceries: 360, transportation: 150, entertainment: 180, other: 190 },
  { month: "Jan", housing: 1450, utilities: 210, groceries: 310, transportation: 140, entertainment: 150, other: 180 },
  { month: "Feb", housing: 1450, utilities: 190, groceries: 330, transportation: 160, entertainment: 140, other: 210 },
  { month: "Mar", housing: 1450, utilities: 170, groceries: 320, transportation: 170, entertainment: 160, other: 180 },
  { month: "Apr", housing: 1450, utilities: 180, groceries: 325, transportation: 175, entertainment: 150, other: 120 },
];

const demoIncomeData = [
  { month: "Nov", income: 4300 },
  { month: "Dec", income: 4300 },
  { month: "Jan", income: 4300 },
  { month: "Feb", income: 4500 },
  { month: "Mar", income: 4500 },
  { month: "Apr", income: 4500 },
];

const demoBillsData = [
  { name: "Rent", amount: 1450, dueDate: "Apr 15", status: "upcoming", type: "housing" },
  { name: "Electricity", amount: 85, dueDate: "Apr 20", status: "upcoming", type: "utility" },
  { name: "Internet", amount: 65, dueDate: "Apr 22", status: "upcoming", type: "utility" },
  { name: "Phone", amount: 45, dueDate: "Apr 25", status: "upcoming", type: "utility" },
  { name: "Car Insurance", amount: 120, dueDate: "Apr 28", status: "upcoming", type: "insurance" },
];

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("month");
  
  // Fetch financial data
  interface FinancialData {
    summary?: FinancialSummary;
    transactions?: Transaction[];
    budget?: BudgetCategory[];
    monthlyExpenses?: MonthlyExpense[];
    incomeData?: { month: string; income: number }[];
    bills?: { name: string; amount: number; dueDate: string; status: string; type: string }[];
  }
  
  const { data: financialData, isLoading } = useQuery<FinancialData>({
    queryKey: ["/api/tenant/financial-data", user?.id],
    enabled: !!user?.id,
  });
  
  // Use real data if available, fallback to demo data if needed
  const summary = financialData?.summary || demoFinancialSummary;
  const transactions = financialData?.transactions || demoTransactions;
  const budget = financialData?.budget || demoBudgetCategories;
  const monthlyExpenses = financialData?.monthlyExpenses || demoMonthlyExpenseData;
  const incomeData = financialData?.incomeData || demoIncomeData;
  const bills = financialData?.bills || demoBillsData;
  
  // Calculate days until next rent payment
  const nextRentDate = new Date(summary.nextRentDue);
  const today = new Date();
  const daysUntilRent = Math.ceil((nextRentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Health Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Track your spending, budget, and overall financial health
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Select defaultValue={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Timeframe</SelectLabel>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Monthly Income & Expenses</CardTitle>
              <Wallet className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</p>
                  <p className="text-xs text-gray-500">Monthly Income</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
                  <p className="text-xs text-gray-500">Monthly Expenses</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Expenses</span>
                  <span>{Math.round((summary.totalExpenses / summary.totalIncome) * 100)}%</span>
                </div>
                <Progress value={(summary.totalExpenses / summary.totalIncome) * 100} className="h-2" />
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                      Savings
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(summary.totalIncome - summary.totalExpenses)} 
                    <span className="text-xs text-gray-500 ml-1">
                      ({summary.savingsRate}%)
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Rent & Housing</CardTitle>
              <Home className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.rentAmount)}</p>
                  <p className="text-xs text-gray-500">Monthly Rent</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Rent-to-Income Ratio</span>
                    <span>{summary.rentToIncomeRatio}%</span>
                  </div>
                  <Progress 
                    value={summary.rentToIncomeRatio} 
                    className={`h-2 ${
                      summary.rentToIncomeRatio <= 30 ? "bg-green-500" : 
                      summary.rentToIncomeRatio <= 40 ? "bg-yellow-500" : 
                      "bg-red-500"
                    }`} 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.rentToIncomeRatio <= 30 
                      ? "Good: Below 30% of income" 
                      : summary.rentToIncomeRatio <= 40 
                        ? "Caution: 30-40% of income" 
                        : "High: Above 40% of income"}
                  </p>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className={`${
                      daysUntilRent <= 3 ? "bg-red-50 text-red-700 border-red-200" :
                      daysUntilRent <= 7 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    } mr-2`}>
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Next Payment
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(summary.nextRentDue)} 
                    <span className="text-xs text-gray-500 ml-1">
                      ({daysUntilRent} days)
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Savings Goal</CardTitle>
              <PiggyBank className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.savingsProgress)}</p>
                  <p className="text-xs text-gray-500">of {formatCurrency(summary.savingsGoal)} goal</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((summary.savingsProgress / summary.savingsGoal) * 100)}%</span>
                  </div>
                  <Progress value={(summary.savingsProgress / summary.savingsGoal) * 100} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mr-2">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      Monthly Contribution
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(summary.totalIncome - summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 md:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="bills">Bills & Payments</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Expenses Breakdown</CardTitle>
                  <CardDescription>
                    See how your expenses are distributed across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        width={500}
                        height={300}
                        data={monthlyExpenses}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, 'Amount']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar dataKey="housing" stackId="a" fill="#3b82f6" name="Housing" />
                        <Bar dataKey="utilities" stackId="a" fill="#10b981" name="Utilities" />
                        <Bar dataKey="groceries" stackId="a" fill="#f59e0b" name="Groceries" />
                        <Bar dataKey="transportation" stackId="a" fill="#8b5cf6" name="Transportation" />
                        <Bar dataKey="entertainment" stackId="a" fill="#ec4899" name="Entertainment" />
                        <Bar dataKey="other" stackId="a" fill="#64748b" name="Other" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Income Trend</CardTitle>
                  <CardDescription>
                    Your income over the past 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={incomeData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Income']} />
                        <Area type="monotone" dataKey="income" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health Indicators</CardTitle>
                  <CardDescription>
                    Key metrics that measure your financial stability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span>Credit Score</span>
                        <span>{summary.creditScore}</span>
                      </div>
                      <Progress 
                        value={(summary.creditScore / 850) * 100} 
                        className={`h-2 ${
                          summary.creditScore >= 700 ? "bg-green-500" : 
                          summary.creditScore >= 600 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {summary.creditScore >= 700 
                          ? "Good to Excellent" 
                          : summary.creditScore >= 600 
                            ? "Fair" 
                            : "Poor to Fair"}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span>Credit Utilization</span>
                        <span>{summary.creditUtilization}%</span>
                      </div>
                      <Progress 
                        value={summary.creditUtilization} 
                        className={`h-2 ${
                          summary.creditUtilization <= 30 ? "bg-green-500" : 
                          summary.creditUtilization <= 50 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {summary.creditUtilization <= 30 
                          ? "Good: Below 30% utilization" 
                          : summary.creditUtilization <= 50 
                            ? "Fair: 30-50% utilization" 
                            : "High: Above 50% utilization"}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span>Savings Rate</span>
                        <span>{summary.savingsRate}%</span>
                      </div>
                      <Progress 
                        value={summary.savingsRate * 5} // Scaling to make it visible (20% savings would be 100% of bar)
                        className={`h-2 ${
                          summary.savingsRate >= 20 ? "bg-green-500" : 
                          summary.savingsRate >= 10 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {summary.savingsRate >= 20 
                          ? "Excellent: 20%+ of income" 
                          : summary.savingsRate >= 10 
                            ? "Good: 10-20% of income" 
                            : "Low: Below 10% of income"}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span>Rent-to-Income Ratio</span>
                        <span>{summary.rentToIncomeRatio}%</span>
                      </div>
                      <Progress 
                        value={summary.rentToIncomeRatio} 
                        className={`h-2 ${
                          summary.rentToIncomeRatio <= 30 ? "bg-green-500" : 
                          summary.rentToIncomeRatio <= 40 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {summary.rentToIncomeRatio <= 30 
                          ? "Good: Below 30% of income" 
                          : summary.rentToIncomeRatio <= 40 
                            ? "Caution: 30-40% of income" 
                            : "High: Above 40% of income"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your recent income and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center pb-3 border-b last:border-0">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-md mr-3 ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {transaction.type === 'income' 
                            ? <ArrowUpRight className="h-4 w-4" /> 
                            : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.date)} • {transaction.category}</p>
                        </div>
                      </div>
                      <p className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : 'text-gray-900'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tenant/transactions">
                    View All Transactions
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Budget Tab */}
          <TabsContent value="budget" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Budget</CardTitle>
                  <CardDescription>
                    Track your spending against your monthly budget
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {budget.map((category: BudgetCategory) => (
                      <div key={category.name}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                            <span>{category.name}</span>
                          </div>
                          <div className="flex space-x-4">
                            <span className="text-gray-500">{formatCurrency(category.spent)} / {formatCurrency(category.allocated)}</span>
                            <span className={category.remaining >= 0 ? "text-green-600" : "text-red-600"}>
                              {category.remaining >= 0 ? formatCurrency(category.remaining) + " left" : "-" + formatCurrency(Math.abs(category.remaining))}
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={(category.spent / category.allocated) * 100} 
                          className={`h-2 ${
                            (category.spent / category.allocated) * 100 <= 85 ? "bg-green-500" : 
                            (category.spent / category.allocated) * 100 <= 100 ? "bg-yellow-500" : 
                            "bg-red-500"
                          }`} 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget Distribution</CardTitle>
                  <CardDescription>
                    How your budget is allocated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budget}
                          dataKey="allocated"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          labelLine={false}
                          label={({cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text 
                                x={x} 
                                y={y} 
                                fill="#fff"
                                textAnchor={x > cx ? 'start' : 'end'} 
                                dominantBaseline="central"
                                fontSize={11}
                              >
                                {`${name} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {budget.map((entry: BudgetCategory, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/tenant/budget">
                      Adjust Budget
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Transactions</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Browse and filter your recent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-md mr-3 ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {transaction.type === 'income' 
                            ? <ArrowUpRight className="h-4 w-4" /> 
                            : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.date)} • {transaction.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className={`font-medium mr-4 ${
                          transaction.type === 'income' 
                            ? 'text-green-600' 
                            : 'text-gray-900'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Category</DropdownMenuItem>
                            <DropdownMenuItem>Add Note</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Remove Transaction</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  Load More Transactions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Bills Tab */}
          <TabsContent value="bills" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bills</CardTitle>
                <CardDescription>
                  Schedule of your bills and payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.map((bill: { name: string; amount: number; dueDate: string; status: string; type: string }, index: number) => (
                    <div key={index} className="flex justify-between items-center pb-4 border-b last:border-0">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-md mr-3 ${
                          bill.type === 'housing' 
                            ? 'bg-blue-100 text-blue-600' 
                            : bill.type === 'utility'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {bill.type === 'housing' 
                            ? <Home className="h-4 w-4" /> 
                            : bill.type === 'utility'
                              ? <Briefcase className="h-4 w-4" />
                              : <CreditCardIcon className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{bill.name}</p>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 text-gray-500 mr-1" />
                            <p className="text-sm text-gray-500">Due on {bill.dueDate}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className="font-medium mr-4">{formatCurrency(bill.amount)}</p>
                        <Button variant="outline" size="sm">Pay Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <p className="text-sm text-gray-500">Total upcoming: {formatCurrency(bills.reduce((total: number, bill: { amount: number }) => total + bill.amount, 0))}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tenant/payments/schedule">
                    Payment Schedule
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and automatic payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-md mr-3">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-gray-500">Expires 05/27</p>
                      </div>
                    </div>
                    <Badge variant="outline">Default</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-md mr-3">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">MasterCard ending in 5678</p>
                        <p className="text-sm text-gray-500">Expires 09/26</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Make Default</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  Add New Payment Method
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}