export interface ProofStepState {
  line: number;
  code: string;
  activeTactic: string | null;
  explanation: string;
  goalsBefore: string[];
  goalsAfter: string[];
}

export interface CompilerError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface VerificationResult {
  success: boolean;
  overallSummary: string;
  errors: CompilerError[];
  proofStates: ProofStepState[];
}

export interface TheoremChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  starterCode: string;
  solutionCode: string;
  tacticsTip: string;
}

export interface TacticGuideItem {
  name: string;
  syntax: string;
  description: string;
  example: string;
  explanation: string;
}
export interface NextStepSuggestion {
  suggestion: string;
  explanation: string;
  expectedGoalsAfter: string[];
}
