import { useState, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationState {
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  currentMessage: string;
  error: string | null;
}

interface UserContext {
  name: string;
  currentRole: string;
  targetRole: string;
  userId?: string;
}

export const useAIConversation = (userContext?: UserContext) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<ConversationState>({
    isRecording: false,
    isProcessing: false,
    isPlaying: false,
    currentMessage: '',
    error: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate personalized system message based on user context
  const getSystemMessage = useCallback(() => {
    if (!userContext) {
      return `You are a professional tech interviewer. Conduct a technical interview with the user.
- Ask clear, real-world technical questions based on the user's previous answers.
- Keep the conversation context so follow-up questions make sense.
- Focus on coding, algorithms, system design, and problem-solving.
- Give feedback on the user's answers and guide them if needed.
- Always respond under 300 tokens so text-to-speech can handle it.`;
    }

    const { name, currentRole, targetRole } = userContext;
    
    return `You are a professional interviewer conducting an interview for ${name}.

CANDIDATE PROFILE:
- Name: ${name}
- Current Role: ${currentRole}
- Target Role: ${targetRole}

INTERVIEW GUIDELINES:
- Address the candidate by their name (${name}) to make it personal
- Focus on ${targetRole} specific questions and scenarios
- Consider their current ${currentRole} background when asking questions
- Ask role-appropriate questions for ${targetRole} position
- Provide constructive feedback based on their target role requirements
- Keep responses under 300 tokens for text-to-speech compatibility
- Maintain professional yet friendly tone throughout
- Ask follow-up questions based on their previous answers
- Test both technical knowledge and soft skills relevant to ${targetRole}

Start the interview by greeting ${name} and acknowledging their transition from ${currentRole} to ${targetRole}.`;
  }, [userContext]);

  // Start recording user's voice
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioToText(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        error: 'Failed to start recording. Please check microphone permissions.' 
      }));
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
    }
  }, [state.isRecording]);

  // Convert audio to text using STT API
  const processAudioToText = useCallback(async (audioBlob: Blob) => {
    try {
      // Convert webm to wav for better compatibility
      const wavBlob = await convertToWav(audioBlob);
      
      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');
      
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`);
      }
      
      const { text } = await response.json();
      
      if (text && text.trim()) {
        const userMessage: Message = { role: 'user', content: text.trim() };
        setState(prev => ({ ...prev, currentMessage: text.trim() }));
        
        // Get AI response with updated messages
        setMessages(prev => {
          const updatedMessages = [...prev, userMessage];
          getAIResponse(updatedMessages);
          return updatedMessages;
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          isProcessing: false,
          error: 'No speech detected. Please try again.' 
        }));
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Failed to process audio. Please try again.' 
      }));
    }
  }, []);

  // Get AI response using chat API
  const getAIResponse = useCallback(async (conversationMessages: Message[]) => {
    try {
      console.log('Sending messages to AI:', conversationMessages);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: getSystemMessage() },
            ...conversationMessages
          ],
          userId: userContext?.userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }
      
      const { reply } = await response.json();
      
      if (reply) {
        const aiMessage: Message = { role: 'assistant', content: reply };
        setMessages(prev => [...prev, aiMessage]);
        
        // Convert AI response to speech
        await playAIResponse(reply);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Failed to get AI response. Please try again.' 
      }));
    }
  }, [getSystemMessage]);

  // Play AI response using TTS
  const playAIResponse = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isPlaying: true }));
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isPlaying: false, isProcessing: false }));
        URL.revokeObjectURL(audioUrl);
      };
      
      audioRef.current.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isProcessing: false,
          error: 'Failed to play AI response audio.' 
        }));
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing AI response:', error);
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isProcessing: false,
        error: 'Failed to play AI response.' 
      }));
    }
  }, []);

  // Convert webm to wav (simplified version)
  const convertToWav = useCallback(async (webmBlob: Blob): Promise<Blob> => {
    // For now, we'll just rename the blob to .wav
    // In a production app, you might want to use a library like lamejs for proper conversion
    return new Blob([webmBlob], { type: 'audio/wav' });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Stop any ongoing audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    setMessages([]);
    setState({
      isRecording: false,
      isProcessing: false,
      isPlaying: false,
      currentMessage: '',
      error: null
    });
    stopAudio();
    
    // Start with AI greeting
    setTimeout(() => {
      const greeting = userContext 
        ? `Hello ${userContext.name}! I'm your AI interviewer. I understand you're currently working as a ${userContext.currentRole} and looking to transition to a ${userContext.targetRole} role. I'll be conducting an interview focused on ${userContext.targetRole} skills and scenarios. Let's start with a simple question: Can you tell me about yourself and what motivates you to move from ${userContext.currentRole} to ${userContext.targetRole}?`
        : "Hello! I'm your AI interviewer. I'll be conducting a technical interview with you today. Let's start with a simple question: Can you tell me about yourself and your experience in software development?";
      
      const aiMessage: Message = { role: 'assistant', content: greeting };
      setMessages([aiMessage]);
      playAIResponse(greeting);
    }, 1000);
  }, [stopAudio, playAIResponse]);

  return {
    messages,
    state,
    startRecording,
    stopRecording,
    clearError,
    stopAudio,
    startNewConversation,
  };
};
