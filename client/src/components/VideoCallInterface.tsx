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
import { ROLE_OPTIONS } from "@shared/schema";

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
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
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
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
      
      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <Badge className="bg-red-500/90 text-white border-0 px-3 py-1">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            REC
          </Badge>
          <div className="text-white/90 text-sm font-medium">
            {ROLE_OPTIONS.find(r => r.value === role)?.label} Interview
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm" data-testid="text-duration">
              {formatTime(duration)}
            </span>
          </div>
          <Badge variant="outline" className="border-green-400/30 bg-green-400/10 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Connected
          </Badge>
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="relative z-10 flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interviewer Video - Main */}
        <div className="lg:col-span-2 relative">
          <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            {/* Professional interviewer simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-40 h-40 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <User className="w-20 h-20 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-slate-900"></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-white">{interviewerName}</h3>
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1">
                    Senior Technical Interviewer
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Professional overlays */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-black/40 backdrop-blur-sm text-white/90 border-0">
                <Monitor className="w-3 h-3 mr-1" />
                1080p
              </Badge>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{interviewerName}</span>
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-green-400" />
                    <Video className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Video - Sidebar */}
        <div className="relative">
          <div className="w-full h-full min-h-[300px] bg-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative">
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
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-600/50 rounded-full flex items-center justify-center">
                    <VideoOff className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-300 font-medium">Camera is off</p>
                    <p className="text-slate-500 text-sm">Click to turn on</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* User overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">You</span>
                  <div className="flex items-center gap-2">
                    {isMicOn ? (
                      <div className="flex items-center gap-1">
                        <Mic className="w-3 h-3 text-green-400" />
                        <div className="flex gap-0.5">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                          ))}
                        </div>
                      </div>
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
      </div>

      {/* Question Panel */}
      {currentQuestion && (
        <div className="relative z-10 px-6 pb-4">
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">Current Question</span>
                  <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                    Listen carefully
                  </Badge>
                </div>
                <p className="text-white text-lg leading-relaxed" data-testid="text-current-question">
                  {currentQuestion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Control Bar */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <Button
                variant={isCameraOn ? "default" : "destructive"}
                size="icon"
                className={cn(
                  "h-14 w-14 rounded-full transition-all duration-200 shadow-lg",
                  isCameraOn 
                    ? "bg-slate-600 hover:bg-slate-500 border-slate-500" 
                    : "bg-red-500 hover:bg-red-600"
                )}
                onClick={toggleCamera}
                data-testid="button-toggle-camera"
              >
                {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>
              
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="icon"
                className={cn(
                  "h-14 w-14 rounded-full transition-all duration-200 shadow-lg",
                  isMicOn 
                    ? "bg-slate-600 hover:bg-slate-500 border-slate-500" 
                    : "bg-red-500 hover:bg-red-600"
                )}
                onClick={toggleMic}
                data-testid="button-toggle-mic"
              >
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl transition-all duration-200 hover:scale-105"
                onClick={handleEndCall}
                data-testid="button-end-call"
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}