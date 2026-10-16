import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { checkCustomRules } from './src/utils/chatLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory response repetition guard across girls
const girlResponseHistory: Record<string, string[]> = {};

// Intelligent in-character conversational engine (supports 10-message memory, anti-repetition, Kajal Auto Wali slang, Gonda, fare, distance)
function generateFallbackReply(
  girlName: string,
  girlPersonality: string,
  trust: number,
  userName: string | null,
  message: string,
  pastReplies: string[] = [],
  history: Array<{ role: string; text: string }> = []
): { reply: string; trustDelta: number; mood: string } {
  const nameCall = userName ? ` ${userName}` : '';
  const cleanMsg = message.toLowerCase().trim();

  // Helper to pick candidate that has NOT been used in pastReplies or recent history
  const pickFresh = (candidates: string[]): string => {
    const fresh = candidates.find(
      (c) =>
        !pastReplies.some((p) => p.toLowerCase().includes(c.slice(0, 15).toLowerCase())) &&
        !history.some((h) => h.text.toLowerCase().includes(c.slice(0, 15).toLowerCase()))
    );
    return fresh || candidates[Math.floor(Math.random() * candidates.length)];
  };

  const isKajal =
    girlName.toLowerCase().includes('kajal') ||
    girlPersonality.toLowerCase().includes('auto') ||
    girlPersonality.toLowerCase().includes('rickshaw');

  // ==========================================
  // SPECIALIZED HANDLING: Kajal Auto Wali
  // (Street-smart, fearless, raw Delhi/Bambaiya slang, golden heart)
  // ==========================================
  if (isKajal) {
    // 1. Gonda questions
    if (cleanMsg.includes('gonda')) {
      const gondaOptions = [
        `Arey Gonda? Boss, Dilli se Gonda poora 650 kilometer hai! Auto ka CNG raste mein dhuaan ho jayega! 😂 Par agar chalna hi hai, toh batao... Kajal ka meter bullet train ki tarah daudega!`,
        `Gonda chalna hai? Bhai auto mein kamar ka halwa ban jayega! Par bolte ho toh Highway pakadte hain, raste mein dhabe pe kulhad wali chai meri taraf se!`,
        `Arey boss Gonda ka naam sun ke mere auto ka horn bajne laga! Waha ke raste mast hain, par meter ka hisab seedha tagda lagega... chalna hai kya?`,
        `Gonda UP mein hai boss, lamba chakkar hai! Par Kajal jab steering pakadti hai toh traffic bhi salute maarta hai. Baitho meter down kar diya!`,
        `Gonda tak auto se? Himmat chahiye boss! Par apun ka Bajaj auto kisi Ferrari se kam nahi hai, kaho toh abhi nikalte hain!`
      ];
      return {
        reply: pickFresh(gondaOptions),
        trustDelta: 1, // User sends 1 message = Level +1 point
        mood: 'Dabanng 🛺',
      };
    }

    // 2. Fare / Kiraya / Rate / Meter / Paise questions
    if (
      cleanMsg.includes('fare') ||
      cleanMsg.includes('kiraya') ||
      cleanMsg.includes('kiraye') ||
      cleanMsg.includes('paise') ||
      cleanMsg.includes('kitna legi') ||
      cleanMsg.includes('kitna logi') ||
      cleanMsg.includes('kitne paise') ||
      cleanMsg.includes('kitna lagega') ||
      cleanMsg.includes('rate') ||
      cleanMsg.includes('meter') ||
      cleanMsg.includes('kharcha')
    ) {
      const fareOptions = [
        `Dekh boss, Kajal ka meter ekdum honest hai! 15 rupay per kilometer, na ek rupiya kam na zyada. Chhutta (change) ready rakhna bas, 500 ka note mat thama dena!`,
        `Kiraye ki baat kar rahe ho? Apun koi lootera nahi hai boss! Jitna meter bolega utna hi lungi. Dil bada hai apun ka, par auto hawa se nahi chalta na!`,
        `Fare ka hisab clear hai boss! Agar raste mein faaltu chik-chik nahi karoge toh shagun ka 20 rupay discount bhi mil sakta hai 😉`,
        `Arey meter down hai boss! Rate card government wala hi hai, par Kajal ki safe driving aur swag bilkul free hai!`,
        `Paison ki chinta chhod boss! Apun haq ka ek rupiya nahi chhodti aur be-imaani ka ek aana nahi leti. Bindaas baitho!`
      ];
      return {
        reply: pickFresh(fareOptions),
        trustDelta: 1,
        mood: 'Witty 💰',
      };
    }

    // 3. Distance / Door / Time / Route / Traffic
    if (
      cleanMsg.includes('distance') ||
      cleanMsg.includes('door') ||
      cleanMsg.includes('kitna door') ||
      cleanMsg.includes('kitni door') ||
      cleanMsg.includes('rasta') ||
      cleanMsg.includes('traffic') ||
      cleanMsg.includes('kaha chalna') ||
      cleanMsg.includes('kaha tak') ||
      cleanMsg.includes('time')
    ) {
      const distOptions = [
        `Distance ki tension mat lo boss! Jab tak Kajal steering pe hai, ghante ka rasta aadhi ghante me nipat jayega. Bas seat pakad ke baithna!`,
        `Kitna bhi door ho, apun ka Bajaj auto bina ruke bhagta hai! Raste mein red light ho ya jaam, apun nikalne ka rasta dhoondh hi leti hai.`,
        `Rasta lamba hai boss, par auto me meri playlist bajegi toh pata bhi nahi chalega kab pahunch gaye!`,
        `Delhi-NCR ka traffic toh apun ke baayein hath ka khel hai boss! Galiyon se cut maar ke nikaal lungi, tension nahi lene ka.`
      ];
      return {
        reply: pickFresh(distOptions),
        trustDelta: 1,
        mood: 'Fearless ⚡',
      };
    }

    // 4. Kajal general banter / street-smart slang
    const kajalBanter = [
      `Bolo boss${nameCall}! Kajal ke auto me sawari mast aur baat cheet ekdum jhakaas milegi. Kya chal raha hai?`,
      `Apun sadak ki dabanng rani hai boss! Dil ki saaf hu, jo hai muh pe bolti hu faaltu makkhan lagana apne ko jamta nahi.`,
      `Meter down hai boss! Aaj mood mast hai, batao tumhari gaadi kaise chal rahi hai zindagi ke track pe?`,
      `Arey bindass bolo boss! Kajal ke auto me baithne ke baad log tension bhool jaate hain, tum batao kya chal raha hai?`,
      `Chai ki talab lag rahi hai boss! Agle mod pe tapri aane wali hai, chaloge adrak wali kadak chai peene?`
    ];
    return {
      reply: pickFresh(kajalBanter),
      trustDelta: 1,
      mood: 'Dabanng 🛺',
    };
  }

  // ==========================================
  // GENERAL INTENT-BASED RESPONSES FOR ALL CHARACTERS
  // ==========================================

  // A. Where are you / City / Kahan
  if (cleanMsg.includes('kaha') || cleanMsg.includes('kahan') || cleanMsg.includes('shehar')) {
    const locationOptions = [
      `Apne shehar ki khubsurat hawa aur yaadon ke beech baithi hu${nameCall}! Tum batao, tum kahan se ho?`,
      `Bas yahi apne adda pe baithi hu! Tumhara shehar yaha se kitni door padta hai waise?`,
      `Yahi tumhare screen ke doosri taraf! Par waise batao, kabhi hamare shehar taraf aana hua hai?`
    ];
    return {
      reply: pickFresh(locationOptions),
      trustDelta: 1,
      mood: 'Curious 🤔',
    };
  }

  // B. What are you doing / Kya kar rahi ho
  if (cleanMsg.includes('kya kar') || cleanMsg.includes('kya chal') || cleanMsg.includes('free ho')) {
    const activityOptions = [
      `Bas tumhare messages ka intezar kar rahi thi${nameCall}! Aaj ka din kaisa guzra tumhara?`,
      `Thoda relax kar rahi hu aur tumhari baatein sun rahi hu. Tumhara koi exciting plan hai aaj?`,
      `Chai ka cup hath me hai aur phone pe tumse chat! Isse behtar aur kya hoga?`
    ];
    return {
      reply: pickFresh(activityOptions),
      trustDelta: 1,
      mood: 'Playful 😉',
    };
  }

  // C. Greetings (Hi, Hello, Hey)
  if (
    cleanMsg.startsWith('hi') ||
    cleanMsg.startsWith('hello') ||
    cleanMsg.startsWith('hey') ||
    cleanMsg.includes('kaise ho') ||
    cleanMsg.includes('kaisa hai')
  ) {
    const greetingOptions = [
      `Hey${nameCall}! Tumhara message dekh ke bohot accha laga. Batao aaj kya chal raha hai?`,
      `Hello${nameCall}! Mai ekdum badiya hu, tum batao tumhara din kaisa chal raha hai?`,
      `Arey hello! Tumse baat karne ka man tha, acha hua tumne ping kiya. Sab theek thak?`
    ];
    return {
      reply: pickFresh(greetingOptions),
      trustDelta: 1,
      mood: 'Happy 😊',
    };
  }

  // D. Compliments / Flirting
  if (
    cleanMsg.includes('sundar') ||
    cleanMsg.includes('cute') ||
    cleanMsg.includes('khoobsurat') ||
    cleanMsg.includes('pyari') ||
    cleanMsg.includes('khubsurat') ||
    cleanMsg.includes('smart')
  ) {
    if (trust < 25) {
      const cautiousOptions = [
        `Tareef ke liye shukriya, par itni jaldi maska mat lagao! Pehle thodi real dosti banao 😉`,
        `Hehe tareef achhi lagi, par mai itni jaldi impress nahi hoti! Thoda aur baat karo.`
      ];
      return {
        reply: pickFresh(cautiousOptions),
        trustDelta: 1,
        mood: 'Observing 🤨',
      };
    }
    const sweetOptions = [
      `Aww${nameCall}, tum jab aise tareef karte ho na toh sach me dil khush ho jata hai 💕`,
      `Itna sweet bologe toh aadat lag jayegi tumhari! Sach keh rahi hu, bohot ache ho tum.`
    ];
    return {
      reply: pickFresh(sweetOptions),
      trustDelta: 1,
      mood: 'Warm 🌸',
    };
  }

  // E. Trust Level Progressions (Warm, Observing, Friendly)
  if (trust >= 50) {
    const warmOptions = [
      `Tumse baat karke sach me dil ko sukoon milta hai${nameCall}! Tum bohot alag ho baaki sab se 💕`,
      `Pata nahi kyu, par tumhare sath baat karte waqt waqt ka pata hi nahi chalta${nameCall}!`,
      `Jab tumhara message aata hai na, toh automatically chehre pe smile aa jaati hai!`
    ];
    return {
      reply: pickFresh(warmOptions),
      trustDelta: 1,
      mood: 'Warm 🌸',
    };
  }

  if (trust < 20) {
    const observingOptions = [
      `Hmm, dekhte hain kitne sachhe aur loyal ho tum! Pehle thoda achhe se baat karke vishwas jeeto.`,
      `Baat toh theek kar rahe ho, par mujhe logon ko samajhne me thoda time lagta hai. Apne baare me kuch aur batao?`
    ];
    return {
      reply: pickFresh(observingOptions),
      trustDelta: 1,
      mood: 'Observing 🤨',
    };
  }

  // Default dynamic friendly pool (Zero repetition)
  const friendlyPool = [
    `Zabardast baat boli tumne${nameCall}! Aise hi dil khol ke baatein kiya karo, bohot maza aata hai.`,
    `Haha tumhara style sach me kamaal ka hai! Aise hi muskuraate raha karo.`,
    `Ye hui na dosti wali baat! Mujhe tumhare vichaar jaan ke sach me kaafi accha laga.`,
    `Tumhare jaise dost se baat karke din ki saari thakaan utar jaati hai${nameCall}!`,
    `Aage kya socha hai fir? Mujhe batao, sun rahi hu poore dhyaan se!`
  ];
  return {
    reply: pickFresh(friendlyPool),
    trustDelta: 1, // User sends 1 message = Level +1 point
    mood: 'Friendly 😊',
  };
}

// POST /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      girlId,
      girlName,
      girlPersonality,
      girlMood,
      trust = 10,
      userName = null,
      message,
      history = [],
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const girlKey = `${girlId}_${girlName}`;
    if (!girlResponseHistory[girlKey]) {
      girlResponseHistory[girlKey] = [];
    }
    const pastReplies = girlResponseHistory[girlKey];

    // Step 1: Run deterministic custom rule engine first (enforcing explicit bug fixes & requirements)
    const ruleResult = checkCustomRules(
      message,
      trust,
      girlName,
      girlPersonality,
      userName,
      pastReplies
    );

    if (ruleResult.isHandled) {
      pastReplies.push(ruleResult.reply);
      if (pastReplies.length > 20) pastReplies.shift();

      const newTrust = Math.min(100, Math.max(0, trust + ruleResult.trustDelta));
      return res.json({
        reply: ruleResult.reply,
        trust: newTrust,
        mood: ruleResult.newMood || girlMood,
        detectedName: ruleResult.detectedName || null,
      });
    }

    // Step 2: Query Gemini API (gemini-3.8-flash)
    if (ai) {
      try {
        const recentHistoryFormatted = history.slice(-10).map((h: any) => `${h.role === 'user' ? (userName || 'User') : girlName}: ${h.text}`).join('\n');
        const avoidedReplies = pastReplies.slice(-10).join(' | ');

        const systemInstruction = `You are ${girlName}, an interactive character in the Kavya AI Story app.
Character Personality: ${girlPersonality}
Current Trust Level: ${trust}/100.
User's Known Name: ${userName ? userName : "Unknown yet (do not assume unless user tells you)"}.
Previous replies you gave that you MUST NEVER REPEAT: [${avoidedReplies}]

STRICT RULES:
1. Speak in natural Indian Hinglish (Hindi written in Roman English alphabet).
2. Keep response strictly 1 to 2 short lines maximum. Very natural and crisp.
3. NEVER repeat questions or greetings like "Chunar kila gaye ho kabhi?" or repeat previous sentences. Always keep conversation moving forward with fresh thoughts.
4. Adapt mood and trust:
   - If user is rude, arrogant, or asks for gf with low trust (<20), respond with attitude or firm boundary.
   - If user is respectful, shares stories, or compliments nicely, award +1 level point per message.
   - If trust > 50, feel free to be shy, sweet, or subtly romantic.
5. You must output JSON matching the requested schema.`;

        const promptText = `Conversation History:
${recentHistoryFormatted}
User: ${message}

Respond in character as ${girlName} in Hinglish (1-2 lines).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: '1 to 2 lines Hinglish conversational response',
                },
                trustDelta: {
                  type: Type.INTEGER,
                  description: 'Level change: +1 per message (or -1 if rude)',
                },
                mood: {
                  type: Type.STRING,
                  description: 'Current emotional mood with emoji (e.g. Happy 😊, Shy 💕, Witty 😉)',
                },
              },
              required: ['reply', 'trustDelta', 'mood'],
            },
          },
        });

        const rawText = response.text?.trim() || '';
        if (rawText) {
          const parsed = JSON.parse(rawText);
          const trustChange = typeof parsed.trustDelta === 'number' && parsed.trustDelta < 0 ? -1 : 1;
          const updatedTrust = Math.min(100, Math.max(0, trust + trustChange));

          pastReplies.push(parsed.reply);
          if (pastReplies.length > 20) pastReplies.shift();

          return res.json({
            reply: parsed.reply,
            trust: updatedTrust,
            mood: parsed.mood || girlMood,
            detectedName: null,
          });
        }
      } catch (geminiError) {
        console.error('Gemini generation error, falling back gracefully:', geminiError);
      }
    }

    // Step 3: Graceful fallback if Gemini is offline or rate-limited
    const fallback = generateFallbackReply(girlName, girlPersonality, trust, userName, message, pastReplies, history);
    const delta = fallback.trustDelta < 0 ? -1 : 1;
    const updatedTrust = Math.min(100, Math.max(0, trust + delta));
    pastReplies.push(fallback.reply);
    if (pastReplies.length > 20) pastReplies.shift();

    return res.json({
      reply: fallback.reply,
      trust: updatedTrust,
      mood: fallback.mood,
      detectedName: null,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      reply: 'Arey internet thoda slow ho gaya lagta hai! Ek baar fir se bolo na?',
      trust: req.body?.trust || 10,
      mood: 'Confused 😅',
    });
  }
});

// Direct Release APK Download Route
app.get(['/app-release.apk', '/download/app-release.apk', '/api/download-apk'], (_req, res) => {
  const possiblePaths = [
    path.resolve(__dirname, 'public', 'app-release.apk'),
    path.resolve(__dirname, 'dist', 'app-release.apk'),
    path.resolve(__dirname, 'app-release.apk'),
    path.resolve(process.cwd(), 'public', 'app-release.apk'),
    path.resolve(process.cwd(), 'app-release.apk'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="app-release.apk"');
      return res.sendFile(p);
    }
  }

  res.status(404).send('APK file not found or currently building.');
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`kavya AI Story server running on port ${PORT}`);
  });
}

startServer();
