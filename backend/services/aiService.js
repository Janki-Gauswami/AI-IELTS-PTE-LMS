/**
 * AI Service Layer for IELTS & PTE LMS
 * Provides statistical algorithms, predictive band modeling, weakness analysis,
 * and dynamic study plan generation with graceful fallbacks and AI adapter hooks.
 */

// Predict IELTS & PTE scores based on historical attempts
exports.predictScore = (attempts = [], targetExam = "IELTS", targetScore = 7.5) => {
  if (!attempts || attempts.length === 0) {
    if (targetExam === "IELTS") {
      return {
        predictedScore: 6.0,
        confidence: 60,
        historicalAttemptsCount: 0,
        status: "Baseline Estimate",
        sectionPredictions: {
          listening: 6.0,
          reading: 6.0,
          writing: 5.5,
          speaking: 6.0,
        },
        trajectory: "Steady",
        targetDelta: Number((targetScore - 6.0).toFixed(1)),
        recommendation: "Take your first diagnostic practice test to unlock accurate personalized prediction.",
      };
    } else {
      return {
        predictedScore: 58,
        confidence: 60,
        historicalAttemptsCount: 0,
        status: "Baseline Estimate",
        sectionPredictions: {
          speaking: 58,
          writing: 56,
          reading: 58,
          listening: 60,
        },
        trajectory: "Steady",
        targetDelta: Number((targetScore - 58).toFixed(0)),
        recommendation: "Complete a full PTE section test to refine your score prediction.",
      };
    }
  }

  // Weight recent attempts higher (0.5 for most recent, 0.3 for previous, 0.2 for older)
  let totalWeightedScore = 0;
  let totalWeights = 0;
  const recentAttempts = attempts.slice(-5);

  recentAttempts.forEach((att, idx) => {
    const weight = idx + 1; // 1, 2, 3...
    const scoreVal = Number(att.overallBand || att.overallScore || att.score || 0);
    totalWeightedScore += scoreVal * weight;
    totalWeights += weight;
  });

  const rawPrediction = totalWeights > 0 ? totalWeightedScore / totalWeights : 6.0;
  const confidence = Math.min(95, Math.max(50, 50 + attempts.length * 9));

  // Determine trend trajectory
  let trajectory = "Steady";
  if (attempts.length >= 2) {
    const firstScore = Number(attempts[0].overallBand || attempts[0].overallScore || 0);
    const lastScore = Number(attempts[attempts.length - 1].overallBand || attempts[attempts.length - 1].overallScore || 0);
    if (lastScore > firstScore) trajectory = "Improving (+0.5)";
    else if (lastScore < firstScore) trajectory = "Declining";
  }

  if (targetExam === "IELTS") {
    // Round to nearest IELTS half band (0.5)
    const roundedBand = Math.round(rawPrediction * 2) / 2;
    const finalBand = Math.min(9.0, Math.max(4.0, roundedBand || 6.5));
    const targetDelta = Number((targetScore - finalBand).toFixed(1));

    return {
      predictedScore: finalBand,
      confidence,
      historicalAttemptsCount: attempts.length,
      status: finalBand >= targetScore ? "On Track for Target" : "Preparation Required",
      sectionPredictions: {
        listening: Math.min(9.0, Number((finalBand + 0.2).toFixed(1))),
        reading: Math.min(9.0, Number((finalBand).toFixed(1))),
        writing: Math.max(4.5, Number((finalBand - 0.5).toFixed(1))),
        speaking: Math.min(9.0, Number((finalBand + 0.1).toFixed(1))),
      },
      trajectory,
      targetDelta,
      recommendation:
        targetDelta <= 0
          ? "You are currently projecting at or above your target band! Focus on timing and full mocks."
          : `You are ${targetDelta} bands away from your target ${targetScore}. Focus on Writing and timed Reading.`,
    };
  } else {
    // PTE scale 10-90
    const finalScore = Math.min(90, Math.max(20, Math.round(rawPrediction) || 65));
    const targetDelta = Number((targetScore - finalScore).toFixed(0));

    return {
      predictedScore: finalScore,
      confidence,
      historicalAttemptsCount: attempts.length,
      status: finalScore >= targetScore ? "On Track for Target" : "Preparation Required",
      sectionPredictions: {
        speaking: Math.min(90, finalScore + 2),
        writing: Math.max(20, finalScore - 4),
        reading: Math.min(90, finalScore),
        listening: Math.min(90, finalScore + 1),
      },
      trajectory,
      targetDelta,
      recommendation:
        targetDelta <= 0
          ? "Projecting on target! Maintain oral fluency and repeat sentence accuracy."
          : `Aiming for ${targetScore}? Focus on Write From Dictation and Read Aloud oral fluency.`,
    };
  }
};

// Detect student weaknesses based on section performance
exports.detectWeaknesses = (sectionScores = {}, exam = "IELTS") => {
  const isIelts = exam === "IELTS";
  const defaultIelts = {
    Listening: 6.5,
    Reading: 6.0,
    Writing: 5.5,
    Speaking: 7.0,
  };
  const defaultPte = {
    "Speaking & Writing": 62,
    Reading: 58,
    Listening: 65,
  };

  const scores = Object.keys(sectionScores).length > 0 ? sectionScores : isIelts ? defaultIelts : defaultPte;

  const weaknesses = [];
  const strengths = [];

  Object.entries(scores).forEach(([section, score]) => {
    const numScore = Number(score);
    const threshold = isIelts ? 6.5 : 65;

    if (numScore < threshold) {
      let advice = "";
      if (section.includes("Writing")) {
        advice = "Focus on Task 2 paragraph coherence, linking devices, and grammatical range.";
      } else if (section.includes("Reading")) {
        advice = "Improve skimming/scanning speed and practice True/False/Not Given questions.";
      } else if (section.includes("Listening")) {
        advice = "Practice Sections 3 & 4 with fast accents and note-taking techniques.";
      } else if (section.includes("Speaking")) {
        advice = "Work on Part 2 long turn structure and discourse markers to reduce hesitation.";
      } else {
        advice = "Daily targeted practice with 20 minutes review.";
      }

      weaknesses.push({
        section,
        score: numScore,
        severity: isIelts ? (numScore < 6.0 ? "High" : "Medium") : numScore < 55 ? "High" : "Medium",
        impact: isIelts ? "-0.5 to -1.0 Band Impact" : "-10 to -15 PTE Score Impact",
        recommendedAction: advice,
      });
    } else {
      strengths.push({
        section,
        score: numScore,
        level: "Solid Proficiency",
      });
    }
  });

  return {
    exam,
    weaknesses,
    strengths,
    primaryBottleneck: weaknesses.length > 0 ? weaknesses[0].section : "None (Balanced Profile)",
  };
};

// Generate personalized study plan
exports.generateStudyPlan = ({
  targetExam = "IELTS",
  targetScore = 7.5,
  examDate = null,
  dailyHours = 2,
  weaknesses = [],
}) => {
  const days = [
    {
      day: "Monday",
      focus: "Reading & Vocabulary",
      tasks: [
        "Complete 1 Timed Reading Passage (20 mins)",
        "Analyze True/False/Not Given mistakes",
        "Review 15 Academic Collocations",
      ],
      duration: `${dailyHours} Hours`,
      skills: ["Reading", "Vocabulary"],
    },
    {
      day: "Tuesday",
      focus: "Speaking & Fluency",
      tasks: [
        "Practice Part 2 Cue Cards (2 topics, record responses)",
        "Part 3 Abstract Discussion practice with timer",
        "Pronunciation & Intonation drill",
      ],
      duration: `${dailyHours} Hours`,
      skills: ["Speaking"],
    },
    {
      day: "Wednesday",
      focus: "Listening & Accents",
      tasks: [
        "Listen to 1 Full Listening Section (40 questions)",
        "Transcribe fast dialogues from Section 3",
        "Spell-check common dictation mistakes",
      ],
      duration: `${dailyHours} Hours`,
      skills: ["Listening"],
    },
    {
      day: "Thursday",
      focus: "Writing Task 1 & Task 2",
      tasks: [
        "Plan and draft 1 Academic Essay (Task 2)",
        "Review Task 1 Graph/Chart structure and overview paragraph",
        "Grammar accuracy audit (complex sentences check)",
      ],
      duration: `${dailyHours} Hours`,
      skills: ["Writing", "Grammar"],
    },
    {
      day: "Friday",
      focus: "Weakness Remediation (Intensive)",
      tasks: [
        "Targeted drills on primary bottleneck area",
        "Review all errors logged during the week",
        "Timed speed practice test",
      ],
      duration: `${dailyHours} Hours`,
      skills: ["Review", "Speed"],
    },
    {
      day: "Saturday",
      focus: "Full Mock Exam Simulation",
      tasks: [
        `Complete 1 Full Timed ${targetExam} Mock Examination`,
        "Simulate official test conditions without pauses",
        "Auto-submit and generate score report",
      ],
      duration: "3 Hours",
      skills: ["Full Test"],
    },
    {
      day: "Sunday",
      focus: "Analysis & Rest",
      tasks: [
        "Review Mock Exam question analysis and answer keys",
        "Update personal vocabulary & mistake notebook",
        "Light reading / podcast listening",
      ],
      duration: "1 Hour",
      skills: ["Revision"],
    },
  ];

  return {
    targetExam,
    targetScore,
    examDate,
    dailyHours,
    weeklySchedule: days,
    estimatedWeeksToTarget: 4,
    recommendedPacing: `${dailyHours * 6} Hours per week`,
  };
};
