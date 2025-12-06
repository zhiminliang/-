export enum Platform {
  IOS = 'iOS',
  ANDROID = 'Android',
  MINI_PROGRAM = 'MiniProgram'
}

export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFO = 'Info'
}

export interface LogIssue {
  title: string;
  description: string;
  severity: Severity;
  line_number?: number;
  log_snippet?: string;
  possible_cause: string;
  recommendation: string;
}

export interface AnalysisResult {
  summary: string;
  overall_health_score: number; // 0-100
  issues: LogIssue[];
  device_info?: string;
  os_version?: string;
  app_version?: string;
}

export interface AnalysisState {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
