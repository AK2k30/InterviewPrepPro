import PerformanceReport from '../PerformanceReport';

export default function PerformanceReportExample() {
  // Mock performance data for demonstration
  const mockMetrics = {
    overallScore: 78,
    duration: 1845, // 30 minutes 45 seconds
    categories: {
      communication: 85,
      technicalKnowledge: 72,
      problemSolving: 80,
      culturalFit: 75
    },
    strengths: [
      "Excellent communication skills and clear articulation of technical concepts",
      "Strong problem-solving approach with systematic thinking",
      "Good understanding of software engineering fundamentals",
      "Confident and professional demeanor throughout the interview"
    ],
    improvements: [
      "Could benefit from more specific examples when discussing past projects",
      "Consider practicing system design scenarios for better architectural thinking",
      "Work on providing more detailed explanations for algorithmic solutions"
    ],
    detailedFeedback: "Overall, you demonstrated strong technical competency and excellent communication skills. Your approach to problem-solving was methodical and well-structured. To improve further, focus on providing more concrete examples from your experience and practice explaining complex technical concepts in simpler terms. Your cultural fit assessment was positive, showing good alignment with team collaboration values."
  };

  return (
    <PerformanceReport 
      metrics={mockMetrics}
      role="Software Engineer"
      onStartNewInterview={() => console.log('Starting new interview')}
      onViewHistory={() => console.log('Viewing interview history')}
    />
  );
}