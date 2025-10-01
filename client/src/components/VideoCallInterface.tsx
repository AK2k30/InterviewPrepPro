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
  User,
  MessageSquare,
  Volume2,
  VolumeX,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@shared/schema";
import { useAIConversation } from "@/hooks/useAIConversation";

interface UserData {
  name: string;
  currentRole: string;
  targetRole: string;
}

interface VideoCallInterfaceProps {
  interviewerName?: string;
  role: string;
  userData: UserData;
  onEndCall: (duration: number) => void;
}

export default function VideoCallInterface({ 
  interviewerName = "AI Interviewer", 
  role,
  userData,
  onEndCall 
}: VideoCallInterfaceProps) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  // AI Conversation hook
  const {
    messages,
    state: aiState,
    startRecording,
    stopRecording,
    clearError,
    stopAudio,
    startNewConversation
  } = useAIConversation(userData);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const aiVideoRef = useRef<HTMLVideoElement>(null);
  const aiIdleVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
      // Start new AI conversation when interview begins
      startNewConversation();
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

  // Media stream management
  useEffect(() => {
    const startMediaStream = async () => {
      if (isCameraOn || isMicOn) {
        try {
          const constraints = {
            video: isCameraOn,
            audio: isMicOn
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          
          if (videoRef.current && isCameraOn) {
            videoRef.current.srcObject = stream;
          }
          
          console.log('Media stream started:', { video: isCameraOn, audio: isMicOn });
        } catch (err) {
          console.log('Media access denied or unavailable:', err);
          // Fallback: turn off the failed media
          if (err instanceof Error && err.name === 'NotAllowedError') {
            setIsCameraOn(false);
            setIsMicOn(false);
          }
        }
      } else {
        // Stop current stream when both camera and mic are off
        stopMediaStream();
      }
    };

    const stopMediaStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    startMediaStream();

    return () => {
      stopMediaStream();
    };
  }, [isCameraOn, isMicOn]);

  // Control AI video based on speaking state
  useEffect(() => {
    if (aiVideoRef.current && aiIdleVideoRef.current) {
      if (aiState.isPlaying) {
        // AI is speaking - show speaking video, hide idle video
        aiVideoRef.current.style.opacity = '1';
        aiIdleVideoRef.current.style.opacity = '0';
        aiVideoRef.current.play().catch(console.error);
        aiIdleVideoRef.current.pause();
      } else {
        // AI is not speaking - show idle video, hide speaking video
        aiVideoRef.current.style.opacity = '0';
        aiIdleVideoRef.current.style.opacity = '1';
        aiVideoRef.current.pause();
        aiIdleVideoRef.current.play().catch(console.error);
      }
    }
  }, [aiState.isPlaying]);

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
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);
    console.log('Camera toggled:', newCameraState ? 'on' : 'off');
    
    // Immediate feedback for UI
    if (!newCameraState && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleMic = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    console.log('Microphone toggled:', newMicState ? 'on' : 'off');
    
    if (newMicState) {
      // Mic turned ON - start voice recording for AI conversation
      if (!aiState.isProcessing && !aiState.isPlaying) {
        startRecording();
      }
    } else {
      // Mic turned OFF - stop voice recording
      if (aiState.isRecording) {
        stopRecording();
      }
    }
  };


  // Get current AI message for display
  const getCurrentAIMessage = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      return lastMessage.content;
    }
    return currentQuestion;
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
    <div className="min-h-screen bg-slate-900 flex flex-col relative">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
      
      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-md border-b border-white/10">
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
      <div className="relative z-10 flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Interviewer Video - Main */}
        <div className="lg:col-span-2 relative">
          <div className="w-full h-full min-h-[350px] max-h-[65vh] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            {/* AI Speaking Video */}
            <video
              ref={aiVideoRef}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
              loop
              muted
              playsInline
              preload="auto"
              style={{ opacity: 0 }}
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* AI Idle Video */}
            <video
              ref={aiIdleVideoRef}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
              loop
              muted
              playsInline
              preload="auto"
              autoPlay
              style={{ opacity: 1 }}
            >
              <source src="/demo-2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Minimal overlay for better video visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Status indicator */}
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-green-400 rounded-full border-4 border-slate-900 shadow-lg"></div>
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
                    {aiState.isPlaying ? (
                      <div className="flex items-center gap-1">
                        <Mic className="w-4 h-4 text-green-400" />
                        <div className="flex gap-0.5">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Mic className="w-4 h-4 text-green-400" />
                    )}
                    <Video className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Video - Sidebar */}
        <div className="relative">
          <div className="w-full h-full min-h-[350px] max-h-[65vh] bg-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative">
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

      {/* AI Conversation Panel */}
      <div className="relative z-10 px-4 pb-1">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary/90">
                  {aiState.isRecording ? 'Listening... (Click mic to stop)' : 
                   aiState.isProcessing ? 'Processing your response...' : 
                   aiState.isPlaying ? 'AI Speaking' : 
                   isMicOn ? 'Ready to listen (Click mic to start recording)' : 'AI Interviewer (Turn on mic to respond)'}
                </span>
                <div className="flex gap-1">
                  {aiState.isRecording && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-2 py-0 animate-pulse">
                      <Mic className="w-2 h-2 mr-1" />
                      Recording
                    </Badge>
                  )}
                  {aiState.isProcessing && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-0">
                      <Loader2 className="w-2 h-2 mr-1 animate-spin" />
                      Processing
                    </Badge>
                  )}
                  {aiState.isPlaying && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-0">
                      <Volume2 className="w-2 h-2 mr-1" />
                      Speaking
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed" data-testid="text-current-question">
                {getCurrentAIMessage()}
              </p>
              {/* Show conversation count for debugging */}
              {/* {messages.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-slate-400">Messages in conversation: {messages.length}</span>
                </div>
              )} */}
              {aiState.currentMessage && (
                <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-xs font-medium mb-1">You said:</p>
                  <p className="text-white/80 text-xs">{aiState.currentMessage}</p>
                </div>
              )}
              {aiState.error && (
                <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-300 text-xs">{aiState.error}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-300 hover:text-red-200 p-0 h-auto mt-1"
                    onClick={clearError}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div className="relative z-10 p-3">
        <div className="flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3">
              <Button
                variant={isCameraOn ? "default" : "destructive"}
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-full transition-all duration-200 shadow-lg",
                  isCameraOn 
                    ? "bg-slate-600 hover:bg-slate-500 border-slate-500" 
                    : "bg-red-500 hover:bg-red-600"
                )}
                onClick={toggleCamera}
                data-testid="button-toggle-camera"
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-full transition-all duration-200 shadow-lg",
                  aiState.isRecording
                    ? "bg-green-500 hover:bg-green-600 animate-pulse"
                    : aiState.isProcessing
                    ? "bg-blue-500 hover:bg-blue-600"
                    : isMicOn 
                    ? "bg-slate-600 hover:bg-slate-500 border-slate-500" 
                    : "bg-red-500 hover:bg-red-600"
                )}
                onClick={toggleMic}
                disabled={aiState.isProcessing}
                data-testid="button-toggle-mic"
                title={
                  aiState.isRecording ? "Recording... Click to stop and send" :
                  aiState.isProcessing ? "Processing your message..." :
                  isMicOn ? "Click to start voice recording" : "Click to enable microphone"
                }
              >
                {aiState.isRecording ? (
                  <Mic className="w-5 h-5" />
                ) : aiState.isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isMicOn ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>

              {/* Stop Audio Button */}
              {aiState.isPlaying && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-full transition-all duration-200 shadow-lg border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20"
                  onClick={stopAudio}
                  data-testid="button-stop-audio"
                  title="Stop AI Audio"
                >
                  <VolumeX className="w-5 h-5 text-orange-400" />
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-xl transition-all duration-200 hover:scale-105"
                onClick={handleEndCall}
                data-testid="button-end-call"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}