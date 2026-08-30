export class messageRouter{
  constructor(){
    this.commands = [
      {
        pattern: /(?:okay[,.]?\s|alright[,.]?\s)?(?:tell|message|text|say)(?:[,.]?\s(?:him|her))?\s+that\s+(.+)/i,
        handler: (match)=>({
          message: match[match.length - 1]
        })
      }
    ]
  }
  process(input) {    
    if (!input || typeof input !== 'string') {
      return { success: false, error: 'error, Invalid command' };
    }
    for (const command of this.commands) {
      const match = input.toLocaleLowerCase().match(command.pattern);
      
      if (match) {
        return {
          success: true,
          ...command.handler(match)
        }
      }
    }

    return { success: false, error: "Sorry, I don't understand that, what will you like to send to " };
  }
}

class CommandRouter {
  constructor() {
    this.commands = [
      {
        patterns: [/go to\s+(.+)\s+section/i, /navigate to\s+(.+)/i, /open\s+(.+)\s+section/i],
        type: 'navigate',
        handler: (match) => ({
          action: 'navigate',
          section: match[1].toLowerCase(),
          destination: match[1]
        })
      },
      {
        patterns: [/message\s+(.+)/i, /send message to\s+(.+)/i, /msg\s+(.+)/i],
        type: 'message',
        handler: (match) => ({
          action: 'message',
          recipient: match[1],
          content: match[1]
        })
      },
      {
        patterns: [
          /(?:message|msg|text|tell|send|say)\s+(\w+)\s+(.+)/i,
          /(?:message|msg|text|tell|send|say)\s+to\s+(\w+)\s+(.+)/i,
        ],
        handler: (match) => ({
          action: 'message_with_content',
          recipient: match[1],
          content: match[2].trim()
        })
      },
      
      {
        patterns: [
          /(?:message|msg|text|tell|send)\s+(\w+):\s*['"]?([^'"]+)['"]?/i,
          /(?:message|msg|text|tell|send)\s+to\s+(\w+):\s*['"]?([^'"]+)['"]?/i,
        ],
        handler: (match) => ({
          action: 'message_with_content',
          recipient: match[1],
          content: match[2].trim()
        })
      },
      {
        patterns: [
          /(?:open|show|view|go to)\s+chat\s+with\s+(\w+)/i,
          /(?:open|show|view|go to)\s+(\w+)['']?s\s+chat/i,
          /chat\s+with\s+(\w+)/i,
          /talk\s+to\s+(\w+)/i,
          /message\s+(\w+)$/i,
          /msg\s+(\w+)$/i,
          /text\s+(\w+)$/i,
          /send\s+to\s+(\w+)$/i,
        ],
        handler: (match) => ({
          action: 'open_chat',
          recipient: match[1],
          content: null
        })
      },
      
      {
        patterns: [
          /(?:message|msg|text|tell|send)\s+(\w+)\s+saying\s+(.+)/i,
          /(?:message|msg|text|tell|send)\s+to\s+(\w+)\s+saying\s+(.+)/i,
        ],
        handler: (match) => ({
          action: 'message_with_content',
          recipient: match[1],
          content: match[2].trim()
        })
      },
      {
        patterns: [
          /(?:message|msg|text|tell|send)\s+(\w+)\s+that\s+(.+)/i,
          /(?:message|msg|text|tell|send)\s+to\s+(\w+)\s+that\s+(.+)/i,
        ],
        handler: (match) => ({
          action: 'message_with_content',
          recipient: match[1],
          content: match[2].trim()
        })
      },
      
      {
        patterns: [
          /reply\s*:\s*(.+)/i,
          /reply\s+with\s*(.+)/i,
          /say\s+(.+)$/i,
          /tell\s+(?:her|him|them)\s+(.+)/i,
          /reply\s+to\s+that\s*:\s*(.+)/i,
        ],
        handler: (match) => ({
          action: 'reply',
          content: match[1].trim(),
          recipient: null
        })
      },
      
      {
        patterns: [
          /hit up\s+(\w+)/i,
          /ping\s+(\w+)/i,
          /reach out to\s+(\w+)/i,
          /contact\s+(\w+)/i,
          /dm\s+(\w+)/i,
        ],
        handler: (match) => ({
          action: 'open_chat',
          recipient: match[1],
          content: null
        })
      },
      
      {
        patterns: [
          /quick\s+(?:message|text|msg)\s+to\s+(\w+)\s+(.+)/i,
          /urgent\s+(?:message|text|msg)\s+to\s+(\w+)\s+(.+)/i,
          /(?:message|text|msg)\s+to\s+(\w+)\s+urgently\s+(.+)/i,
        ],
        handler: (match) => ({
          action: 'message_with_content',
          recipient: match[1],
          content: match[2].trim(),
          urgent: true
        })
      },
      {
        patterns: [
          /tell\s+the\s+(team|group|everyone)/i,
          /message\s+the\s+(team|group|everyone)/i,
          /notify\s+(all|everyone)/i,
          /send\s+to\s+group/i,
        ],
        handler: (match) => ({
          action: 'open_chat',
          recipient: 'group',
          groupType: match[1] || 'everyone',
          content: null
        })
      },
      
      {
        patterns: [
          /tell\s+the\s+(team|group|everyone)\s+(.+)/i,
          /message\s+the\s+(team|group|everyone)\s+(.+)/i,
          /notify\s+(all|everyone)\s+(.+)/i,
        ],
        handler: (match) => ({
          action: 'message_with_content',
          recipient: 'group',
          groupType: match[1],
          content: match[2].trim()
        })
      },
      
      {
        patterns: [
          /check\s+messages\s+from\s+(\w+)/i,
          /read\s+(?:my\s+)?chat\s+with\s+(\w+)/i,
          /show\s+messages\s+from\s+(\w+)/i,
          /see\s+conversation\s+with\s+(\w+)/i,
        ],
      },
      {
        patterns: [/open\s+(.+)\s+chat/i, /start chat with\s+(.+)/i, /chat with\s+(.+)/i],
        type: 'chat',
        handler: (match) => ({
          action: 'open_chat',
          user: match[1],
          context: 'chat'
        })
      },
      
      {
        patterns: [/play\s+(.+)/i, /watch\s+(.+)/i, /listen to\s+(.+)/i],
        type: 'play',
        handler: (match) => ({
          action: 'play',
          content: match[1],
          type: this.detectMediaType(match[1])
        })
      },
      
      {
        patterns: [/go to settings section/i, /open settings/i, /settings/i],
        type: 'settings_section',
        handler: () => ({
          action: 'navigate',
          section: 'settings',
          destination: 'settings Settings'
        })
      },
      
      {
        patterns: [/go to live video section/i, /open live video/i, /live video/i],
        type: 'live_video',
        handler: () => ({
          action: 'navigate',
          section: 'live_video',
          destination: 'Live Video'
        })
      },
      
      {
        patterns: [/go to live video section and play\s+(.+)/i, /watch live\s+(.+)/i],
        type: 'live_video_play',
        handler: (match) => ({
          action: 'play_live_video',
          content: match[1],
          section: 'live_video'
        })
      },
      
      {
        patterns: [/go to friend section and search\s+(.+)/i, /search friend\s+(.+)/i, /find friend\s+(.+)/i],
        type: 'friend_search',
        handler: (match) => ({
          action: 'search_friends',
          query: match[1],
          section: 'friends'
        })
      },
      
      {
        patterns: [/go to friends section/i, /open friends/i, /show friends/i],
        type: 'friends_section',
        handler: () => ({
          action: 'navigate',
          section: 'friends',
          destination: 'Friends List'
        })
      },
      
      {
        patterns: [/go to AI/i, /open AI/i, /launch AI/i, /start AI/i],
        type: 'ai_section',
        handler: () => ({
          action: 'navigate',
          section: 'ai',
          destination: 'AI Assistant'
        })
      },
      
      {
        patterns: [/open AI and send\s+(.+)/i, /ask AI\s+(.+)/i, /AI\s+(.+)/i],
        type: 'ai_message',
        handler: (match) => ({
          action: 'ai_message',
          message: match[1],
          section: 'ai'
        })
      },
      
      {
        patterns: [/what is\s+(.+)/i, /explain\s+(.+)/i, /how to\s+(.+)/i, 
                   /why is\s+(.+)/i, /tell me about\s+(.+)/i, /what does\s+(.+)/i,
                   /can you\s+(.+)/i, /where is\s+(.+)/i, /when is\s+(.+)/i],
        type: 'question',
        handler: (match) => ({
          action: 'ask_ai',
          question: match[1],
          type: 'question'
        })
      },
      
      {
        patterns: [/(.+)/],
        type: 'unknown',
        handler: (match) => ({
          action: 'unknown',
          text: match[1]
        })
      }
    ];
  }
  
  detectMediaType(content) {
    const videoKeywords = ['video', 'movie', 'film', 'clip', 'youtube'];
    const musicKeywords = ['song', 'music', 'track', 'audio', 'playlist'];
    
    const lowerContent = content.toLowerCase();
    
    if (videoKeywords.some(k => lowerContent.includes(k))) {
      return 'video';
    }
    if (musicKeywords.some(k => lowerContent.includes(k))) {
      return 'music';
    }
    return 'unknown';
  }
  
  parse(command) {
    const trimmedCommand = command.trim();
    
    for (const cmd of this.commands) {
      for (const pattern of cmd.patterns) {
        const match = trimmedCommand.match(pattern);
        if (match) {
          const result = cmd.handler(match);
          return {
            ...result,
            original: trimmedCommand,
            type: cmd.type,
            confidence: 1.0
          };
        }
      }
    }
    
    return {
      action: 'unknown',
      original: trimmedCommand,
      text: trimmedCommand,
      type: 'unknown',
      confidence: 0.5
    };
  }
}



export const getBuiltInResponse = (command, userCredentials) => {
    const lower = command.toLowerCase().trim();
    console.log("lower", lower);
    
    if (lower == "stop" || lower ==  "stop." || lower == "go off" || lower == "go off." || lower == "shut up" || lower == "close" || lower == "close now") {
       return "Okay, closing AI, thank you for your time"
    }
    if (lower.includes('who are you') || lower.includes('what are you')) {
      return "Hello! My name is Tilux, your personal assistant. I'm here to help you with messaging, navigation, playing media, and answering your questions. How can I assist you today?";
    }
    
    if (lower.includes('how are you') || lower.includes('how are you doing')) {
      return "I'm doing great, thank you for asking! I'm ready and waiting to help you with whatever you need.";
    }
    
    if (lower.includes('what can you do') || lower.includes('can you do') || lower.includes('your capabilities')) {
      return "I can help you with lots of things! I can send messages, open chats, play music or videos, navigate to different sections, search for friends, and answer questions using AI. Just tell me what you need!";
    }
    
    if (lower.includes('thank you') || lower.includes('thanks') || lower.includes('really appreciate')) {
      return `You're very welcome ${userCredentials?.UserName || ""}! Is there anything else I can help you with?`;
    }
    
    if (lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening')) {
      const hour = new Date().getHours();
      let timeOfDay = "day";
      if (hour < 12) timeOfDay = "morning";
      else if (hour < 17) timeOfDay = "afternoon";
      else timeOfDay = "evening";
      return `Good ${timeOfDay} ${userCredentials?.UserName || ""}! How can I help you today?`;
    }
    
    if (lower.includes('your name') || lower.includes('developed you') || lower.includes('are you') || lower.includes('built you') || lower.includes('build you') || lower.includes('made you')) {
      return "My name is Tilux! I'm your personal voice assistant.";
    }
    
    if (lower.includes('hey tilux') || lower.includes('hello tilux') || lower.includes('hello') || lower.includes('hi there') || lower.includes('hey') ) {
      return `Hello ${userCredentials?.UserName || ""}! How can I help you today?`;
    }
    return null; 
  };


export default CommandRouter;