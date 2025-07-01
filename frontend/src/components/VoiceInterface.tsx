import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const VoiceInterface: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('history', JSON.stringify(messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))));

      const response = await axios.post('http://localhost:3000/api/voice/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { transcription, response: aiResponse } = response.data;
      
      // Add user message
      const userMessage: Message = {
        text: transcription,
        sender: 'user',
        timestamp: new Date(),
      };
      
      // Add AI response
      const aiMessage: Message = {
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      // Speak the AI response using browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextChat = async (message: string) => {
    try {
      setIsProcessing(true);
      const response = await axios.post('http://localhost:3000/api/voice/chat', {
        message,
        history: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });

      const userMessage: Message = {
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      
      const aiMessage: Message = {
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      console.error('Error in text chat:', error);
      setError('Failed to process message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          GetHelp Voice Assistant
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Click the microphone to start voice interaction or use the demo tasks below
        </Typography>
        
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            variant="contained"
            size="large"
            startIcon={isRecording ? <MicOffIcon /> : <MicIcon />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            color={isRecording ? "secondary" : "primary"}
            sx={{ minWidth: 200, minHeight: 60 }}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : isRecording ? (
              'Stop Recording'
            ) : (
              'Start Recording'
            )}
          </Button>
        </Box>

        {/* Demo Task Buttons */}
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" mb={4}>
          <Button
            variant="outlined"
            onClick={() => handleTextChat("Check my account balance")}
            disabled={isProcessing}
          >
            Check Account
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTextChat("Schedule an appointment")}
            disabled={isProcessing}
          >
            Schedule Appointment
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTextChat("Track my order")}
            disabled={isProcessing}
          >
            Track Order
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTextChat("Pay my bill")}
            disabled={isProcessing}
          >
            Pay Bill
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTextChat("I need technical support")}
            disabled={isProcessing}
          >
            Tech Support
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTextChat("Tell me about your products")}
            disabled={isProcessing}
          >
            Product Info
          </Button>
        </Box>

        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Start a conversation by recording your voice or clicking a demo task
            </Typography>
          ) : (
            <List>
              {messages.map((message, index) => (
                <ListItem key={index} sx={{ 
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  px: 0
                }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <ListItemText
                      primary={message.text}
                      secondary={message.timestamp.toLocaleTimeString()}
                      secondaryTypographyProps={{
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                      }}
                    />
                  </Paper>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VoiceInterface;