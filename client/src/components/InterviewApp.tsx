import { useState } from "react";
import UserRegistration from "./UserRegistration";
import VideoCallInterface from "./VideoCallInterface";
import PerformanceReport from "./PerformanceReport";
import { ThemeToggle } from "./ThemeToggle";
import { ROLE_OPTIONS } from "@shared/schema";

type AppState = "registration" | "interview" | "report";

interface UserData {
  name: string;
  currentRole: string;
  targetRole: string;
}

export default function InterviewApp() {
  const [currentState, setCurrentState] = useState<AppState>("registration");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [interviewDuration, setInterviewDuration] = useState<number>(0);

  const handleRegistrationComplete = (data: UserData) => {
    setUserData(data);
    setCurrentState("interview");
    console.log("Moving to interview phase with user data:", data);
  };

  const handleInterviewEnd = (duration: number) => {
    setInterviewDuration(duration);
    setCurrentState("report");
    console.log("Interview ended, moving to report phase");
  };

  const handleStartNewInterview = () => {
    setCurrentState("interview");
    console.log("Starting new interview");
  };

  const handleBackToRegistration = () => {
    setCurrentState("registration");
    setUserData(null);
    console.log("Back to registration");
  };

  // Generate mock performance data based on user data
  const generateMockPerformance = () => {
    if (!userData) return null;

    // Simulate different scores based on role
    const baseScore = Math.floor(Math.random() * 30) + 60; // 60-90 range
    
    return {
      overallScore: baseScore + Math.floor(Math.random() * 10),
      duration: interviewDuration,
      categories: {
        communication: baseScore + Math.floor(Math.random() * 20) - 10,
        technicalKnowledge: baseScore + Math.floor(Math.random() * 20) - 10,
        problemSolving: baseScore + Math.floor(Math.random() * 20) - 10,
        culturalFit: baseScore + Math.floor(Math.random() * 20) - 10,
      },
      strengths: [
        "Clear and articulate communication throughout the interview",
        "Demonstrated strong analytical thinking and problem-solving skills",
        "Showed good understanding of industry best practices",
        "Professional demeanor and positive attitude"
      ],
      improvements: [
        "Could provide more specific examples from past experience",
        "Consider elaborating more on technical implementation details",
        "Practice explaining complex concepts in simpler terms"
      ],
      detailedFeedback: `Great job on your ${getRoleLabel(userData.targetRole)} interview! You demonstrated solid foundational knowledge and good communication skills. Your responses showed thoughtful consideration of the questions asked. To improve further, focus on providing more concrete examples from your experience and practice articulating your thought process more clearly when solving problems.`
    };
  };

  const getRoleLabel = (roleValue: string) => {
    const role = ROLE_OPTIONS.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  // Add theme toggle to top-right corner for non-interview states
  const showThemeToggle = currentState !== "interview";

  return (
    <div className="min-h-screen">
      {showThemeToggle && (
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      
      {currentState === "registration" && (
        <UserRegistration onComplete={handleRegistrationComplete} />
      )}
      
      {currentState === "interview" && userData && (
        <VideoCallInterface
          role={userData.targetRole}
          userData={userData}
          onEndCall={handleInterviewEnd}
        />
      )}
      
      {currentState === "report" && userData && (
        <PerformanceReport
          metrics={generateMockPerformance()!}
          role={getRoleLabel(userData.targetRole)}
          onStartNewInterview={handleStartNewInterview}
          onViewHistory={handleBackToRegistration}
        />
      )}
    </div>
  );
}