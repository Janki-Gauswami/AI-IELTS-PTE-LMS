import { useEffect, useMemo, useState } from "react";

import {
  X,
  Plus,
  Save,
  Trash2,
  Edit,
  Loader2,
  ListChecks,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Headphones,
  Volume2,
  CheckCircle2,
  Upload,
} from "lucide-react";

import api from "../../api/axios";

import {
  getMockTestById,
  updateMockTest,
} from "../../services/mockTestService";

const SECTION_OPTIONS = [
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Speaking & Writing",
];

const QUESTION_TYPES = [
  "Multiple Choice",
  "True/False",
  "Fill in the Blank",
  "Writing",
  "Speaking",
  "Short Answer",
  "Matching",
];

const EMPTY_QUESTION = {
  section: "Reading",
  questionType: "Multiple Choice",
  question: "",
  passage: "",
  audioUrl: "",
  options: [""],
  correctAnswer: "",
  acceptableAnswers: [""],
  wordLimit: 250,
  prepTimeSeconds: 60,
  responseTimeSeconds: 120,
  marks: 1,
  explanation: "",
};

const normalizeQuestion = (question, fallbackSection = "Reading") => {
  return {
    _id: question?._id,

    order: Number(question?.order) || 1,

    section:
      question?.section || fallbackSection,

    questionType:
      question?.questionType || "Multiple Choice",

    question:
      question?.question || "",

    passage:
      question?.passage || "",

    audioUrl:
      question?.audioUrl || "",

    options:
      Array.isArray(question?.options)
        ? question.options.map((item) =>
            typeof item === "string"
              ? item
              : item?.text || ""
          )
        : [""],

    correctAnswer:
      question?.correctAnswer || "",

    acceptableAnswers:
      Array.isArray(question?.acceptableAnswers)
        ? question.acceptableAnswers
        : [""],

    wordLimit:
      Number(question?.wordLimit) || 250,

    prepTimeSeconds:
      Number(question?.prepTimeSeconds) || 60,

    responseTimeSeconds:
      Number(question?.responseTimeSeconds) || 120,

    marks:
      Number(question?.marks) || 1,

    explanation:
      question?.explanation || "",
  };
};

const MockTestQuestions = ({
  testId,
  initialTest = null,
  onClose,
  onUpdated,
}) => {
  const [mockTest, setMockTest] = useState(initialTest);

  const [loading, setLoading] = useState(!initialTest);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingQuestionId, setEditingQuestionId] =
    useState(null);

  const [questionForm, setQuestionForm] =
    useState(EMPTY_QUESTION);

  const [expandedQuestionId, setExpandedQuestionId] =
    useState(null);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioSuccess, setAudioSuccess] = useState("");

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
        setQuestionForm((prev) => ({
          ...prev,
          audioUrl: res.data.data.fileUrl,
        }));
        setAudioSuccess("Audio uploaded successfully!");
      } else {
        throw new Error(res.data?.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Audio upload error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload audio."
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  // =========================================================
  // LOAD TEST
  // =========================================================

  useEffect(() => {
    if (!testId) {
      setError("Mock test ID is missing.");
      return;
    }

    if (initialTest) {
      setMockTest(initialTest);
      setLoading(false);
      return;
    }

    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMockTestById(testId);

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load mock test."
          );
        }

        setMockTest(response.data);
      } catch (err) {
        console.error(
          "Load Mock Test Questions Error:",
          err
        );

        setError(
          err?.message ||
            err?.error?.message ||
            "Unable to load mock test."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, initialTest]);

  // =========================================================
  // GET ALL QUESTIONS
  // =========================================================

  const allQuestions = useMemo(() => {
    if (!mockTest) return [];

    const questions = [];

    // -------------------------------------------------------
    // Questions inside sections
    // -------------------------------------------------------

    if (Array.isArray(mockTest.sections)) {
      mockTest.sections.forEach((section) => {
        if (!Array.isArray(section.questions)) {
          return;
        }

        section.questions.forEach((question) => {
          questions.push({
            ...question,
            section:
              question.section || section.name,
          });
        });
      });
    }

    // -------------------------------------------------------
    // Flat questions
    // -------------------------------------------------------

    if (Array.isArray(mockTest.questions)) {
      mockTest.questions.forEach((question) => {
        const alreadyIncluded = questions.some(
          (existing) =>
            existing._id &&
            question._id &&
            String(existing._id) ===
              String(question._id)
        );

        if (!alreadyIncluded) {
          questions.push(question);
        }
      });
    }

    return questions.sort(
      (a, b) =>
        Number(a.order || 0) -
        Number(b.order || 0)
    );
  }, [mockTest]);

  // =========================================================
  // QUESTION COUNTS
  // =========================================================

  const sectionCounts = useMemo(() => {
    const counts = {};

    SECTION_OPTIONS.forEach((section) => {
      counts[section] = 0;
    });

    allQuestions.forEach((question) => {
      if (!counts[question.section]) {
        counts[question.section] = 0;
      }

      counts[question.section] += 1;
    });

    return counts;
  }, [allQuestions]);

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleQuestionChange = (event) => {
    const { name, value } = event.target;

    setQuestionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // NUMBER INPUT
  // =========================================================

  const handleNumberChange = (event) => {
    const { name, value } = event.target;

    setQuestionForm((previous) => ({
      ...previous,
      [name]:
        value === ""
          ? ""
          : Number(value),
    }));
  };

  // =========================================================
  // OPTIONS
  // =========================================================

  const handleOptionChange = (index, value) => {
    setQuestionForm((previous) => {
      const options = [...previous.options];

      options[index] = value;

      return {
        ...previous,
        options,
      };
    });
  };

  const addOption = () => {
    setQuestionForm((previous) => ({
      ...previous,
      options: [
        ...previous.options,
        "",
      ],
    }));
  };

  const removeOption = (index) => {
    setQuestionForm((previous) => {
      if (previous.options.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        options: previous.options.filter(
          (_, optionIndex) =>
            optionIndex !== index
        ),
      };
    });
  };

  // =========================================================
  // ACCEPTABLE ANSWERS
  // =========================================================

  const handleAcceptableAnswerChange = (
    index,
    value
  ) => {
    setQuestionForm((previous) => {
      const answers = [
        ...previous.acceptableAnswers,
      ];

      answers[index] = value;

      return {
        ...previous,
        acceptableAnswers: answers,
      };
    });
  };

  const addAcceptableAnswer = () => {
    setQuestionForm((previous) => ({
      ...previous,
      acceptableAnswers: [
        ...previous.acceptableAnswers,
        "",
      ],
    }));
  };

  const removeAcceptableAnswer = (index) => {
    setQuestionForm((previous) => {
      if (
        previous.acceptableAnswers.length <= 1
      ) {
        return previous;
      }

      return {
        ...previous,
        acceptableAnswers:
          previous.acceptableAnswers.filter(
            (_, answerIndex) =>
              answerIndex !== index
          ),
      };
    });
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setQuestionForm({
      ...EMPTY_QUESTION,
      section:
        mockTest?.course === "PTE"
          ? "Speaking"
          : "Reading",
    });

    setEditingQuestionId(null);
    setShowForm(false);
  };

  // =========================================================
  // EDIT QUESTION
  // =========================================================

  const handleEditQuestion = (question) => {
    setQuestionForm(
      normalizeQuestion(
        question,
        question.section ||
          (mockTest?.course === "PTE"
            ? "Speaking"
            : "Reading")
      )
    );

    setEditingQuestionId(
      question._id
        ? String(question._id)
        : null
    );

    setShowForm(true);

    setError("");
  };

  // =========================================================
  // DELETE QUESTION
  // =========================================================

  const handleDeleteQuestion = async (
    questionId
  ) => {
    if (!questionId) {
      setError(
        "This question does not have a valid ID."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this question from the mock test?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      const nextTest = buildTestWithoutQuestion(
        mockTest,
        questionId
      );

      const response =
        await updateMockTest(
          mockTest._id,
          {
            sections: nextTest.sections,
            questions: nextTest.questions,
          }
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to delete question."
        );
      }

      const updatedTest =
        response.data || nextTest;

      setMockTest(updatedTest);

      onUpdated?.(updatedTest);

      if (
        expandedQuestionId &&
        String(expandedQuestionId) ===
          String(questionId)
      ) {
        setExpandedQuestionId(null);
      }
    } catch (err) {
      console.error(
        "Delete Mock Test Question Error:",
        err
      );

      setError(
        err?.message ||
          err?.error?.message ||
          "Failed to delete question."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // BUILD TEST WITHOUT QUESTION
  // =========================================================

  const buildTestWithoutQuestion = (
    test,
    questionId
  ) => {
    const updatedSections = Array.isArray(
      test.sections
    )
      ? test.sections.map((section) => ({
          ...section,
          questions: Array.isArray(
            section.questions
          )
            ? section.questions
                .filter(
                  (question) =>
                    String(question._id) !==
                    String(questionId)
                )
                .map((question, index) => ({
                  ...question,
                  order: index + 1,
                }))
            : [],
        }))
      : [];

    const updatedQuestions = Array.isArray(
      test.questions
    )
      ? test.questions
          .filter(
            (question) =>
              String(question._id) !==
              String(questionId)
          )
          .map((question, index) => ({
            ...question,
            order: index + 1,
          }))
      : [];

    return {
      ...test,
      sections: updatedSections,
      questions: updatedQuestions,
    };
  };

  // =========================================================
  // VALIDATE QUESTION
  // =========================================================

  const validateQuestion = () => {
    if (!questionForm.section) {
      return "Please select a section.";
    }

    if (!questionForm.questionType) {
      return "Please select a question type.";
    }

    if (!questionForm.question.trim()) {
      return "Question text or prompt is required.";
    }

    if (
      Number(questionForm.marks) < 1
    ) {
      return "Marks must be at least 1.";
    }

    return "";
  };

  // =========================================================
  // BUILD NEW QUESTION
  // =========================================================

  const buildQuestion = () => {
    const existingQuestion =
      editingQuestionId
        ? allQuestions.find(
            (question) =>
              String(question._id) ===
              String(editingQuestionId)
          )
        : null;

    return {
      ...(existingQuestion?._id
        ? { _id: existingQuestion._id }
        : {}),

      order:
        Number(existingQuestion?.order) ||
        1,

      section:
        questionForm.section,

      questionType:
        questionForm.questionType,

      question:
        questionForm.question.trim(),

      passage:
        questionForm.passage.trim(),

      audioUrl:
        questionForm.audioUrl.trim(),

      options:
        questionForm.options
          .map((option) =>
            String(option || "").trim()
          )
          .filter(Boolean),

      correctAnswer:
        questionForm.correctAnswer.trim(),

      acceptableAnswers:
        questionForm.acceptableAnswers
          .map((answer) =>
            String(answer || "").trim()
          )
          .filter(Boolean),

      wordLimit:
        Number(questionForm.wordLimit) || 250,

      prepTimeSeconds:
        Number(
          questionForm.prepTimeSeconds
        ) || 60,

      responseTimeSeconds:
        Number(
          questionForm.responseTimeSeconds
        ) || 120,

      marks:
        Number(questionForm.marks) || 1,

      explanation:
        questionForm.explanation.trim(),
    };
  };

  // =========================================================
  // ADD / UPDATE QUESTION
  // =========================================================

  const handleSaveQuestion = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateQuestion();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!mockTest?._id) {
      setError(
        "Mock test ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newQuestion =
        buildQuestion();

      let updatedSections = Array.isArray(
        mockTest.sections
      )
        ? mockTest.sections.map(
            (section) => ({
              ...section,
              questions:
                Array.isArray(
                  section.questions
                )
                  ? [...section.questions]
                  : [],
            })
          )
        : [];

      let updatedQuestions = Array.isArray(
        mockTest.questions
      )
        ? [...mockTest.questions]
        : [];

      // =====================================================
      // UPDATE EXISTING QUESTION
      // =====================================================

      if (editingQuestionId) {
        let found = false;

        updatedSections =
          updatedSections.map(
            (section) => {
              const questions =
                section.questions || [];

              const updated =
                questions.map(
                  (question) => {
                    if (
                      String(
                        question._id
                      ) ===
                      String(
                        editingQuestionId
                      )
                    ) {
                      found = true;

                      return {
                        ...question,
                        ...newQuestion,
                        order:
                          question.order ||
                          1,
                      };
                    }

                    return question;
                  }
                );

              return {
                ...section,
                questions: updated,
              };
            }
          );

        if (!found) {
          updatedQuestions =
            updatedQuestions.map(
              (question) => {
                if (
                  String(
                    question._id
                  ) ===
                  String(
                    editingQuestionId
                  )
                ) {
                  found = true;

                  return {
                    ...question,
                    ...newQuestion,
                    order:
                      question.order ||
                      1,
                  };
                }

                return question;
              }
            );
        }

        if (!found) {
          throw new Error(
            "Question could not be found in this mock test."
          );
        }
      }

      // =====================================================
      // ADD NEW QUESTION
      // =====================================================

      else {
        const targetSectionIndex =
          updatedSections.findIndex(
            (section) =>
              String(
                section.name || ""
              ).toLowerCase() ===
              String(
                questionForm.section
              ).toLowerCase()
          );

        if (
          targetSectionIndex !== -1
        ) {
          const currentQuestions =
            updatedSections[
              targetSectionIndex
            ].questions || [];

          newQuestion.order =
            currentQuestions.length + 1;

          updatedSections[
            targetSectionIndex
          ].questions = [
            ...currentQuestions,
            newQuestion,
          ];
        } else {
          newQuestion.order =
            updatedQuestions.length + 1;

          updatedQuestions = [
            ...updatedQuestions,
            newQuestion,
          ];
        }
      }

      // =====================================================
      // SAVE TO BACKEND
      // =====================================================

      const response =
        await updateMockTest(
          mockTest._id,
          {
            sections: updatedSections,
            questions: updatedQuestions,
          }
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to save question."
        );
      }

      const updatedTest =
        response.data || {
          ...mockTest,
          sections: updatedSections,
          questions: updatedQuestions,
        };

      setMockTest(updatedTest);

      onUpdated?.(updatedTest);

      resetForm();
    } catch (err) {
      console.error(
        "Save Mock Test Question Error:",
        err
      );

      setError(
        err?.message ||
          err?.error?.message ||
          "Failed to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // QUESTION TYPE HELPERS
  // =========================================================

  const isChoiceQuestion = [
    "Multiple Choice",
    "True/False",
    "Matching",
  ].includes(
    questionForm.questionType
  );

  const isWritingQuestion =
    questionForm.questionType ===
    "Writing";

  const isSpeakingQuestion =
    questionForm.questionType ===
    "Speaking";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-10 text-center shadow-2xl">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-slate-500">
            Loading mock test questions...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <ListChecks className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Manage Questions
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {mockTest?.title || "Mock Test"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="flex-1 overflow-y-auto p-6">
          {/* ERROR */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1 text-sm">
                {error}
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {SECTION_OPTIONS.map(
              (section) => (
                <div
                  key={section}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs text-slate-500">
                    {section}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {sectionCounts[
                      section
                    ] || 0}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Questions
                  </p>
                </div>
              )
            )}
          </div>

          {/* =================================================
              ADD QUESTION BUTTON
          ================================================= */}

          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setQuestionForm({
                  ...EMPTY_QUESTION,
                  section:
                    mockTest?.course === "PTE"
                      ? "Speaking"
                      : "Reading",
                });

                setEditingQuestionId(
                  null
                );

                setShowForm(true);
                setError("");
              }}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 px-5 py-4 text-sm font-bold text-purple-700 transition hover:border-purple-400 hover:bg-purple-100"
            >
              <Plus className="h-5 w-5" />
              Add New Question
            </button>
          )}

          {/* =================================================
              QUESTION FORM
          ================================================= */}

          {showForm && (
            <div className="mb-6 rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingQuestionId
                      ? "Edit Question"
                      : "Add Question"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the question content and evaluation
                    details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={
                  handleSaveQuestion
                }
                className="space-y-5"
              >
                {/* SECTION + TYPE */}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Section *
                    </label>

                    <select
                      name="section"
                      value={
                        questionForm.section
                      }
                      onChange={
                        handleQuestionChange
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      {SECTION_OPTIONS.map(
                        (section) => (
                          <option
                            key={section}
                            value={section}
                          >
                            {section}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Question Type *
                    </label>

                    <select
                      name="questionType"
                      value={
                        questionForm.questionType
                      }
                      onChange={
                        handleQuestionChange
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      {QUESTION_TYPES.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* QUESTION */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Question / Prompt *
                  </label>

                  <textarea
                    name="question"
                    value={
                      questionForm.question
                    }
                    onChange={
                      handleQuestionChange
                    }
                    rows={4}
                    required
                    placeholder="Enter the question or prompt..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* PASSAGE */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Passage / Context
                  </label>

                  <textarea
                    name="passage"
                    value={
                      questionForm.passage
                    }
                    onChange={
                      handleQuestionChange
                    }
                    rows={5}
                    placeholder="Optional reading passage or context..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* AUDIO UPLOAD */}
                {(questionForm.section === "Listening" ||
                  questionForm.section === "Speaking" ||
                  questionForm.section === "Speaking & Writing" ||
                  questionForm.audioUrl) && (
                  <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Headphones className="h-5 w-5 text-purple-600" />
                        <h3 className="text-sm font-bold text-purple-950">
                          Listening Audio Clip
                        </h3>
                      </div>
                      {questionForm.audioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionForm((prev) => ({ ...prev, audioUrl: "" }));
                            setAudioSuccess("");
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove Audio
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Upload an audio file (MP3, WAV, WebM, M4A) for students to listen to during this question.
                    </p>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        Choose Audio File
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.webm,.m4a,.ogg"
                          onChange={handleAudioUpload}
                          disabled={uploadingAudio}
                          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white hover:file:bg-purple-700"
                        />
                      </div>

                      {uploadingAudio && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-purple-600">
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading and processing audio clip...
                        </p>
                      )}
                      {audioSuccess && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> {audioSuccess}
                        </p>
                      )}
                    </div>

                    {questionForm.audioUrl && (
                      <div className="space-y-2 rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Volume2 className="h-4 w-4 text-purple-600" /> Audio Clip Preview
                        </p>
                        <audio
                          controls
                          src={
                            questionForm.audioUrl.startsWith("http")
                              ? questionForm.audioUrl
                              : `http://localhost:5000${questionForm.audioUrl}`
                          }
                          className="h-10 w-full rounded-xl"
                        />
                        <p className="truncate text-[11px] text-slate-400">
                          Source: {questionForm.audioUrl}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* OPTIONS */}

                {isChoiceQuestion && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Options
                        </h4>

                        <p className="text-[11px] text-slate-500">
                          Add answer choices for this question.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addOption}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {questionForm.options.map(
                        (option, index) => (
                          <div
                            key={`option-${index}`}
                            className="flex gap-2"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-500">
                              {String.fromCharCode(
                                65 + index
                              )}
                            </div>

                            <input
                              type="text"
                              value={option}
                              onChange={(event) =>
                                handleOptionChange(
                                  index,
                                  event.target.value
                                )
                              }
                              placeholder={`Option ${
                                index + 1
                              }`}
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeOption(
                                  index
                                )
                              }
                              disabled={
                                questionForm
                                  .options
                                  .length <= 1
                              }
                              className="rounded-lg px-3 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* CORRECT ANSWER */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Correct Answer
                  </label>

                  <input
                    type="text"
                    name="correctAnswer"
                    value={
                      questionForm.correctAnswer
                    }
                    onChange={
                      handleQuestionChange
                    }
                    placeholder="Enter the correct answer..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    For multiple choice, enter the option text
                    or answer value.
                  </p>
                </div>

                {/* ACCEPTABLE ANSWERS */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Acceptable Answers
                      </h4>

                      <p className="text-[11px] text-slate-500">
                        Useful for fill-in-the-blank or short-answer
                        questions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        addAcceptableAnswer
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Answer
                    </button>
                  </div>

                  <div className="space-y-2">
                    {questionForm.acceptableAnswers.map(
                      (answer, index) => (
                        <div
                          key={`acceptable-${index}`}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={answer}
                            onChange={(event) =>
                              handleAcceptableAnswerChange(
                                index,
                                event.target.value
                              )
                            }
                            placeholder={`Acceptable answer ${
                              index + 1
                            }`}
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeAcceptableAnswer(
                                index
                              )
                            }
                            disabled={
                              questionForm
                                .acceptableAnswers
                                .length <= 1
                            }
                            className="rounded-lg px-3 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* WRITING SETTINGS */}

                {isWritingQuestion && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Word Limit
                    </label>

                    <input
                      type="number"
                      name="wordLimit"
                      min="1"
                      value={
                        questionForm.wordLimit
                      }
                      onChange={
                        handleNumberChange
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                )}

                {/* SPEAKING SETTINGS */}

                {isSpeakingQuestion && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                        Preparation Time (Seconds)
                      </label>

                      <input
                        type="number"
                        name="prepTimeSeconds"
                        min="0"
                        value={
                          questionForm.prepTimeSeconds
                        }
                        onChange={
                          handleNumberChange
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                        Response Time (Seconds)
                      </label>

                      <input
                        type="number"
                        name="responseTimeSeconds"
                        min="0"
                        value={
                          questionForm.responseTimeSeconds
                        }
                        onChange={
                          handleNumberChange
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>
                )}

                {/* MARKS */}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Marks *
                    </label>

                    <input
                      type="number"
                      name="marks"
                      min="1"
                      value={
                        questionForm.marks
                      }
                      onChange={
                        handleNumberChange
                      }
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                {/* EXPLANATION */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Explanation
                  </label>

                  <textarea
                    name="explanation"
                    value={
                      questionForm.explanation
                    }
                    onChange={
                      handleQuestionChange
                    }
                    rows={3}
                    placeholder="Optional explanation shown after evaluation..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* FORM ACTIONS */}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {saving
                      ? "Saving..."
                      : editingQuestionId
                      ? "Update Question"
                      : "Add Question"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================
              QUESTIONS
          ================================================= */}

          {allQuestions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ListChecks className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No Questions Added
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                This mock test does not have any questions yet.
                Click "Add New Question" to start building the
                examination.
              </p>

              {!showForm && (
                <button
                  type="button"
                  onClick={() => {
                    setQuestionForm({
                      ...EMPTY_QUESTION,
                      section:
                        mockTest?.course ===
                        "PTE"
                          ? "Speaking"
                          : "Reading",
                    });

                    setShowForm(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Add First Question
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {allQuestions.map(
                (question, index) => {
                  const questionId =
                    question._id
                      ? String(question._id)
                      : `question-${index}`;

                  const isExpanded =
                    expandedQuestionId ===
                    questionId;

                  return (
                    <div
                      key={questionId}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      {/* QUESTION HEADER */}

                      <div className="flex items-start gap-4 p-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-bold text-purple-700">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                              {question.section}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              {question.questionType}
                            </span>

                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                              {question.marks || 0} mark
                              {Number(
                                question.marks
                              ) === 1
                                ? ""
                                : "s"}
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-800">
                            {question.question ||
                              "No question text"}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedQuestionId(
                                isExpanded
                                  ? null
                                  : questionId
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title={
                              isExpanded
                                ? "Collapse"
                                : "View details"
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEditQuestion(
                                question
                              )
                            }
                            disabled={saving}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            title="Edit question"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteQuestion(
                                question._id
                              )
                            }
                            disabled={
                              saving ||
                              !question._id
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* DETAILS */}

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50 p-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Question
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                {question.question ||
                                  "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Correct Answer
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {question.correctAnswer ||
                                  "Not specified"}
                              </p>
                            </div>

                            {question.audioUrl && (
                              <div className="md:col-span-2 rounded-xl bg-purple-50/70 border border-purple-200/70 p-3 space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-purple-900 flex items-center gap-1.5">
                                  <Headphones className="w-3.5 h-3.5 text-purple-600" /> Audio Passage
                                </p>
                                <audio
                                  controls
                                  src={
                                    question.audioUrl.startsWith("http")
                                      ? question.audioUrl
                                      : `http://localhost:5000${question.audioUrl}`
                                  }
                                  className="w-full h-9 rounded-lg"
                                />
                              </div>
                            )}

                            {question.passage && (
                              <div className="md:col-span-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Passage
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                  {question.passage}
                                </p>
                              </div>
                            )}

                            {Array.isArray(
                              question.options
                            ) &&
                              question.options
                                .length >
                                0 && (
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Options
                                  </p>

                                  <ul className="mt-2 space-y-1">
                                    {question.options.map(
                                      (
                                        option,
                                        optionIndex
                                      ) => (
                                        <li
                                          key={`${questionId}-option-${optionIndex}`}
                                          className="text-sm text-slate-700"
                                        >
                                          <span className="mr-2 font-bold">
                                            {String.fromCharCode(
                                              65 +
                                                optionIndex
                                            )}
                                            .
                                          </span>

                                          {typeof option ===
                                          "string"
                                            ? option
                                            : option?.text ||
                                              "—"}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Timing
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                Preparation:{" "}
                                {question.prepTimeSeconds ||
                                  0}{" "}
                                sec
                              </p>

                              <p className="text-sm text-slate-700">
                                Response:{" "}
                                {question.responseTimeSeconds ||
                                  0}{" "}
                                sec
                              </p>
                            </div>

                            {question.explanation && (
                              <div className="md:col-span-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Explanation
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                  {
                                    question.explanation
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <div className="text-xs text-slate-500">
            Total Questions:{" "}
            <span className="font-bold text-slate-800">
              {allQuestions.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTestQuestions;