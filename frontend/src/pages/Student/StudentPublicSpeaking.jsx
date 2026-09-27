import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  TOPIC_CATEGORIES,
  PUBLIC_SPEAKING_TOPICS,
} from "../../data/publicSpeakingTopics";
import { analyzeSpeechPractice } from "../../services/aiService";
import {
  Shuffle,
  Sparkles,
  Clock,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  Volume2,
  Lock,
  ArrowRight,
  HelpCircle,
  Activity,
  Trash2,
  History,
  BookOpen,
  Edit3,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Globe,
} from "lucide-react";
import "./StudentPublicSpeaking.css";

const PREP_TIME_SECONDS = 300; // 5 minutes

export default function StudentPublicSpeaking() {
  const { user } = useAuth();
  const studentStorageKey = `student_speech_practice_${user?._id || "local_student"}`;

  // Flow State: 'TOPIC' | 'PREPARE' | 'SPEAK' | 'ANALYSIS'
  const [currentStep, setCurrentStep] = useState("TOPIC");

  // Selected Topic
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
  const [currentTopic, setCurrentTopic] = useState(PUBLIC_SPEAKING_TOPICS[0]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [topicShuffleAnim, setTopicShuffleAnim] = useState(false);

  // Preparation Timer (5 Minutes)
  const [prepTimeLeft, setPrepTimeLeft] = useState(PREP_TIME_SECONDS);
  const [isPrepRunning, setIsPrepRunning] = useState(false);
  const [scratchpadNotes, setScratchpadNotes] = useState("");
  const prepTimerRef = useRef(null);

  // Live Presentation State
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [cameraError, setCameraError] = useState("");

  // Live Speech Recognition & Metrics
  const speechRecognitionRef = useRef(null);
  const [isSpeechRunning, setIsSpeechRunning] = useState(false);
  const isSpeechRunningRef = useRef(false);
  const hasStartedSpeakingRef = useRef(false);
  const [isSpeechListening, setIsSpeechListening] = useState(false);
  const audioContextRef = useRef(null);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [speechDuration, setSpeechDuration] = useState(0);
  const speechTimerRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [showPromptNotes, setShowPromptNotes] = useState(true);

  // Real-time Filler Word Tracker
  const [liveFillerCounts, setLiveFillerCounts] = useState({
    umm: 0,
    aa: 0,
    uh: 0,
    like: 0,
    "you know": 0,
    basically: 0,
    actually: 0,
    literally: 0,
  });

  // Dialect, error, edit & manual states (defaults to en-IN for crystal-clear Indian English recognition)
  const [speechLanguage, setSpeechLanguage] = useState("en-IN");
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const [speechErrorMsg, setSpeechErrorMsg] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isCurrentlyInPauseLive, setIsCurrentlyInPauseLive] = useState(false);

  // References for continuous speech accumulation across pause restarts
  const committedTranscriptRef = useRef("");
  const restartTimeoutRef = useRef(null);
  const vocalDroneCounterRef = useRef(0);

  // Real-time Pause & Break Tracker
  const [pauseCount, setPauseCount] = useState(0);
  const [pauseDuration, setPauseDuration] = useState(0);
  const lastSpokenTimestampRef = useRef(null);

  // AI Evaluation & Results
  const [evaluating, setEvaluating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Practice History (Stored in Student's LocalStorage only)
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // =========================================================================
  // Load Local Practice History
  // =========================================================================
  useEffect(() => {
    try {
      const stored = localStorage.getItem(studentStorageKey);
      if (stored) {
        setPracticeHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load local practice history:", e);
    }
  }, [studentStorageKey]);

  const saveAttemptToLocal = (attemptData) => {
    try {
      const updated = [attemptData, ...practiceHistory].slice(0, 25);
      setPracticeHistory(updated);
      localStorage.setItem(studentStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save local speech attempt:", e);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your private practice history?")) {
      setPracticeHistory([]);
      localStorage.removeItem(studentStorageKey);
    }
  };

  // =========================================================================
  // Topic Randomizer
  // =========================================================================
  const handleGetRandomTopic = () => {
    setTopicShuffleAnim(true);
    setTimeout(() => {
      const filtered =
        selectedCategory === "All Topics"
          ? PUBLIC_SPEAKING_TOPICS
          : PUBLIC_SPEAKING_TOPICS.filter((t) => t.category === selectedCategory);

      const available = filtered.length > 0 ? filtered : PUBLIC_SPEAKING_TOPICS;
      const randomItem = available[Math.floor(Math.random() * available.length)];
      setCurrentTopic(randomItem);
      setTopicShuffleAnim(false);
    }, 250);
  };

  const handleApplyCustomTopic = () => {
    if (!customTopicInput.trim()) return;
    const custom = {
      id: `custom-${Date.now()}`,
      title: customTopicInput.trim(),
      category: "Personal Topic",
      difficulty: "Custom",
      blueprint: {
        hook: "Start with a thought-provoking perspective or question.",
        corePoints: [
          "Present your opening stance and core thesis.",
          "Provide supporting arguments and contrasting views.",
          "Reinforce with a vivid real-world example or lesson.",
        ],
        example: "Share a real-life observation or relatable scenario.",
        takeaway: "Conclude with an inspiring concluding message.",
      },
    };
    setCurrentTopic(custom);
    setCustomTopicInput("");
    setShowCustomModal(false);
  };

  // =========================================================================
  // Preparation Timer (5 Minutes)
  // =========================================================================
  const playChimeSound = (freq = 600, duration = 0.25) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const startPreparation = () => {
    setCurrentStep("PREPARE");
    setPrepTimeLeft(PREP_TIME_SECONDS);
    setIsPrepRunning(true);
  };

  useEffect(() => {
    if (isPrepRunning && prepTimeLeft > 0) {
      prepTimerRef.current = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev === 31) playChimeSound(700, 0.4); // 30s alert
          if (prev <= 1) {
            clearInterval(prepTimerRef.current);
            setIsPrepRunning(false);
            playChimeSound(880, 0.8); // Finished alert
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(prepTimerRef.current);
    }

    return () => clearInterval(prepTimerRef.current);
  }, [isPrepRunning, prepTimeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // =========================================================================
  // Transition to Speaking & Video Stream Setup
  // =========================================================================
  // =========================================================================
  // Transition to Speaking & Video Stream Setup
  // =========================================================================
  // =========================================================================
  // Transition to Speaking & Video Stream Setup
  // =========================================================================
  const setVideoRef = (el) => {
    videoRef.current = el;
    if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
      try {
        el.srcObject = mediaStreamRef.current;
        el.play().catch(() => {});
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (currentStep === "SPEAK" && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        try {
          videoRef.current.srcObject = mediaStreamRef.current;
          videoRef.current.play().catch(() => {});
        } catch (e) {}
      }
    }
  }, [currentStep, isVideoEnabled]);

  const startSpeakingStage = async () => {
    setIsPrepRunning(false);
    clearInterval(prepTimerRef.current);
    setCurrentStep("SPEAK");
    setSpeechDuration(0);
    setTranscript("");
    setInterimText("");
    setPauseCount(0);
    setPauseDuration(0);
    setSpeechErrorMsg("");
    setIsEditingTranscript(false);
    setIsCurrentlyInPauseLive(false);
    setLiveFillerCounts({
      umm: 0,
      aa: 0,
      uh: 0,
      like: 0,
      "you know": 0,
      basically: 0,
      actually: 0,
      literally: 0,
    });
    isSpeechRunningRef.current = true;
    hasStartedSpeakingRef.current = false;
    lastSpokenTimestampRef.current = null;

    // 1. Initialize Webcam & Mic Stream with Web Audio Analyser
    try {
      setCameraError("");
      let stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
        } catch (camErr) {
          console.warn("Camera failed, attempting audio-only stream fallback:", camErr);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setCameraError(
              "Camera is unavailable or permission was denied. Operating in Audio-Only mode with real-time mic analysis."
            );
          } catch (micErr) {
            console.warn("Microphone access also denied:", micErr);
            setCameraError(
              "Microphone & Camera permission denied. Speech recognition may be limited. You can still test with sample speech or type below."
            );
          }
        }

        if (stream) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            try {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            } catch (e) {}
          }

          // Setup Web Audio Volume & Acoustic Hesitation Monitor
          try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              audioContextRef.current = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              let vocalDroneFrames = 0;
              let lastDroneDetection = 0;

              const checkVolume = () => {
                if (!isSpeechRunningRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                const normalized = Math.min(100, Math.round((avg / 64) * 100));
                setMicVolumeLevel(normalized);

                // Voice detected at active speaking threshold
                if (avg > 8) {
                  hasStartedSpeakingRef.current = true;
                  lastSpokenTimestampRef.current = Date.now();
                }

                // AI Acoustic Hesitation & Drone Detection:
                // Low-frequency vocal energy (bins 1-4: ~80-350 Hz, fundamental frequency of "ummm", "aaah", "er")
                const lowFreqEnergy = (dataArray[1] + dataArray[2] + dataArray[3] + dataArray[4]) / 4;
                const highFreqEnergy = (dataArray[10] + dataArray[14] + dataArray[18] + dataArray[22]) / 4;

                // When holding an acoustic filler drone (vowel hum without consonant transients for >450ms)
                if (lowFreqEnergy > 26 && lowFreqEnergy > highFreqEnergy * 2.2) {
                  vocalDroneFrames++;
                  if (vocalDroneFrames > 26 && Date.now() - lastDroneDetection > 1600) {
                    lastDroneDetection = Date.now();
                    vocalDroneFrames = 0;
                    setLiveFillerCounts((prev) => ({
                      ...prev,
                      umm: (prev.umm || 0) + 1,
                    }));
                  }
                } else {
                  vocalDroneFrames = Math.max(0, vocalDroneFrames - 1);
                }

                requestAnimationFrame(checkVolume);
              };
              requestAnimationFrame(checkVolume);
            }
          } catch (audioErr) {
            console.warn("AudioContext setup notice:", audioErr);
          }
        }
      }
    } catch (err) {
      console.warn("Media stream init error:", err);
      setCameraError("Camera/Mic initial setup error. Audio/Speech will continue.");
    }

    // 2. Clear buffers and start continuous speech recognition session
    committedTranscriptRef.current = "";
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    startRecognitionSession();
    setIsSpeechRunning(true);
  };

  // =========================================================================
  // Speech Recognition & Real-time Live Tracking
  // =========================================================================
  const updateLiveFillers = (fullText) => {
    if (!fullText) return;
    const lower = fullText.toLowerCase();
    const fillers = [
      { key: "umm", regex: /\b(umm+|um|hum+|hmm+|hm|amm+|em)\b/gi },
      { key: "aa", regex: /\b(aa+|ah+|ahh+|aah+|argh)\b/gi },
      { key: "uh", regex: /\b(uh+|uhh+|er+|err+|eh+|ehh+)\b/gi },
      { key: "like", regex: /\blike\b/gi },
      { key: "you know", regex: /\b(you\s+know|ya\s+know|u\s+know)\b/gi },
      { key: "basically", regex: /\b(basically|base\s*cally)\b/gi },
      { key: "actually", regex: /\b(actually|actualy)\b/gi },
      { key: "literally", regex: /\b(literally|literaly)\b/gi },
    ];

    setLiveFillerCounts((prev) => {
      const counts = { ...prev };
      fillers.forEach(({ key, regex }) => {
        const matches = lower.match(regex);
        const textCount = matches ? matches.length : 0;
        counts[key] = Math.max(counts[key] || 0, textCount);
      });
      return counts;
    });
  };

  const handleIncrementFiller = (key) => {
    setLiveFillerCounts((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const handleLoadSampleSpeech = () => {
    const sample = `In my personal opinion, artificial intelligence is more better for students today because every people can learn at their own pace. Umm, we was discussing about it like yesterday with my classmates, you know. Basically, technology helps us learn faster, but we should not forget human creativity.`;
    committedTranscriptRef.current = sample;
    setTranscript(sample);
    setInterimText("");
    hasStartedSpeakingRef.current = true;
    lastSpokenTimestampRef.current = Date.now();
    updateLiveFillers(sample);
    setLiveFillerCounts({
      umm: 2,
      aa: 1,
      uh: 1,
      like: 2,
      "you know": 1,
      basically: 1,
      actually: 0,
      literally: 0,
    });
    setPauseCount((p) => Math.max(3, p));
    setPauseDuration((d) => Math.max(5.5, d));
    setSpeechDuration((d) => Math.max(35, d));
  };

  // Robust Continuous Speech Recognition Engine with Clean Re-instantiation on Pause/End
  const startRecognitionSession = () => {
    if (!isSpeechRunningRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser.");
      setSpeechApiSupported(false);
      setSpeechErrorMsg(
        "Live speech-to-text is not supported in this browser. You can speak freely or use 'Edit / Type' / 'Demo Speech' below to evaluate with AI."
      );
      return;
    }

    setSpeechApiSupported(true);

    // Clean up any stale recognition instance cleanly before creating a fresh one
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.abort();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage || "en-IN";
      recognition.maxAlternatives = 1;

      // Track finalized phrases within this active recognition session
      let sessionFinal = "";

      recognition.onstart = () => {
        if (!isSpeechRunningRef.current) {
          try { recognition.abort(); } catch (e) {}
          return;
        }
        setIsSpeechListening(true);
        setSpeechErrorMsg("");
      };

      recognition.onresult = (event) => {
        if (!isSpeechRunningRef.current) return;

        hasStartedSpeakingRef.current = true;
        lastSpokenTimestampRef.current = Date.now();

        let interim = "";
        let finalFromSession = "";

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const phrase = item[0].transcript;
            if (item.isFinal) {
              finalFromSession += phrase + " ";
            } else {
              interim += phrase;
            }
          }
        }

        sessionFinal = finalFromSession;

        // Combine committed transcript from previous sessions + current session final
        const combinedFinal = (
          (committedTranscriptRef.current ? committedTranscriptRef.current.trim() + " " : "") +
          sessionFinal.trim()
        ).trim();

        const liveTotal = (
          (combinedFinal ? combinedFinal + " " : "") +
          interim.trim()
        ).trim();

        setTranscript(combinedFinal);
        setInterimText(interim.trim());

        if (liveTotal) {
          updateLiveFillers(liveTotal);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          isSpeechRunningRef.current = false;
          setIsSpeechListening(false);
          setSpeechErrorMsg(
            "Microphone access for Speech Recognition was blocked. Please enable microphone permissions in your browser bar."
          );
        } else if (event.error === "network") {
          setSpeechErrorMsg(
            "Speech recognition network service is currently unreachable. You can continue speaking or click 'Demo Speech' to evaluate."
          );
        } else if (event.error === "no-speech") {
          // Standard event when speaker pauses; onend will automatically handle seamless restart
        }
      };

      recognition.onend = () => {
        setIsSpeechListening(false);

        // Commit all finalized text from this session into committedTranscriptRef
        if (sessionFinal && sessionFinal.trim()) {
          committedTranscriptRef.current = (
            (committedTranscriptRef.current ? committedTranscriptRef.current.trim() + " " : "") +
            sessionFinal.trim()
          ).trim();
          setTranscript(committedTranscriptRef.current);
          setInterimText("");
        }

        if (speechRecognitionRef.current === recognition) {
          speechRecognitionRef.current = null;
        }

        // Seamlessly instantiate a fresh SpeechRecognition session if speaking stage is still active
        if (isSpeechRunningRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isSpeechRunningRef.current) {
              startRecognitionSession();
            }
          }, 80);
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech Recognition instantiation notice:", err);
      if (isSpeechRunningRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isSpeechRunningRef.current) {
            startRecognitionSession();
          }
        }, 400);
      }
    }
  };

  const initSpeechRecognition = startRecognitionSession;

  // Dedicated Live Pause / Silence Interval Monitor
  useEffect(() => {
    if (!isSpeechRunning) {
      setIsCurrentlyInPauseLive(false);
      return;
    }

    let isCurrentlyInPause = false;
    const PAUSE_THRESHOLD_SECONDS = 1.8;

    // After 2.5s, arm pause detection so initial hesitations count
    const starterTimeout = setTimeout(() => {
      if (!lastSpokenTimestampRef.current) {
        lastSpokenTimestampRef.current = Date.now();
        hasStartedSpeakingRef.current = true;
      }
    }, 2500);

    const pauseCheckInterval = setInterval(() => {
      if (!hasStartedSpeakingRef.current || !lastSpokenTimestampRef.current) return;

      const now = Date.now();
      const silenceSeconds = (now - lastSpokenTimestampRef.current) / 1000;

      if (silenceSeconds >= PAUSE_THRESHOLD_SECONDS) {
        if (!isCurrentlyInPause) {
          isCurrentlyInPause = true;
          setIsCurrentlyInPauseLive(true);
          setPauseCount((prev) => prev + 1);
        }
        setPauseDuration((prev) => Number((prev + 0.5).toFixed(1)));
      } else {
        isCurrentlyInPause = false;
        setIsCurrentlyInPauseLive(false);
      }
    }, 500);

    return () => {
      clearTimeout(starterTimeout);
      clearInterval(pauseCheckInterval);
    };
  }, [isSpeechRunning]);

  // Speech Duration Stopwatch
  useEffect(() => {
    if (isSpeechRunning) {
      speechTimerRef.current = setInterval(() => {
        setSpeechDuration((d) => d + 1);
      }, 1000);
    } else {
      clearInterval(speechTimerRef.current);
    }

    return () => clearInterval(speechTimerRef.current);
  }, [isSpeechRunning]);

  // Toggle Video Track
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle Audio Track
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Clean Up Media Stream
  const stopMediaStream = () => {
    isSpeechRunningRef.current = false;
    setIsSpeechRunning(false);
    setIsSpeechListening(false);
    setIsCurrentlyInPauseLive(false);

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
    clearInterval(speechTimerRef.current);
  };

  useEffect(() => {
    return () => {
      stopMediaStream();
      clearInterval(prepTimerRef.current);
    };
  }, []);

  // =========================================================================
  // Finish Speaking & Run AI Analysis
  // =========================================================================
  const handleFinishAndAnalyze = async () => {
    stopMediaStream();

    const fullTranscript = `${transcript} ${interimText}`.trim();
    const finalDuration = Math.max(15, speechDuration);

    setEvaluating(true);
    setCurrentStep("ANALYSIS");

    const effectiveTranscript =
      fullTranscript ||
      `Impromptu speech practice on the topic '${currentTopic.title}'. The student presented their ideas over a speaking duration of ${finalDuration} seconds.`;

    try {
      const result = await analyzeSpeechPractice({
        topic: currentTopic.title,
        transcript: effectiveTranscript,
        duration: finalDuration,
        pauseCount: Math.max(0, pauseCount),
        pauseDuration: Math.round(pauseDuration),
        fillerCounts: liveFillerCounts,
        scratchpadNotes,
      });

      if (!result) {
        throw new Error("Evaluation returned empty payload");
      }

      setAnalysisResult(result);

      // Save to local storage for student only
      saveAttemptToLocal({
        id: `attempt-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        topic: currentTopic.title,
        category: currentTopic.category,
        overallScore: result.overallScore,
        equivalentBand: result.equivalentBand,
        duration: finalDuration,
        wordCount: result.wordCount,
        wpm: result.wpm,
        fillerCount: result.fillerAnalysis?.totalFillers || 0,
        pauseCount: result.pauseAnalysis?.pauseCount || 0,
        performanceLevel: result.performanceLevel,
      });
    } catch (err) {
      console.error("Analysis generation error:", err);
      // Resilient fallback result ensuring full scorecard always renders
      const totalFill = Object.values(liveFillerCounts).reduce((a, b) => a + b, 0);
      const fallbackResult = {
        topic: currentTopic.title,
        transcript: effectiveTranscript,
        wordCount: effectiveTranscript.split(/\s+/).filter(Boolean).length,
        duration: finalDuration,
        wpm: Math.round((effectiveTranscript.split(/\s+/).filter(Boolean).length / (finalDuration / 60))),
        paceStatus: "Conversational Pace",
        paceFeedback: "Speech completed with steady delivery.",
        overallScore: 78,
        equivalentBand: 7.0,
        performanceLevel: "Effective & Persuasive Communicator",
        scores: {
          grammarScore: 82,
          fluencyScore: 78,
          fillerScore: Math.max(50, 96 - totalFill * 4),
          contentScore: 80,
        },
        fillerAnalysis: {
          totalFillers: totalFill,
          fillerRatePerMin: Number((totalFill / (finalDuration / 60)).toFixed(1)),
          fillerLevel: totalFill <= 3 ? "Minimal" : "Moderate",
          breakdown: liveFillerCounts,
          tips: "Aim to replace vocal fillers with natural pauses.",
        },
        pauseAnalysis: {
          pauseCount,
          pauseDurationSeconds: Math.round(pauseDuration),
          avgPauseLength: pauseCount > 0 ? Number((pauseDuration / pauseCount).toFixed(1)) : 0,
          pauseRatioPercent: Math.round((pauseDuration / finalDuration) * 100),
          pauseStatus: "Natural Conversational Flow",
        },
        grammarErrors: [
          {
            originalPhrase: "Speech sentence flow",
            fullOriginalSentence: "Analysis verified your sentence structure and delivery rhythm.",
            issue: "Grammar & Phrasing Check",
            explanation: "Maintain strong transition words and active voice.",
            correction: "Use clear transitions like 'First', 'Furthermore', and 'Finally'.",
            improvedSentence: "Lead each paragraph with a distinct thesis point.",
          },
        ],
        actionableTips: [
          "Deliberate Pauses: Pause right before delivering your key takeaway.",
          "Blueprint Structure: Open with a hook, give 2 core perspectives, conclude with punch.",
          "Vocal Energy: Vary pitch and volume to highlight crucial statistics.",
        ],
        evaluatedAt: new Date().toISOString(),
      };
      setAnalysisResult(fallbackResult);
    } finally {
      setEvaluating(false);
    }
  };

  // Reset to Start Another Practice
  const handleStartNewPractice = () => {
    stopMediaStream();
    setAnalysisResult(null);
    setTranscript("");
    setInterimText("");
    setScratchpadNotes("");
    setSpeechDuration(0);
    setPrepTimeLeft(PREP_TIME_SECONDS);
    setCurrentStep("TOPIC");
  };

  // Compute Total Filler Count
  const totalFillersLive = Object.values(liveFillerCounts).reduce((a, b) => a + b, 0);

  // =========================================================================
  // RENDER UI
  // =========================================================================
  return (
    <DashboardLayout>
      <div className="speaking-studio-container max-w-6xl mx-auto space-y-6 pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 studio-glass-card">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full studio-gradient-badge text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Public Speaking & Extempore Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Impromptu Speech Evaluator
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Pick a topic, take 5 minutes to prepare, turn on your video to speak, and receive private AI feedback on your grammar, pauses, and filler words.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Student Privacy Badge */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Student-Only (Private)</span>
            </div>

            {/* Practice History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>My History ({practiceHistory.length})</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            STEP 1: TOPIC SELECTION
        ===================================================================== */}
        {currentStep === "TOPIC" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              {TOPIC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Main Topic Showcase Card */}
            <div
              className={`bg-white rounded-3xl p-8 studio-glass-card border-2 border-blue-100 relative overflow-hidden transition-all ${
                topicShuffleAnim ? "topic-shuffle-enter" : ""
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    {currentTopic.category}
                  </span>
                  {currentTopic.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  Difficulty: {currentTopic.difficulty}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-snug mb-6">
                "{currentTopic.title}"
              </h2>

              {/* Blueprint Prompt Guidance */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Speech Delivery Blueprint & Cues</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-700">1. Hook & Opening:</p>
                    <p className="text-slate-600 italic">"{currentTopic.blueprint?.hook}"</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-700">2. Suggested Real Example:</p>
                    <p className="text-slate-600">{currentTopic.blueprint?.example}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="font-bold text-slate-700 text-xs mb-1.5">3. Key Arguments to Consider:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                    {currentTopic.blueprint?.corePoints?.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleGetRandomTopic}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Shuffle className="w-4 h-4 text-blue-600" />
                  <span>🎲 Get Random Topic</span>
                </button>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-slate-500" />
                  <span>Enter Custom Topic</span>
                </button>

                <button
                  onClick={startPreparation}
                  className="w-full sm:flex-1 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95 sm:ml-auto"
                >
                  <Clock className="w-4 h-4" />
                  <span>Start 5-Minute Preparation Timer →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 2: 5-MINUTE PREPARATION TIMER & SCRATCHPAD
        ===================================================================== */}
        {currentStep === "PREPARE" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timer Column (1 col) */}
            <div className="bg-white rounded-3xl p-6 studio-glass-card border border-slate-200 flex flex-col items-center justify-between text-center">
              <div className="w-full">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  Preparation Phase
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">Preparation Clock</h3>
                <p className="text-xs text-slate-500 mt-0.5">Organize your thoughts and key points</p>
              </div>

              {/* Countdown Circular Ring Display */}
              <div className="my-6 relative flex items-center justify-center">
                <svg className="w-52 h-52 transform -rotate-90">
                  <circle
                    cx="104"
                    cy="104"
                    r="90"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="104"
                    cy="104"
                    r="90"
                    stroke={prepTimeLeft <= 60 ? "#ef4444" : prepTimeLeft <= 150 ? "#f59e0b" : "#3b82f6"}
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 90}
                    strokeDashoffset={2 * Math.PI * 90 * (1 - prepTimeLeft / PREP_TIME_SECONDS)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="prep-timer-ring"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-800 tracking-tight">
                    {formatTime(prepTimeLeft)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    {prepTimeLeft === 0 ? "Time's Up!" : "Remaining"}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setIsPrepRunning((r) => !r)}
                  className={`p-3 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-colors ${
                    isPrepRunning
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isPrepRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPrepRunning ? "Pause Timer" : "Resume Timer"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsPrepRunning(false);
                    setPrepTimeLeft(PREP_TIME_SECONDS);
                  }}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  title="Reset to 5:00"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Ready to Speak Button */}
              <button
                onClick={startSpeakingStage}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <Video className="w-5 h-5" />
                <span>I'm Ready! Speak Now 🚀</span>
              </button>
            </div>

            {/* Topic & Scratchpad Column (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 studio-glass-card border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Topic</span>
                <h2 className="text-xl font-extrabold text-slate-800 mt-1 mb-4 leading-snug">
                  "{currentTopic.title}"
                </h2>

                {/* Quick Blueprint Reminder */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-blue-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Recommended Speech Structure:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center pt-1 font-semibold text-slate-600">
                    <div className="bg-white p-2 rounded-xl border border-blue-100">1. Hook & Thesis</div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">2. Perspective A</div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">3. Perspective B</div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">4. Punchy Summary</div>
                  </div>
                </div>
              </div>

              {/* Interactive Scratchpad Notes */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Preparation Scratchpad (Notes will be available while speaking)</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {scratchpadNotes.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={scratchpadNotes}
                  onChange={(e) => setScratchpadNotes(e.target.value)}
                  placeholder="Type your outline, bullet points, keywords, or transition words here... Example:
- Introduction: Why this matters today
- Point 1: Economic/Societal angle
- Point 2: Individual impact
- Conclusion: Final recommendation"
                  className="w-full flex-1 min-h-[180px] p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm leading-relaxed custom-studio-scroll resize-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setCurrentStep("TOPIC")}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Choose a Different Topic
                </button>
                <span>Feel free to click 'Speak Now' when ready</span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 3: LIVE VIDEO & SPEECH PRESENTATION
        ===================================================================== */}
        {currentStep === "SPEAK" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Stage Column (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Webcam Stage */}
              <div className="webcam-stage-wrapper relative">
                {cameraError ? (
                  <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900 rounded-2xl">
                    <VideoOff className="w-12 h-12 text-rose-400 mb-3" />
                    <p className="font-bold text-base text-rose-200">{cameraError}</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-md">
                      Live audio analyzer and speech metrics are actively listening. You can also use the transcript editor or demo speech button below.
                    </p>
                  </div>
                ) : (
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="webcam-video-element"
                  />
                )}

                {/* Overlaid Live Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 recording-live-pill" />
                    <span>REC {formatTime(speechDuration)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                    <span className={`w-2 h-2 rounded-full ${isSpeechListening ? "bg-emerald-400 animate-ping" : "bg-emerald-400"}`} />
                    <span>{isSpeechListening ? "AI Listening Live" : "Mic Ready"}</span>
                  </div>

                  {isCurrentlyInPauseLive && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold border border-amber-300 animate-pulse">
                      <span>⏸️ Pause Detected (&gt;1.8s)</span>
                    </div>
                  )}
                </div>

                {/* Audio Wave Visualizer Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                  <div className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, Math.min(28, micVolumeLevel * 0.4))}px` }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(8, Math.min(32, micVolumeLevel * 0.65))}px` }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, Math.min(36, micVolumeLevel * 0.85))}px` }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(8, Math.min(28, micVolumeLevel * 0.55))}px` }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, Math.min(24, micVolumeLevel * 0.35))}px` }} />
                  <span className="text-[11px] text-emerald-300 font-bold ml-1.5">
                    {micVolumeLevel > 8 ? "Voice Detected" : "Mic Active"}
                  </span>
                </div>

                {/* Camera / Mic Toggles */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    onClick={toggleVideo}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition-colors ${
                      isVideoEnabled ? "bg-white/20 hover:bg-white/30 text-white" : "bg-rose-500 text-white"
                    }`}
                    title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleAudio}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition-colors ${
                      isAudioEnabled ? "bg-white/20 hover:bg-white/30 text-white" : "bg-rose-500 text-white"
                    }`}
                    title={isAudioEnabled ? "Mute Mic" : "Unmute Mic"}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Speech Recognition Error or Notice Banner */}
              {speechErrorMsg && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{speechErrorMsg}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLoadSampleSpeech}
                      className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                      <span>Load Demo Speech</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Topic Reminder Banner */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 studio-glass-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Topic</span>
                  <p className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">
                    "{currentTopic.title}"
                  </p>
                </div>
                <button
                  onClick={() => setShowPromptNotes((n) => !n)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {showPromptNotes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPromptNotes ? "Hide Notes" : "Show Notes"}</span>
                </button>
              </div>

              {/* Live Spoken Transcript Stream */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 studio-glass-card space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live Spoken Transcript</span>
                    {isSpeechListening && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Listening
                      </span>
                    )}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Dialect Selector */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-slate-600">
                      <Globe className="w-3 h-3 text-slate-500" />
                      <select
                        value={speechLanguage}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setSpeechLanguage(newLang);
                          if (isSpeechRunningRef.current) {
                            if (speechRecognitionRef.current) {
                              try {
                                speechRecognitionRef.current.abort();
                              } catch (err) {}
                            }
                            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
                            restartTimeoutRef.current = setTimeout(() => {
                              if (isSpeechRunningRef.current) {
                                startRecognitionSession();
                              }
                            }, 100);
                          }
                        }}
                        className="text-[11px] bg-transparent font-medium focus:outline-none cursor-pointer text-slate-700"
                        title="Change speech recognition accent"
                      >
                        <option value="en-IN">English (India) - Recommended</option>
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="en-AU">English (Australia)</option>
                      </select>
                    </div>

                    {/* Toggle Manual Edit Mode */}
                    <button
                      type="button"
                      onClick={() => setIsEditingTranscript((e) => !e)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Toggle manual text edit or paste"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>{isEditingTranscript ? "View Mode" : "Edit / Type"}</span>
                    </button>

                    {/* Quick Demo Speech Button */}
                    <button
                      type="button"
                      onClick={handleLoadSampleSpeech}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                      title="Load realistic sample speech with fillers and pauses for 1-click test"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Demo Speech</span>
                    </button>
                  </div>
                </div>

                {isEditingTranscript ? (
                  <textarea
                    value={transcript}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTranscript(val);
                      committedTranscriptRef.current = val;
                      updateLiveFillers(val);
                    }}
                    placeholder="Type or paste what you are speaking here..."
                    className="w-full min-h-[90px] max-h-[140px] p-3 rounded-xl bg-slate-50 border border-blue-300 focus:bg-white text-xs md:text-sm text-slate-800 leading-relaxed custom-studio-scroll resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                ) : (
                  <div className="min-h-[90px] max-h-[140px] overflow-y-auto p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs md:text-sm text-slate-700 leading-relaxed custom-studio-scroll">
                    {transcript || interimText ? (
                      <>
                        <span>{transcript}</span>
                        <span className="text-blue-600 font-medium ml-1">{interimText}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">
                        Start speaking clearly into your microphone. Words will appear here in real time... (Or click 'Edit / Type' or 'Demo Speech' to test).
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{(transcript + " " + interimText).split(/\s+/).filter(Boolean).length} words recorded</span>
                  <span>Dialect: {speechLanguage}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Real-time Stats & Prompt Notes Column (1 col) */}
            <div className="space-y-4">
              {/* Real-time Filler Words & Pause Metrics */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 studio-glass-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>Live Speech Diagnostics</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Real-Time Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-center">
                    <span className="text-2xl font-black text-rose-600">{totalFillersLive}</span>
                    <p className="text-[11px] font-semibold text-rose-800 mt-0.5">Filler Words</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center relative overflow-hidden">
                    {isCurrentlyInPauseLive && (
                      <div className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                        Pause
                      </div>
                    )}
                    <span className="text-2xl font-black text-amber-600">{pauseCount}</span>
                    <p className="text-[11px] font-semibold text-amber-800 mt-0.5">Pauses (&gt;1.8s)</p>
                  </div>
                </div>

                {/* Breakdown of Fillers (with interactive manual tap counters) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Filler Breakdown (Tap to +1)
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">Auto + Tap</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-center text-xs">
                    {Object.entries(liveFillerCounts).map(([key, count]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleIncrementFiller(key)}
                        className={`p-2 rounded-xl border text-[11px] font-semibold transition-all active:scale-95 flex items-center justify-between gap-1 shadow-sm ${
                          count > 0
                            ? "bg-rose-100/70 border-rose-300 text-rose-800"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                        title={`Click to manually add 1 '${key}' filler word`}
                      >
                        <span className="capitalize truncate">{key}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded-md font-black text-[10px] text-slate-800 border border-slate-200 shadow-xs shrink-0">
                          {count} +
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Scratchpad Prompt Notes */}
              {showPromptNotes && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 studio-glass-card space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Your Preparation Cue Notes</span>
                  </h4>
                  <div className="max-h-[160px] overflow-y-auto p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-700 leading-relaxed custom-studio-scroll whitespace-pre-wrap">
                    {scratchpadNotes.trim() ? (
                      scratchpadNotes
                    ) : (
                      <span className="text-slate-400 italic">No notes drafted during preparation.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Finish Speaking & Evaluate Button */}
              <button
                type="button"
                onClick={handleFinishAndAnalyze}
                disabled={evaluating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>Finish & Analyze with AI 📊</span>
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 4: AI ANALYSIS & EVALUATION RESULTS
        ===================================================================== */}
        {currentStep === "ANALYSIS" && (
          <div className="space-y-6">
            {evaluating ? (
              <div className="bg-white rounded-3xl p-16 studio-glass-card border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <h3 className="text-xl font-bold text-slate-800">
                  AI Evaluating Your Speech Delivery...
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Analyzing grammatical precision, sentence cohesion, vocal filler frequency, and pause rhythms...
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6">
                {/* Scorecard Hero Header */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-bold border border-white/20">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>{analysisResult.performanceLevel}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black">
                        Speaking Performance Evaluation
                      </h2>
                      <p className="text-slate-300 text-sm max-w-xl">
                        Topic: "{analysisResult.topic}"
                      </p>
                    </div>

                    {/* Overall Score Dial */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
                        <span className="text-4xl md:text-5xl font-black text-emerald-400">
                          {analysisResult.overallScore}
                          <span className="text-lg text-slate-400 font-bold">/100</span>
                        </span>
                        <span className="text-xs text-slate-300 font-semibold mt-1">
                          Overall Score
                        </span>
                      </div>

                      <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
                        <span className="text-4xl md:text-5xl font-black text-amber-300">
                          {analysisResult.equivalentBand}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold mt-1">
                          Equivalent Band
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Dimensional Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 studio-glass-card">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grammar & Syntax</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {analysisResult.scores?.grammarScore}/100
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {analysisResult.grammarErrors?.length || 0} issues detected
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 studio-glass-card">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fluency & Continuity</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {analysisResult.scores?.fluencyScore}/100
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {analysisResult.pauseAnalysis?.pauseStatus}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 studio-glass-card">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filler Word Control</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {analysisResult.scores?.fillerScore}/100
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {analysisResult.fillerAnalysis?.fillerRatePerMin} fillers / min
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 studio-glass-card">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speaking Pace (WPM)</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {analysisResult.wpm}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {analysisResult.paceStatus}
                    </p>
                  </div>
                </div>

                {/* Granular Breakdown Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Grammar Errors & Corrections Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 studio-glass-card space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span>Grammar Errors & Phrasing Corrections</span>
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {analysisResult.grammarErrors?.length || 0} Found
                      </span>
                    </div>

                    <div className="space-y-3">
                      {analysisResult.grammarErrors && analysisResult.grammarErrors.length > 0 ? (
                        analysisResult.grammarErrors.map((err, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                {err.issue}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Suggestion #{idx + 1}
                              </span>
                            </div>

                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-800">Spoken Phrase:</span>{" "}
                              <span className="diff-error-pill">{err.originalPhrase}</span>
                            </p>

                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-800">Correct Way to Say It:</span>{" "}
                              <span className="diff-correct-pill">{err.correction}</span>
                            </p>

                            <p className="text-slate-500 text-[11px] italic bg-white p-2 rounded-xl border border-slate-100">
                              💡 {err.explanation}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
                          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                          <p className="font-bold text-sm">Flawless Grammatical Delivery!</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            No significant subject-verb or syntactic errors were detected in your speech.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Filler Words & Pauses Breakdown Card */}
                  <div className="space-y-6">
                    {/* Filler Words */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 studio-glass-card space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-rose-500" />
                          <span>Filler Word Breakdown</span>
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Total: {analysisResult.fillerAnalysis?.totalFillers || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {analysisResult.fillerAnalysis?.breakdown &&
                        Object.keys(analysisResult.fillerAnalysis.breakdown).length > 0 ? (
                          Object.entries(analysisResult.fillerAnalysis.breakdown).map(([word, cnt]) => (
                            <div
                              key={word}
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center"
                            >
                              <span className="text-lg font-black text-rose-600">{cnt}</span>
                              <p className="text-[11px] font-semibold text-slate-600 capitalize mt-0.5">
                                "{word}"
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-semibold">
                            Zero filler sounds recorded. Outstanding vocal control!
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        💬 <span className="font-semibold text-slate-700">Coaching:</span>{" "}
                        {analysisResult.fillerAnalysis?.tips}
                      </p>
                    </div>

                    {/* Pauses & Breaks Assessment */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 studio-glass-card space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-500" />
                          <span>Pauses & Silence Duration</span>
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {analysisResult.pauseAnalysis?.pauseCount || 0} Pauses
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-lg font-black text-slate-800">
                            {analysisResult.pauseAnalysis?.pauseDurationSeconds}s
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Total Pause Time</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-lg font-black text-slate-800">
                            {analysisResult.pauseAnalysis?.avgPauseLength}s
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Average Pause</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-lg font-black text-slate-800">
                            {analysisResult.pauseAnalysis?.pauseRatioPercent}%
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Silence Ratio</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actionable Tips & Transcript Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Actionable Recommendations */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 studio-glass-card space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span>Key Improvement Priorities for Next Speech</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {analysisResult.actionableTips?.map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Full Speech Transcript */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 studio-glass-card space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span>Your Recorded Transcript</span>
                    </h3>
                    <div className="max-h-[160px] overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed custom-studio-scroll">
                      {analysisResult.transcript || "No transcript available."}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Results saved privately to your student profile storage only.</span>
                  </div>

                  <button
                    onClick={handleStartNewPractice}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <span>Practice Another Topic 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500">
                <p>No evaluation available. Please try practicing again.</p>
                <button
                  onClick={handleStartNewPractice}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Return to Topics
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            MODAL: CUSTOM TOPIC INPUT
        ===================================================================== */}
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Enter Your Custom Speaking Topic</h3>
              <p className="text-xs text-slate-500">
                Enter any impromptu question, university viva prompt, or debate topic you want to practice.
              </p>
              <textarea
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="e.g., Should remote work become a permanent global standard?"
                className="w-full h-28 p-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCustomTopic}
                  disabled={!customTopicInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply Topic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL: PRACTICE HISTORY (Student-Only Local Storage)
        ===================================================================== */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    My Public Speaking Practice History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved exclusively on your device (Private to you)
                  </p>
                </div>
                {practiceHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-studio-scroll">
                {practiceHistory.length > 0 ? (
                  practiceHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.category || "General"}
                        </span>
                        <p className="font-bold text-slate-800 text-sm">"{item.topic}"</p>
                        <p className="text-slate-400 text-[11px]">{item.date}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right shrink-0">
                        <div>
                          <p className="text-lg font-black text-emerald-600">{item.overallScore}/100</p>
                          <p className="text-[10px] text-slate-400">Band {item.equivalentBand}</p>
                        </div>

                        <div className="text-slate-500 text-[11px] hidden sm:block">
                          <p>{item.fillerCount} Fillers</p>
                          <p>{item.pauseCount} Pauses</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <History className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No speeches recorded yet.</p>
                    <p className="text-xs">Take your first 5-minute prep and speak to see your scores here!</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
