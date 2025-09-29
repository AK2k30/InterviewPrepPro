import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  Clock,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCallInterfaceProps {
  interviewerName?: string;
  role: string;
  onEndCall: (duration: number) => void;
}

export default function VideoCallInterface({ 
  interviewerName = "AI Interviewer", 
  role,
  onEndCall 
}: VideoCallInterfaceProps) {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Simulate interview questions based on role
  const questionsByRole: Record<string, string[]> = {
    "software-engineer": [
      "Tell me about yourself and your experience with software development.",
      "Describe a challenging technical problem you've solved recently.",
      "How do you approach debugging a complex issue?",
      "What's your experience with system design and scalability?"
    ],
    "product-manager": [
      "Walk me through how you would prioritize features for a new product.",
      "How do you handle conflicting stakeholder requirements?",
      "Describe a time when you had to make a difficult product decision.",
      "How do you measure product success?"
    ],
    "data-scientist": [
      "Explain a machine learning project you've worked on from start to finish.",
      "How do you handle missing or dirty data in your analysis?",
      "What's your approach to feature selection and engineering?",
      "How do you communicate complex findings to non-technical stakeholders?"
    ],
    // Add more role-specific questions as needed
  };

  useEffect(() => {
    // Simulate connection process
    const connectionTimer = setTimeout(() => {
      setIsConnected(true);
      startTimeRef.current = Date.now();
    }, 2000);

    // Start the first question after connection
    const questionTimer = setTimeout(() => {
      const questions = questionsByRole[role] || questionsByRole["software-engineer"];
      setCurrentQuestion(questions[0]);
    }, 3000);

    return () => {
      clearTimeout(connectionTimer);
      clearTimeout(questionTimer);
    };
  }, [role]);

  useEffect(() => {
    // Update duration every second
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    // Simulate getting user's camera feed
    if (isCameraOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.log('Camera access denied or unavailable:', err);
          // Continue with simulation
        });
    }
  }, [isCameraOn]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    console.log('Ending call after', duration, 'seconds');
    onEndCall(duration);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    console.log('Camera toggled:', !isCameraOn ? 'on' : 'off');
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    console.log('Microphone toggled:', !isMicOn ? 'on' : 'off');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 bg-slate-800/50 border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold text-slate-100">Connecting to Interview Room</h2>
          <p className="text-slate-400">Please wait while we set up your interview session...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live Interview
          </Badge>
          <span className="text-slate-300 text-sm">Role: {role}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm" data-testid="text-duration">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex">
        {/* Interviewer Video (Simulated) */}
        <div className="flex-1 relative">
          <div className="w-full h-full bg-slate-700 flex items-center justify-center relative">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <User className="w-16 h-16 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-100">{interviewerName}</h3>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  AI Interviewer
                </Badge>
              </div>
            </div>
            
            {/* Connection Quality Indicator */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Monitor className="w-3 h-3 mr-1" />
                HD
              </Badge>
            </div>
          </div>
        </div>

        {/* User Video */}
        <div className="w-80 relative">
          <div className="w-full h-full bg-slate-800 relative overflow-hidden">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                data-testid="video-user-camera"
              />
            ) : (
              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <VideoOff className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-slate-400 text-sm">Camera is off</p>
                </div>
              </div>
            )}
            
            {/* User Video Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-2">
                <p className="text-slate-200 text-sm font-medium">You</p>
                <div className="flex items-center gap-2 mt-1">
                  {isMicOn ? (
                    <Mic className="w-3 h-3 text-green-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-red-400" />
                  )}
                  {isCameraOn ? (
                    <Video className="w-3 h-3 text-green-400" />
                  ) : (
                    <VideoOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Question Display */}
      {currentQuestion && (
        <div className="p-6 bg-slate-800/30 border-t border-slate-700">
          <Card className="p-4 bg-slate-700/50 border-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">Current Question:</p>
                <p className="text-slate-100" data-testid="text-current-question">
                  {currentQuestion}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="p-6 bg-slate-800/50">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isCameraOn ? "secondary" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleCamera}
            data-testid="button-toggle-camera"
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMic}
            data-testid="button-toggle-mic"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={handleEndCall}
            data-testid="button-end-call"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}