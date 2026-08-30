import React, { useEffect, useRef, useState } from 'react'
import { DeepgramClient } from '@deepgram/sdk';
import CommandRouter, { getBuiltInResponse, messageRouter } from "../CommandRouter"
import "../Styles/VoiceAi.css"
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';




const VoiceAi = ({setIsAwake, isAwake, userCredentials, setOrderObj, returnStatement, setReturnStatement,setAskMsg ,askMsg}) => {
  const commandRouter = useRef(new CommandRouter())
  const messageROuter = useRef(new messageRouter())
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(''); 
  const ct  = useRef(true)
  const ws = useRef()
  const onSpeech = useRef(false)
  const speechInterval = useRef()
  const textMsg = useRef(false)
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const currentKeyIndex = useRef(0)
  
  
  const DEEPGRAM_API_KEY = 'f21bcdfbb98f1f88e2e1f39aada2cf821a42c0ff';
  
  useEffect(() => {
    startListening();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!askMsg) {
      return
    }
    speak(`Done, What would you like to message ${askMsg} about?`)
    textMsg.current = false
  }, [askMsg])
  

  useEffect(() => {
    setStatus('Hello, how can I help you?');
    playSound();
    speak("Hello, how can I help you?");
    onSpeech.current = false
    stopListening()
  }, [])

  useEffect(() => {
    if (isAwake) {
      speechInterval.current = setInterval(() => {
        setStatus("")
      }, 3000);
    }
    else{
      clearInterval(speechInterval.current)
      speechInterval.current = ""
    }
  }, [isAwake])
  
  useEffect(() => {
    if (returnStatement) {
      speak(`${returnStatement}. What is your next command`)
      setReturnStatement()
    }
  }, [returnStatement])
  
  
  const speak = (message) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      resolve();
      return;
    }
      try {
        const utterance = new SpeechSynthesisUtterance(message);
      console.log(utterance)
       utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const currentWord = message.substring(event.charIndex, event.charIndex + event.charLength);
          setStatus(currentWord)
        }
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
      } catch (error) {
        alert("there is error")
      }
    })
  }

  const query = async(command) =>{
    if (ct.current) {
      axios.post("https://tilchat-api-backend.onrender.com/voiceAi", {
            prompt: command
        })
        .then(async(result)=>{
          console.log(result);
          
            await speak(result?.data?.message)
        })
    }
  }

  const removeNotation = (command) => {
    return command
      .replace(/[.,!?;:()"'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const processCommand = async (command) => {
    onSpeech.current = true
    const builtIn = getBuiltInResponse(command, userCredentials);
    if (builtIn) {
      await speak(builtIn);
      setResponse(builtIn);
      onSpeech.current = false
      if (builtIn?.includes("closing AI")) {
        closeAi()
      }
      return
    } else {
      forceStopAudio()
      stopListening()
      const removedNotation = removeNotation(command)
      console.log(removedNotation);
      const parsed = commandRouter.current.parse(removedNotation);
      const lower = command.toLowerCase();
      setOrderObj(parsed)
      switch (parsed.action) {
        case 'message':
          await speak(`Okay, messaging ${parsed.recipient}`);
          window.dispatchEvent(new CustomEvent('voice-command', {
            detail: { type: 'message', data: parsed }
          }));
          onSpeech.current = false
          break;
          
        case 'open_chat':
          await speak(`Opening chat with ${parsed.user}`);
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { type: 'chat', data: parsed }
          }));
          onSpeech.current = false
          break;
          
        case 'play':
          await speak(`Playing ${parsed.content}`);
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { type: 'play', data: parsed }
          }));
          onSpeech.current = false
          break;
          
        case 'navigate':
          await speak(`Going to ${parsed.destination}`);
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { type: 'navigate', data: parsed }
          }));
          onSpeech.current = false
          break;
          
        case 'search_friends':
          await speak(`Searching for ${parsed.query}`);
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { type: 'search', data: parsed }
          }));
          onSpeech.current = false
          break;
          
        case 'ask_ai':
        case 'question':
          onSpeech.current = false
          await speak(`Let me think about that`);
          query(command)
          break;
          
        default:
          onSpeech.current = false
          await speak(`Let me think about that`);
          onSpeech.current = false
          query(command)
      }
    }
  };
  
  const startListening = async () => {
    if (ct.current) {
      try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const params = new URLSearchParams({
        model: 'nova-2',
        language: 'en-US',
        punctuate: 'true',
        interim_results: 'true',
        endpointing: '500',
        keywords: 'Tilux:30',
        encoding: 'linear16',
        sample_rate: '16000',
      });
      
      ws.current = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${params.toString()}`,
        ['token', DEEPGRAM_API_KEY]
      );
      
      ws.current.onopen = () => {
        console.log('Connected');
        setupAudio(stream, ws.current);
      };
      
      ws.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const text = data.channel?.alternatives[0]?.transcript;
        const isFinal = data.is_final;
        console.log(text);
        setStatus(text)
        console.log(isFinal);
        if (text && text.trim()) {
            stopListening()
          if (askMsg) {
            const checkResponse = messageROuter?.current.process(text)
            console.log(checkResponse);
            if (!checkResponse?.success) {
              await speak(checkResponse?.error)
              setAskMsg(null)
            }
            else{
              console.log(checkResponse);
              await speak(`Okay, the content of the message is: ${checkResponse?.message}`)
            }
            return
          }
          setTranscript(text);
          const lower = text.toLowerCase();
          
          if (isAwake && text.length > 0 && isFinal) {
            if (!onSpeech.current) {
                processCommand(text);
            }
          }
        }
      };
      
      ws.current.onerror = () => console.error('WebSocket error');
      ws.current.onclose = () => {
        if (status !== 'Stopped') {
          setTimeout(startListening, 3000);
        }
      };
      
      wsRef.current = ws.current;
    } catch (error) {
      console.error('Error:', error);
    }
    }
  };
  
  const setupAudio = (stream, ws) => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (event) => {
      if (ws.readyState === WebSocket.OPEN) {
        const audioData = event.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          pcmData[i] = Math.floor(audioData[i] * 32767);
        }
        ws.send(pcmData);
      }
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
  };
  
  const stopListening = () => {
    if (wsRef.current) wsRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setStatus('');
    setTranscript('');
  };
  
  const playSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.2;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => ctx.close(), 400);
    } catch (e) {}
  };

 const closeDeepgramConnection = () => {
  if (wsRef.current) {
    wsRef.current.close();
    wsRef.current = null;
  }
  if (audioContextRef.current) {
    audioContextRef.current.close();
    audioContextRef.current = null;
  }
  if (mediaStreamRef.current) {
    mediaStreamRef.current.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  }
};

const forceStopAudio = () => {
  window.speechSynthesis.cancel();
  if (audioContextRef.current) {
    audioContextRef.current.close();
    audioContextRef.current = null;
  }
  if (wsRef.current?.processor) {
    wsRef.current.processor.disconnect();
  }
  if (wsRef.current?.source) {
    wsRef.current.source.disconnect();
  }
  isSpeakingRef.current = false;
};

const closeAi = () => {
  closeDeepgramConnection();
  forceStopAudio();
  setIsAwake(false);
  setStatus("");
  setTranscript("");
  setResponse("");
  onSpeech.current = false;
  ws.current = null
  ct.current = false
  clearInterval(speechInterval.current)
  speechInterval.current = ""
};

  return (
    <div className='voiceAi-overall'>
        {
            isAwake?(
            <div className="roll-parent" onClick={closeAi}>
              <h1>{status}</h1>
                <div className="voiceRoll"></div>
            </div>
            )
            :null
        }
    </div>
  )
}

export default VoiceAi
