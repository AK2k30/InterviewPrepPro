import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Star,
  ArrowRight,
  RotateCcw
} from "lucide-react";

interface PerformanceMetrics {
  overallScore: number;
  duration: number;
  categories: {
    communication: number;
    technicalKnowledge: number;
    problemSolving: number;
    culturalFit: number;
  };
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

interface PerformanceReportProps {
  metrics: PerformanceMetrics;
  role: string;
  onStartNewInterview: () => void;
  onViewHistory?: () => void;
}

export default function PerformanceReport({ 
  metrics, 
  role, 
  onStartNewInterview,
  onViewHistory 
}: PerformanceReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const categoryLabels = {
    communication: "Communication Skills",
    technicalKnowledge: "Technical Knowledge",
    problemSolving: "Problem Solving",
    culturalFit: "Cultural Fit"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-report-title">
              Interview Performance Report
            </h1>
            <p className="text-muted-foreground text-lg">
              {role} Interview Analysis
            </p>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-lg">Overall Performance</CardTitle>
            <CardDescription>Your interview performance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className={`text-6xl font-bold ${getScoreColor(metrics.overallScore)}`} data-testid="text-overall-score">
                {metrics.overallScore}
              </div>
              <div className="text-2xl text-muted-foreground">out of 100</div>
              <Badge 
                variant={getScoreBadgeVariant(metrics.overallScore)}
                className="text-sm px-3 py-1"
                data-testid="badge-score-level"
              >
                {metrics.overallScore >= 80 ? "Excellent" : 
                 metrics.overallScore >= 60 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span data-testid="text-interview-duration">
                  Duration: {formatDuration(metrics.duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>AI Assessment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Detailed analysis by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(metrics.categories).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </span>
                  <span className={`font-semibold ${getScoreColor(score)}`} data-testid={`score-${category}`}>
                    {score}/100
                  </span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {metrics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`strength-${index}`}>
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {metrics.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`improvement-${index}`}>
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
            <CardDescription>Comprehensive analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none" data-testid="text-detailed-feedback">
              <p className="text-foreground leading-relaxed">
                {metrics.detailedFeedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button 
            onClick={onStartNewInterview}
            className="flex items-center gap-2"
            data-testid="button-new-interview"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Interview
          </Button>
          
          {onViewHistory && (
            <Button 
              variant="outline"
              onClick={onViewHistory}
              className="flex items-center gap-2"
              data-testid="button-view-history"
            >
              View Interview History
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}