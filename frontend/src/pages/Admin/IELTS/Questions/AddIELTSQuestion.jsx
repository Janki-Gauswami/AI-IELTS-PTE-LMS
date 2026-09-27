import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../../components/Dashboard/DashboardLayout";
import {
  createIELTSQuestion,
} from "../../../../services/ieltsQuestionService";
import api from "../../../../api/axios";
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Upload,
  Play,
  Volume2,
  Clock,
  Sparkles,
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const SECTION_QUESTION_TYPES = {
  Listening: [
    "Multiple Choice",
    "Fill in the Blanks",
    "Sentence Completion",
    "Summary Completion",
    "Short Answer",
    "Map / Diagram Labelling",
  ],
  Reading: [
    "Multiple Choice",
    "True False Not Given",
    "Yes No Not Given",
    "Matching",
    "Matching Headings",
    "Fill in the Blanks",
    "Sentence Completion",
    "Short Answer",
  ],
  Writing: [
    "Task 1 Report",
    "Task 2 Essay",
    "Essay Writing",
    "Short Answer",
    "Long Answer",
    "Email Writing",
  ],
  Speaking: [
    "Part 1 Interview",
    "Part 2 Cue Card",
    "Part 3 Discussion",
    "Speaking Prompt",
  ],
};

const AddIELTSQuestion = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    section: "Listening",
    questionType: "Multiple Choice",
    questionText: "",
    passage: "",
    audioUrl: "",
    imageUrl: "",
    sampleAnswer: "",
    wordLimit: 250,
    prepTimeSeconds: 60,
    responseTimeSeconds: 120,
    difficulty: "Medium",
    correctAnswer: "",
    marks: 1,
    explanation: "",
    status: "Published",
  });

  const [options, setOptions] = useState([
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ]);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioSuccess, setAudioSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSectionChange = (e) => {
    const newSection = e.target.value;
    const defaultType = SECTION_QUESTION_TYPES[newSection]?.[0] || "Multiple Choice";
    const defaultWordLimit = newSection === "Writing" ? (defaultType === "Task 1 Report" ? 150 : 250) : 0;

    setForm((prev) => ({
      ...prev,
      section: newSection,
      questionType: defaultType,
      wordLimit: defaultWordLimit,
      passage: newSection === "Reading" ? prev.passage : "",
      audioUrl: newSection === "Listening" ? prev.audioUrl : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, text: value } : opt))
    );
  };

  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions((prev) => [...prev, { label: nextLabel, text: "" }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((opt, i) => ({ ...opt, label: String.fromCharCode(65 + i) }))
    );
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setUploadingAudio(true);
      setAudioSuccess("");
      setError("");

      const res = await api.post("/upload/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.data?.fileUrl) {
        setForm((prev) => ({ ...prev, audioUrl: res.data.data.fileUrl }));
        setAudioSuccess("Audio uploaded successfully!");
      } else {
        throw new Error(res.data?.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Audio upload error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to upload audio.");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.questionText.trim()) {
      setError("Question / Prompt text is required.");
      return;
    }

    if (form.section === "Listening" && !form.audioUrl.trim()) {
      setError("Please upload an audio clip or specify an audio URL for listening questions.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const requiresOptions =
        form.questionType === "Multiple Choice" ||
        form.questionType === "Matching" ||
        form.questionType === "Matching Headings";

      const data = {
        ...form,
        marks: Number(form.marks) || 1,
        wordLimit: Number(form.wordLimit) || 0,
        prepTimeSeconds: Number(form.prepTimeSeconds) || 60,
        responseTimeSeconds: Number(form.responseTimeSeconds) || 120,
        options: requiresOptions ? options : [],
      };

      await createIELTSQuestion(data);
      navigate("/admin/ielts/questions");
    } catch (err) {
      console.error("Create IELTS Question Error:", err);
      setError(err.message || "Unable to create question.");
    } finally {
      setLoading(false);
    }
  };

  const renderSectionIcon = (sec) => {
    switch (sec) {
      case "Listening":
        return <Headphones className="w-5 h-5 text-blue-600" />;
      case "Reading":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "Writing":
        return <PenTool className="w-5 h-5 text-purple-600" />;
      case "Speaking":
        return <Mic className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/ielts/questions")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to IELTS Questions</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-5">
            <h1 className="text-2xl font-bold text-slate-900">Add IELTS Question</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create structured IELTS practice questions for Listening, Reading, Writing, or Speaking.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Section Selector Pills */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                IELTS Section
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Listening", "Reading", "Writing", "Speaking"].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleSectionChange({ target: { value: sec } })}
                    className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                      form.section === sec
                        ? "bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {renderSectionIcon(sec)}
                    <span>{sec}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Question Type ({form.section})
                </label>
                <select
                  name="questionType"
                  value={form.questionType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                >
                  {(SECTION_QUESTION_TYPES[form.section] || []).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                >
                  <option value="Easy">Easy (Band 5.0 - 6.0)</option>
                  <option value="Medium">Medium (Band 6.5 - 7.5)</option>
                  <option value="Hard">Hard (Band 8.0 - 9.0)</option>
                </select>
              </div>
            </div>

            {/* 1. LISTENING SECTION: AUDIO CLIP UPLOAD */}
            {form.section === "Listening" && (
              <div className="rounded-2xl bg-blue-50/50 border border-blue-200/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-950">Listening Audio Clip</h3>
                  </div>
                  {form.audioUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, audioUrl: "" }));
                        setAudioSuccess("");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Audio
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Upload an audio clip (MP3, WAV, WebM, M4A) for students to listen before answering.
                </p>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">Choose Audio File</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.webm,.m4a,.ogg"
                      onChange={handleAudioUpload}
                      disabled={uploadingAudio}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer border border-slate-200 rounded-xl bg-white p-2"
                    />
                  </div>

                  {uploadingAudio && (
                    <p className="mt-2 text-xs text-blue-600 flex items-center gap-1.5 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading and processing audio clip...
                    </p>
                  )}
                  {audioSuccess && (
                    <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> {audioSuccess}
                    </p>
                  )}
                </div>

                {form.audioUrl && (
                  <div className="pt-2 rounded-xl bg-white p-4 border border-blue-100 shadow-sm space-y-2">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-blue-600" /> Audio Clip Preview
                    </p>
                    <audio
                      controls
                      src={form.audioUrl.startsWith("http") ? form.audioUrl : `http://localhost:5000${form.audioUrl}`}
                      className="w-full h-10 rounded-xl"
                    />
                    <p className="text-[11px] text-slate-400 truncate">Source: {form.audioUrl}</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. READING SECTION: PASSAGE CONTEXT */}
            {form.section === "Reading" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Reading Passage / Context
                </label>
                <textarea
                  name="passage"
                  value={form.passage}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Paste or enter the IELTS reading article passage..."
                  className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>
            )}

            {/* 3. QUESTION / PROMPT TEXT */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                {form.section === "Writing"
                  ? "Writing Prompt / Essay Question"
                  : form.section === "Speaking"
                  ? "Speaking Topic / Cue Card Prompt"
                  : "Question Text"}
              </label>
              <textarea
                name="questionText"
                value={form.questionText}
                onChange={handleChange}
                rows={form.section === "Writing" || form.section === "Speaking" ? 4 : 3}
                required
                placeholder={
                  form.section === "Writing"
                    ? "e.g. Some people believe that university education should be free for everyone. To what extent do you agree or disagree? Give reasons for your answer."
                    : form.section === "Speaking"
                    ? "e.g. Describe a memorable journey you took. You should say: where you went, who you went with, what you did, and explain why it was so memorable."
                    : "Enter the question prompt..."
                }
                className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none leading-relaxed"
              />
            </div>

            {/* 4. WRITING SPECIFIC FIELDS */}
            {form.section === "Writing" && (
              <div className="rounded-2xl bg-purple-50/50 border border-purple-200/80 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-bold text-purple-950">Writing Configuration & Rubric</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Target Word Limit</label>
                    <input
                      type="number"
                      name="wordLimit"
                      value={form.wordLimit}
                      onChange={handleChange}
                      placeholder="250"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Recommended: 150 words for Task 1, 250 words for Task 2.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">AI Grading & Manual Evaluation</label>
                    <div className="p-3 bg-white border border-purple-100 rounded-xl text-xs text-purple-900 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Evaluated on Task Response, Cohesion, Lexicon & Grammar.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Sample / High-Band Model Answer</label>
                  <textarea
                    name="sampleAnswer"
                    value={form.sampleAnswer}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter an ideal Band 8.0+ sample response for student reference..."
                    className="w-full rounded-xl border border-slate-300 p-3.5 text-sm bg-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* 5. SPEAKING SPECIFIC FIELDS */}
            {form.section === "Speaking" && (
              <div className="rounded-2xl bg-amber-50/50 border border-amber-200/80 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-amber-950">Speaking Topic & Timers</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Preparation Time (Seconds)</label>
                    <input
                      type="number"
                      name="prepTimeSeconds"
                      value={form.prepTimeSeconds}
                      onChange={handleChange}
                      placeholder="60"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Response Time (Seconds)</label>
                    <input
                      type="number"
                      name="responseTimeSeconds"
                      value={form.responseTimeSeconds}
                      onChange={handleChange}
                      placeholder="120"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Model Speaking Points & Key Vocab</label>
                  <textarea
                    name="sampleAnswer"
                    value={form.sampleAnswer}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Bullet points and key collocations expected in a fluent answer..."
                    className="w-full rounded-xl border border-slate-300 p-3.5 text-sm bg-white outline-none"
                  />
                </div>

                <div className="p-3 bg-white border border-amber-200/80 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Students open their mic and record speech. Evaluated with AI Fluency, Pronunciation & Vocabulary metrics.</span>
                </div>
              </div>
            )}

            {/* 6. MCQ OPTIONS (Reading & Listening Multiple Choice) */}
            {(form.questionType === "Multiple Choice" ||
              form.questionType === "Matching" ||
              form.questionType === "Matching Headings") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Options
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.label} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs shrink-0">
                        {option.label}
                      </span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${option.label} text`}
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CORRECT ANSWER & MARKS (for auto-scorable types) */}
            {form.section !== "Writing" && form.section !== "Speaking" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Correct Answer / Answer Key
                  </label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={form.correctAnswer}
                    onChange={handleChange}
                    placeholder={
                      form.questionType === "Multiple Choice"
                        ? "e.g. B (or option text)"
                        : "e.g. True or exact answer string"
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Marks / Points
                  </label>
                  <input
                    type="number"
                    name="marks"
                    min="1"
                    value={form.marks}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Explanation / Notes */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Explanation & Answer Notes (Optional)
              </label>
              <textarea
                name="explanation"
                value={form.explanation}
                onChange={handleChange}
                rows={2}
                placeholder="Explain why this answer is correct..."
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/admin/ielts/questions")}
                className="px-6 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition disabled:opacity-60 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{loading ? "Saving Question..." : "Save Question"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddIELTSQuestion;