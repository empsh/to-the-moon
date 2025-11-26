
import { GoogleGenAI } from "@google/genai";
import { DailyMission, DailyMissionType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Cache default headlines in case of API failure or rate limits
const FALLBACK_NEWS = [
  "BREAKING: Santa Claus declares Bitcoin legal tender at North Pole!",
  "TRUMP: 'We are going to build a firewall and the SEC is going to pay for it!'",
  "Market Analysis: Reindeer bullish on Dogecoin this season.",
  "Elf Union demands wages be paid in Ethereum.",
  "Grinch suspected of shorting the market just before Christmas."
];

const FALLBACK_COMMENTARY = [
  "This is huge! Nobody collects coins better than me.",
  "Believe me, that is a very good score.",
  "We are going to the moon, guaranteed!",
  "I love crypto, it's fantastic.",
  "Christmas is saved, thanks to me!"
];

const FALLBACK_MISSIONS = [
  "COLLECT 50 BITCOINS NOW!",
  "DODGE THE FAKE NEWS!",
  "FIND ELON MUSK!",
  "SURVIVE THE BEAR MARKET!",
  "GET TO 1000 POINTS!",
  "BUILD A WALL OF PROFITS!",
  "MAKE CRYPTO GREAT AGAIN!"
];

export const generateTrumpCommentary = async (score: number, event: 'hit' | 'miss' | 'start' | 'gameover'): Promise<string> => {
  if (!apiKey) return FALLBACK_COMMENTARY[Math.floor(Math.random() * FALLBACK_COMMENTARY.length)];

  try {
    const prompt = `
      You are Donald Trump. You are in a Christmas video game where you collect cryptocurrencies.
      The player just experienced this event: ${event} (Current Score: ${score}).
      
      Respond with a short phrase (max 15 words), funny, exaggerated, in English, in your characteristic style.
      Use words like "Huge", "Fake News", "Winner", "China", "Beautiful".
      Be positive if it's 'start' or 'hit', and defensive or critical if it's 'miss' or 'gameover'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 50,
        temperature: 1.2
      }
    });

    const text = response.text;
    if (!text) return "Make Christmas Great Again!";

    return text.replace(/"/g, '');
  } catch (error) {
    // Silently fail to fallback to prevent disrupting gameplay
    return FALLBACK_COMMENTARY[Math.floor(Math.random() * FALLBACK_COMMENTARY.length)];
  }
};

export const generateNewsHeadlines = async (): Promise<string[]> => {
  if (!apiKey) return FALLBACK_NEWS;

  try {
    const prompt = `
      Generate 5 satirical and funny "Breaking News" headlines.
      Themes: Donald Trump, Cryptocurrencies (Bitcoin, Doge), Christmas, Santa Claus, Economy.
      Format: JSON Array of strings.
      Language: English business style.
      Example: ["Bitcoin replaces coal for naughty kids", "Trump launches 'MAGA COIN'"]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return FALLBACK_NEWS;
    
    return JSON.parse(text) as string[];
  } catch (error) {
    return FALLBACK_NEWS;
  }
};

export const generateTrumpMission = async (): Promise<string> => {
  if (!apiKey) return FALLBACK_MISSIONS[Math.floor(Math.random() * FALLBACK_MISSIONS.length)];

  try {
    const prompt = `
      You are Donald Trump giving a mission to a player in a video game.
      Generate a VERY SHORT, IMPERATIVE mission (max 6 words).
      It must sound urgent and presidential.
      Examples: "Collect all the Gold!", "Avoid the Taxes!", "Find the Rocket!", "Hold the Line!".
      Return only the text of the mission in uppercase.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 20,
        temperature: 1.0
      }
    });

    const text = response.text;
    if (!text) return "WIN BIGLY!";

    return text.replace(/"/g, '').trim().toUpperCase();
  } catch (error) {
    return FALLBACK_MISSIONS[Math.floor(Math.random() * FALLBACK_MISSIONS.length)];
  }
};

export const generateDailyMission = async (): Promise<DailyMission> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Fallback
  const fallback: DailyMission = {
      date: today,
      description: "Collect 100 Bitcoins",
      type: DailyMissionType.COLLECT_BITCOIN,
      target: 100,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      reward: 500
  };

  if (!apiKey) return fallback;

  try {
      const prompt = `
          Generate a Daily Mission for a Trump-themed crypto game.
          Return a JSON object with:
          - description (string): Short, fun description (e.g. "Stimulus Check Day: Collect 500 Coins")
          - type (string): One of [COLLECT_COINS, COLLECT_BITCOIN, COLLECT_DOGE, SCORE_TOTAL, PLAY_GAMES]
          - target (number): An achievable integer target.
          - reward (number): Amount of currency reward (between 100 and 1000).
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
          }
      });

      const data = JSON.parse(response.text || "{}");
      
      if (!data.type) return fallback;

      return {
          date: today,
          description: data.description,
          type: data.type as DailyMissionType,
          target: data.target,
          progress: 0,
          isCompleted: false,
          isClaimed: false,
          reward: data.reward
      };

  } catch (error) {
      return fallback;
  }
};
