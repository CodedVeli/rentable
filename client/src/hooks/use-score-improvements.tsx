import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ScoreData {
  overall: number;
  paymentHistory: number;
  incomeStability: number;
  creditScore: number;
  rentalHistory: number;
}

export interface RecommendationItem {
  type: 'high' | 'medium' | 'low';
  message: string;
  actionItems: string[];
  impact: number;
}

export interface ImprovementPlan {
  title: string;
  description: string;
  timeframe: string;
  difficulty: string;
  steps: string[];
  potentialIncrease: number;
}

export interface ActionableItem {
  name: string;
  status: 'complete' | 'incomplete';
  priority: 'high' | 'medium' | 'low';
  impact: number;
  description: string;
  estimatedTime: string;
  link: string;
}

export interface ScoreAnalysis {
  score: ScoreData;
  recommendations: RecommendationItem[];
  improvementPlans: ImprovementPlan[];
  actionableItems: ActionableItem[];
}

export function useScoreImprovements(userId?: number) {
  const [activeTab, setActiveTab] = useState<string>('recommendations');

  // Use TanStack Query to fetch score improvement data
  const {
    data: scoreAnalysisData,
    isLoading: scoreAnalysisLoading,
    error: scoreAnalysisError,
  } = useQuery({
    queryKey: [`/api/score-improvement-recommendations/${userId}`],
    enabled: !!userId,
  });

  return {
    scoreAnalysisData: scoreAnalysisData as ScoreAnalysis | undefined,
    scoreAnalysisLoading,
    scoreAnalysisError,
    activeTab,
    setActiveTab,
  };
}