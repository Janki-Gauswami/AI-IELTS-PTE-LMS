import api from "../api/axios";

export const getBandPrediction = async (params = {}) => {
  try {
    const res = await api.get("/ai/band-prediction", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch AI band prediction." };
  }
};

export const getWeaknessDetection = async (params = {}) => {
  try {
    const res = await api.get("/ai/weakness-detection", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to detect weaknesses." };
  }
};

export const generateStudyPlan = async (data) => {
  try {
    const res = await api.post("/ai/study-plan", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to generate AI study plan." };
  }
};

export const getCohortAIOverview = async () => {
  try {
    const res = await api.get("/ai/cohort-overview");
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch cohort overview." };
  }
};

export const evaluateSubmission = async (data) => {
  try {
    const res = await api.post("/ai/evaluate-submission", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to evaluate submission with AI." };
  }
};

/**
 * Public Speaking & Extempore Speech Evaluator
 * Calls the backend /ai/analyze-speech endpoint.
 * Includes comprehensive client-side fallback if backend is unavailable.
 */
export const analyzeSpeechPractice = async (payload) => {
  try {
    const res = await api.post("/ai/analyze-speech", payload);
    if (res.data?.success) {
      return res.data.data;
    }
  } catch (err) {
    console.warn("Backend speech analysis unavailable, using client evaluator:", err);
  }

  // Client-side fallback evaluator (full heuristic NLP engine)
  const {
    topic = "Public Speaking",
    transcript = "",
    duration = 60,
    pauseCount = 0,
    pauseDuration = 0,
    fillerCounts = {},
  } = payload;

  const cleanTranscript = (transcript || "").trim();
  const words = cleanTranscript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const safeDuration = Math.max(10, Number(duration) || 60);
  const minutes = safeDuration / 60;
  const wpm = Math.round(wordCount / minutes);

  // 1. Fillers Analysis
  let totalFillers = 0;
  const detailedFillers = { ...fillerCounts };
  Object.values(detailedFillers).forEach((c) => (totalFillers += Number(c) || 0));

  const trackedFillers = ["umm", "um", "aa", "ah", "uh", "er", "like", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean"];
  const lowerText = cleanTranscript.toLowerCase();
  trackedFillers.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    if (count > (detailedFillers[filler] || 0)) {
      totalFillers += count - (detailedFillers[filler] || 0);
      detailedFillers[filler] = count;
    }
  });

  const fillerRatePerMin = Number((totalFillers / minutes).toFixed(1));
  let fillerLevel = "Excellent";
  let fillerTips = "Minimal filler words used. Your delivery sounds polished and confident.";
  if (fillerRatePerMin > 6) {
    fillerLevel = "High";
    fillerTips = `You used approx. ${fillerRatePerMin} filler words per minute. Practice replacing fillers with silent pauses.`;
  } else if (fillerRatePerMin > 2.5) {
    fillerLevel = "Moderate";
    fillerTips = "Noticeable filler sounds detected. Take a gentle breath before starting the next clause.";
  }

  // 2. Pause Analysis
  const safePauseCount = Math.max(0, Number(pauseCount) || 0);
  const safePauseDuration = Math.max(0, Number(pauseDuration) || 0);
  const avgPauseLength = safePauseCount > 0 ? Number((safePauseDuration / safePauseCount).toFixed(1)) : 0;
  const pauseRatio = Math.min(100, Math.round((safePauseDuration / safeDuration) * 100));

  let pauseStatus = "Fluid & Natural";
  if (pauseRatio > 35) pauseStatus = "Frequent Hesitations";
  else if (pauseRatio > 20) pauseStatus = "Normal Conversational Pauses";
  else if (pauseRatio < 5 && wordCount > 60) pauseStatus = "Rushed / Few Pauses";

  // 3. Dynamic Grammar Rules Engine
  const grammarErrors = [];
  const rules = [
    {
      regex: /\b(he|she|it)\s+(don't|do|have|go|want)\b/i,
      issue: "Subject-Verb Agreement",
      explanation: "Third-person singular subjects (he, she, it) require singular verbs (doesn't, does, has, goes, wants).",
      fix: (match) => match.replace(/\bdon't\b/i, "doesn't").replace(/\bdo\b/i, "does").replace(/\bhave\b/i, "has").replace(/\bgo\b/i, "goes").replace(/\bwant\b/i, "wants"),
    },
    {
      regex: /\b(they|we|you)\s+(was|has|doesn't)\b/i,
      issue: "Subject-Verb Agreement",
      explanation: "Plural pronouns require plural verbs (were, have, don't).",
      fix: (match) => match.replace(/\bwas\b/i, "were").replace(/\bhas\b/i, "have").replace(/\bdoesn't\b/i, "don't"),
    },
    {
      regex: /\b(did|didn't)\s+([a-z]+ed|went|saw|ate|bought|came|told)\b/i,
      issue: "Double Past Tense",
      explanation: "The auxiliary verb 'did / didn't' must be followed by the base form of the main verb.",
      fix: (match) => match.replace(/\bwent\b/i, "go").replace(/\bsaw\b/i, "see").replace(/\bate\b/i, "eat").replace(/\bbought\b/i, "buy").replace(/\bcame\b/i, "come").replace(/\btold\b/i, "tell").replace(/([a-z]+)ed\b/i, "$1"),
    },
    {
      regex: /\b(discuss\s+about)\b/i,
      issue: "Redundant Preposition",
      explanation: "'Discuss' is a transitive verb; omit 'about'.",
      fix: () => "discuss",
    },
    {
      regex: /\b(more\s+better|more\s+easier|most\s+best)\b/i,
      issue: "Double Comparative / Superlative",
      explanation: "Do not combine 'more/most' with comparative adjectives ending in -er or -est.",
      fix: (m) => m.replace(/more\s+/i, "").replace(/most\s+/i, ""),
    },
    {
      regex: /\b(every\s+people|each\s+students)\b/i,
      issue: "Quantifier Agreement",
      explanation: "'Every' and 'each' modify singular countable nouns (e.g., 'everyone' or 'every person').",
      fix: (m) => m.replace(/every people/i, "everyone").replace(/each students/i, "each student"),
    },
    {
      regex: /\b(married\s+with)\b/i,
      issue: "Incorrect Preposition",
      explanation: "In standard English, use 'married to' instead of 'married with'.",
      fix: () => "married to",
    },
  ];

  const sentences = cleanTranscript.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 5);
  sentences.forEach((sentence) => {
    rules.forEach((rule) => {
      const match = sentence.match(rule.regex);
      if (match && grammarErrors.length < 5) {
        const errorSnippet = match[0];
        const correctedSnippet = rule.fix(errorSnippet);
        grammarErrors.push({
          originalPhrase: errorSnippet,
          fullOriginalSentence: sentence,
          issue: rule.issue,
          explanation: rule.explanation,
          correction: correctedSnippet,
          improvedSentence: sentence.replace(errorSnippet, correctedSnippet),
        });
      }
    });
  });

  // 4. Scoring calculations
  const grammarScore = Math.max(55, Math.min(96, 94 - grammarErrors.length * 9));
  const fluencyScore = Math.max(50, Math.min(95, 92 - Math.min(35, pauseRatio * 0.9)));
  const fillerScore = Math.max(40, Math.min(98, 96 - totalFillers * 4));
  const contentScore = Math.max(50, Math.min(95, 65 + Math.min(25, wordCount / 4)));

  const overallScore = Math.round(
    grammarScore * 0.3 + fluencyScore * 0.3 + fillerScore * 0.2 + contentScore * 0.2
  );
  const equivalentBand = Math.min(9.0, Math.max(4.0, Number((4.0 + (overallScore / 100) * 5.0).toFixed(1))));

  let performanceLevel = "Proficient Public Speaker";
  if (overallScore >= 85) performanceLevel = "Executive / Master Speaker";
  else if (overallScore >= 75) performanceLevel = "Effective & Persuasive Communicator";
  else if (overallScore >= 60) performanceLevel = "Competent Speaker (Developing Flow)";
  else performanceLevel = "Foundation Level (Requires Practice)";

  const actionableTips = [];
  if (totalFillers > 2) {
    actionableTips.push(`Minimize hesitation fillers: You used '${Object.keys(detailedFillers).slice(0, 2).join("' & '")}' multiple times. Embrace silent pauses.`);
  } else {
    actionableTips.push("Strong vocal clarity: Great filler word suppression; maintain vocal inflection for key arguments.");
  }

  if (pauseRatio > 25) {
    actionableTips.push("Speech continuity: Group thoughts into chunks of 4-7 words to eliminate halting mid-sentence stops.");
  } else if (wpm < 110) {
    actionableTips.push("Conversational pace: Practice speaking slightly more dynamically to keep listeners captivated.");
  } else {
    actionableTips.push("Strategic cadence: Use a 1-second pause right before delivering your core punchline.");
  }

  if (grammarErrors.length > 0) {
    actionableTips.push(`Grammar precision: Review ${grammarErrors[0].issue.toLowerCase()} rules shown in your scorecard.`);
  } else {
    actionableTips.push("Speech structure: Keep reinforcing the 3-part blueprint (Hook → Core Arguments → Resonant Takeaway).");
  }

  return {
    topic,
    transcript: cleanTranscript,
    wordCount,
    duration: Math.round(safeDuration),
    wpm,
    paceStatus: wpm >= 120 && wpm <= 160 ? "Optimal Conversational Pace" : wpm < 120 ? "Deliberate / Slow" : "Fast Pace",
    paceFeedback: wpm >= 120 && wpm <= 160 ? "Natural pace, easy to follow (120-160 WPM)." : "Aim for 120-150 words per minute for optimal audience comprehension.",
    overallScore,
    equivalentBand,
    performanceLevel,
    scores: {
      grammarScore: Math.round(grammarScore),
      fluencyScore: Math.round(fluencyScore),
      fillerScore: Math.round(fillerScore),
      contentScore: Math.round(contentScore),
    },
    fillerAnalysis: {
      totalFillers,
      fillerRatePerMin,
      fillerLevel,
      breakdown: detailedFillers,
      tips: fillerTips,
    },
    pauseAnalysis: {
      pauseCount: safePauseCount,
      pauseDurationSeconds: Math.round(safePauseDuration),
      avgPauseLength,
      pauseRatioPercent: pauseRatio,
      pauseStatus,
    },
    grammarErrors,
    actionableTips,
    evaluatedAt: new Date().toISOString(),
  };
};

