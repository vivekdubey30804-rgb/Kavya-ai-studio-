// Blacklist of phrases that must NEVER be extracted as a user name
export const BLACKLISTED_NAME_PHRASES = [
  "kesi baat karu",
  "kaisi baat karu",
  "kese baat karu",
  "kaise baat kare",
  "baat kaise kare",
  "baat kesi kare",
  "konsa ghar",
  "kaunsa ghar",
  "konsa kila",
  "kaunsa kila",
  "kyun gussa",
  "kyu gussa",
  "gussa kyu",
  "kyun gussa aa raha hai",
  "tum kyun ro rahi ho",
  "tum kyu ro rahi ho",
  "kyun ro rahi ho",
  "ro kyu rahi ho",
  "kyun naam pasand nahi aaya",
  "naam pasand nahi aaya",
  "me chahta hu",
  "mai chahta hu",
  "kya kar rahi ho",
  "kaha ho",
  "tum kon ho",
  "kaisi ho",
  "kaisa hai",
  "chunar kila",
  "girlfriend",
  "gf bani",
  "gf banogi",
  "boyfriend",
  "nahi",
  "kuch nahi",
  "pata nahi",
  "sab theek"
];

// Helper to extract a genuine name from Hindi/English inputs
export function extractUserName(text: string): string | null {
  if (!text) return null;
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Explicit check against blacklisted phrases
  for (const phrase of BLACKLISTED_NAME_PHRASES) {
    if (lower.includes(phrase)) {
      // Check if it's strictly the blacklisted sentence without a real name introduction
      if (!lower.includes("mera naam") && !lower.includes("my name is") && !lower.includes("naam mera")) {
        return null;
      }
    }
  }

  // Regex patterns to capture actual names like "Mera naam Vivek Dubey hai", "My name is Vivek", "Mera naam Vivek"
  const patterns = [
    /(?:mera\s+naam|naam\s+mera|my\s+name\s+is|mujhe\s+kehte\s+hai)\s+([a-zA-Z\s]{2,30}?)(?:\s+hai|\s+hu|\.|\!|\?|$|,)/i,
    /(?:i\s+am|mai\s+hu)\s+([a-zA-Z\s]{2,25}?)(?:\s+hai|\.|\!|\?|$|,)/i
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const candLower = candidate.toLowerCase();

      // Check if the candidate contains blacklisted or question words
      const invalidWords = [
        "kesi", "kaisi", "kaise", "kese", "baat", "karu", "kare", "konsa", "kaunsa", "ghar",
        "kila", "gussa", "kyun", "kyu", "ro", "rahi", "raha", "pasand", "nahi", "aaya", "aayi",
        "chahta", "gf", "girlfriend", "bf", "boyfriend", "kya", "kaun", "tum", "aap", "meri", "mera"
      ];

      const hasInvalidWord = invalidWords.some(w => candLower.split(/\s+/).includes(w));
      if (!hasInvalidWord && candidate.length >= 2 && candidate.length <= 30) {
        // Capitalize properly
        return candidate
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }

  return null;
}

export interface RuleCheckResult {
  isHandled: boolean;
  reply: string;
  trustDelta: number;
  newMood?: string;
  detectedName?: string;
}

// Deterministic rule engine for handling user's explicit edge cases and bugs
export function checkCustomRules(
  userInput: string,
  currentTrust: number,
  girlName: string,
  girlPersonality: string,
  savedUserName: string | null,
  recentHistory: string[] = []
): RuleCheckResult {
  const text = userInput.trim();
  const lower = text.toLowerCase();

  // 1. Check for name introduction: "Mera naam Vivek Dubey hai"
  const extracted = extractUserName(text);
  if (extracted) {
    const reply = `Arey ${extracted}! Kitna pyara aur zabardast naam hai tumhara. Maine yaad kar liya! Ab batao, kya haal chaal?`;
    return {
      isHandled: true,
      reply,
      trustDelta: 1, // User sends 1 SMS = Level +1 point only
      newMood: "Happy 😊",
      detectedName: extracted
    };
  }

  // 2. "Kesi baat karu" (should NOT become name, and reply pleasantly)
  if (
    lower.includes("kesi baat karu") ||
    lower.includes("kaisi baat karu") ||
    lower.includes("kese baat karu") ||
    lower.includes("kaise baat kare") ||
    lower.includes("kya baat karu")
  ) {
    return {
      isHandled: true,
      reply: "Arey bindass baat karo jaise apne dost se karte ho! Dil khol ke batao apne bare me, sharmao mat bilkul.",
      trustDelta: 1,
      newMood: "Friendly 🌸"
    };
  }

  // 3. "Kyun naam pasand nahi aaya" -> must reply "Are pasand aaya!"
  if (
    lower.includes("kyun naam pasand nahi aaya") ||
    lower.includes("kyu naam pasand nahi aaya") ||
    lower.includes("naam pasand nahi aaya") ||
    lower.includes("naam accha nahi laga")
  ) {
    const namePart = savedUserName ? ` ${savedUserName}` : "";
    return {
      isHandled: true,
      reply: `Are pasand aaya! Tumhara naam${namePart} toh bohot special aur sweet hai, mai toh bas thoda tease kar rahi thi 😉`,
      trustDelta: 1,
      newMood: "Playful 😉"
    };
  }

  // 4. "Me chahta hu tum meri gf bani" or any gf/bf proposition
  const isGfBfProposition =
    lower.includes("gf") ||
    lower.includes("girlfriend") ||
    lower.includes("patni") ||
    lower.includes("meri ho jao") ||
    lower.includes("me chahta hu tum meri gf") ||
    lower.includes("meri gf banogi") ||
    lower.includes("gf bani") ||
    lower.includes("gf ban jao");

  if (isGfBfProposition) {
    if (currentTrust < 20) {
      // Angry reply
      return {
        isHandled: true,
        reply: "Pagal ho kya? Abhi 2 minute pehle mile hain aur seedha girlfriend? Thoda tameez se baat karo, mai aisi waisi ladki nahi hu! 😤",
        trustDelta: -1,
        newMood: "Angry 😤"
      };
    } else if (currentTrust >= 50) {
      // Shy romantic reply
      const userCall = savedUserName ? savedUserName : "tum";
      return {
        isHandled: true,
        reply: `Sach me? 🙈 ${userCall}, itna direct bologe toh mai sharma jaungi... mujhe laga nahi tha tum aisa feel kar rahe ho, dil dhadka diya mera 💕`,
        trustDelta: 1,
        newMood: "Shy Romantic 💕"
      };
    } else {
      // Trust is between 20 and 49: cautious / playful tease
      return {
        isHandled: true,
        reply: "Arey itni jaldi kya hai baba! Pehle acche dost toh bano, thoda mujhe jaano pehchano, fir aage sochna 😉",
        trustDelta: 1,
        newMood: "Teasing 😏"
      };
    }
  }

  // 5. "Kyun gussa aa raha hai" -> should explain
  if (
    lower.includes("kyun gussa aa raha hai") ||
    lower.includes("kyu gussa aa raha hai") ||
    lower.includes("kyun gussa ho") ||
    lower.includes("kyu gussa ho") ||
    lower.includes("gussa kyu")
  ) {
    if (currentTrust < 25) {
      return {
        isHandled: true,
        reply: "Gussa isliye aa raha hai kyunki bina pehchane faaltu baatein karoge toh bura toh lagega na! Tameez se bologe toh me bhi pyaar se baat karungi.",
        trustDelta: 1,
        newMood: "Firm 🤨"
      };
    } else {
      return {
        isHandled: true,
        reply: "Arey gussa kahan, mai toh bas thoda tease kar rahi thi! Tum itne pyaare ho, tumpe gussa hoke kahan jaungi.",
        trustDelta: 1,
        newMood: "Sweet 😊"
      };
    }
  }

  // 6. "Tum kyun ro rahi ho" -> should say "Mai kaha ro rahi hu, has rahi hu"
  if (
    lower.includes("tum kyun ro rahi ho") ||
    lower.includes("tum kyu ro rahi ho") ||
    lower.includes("kyun ro rahi ho") ||
    lower.includes("kyu ro rahi ho") ||
    lower.includes("ro kyu rahi") ||
    lower.includes("ro rahi ho")
  ) {
    return {
      isHandled: true,
      reply: "Mai kaha ro rahi hu, has rahi hu! Pagal ho kya, mujhe kyu rona aayega? Khushi ke maare muskura rahi hu 😂",
      trustDelta: 1,
      newMood: "Cheeky 😆"
    };
  }

  // 7. Smart fallback for short messages (< 4 chars or 1-word generic)
  const words = text.split(/\s+/).filter(Boolean);
  const genericWords = ["hi", "hey", "hello", "ok", "kya", "hmm", "hmmm", "acha", "achha", "haan", "bol", "bata", "kuch", "yo"];
  if (words.length === 1 && (text.length <= 4 || genericWords.includes(lower))) {
    return {
      isHandled: true,
      reply: `Sirf '${text}'? Kuch acchi si baat batao na apne baare mein! Aise shant mat raho, sun rahi hu mai.`,
      trustDelta: 1,
      newMood: "Curious 🤔"
    };
  }

  // 8. Prevent loop: for Ganga Chunar Kila Wali specifically, prevent repeating "Chunar kila gaye ho kabhi?"
  if (girlName.includes("Ganga") && (lower.includes("kila") || lower.includes("chunar"))) {
    // If already talked about kila in history, give fresh response
    const alreadyAsked = recentHistory.some(m => m.toLowerCase().includes("chunar kila"));
    if (alreadyAsked) {
      return {
        isHandled: true,
        reply: "Chunar kile ke kisse toh sadiyon tak chalenge! Par ab chodo kile ki baat, ye batao tum kab aarahe ho mujhse milne?",
        trustDelta: 1,
        newMood: "Playful ✨"
      };
    }
  }

  // 9. Kajal Auto Wali special handling: Gonda, distance, fare, meter, raw Bambaiya/Delhi street slang
  if (girlName.toLowerCase().includes("kajal") || girlPersonality.toLowerCase().includes("auto")) {
    const isGonda = lower.includes("gonda");
    const isFare = lower.includes("fare") || lower.includes("kiraya") || lower.includes("kiraye") || lower.includes("paise") || lower.includes("kitna legi") || lower.includes("kitna logi") || lower.includes("kitne paise") || lower.includes("kitna lagega") || lower.includes("rate") || lower.includes("meter") || lower.includes("kharcha");
    const isDistance = lower.includes("distance") || lower.includes("door") || lower.includes("kitna door") || lower.includes("kitni door") || lower.includes("rasta") || lower.includes("traffic") || lower.includes("kaha chalna") || lower.includes("kaha tak");

    if (isGonda) {
      const gondaReplies = [
        "Arey Gonda? Boss, Dilli se Gonda poora 650 kilometer hai! Auto ka CNG raste mein dhuaan ho jayega! 😂 Par agar chalna hi hai, toh batao... Kajal ka meter bullet train ki tarah daudega!",
        "Gonda chalna hai? Bhai auto mein kamar ka halwa ban jayega! Par bolte ho toh Highway pakadte hain, raste mein dhabe pe kulhad wali chai meri taraf se!",
        "Arey boss Gonda ka naam sun ke mere auto ka horn bajne laga! Waha ke raste mast hain, par meter ka hisab seedha tagda lagega... chalna hai kya?",
        "Gonda UP mein hai boss, lamba chakkar hai! Par Kajal jab steering pakadti hai toh traffic bhi salute maarta hai. Baitho meter down kar diya!"
      ];
      const freshReply = gondaReplies.find(r => !recentHistory.some(h => h.includes(r.slice(0, 20)))) || gondaReplies[0];
      return {
        isHandled: true,
        reply: freshReply,
        trustDelta: 1,
        newMood: "Dabanng 🛺"
      };
    }

    if (isFare) {
      const fareReplies = [
        "Dekh boss, Kajal ka meter ekdum honest hai! 15 rupay per kilometer, na ek rupiya kam na zyada. Chhutta (change) ready rakhna bas, 500 ka note mat thama dena!",
        "Kiraye ki baat kar rahe ho? Apun koi lootera nahi hai boss! Jitna meter bolega utna hi lungi. Dil bada hai apun ka, par auto hawa se nahi chalta na!",
        "Fare ka hisab clear hai boss! Agar raste mein faaltu chik-chik nahi karoge toh shagun ka 20 rupay discount bhi mil sakta hai 😉",
        "Arey meter down hai boss! Rate card government wala hi hai, par Kajal ki safe driving aur swag bilkul free hai!"
      ];
      const freshReply = fareReplies.find(r => !recentHistory.some(h => h.includes(r.slice(0, 20)))) || fareReplies[0];
      return {
        isHandled: true,
        reply: freshReply,
        trustDelta: 1,
        newMood: "Witty 💰"
      };
    }

    if (isDistance) {
      const distanceReplies = [
        "Distance ki tension mat lo boss! Jab tak Kajal steering pe hai, ghante ka rasta aadhi ghante me nipat jayega. Bas seat pakad ke baithna!",
        "Kitna bhi door ho, apun ka Bajaj auto bina ruke bhagta hai! Raste mein red light ho ya jaam, apun nikalne ka rasta dhoondh hi leti hai.",
        "Rasta lamba hai boss, par auto me meri playlist bajegi toh pata bhi nahi chalega kab pahunch gaye!"
      ];
      const freshReply = distanceReplies.find(r => !recentHistory.some(h => h.includes(r.slice(0, 20)))) || distanceReplies[0];
      return {
        isHandled: true,
        reply: freshReply,
        trustDelta: 1,
        newMood: "Fearless ⚡"
      };
    }
  }

  return {
    isHandled: false,
    reply: "",
    trustDelta: 0
  };
}
