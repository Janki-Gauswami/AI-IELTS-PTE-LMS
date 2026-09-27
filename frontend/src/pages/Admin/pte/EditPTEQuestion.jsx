import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

import {
  Headphones,
  Mic,
  Volume2,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import DashboardLayout from "../../../components/Dashboard/DashboardLayout";

import {
  getPTEQuestionById,
  updatePTEQuestion,
} from "../../../services/pteQuestionService";

import api from "../../../api/axios";

// ======================================================
// PTE Question Types
// ======================================================

const QUESTION_TYPES = {
  Speaking: [
    "Read Aloud",
    "Repeat Sentence",
    "Describe Image",
    "Re-tell Lecture",
    "Answer Short Question",
  ],

  Writing: [
    "Summarize Written Text",
    "Write Essay",
  ],

  Reading: [
    "Reading & Writing Fill in the Blanks",
    "Multiple Choice Single Answer",
    "Multiple Choice Multiple Answers",
    "Re-order Paragraphs",
    "Reading Fill in the Blanks",
  ],

  Listening: [
    "Summarize Spoken Text",
    "Listening Multiple Choice Single Answer",
    "Listening Multiple Choice Multiple Answers",
    "Fill in the Blanks",
    "Highlight Incorrect Words",
    "Write From Dictation",
  ],
};

// ======================================================
// Question Types Requiring Options
// ======================================================

const OPTION_QUESTION_TYPES = [
  "Multiple Choice Single Answer",
  "Multiple Choice Multiple Answers",
  "Reading & Writing Fill in the Blanks",
  "Reading Fill in the Blanks",
  "Re-order Paragraphs",
  "Listening Multiple Choice Single Answer",
  "Listening Multiple Choice Multiple Answers",
];

// ======================================================
// Initial Form State
// ======================================================

const INITIAL_FORM = {
  section: "Reading",
  questionType: "Multiple Choice Single Answer",
  questionText: "",
  passage: "",
  audioUrl: "",
  imageUrl: "",
  options: [
    {
      label: "A",
      text: "",
    },
    {
      label: "B",
      text: "",
    },
    {
      label: "C",
      text: "",
    },
    {
      label: "D",
      text: "",
    },
  ],
  correctAnswer: "",
  explanation: "",
  marks: 1,
  difficulty: "Medium",
  manualEvaluationRequired: false,
  lesson: "",
  status: "Draft",
};

// ======================================================
// Component
// ======================================================

const EditPTEQuestion = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  // ====================================================
  // States
  // ====================================================

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioSuccess, setAudioSuccess] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("audio", file);

    try {
      setUploadingAudio(true);
      setAudioSuccess("");
      setError("");

      const res = await api.post("/upload/audio", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, audioUrl: res.data.data.fileUrl }));
        setAudioSuccess("Audio uploaded successfully!");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload audio.");
    } finally {
      setUploadingAudio(false);
    }
  };

  // ====================================================
  // Question Types Based On Section
  // ====================================================

  const availableQuestionTypes = useMemo(() => {
    return QUESTION_TYPES[formData.section] || [];
  }, [formData.section]);

  // ====================================================
  // Load Question
  // ====================================================

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError(
            "Question ID is missing."
          );
          return;
        }

        const response =
          await getPTEQuestionById(id);

        const question =
          response?.data;

        if (!question) {
          setError(
            "PTE question not found."
          );
          return;
        }

        // ----------------------------------------------
        // Normalize Options
        // ----------------------------------------------

        let normalizedOptions = [];

        if (
          Array.isArray(question.options)
        ) {
          normalizedOptions =
            question.options.map(
              (option, index) => ({
                label:
                  option?.label ||
                  String.fromCharCode(
                    65 + index
                  ),
                text:
                  option?.text || "",
              })
            );
        }

        // ----------------------------------------------
        // If no options
        // ----------------------------------------------

        if (
          normalizedOptions.length === 0
        ) {
          normalizedOptions = [
            {
              label: "A",
              text: "",
            },
          ];
        }

        // ----------------------------------------------
        // Populate Form
        // ----------------------------------------------

        setFormData({
          section:
            question.section ||
            "Reading",

          questionType:
            question.questionType ||
            "Multiple Choice Single Answer",

          questionText:
            question.questionText ||
            "",

          passage:
            question.passage || "",

          audioUrl:
            question.audioUrl || "",

          imageUrl:
            question.imageUrl || "",

          options:
            normalizedOptions,

          correctAnswer:
            question.correctAnswer ||
            "",

          explanation:
            question.explanation ||
            "",

          marks:
            question.marks ?? 1,

          difficulty:
            question.difficulty ||
            "Medium",

          manualEvaluationRequired:
            Boolean(
              question.manualEvaluationRequired
            ),

          lesson:
            question.lesson?._id ||
            question.lesson ||
            "",

          status:
            question.status ||
            "Draft",
        });
      } catch (err) {
        console.error(
          "Load PTE Question Error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load PTE question."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  // ====================================================
  // Handle Input
  // ====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  // ====================================================
  // Handle Section Change
  // ====================================================

  const handleSectionChange = (e) => {
    const section = e.target.value;

    const questionTypes =
      QUESTION_TYPES[section] || [];

    setFormData((previous) => ({
      ...previous,

      section,

      questionType:
        questionTypes.length > 0
          ? questionTypes[0]
          : "",
    }));

    setError("");
  };

  // ====================================================
  // Handle Option Change
  // ====================================================

  const handleOptionChange = (
    index,
    value
  ) => {
    setFormData((previous) => {
      const options = [
        ...previous.options,
      ];

      options[index] = {
        ...options[index],
        text: value,
      };

      return {
        ...previous,
        options,
      };
    });

    setError("");
  };

  // ====================================================
  // Add Option
  // ====================================================

  const addOption = () => {
    setFormData((previous) => {
      const nextIndex =
        previous.options.length;

      const label =
        String.fromCharCode(
          65 + nextIndex
        );

      return {
        ...previous,

        options: [
          ...previous.options,
          {
            label,
            text: "",
          },
        ],
      };
    });
  };

  // ====================================================
  // Remove Option
  // ====================================================

  const removeOption = (index) => {
    setFormData((previous) => {
      if (
        previous.options.length <= 1
      ) {
        return previous;
      }

      const options =
        previous.options.filter(
          (_, optionIndex) =>
            optionIndex !== index
        );

      const updatedOptions =
        options.map(
          (option, optionIndex) => ({
            ...option,
            label:
              String.fromCharCode(
                65 + optionIndex
              ),
          })
        );

      return {
        ...previous,

        options: updatedOptions,
      };
    });
  };

  // ====================================================
  // Validation
  // ====================================================

  const validateForm = () => {
    if (!formData.section) {
      return "Please select a section.";
    }

    if (!formData.questionType) {
      return "Please select a question type.";
    }

    if (
      !formData.questionText.trim()
    ) {
      return "Question text is required.";
    }

    if (
      !formData.marks ||
      Number(formData.marks) < 1
    ) {
      return "Marks must be at least 1.";
    }

    // ----------------------------------------------
    // Validate options for objective questions
    // ----------------------------------------------

    const objectiveTypes = [
      "Multiple Choice Single Answer",
      "Multiple Choice Multiple Answers",
      "Reading & Writing Fill in the Blanks",
      "Reading Fill in the Blanks",
      "Listening Multiple Choice Single Answer",
      "Listening Multiple Choice Multiple Answers",
      "Fill in the Blanks",
      "Highlight Incorrect Words",
      "Write From Dictation",
      "Re-order Paragraphs",
    ];

    if (
      objectiveTypes.includes(
        formData.questionType
      )
    ) {
      const hasEmptyOption =
        formData.options.some(
          (option) =>
            !option.text.trim()
        );

      if (
        formData.options.length > 0 &&
        hasEmptyOption
      ) {
        return "Please fill all option fields.";
      }
    }

    return "";
  };

  // ====================================================
  // Submit
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      // ----------------------------------------------
      // Prepare Payload
      // ----------------------------------------------

      const payload = {
        section:
          formData.section,

        questionType:
          formData.questionType,

        questionText:
          formData.questionText.trim(),

        passage:
          formData.passage.trim(),

        audioUrl:
          formData.audioUrl.trim(),

        imageUrl:
          formData.imageUrl.trim(),

        options:
          formData.options.map(
            (option) => ({
              label:
                option.label,
              text:
                option.text.trim(),
            })
          ),

        correctAnswer:
          formData.correctAnswer.trim(),

        explanation:
          formData.explanation.trim(),

        marks:
          Number(formData.marks),

        difficulty:
          formData.difficulty,

        manualEvaluationRequired:
          Boolean(
            formData.manualEvaluationRequired
          ),

        lesson:
          formData.lesson || null,

        status:
          formData.status,
      };

      await updatePTEQuestion(
        id,
        payload
      );

      setSuccess(
        "PTE question updated successfully."
      );

      // ----------------------------------------------
      // Redirect
      // ----------------------------------------------

      setTimeout(() => {
        navigate(
          "/admin/pte/questions"
        );
      }, 800);
    } catch (err) {
      console.error(
        "Update PTE Question Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update PTE question."
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // Loading
  // ====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="animate-spin text-3xl text-blue-600" />
            <p className="text-gray-600">Loading PTE question...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ====================================================
  // Render
  // ====================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admin/pte/questions")
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition mb-2"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PTE Questions</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              Edit PTE Question
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Update question text, options, audio clip, or metadata.
            </p>
          </div>
        </div>

        {/* ==================================================
            Error
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            Success
        ================================================== */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {/* ==================================================
            Form
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
        >

          {/* ==================================================
              Section
          ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section *
            </label>

            <select
              name="section"
              value={
                formData.section
              }
              onChange={
                handleSectionChange
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Speaking">
                Speaking
              </option>

              <option value="Writing">
                Writing
              </option>

              <option value="Reading">
                Reading
              </option>

              <option value="Listening">
                Listening
              </option>
            </select>
          </div>

          {/* ==================================================
              Question Type
          ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type *
            </label>

            <select
              name="questionType"
              value={
                formData.questionType
              }
              onChange={
                handleChange
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableQuestionTypes.map(
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

          {/* ==================================================
              Passage
          ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passage / Context
            </label>

            <textarea
              name="passage"
              value={
                formData.passage
              }
              onChange={
                handleChange
              }
              rows={5}
              placeholder="Enter passage or context..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ==================================================
              Question
          ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>

            <textarea
              name="questionText"
              value={
                formData.questionText
              }
              onChange={
                handleChange
              }
              rows={4}
              placeholder="Enter question..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Audio Clip (for Listening & Speaking questions) */}
          {(formData.section === "Listening" ||
            formData.section === "Speaking") && (
            <div className="rounded-2xl bg-blue-50/60 p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {formData.section === "Listening" ? (
                    <Headphones className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Mic className="w-5 h-5 text-blue-600" />
                  )}
                  <label className="text-sm font-bold text-blue-950">
                    {formData.section} Audio Clip
                  </label>
                </div>
                {formData.audioUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, audioUrl: "" }));
                      setAudioSuccess("");
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Audio
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-3">
                Upload an audio file (MP3, WAV, WebM, M4A, OGG) for this {formData.section} question.
              </p>

              <div>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.webm,.m4a,.ogg"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer border border-slate-200 rounded-xl bg-white p-2"
                />
                {uploadingAudio && (
                  <p className="mt-2 text-xs text-blue-600 flex items-center gap-1.5 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading audio clip...
                  </p>
                )}
                {audioSuccess && (
                  <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> {audioSuccess}
                  </p>
                )}
              </div>

              {formData.audioUrl && (
                <div className="mt-3 rounded-xl bg-white p-3.5 border border-blue-100 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-600" /> Audio Clip Preview
                  </p>
                  <audio
                    controls
                    src={formData.audioUrl.startsWith("http") ? formData.audioUrl : `http://localhost:5000${formData.audioUrl}`}
                    className="w-full h-10 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400 truncate">Source: {formData.audioUrl}</p>
                </div>
              )}
            </div>
          )}

          {/* Image URL (for Describe Image) */}
          {formData.questionType === "Describe Image" && (
            <div className="rounded-xl bg-purple-50 p-4 border border-purple-100">
              <label className="mb-2 block text-sm font-semibold text-purple-900">
                Chart / Image URL (Describe Image)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/chart-image.png"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="PTE Chart Preview"
                    className="max-h-48 rounded-lg border border-purple-200 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              Options
          ================================================== */}

          <div>

            <div className="flex items-center justify-between mb-3">

              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>

              <button
                type="button"
                onClick={
                  addOption
                }
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <FaPlus />

                Add Option
              </button>

            </div>

            <div className="space-y-3">

              {formData.options.map(
                (
                  option,
                  index
                ) => (
                  <div
                    key={`${option.label}-${index}`}
                    className="flex items-center gap-3"
                  >

                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 font-semibold text-gray-700">
                      {
                        option.label
                      }
                    </div>

                    <input
                      type="text"
                      value={
                        option.text
                      }
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          e.target
                            .value
                        )
                      }
                      placeholder={`Option ${option.label}`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeOption(
                          index
                        )
                      }
                      disabled={
                        formData
                          .options
                          .length <=
                        1
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaTrash />
                    </button>

                  </div>
                )
              )}

            </div>

          </div>

          {/* ==================================================
              Correct Answer
          ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>

            <input
              type="text"
              name="correctAnswer"
              value={
                formData.correctAnswer
              }
              onChange={
                handleChange
              }
              placeholder="Enter correct answer..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ==================================================
              Explanation
          ================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation
            </label>

            <textarea
              name="explanation"
              value={
                formData.explanation
              }
              onChange={
                handleChange
              }
              rows={4}
              placeholder="Explain why this answer is correct..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ==================================================
              Marks / Difficulty / Status
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Marks */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks *
              </label>

              <input
                type="number"
                name="marks"
                min="1"
                value={
                  formData.marks
                }
                onChange={
                  handleChange
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Difficulty */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={
                  formData.difficulty
                }
                onChange={
                  handleChange
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>
              </select>
            </div>

            {/* Status */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Archived">
                  Archived
                </option>
              </select>
            </div>

          </div>

          {/* ==================================================
              Manual Evaluation
          ================================================== */}

          <div className="border border-gray-200 rounded-lg p-4">

            <label className="flex items-start gap-3 cursor-pointer">

              <input
                type="checkbox"
                name="manualEvaluationRequired"
                checked={
                  formData.manualEvaluationRequired
                }
                onChange={
                  handleChange
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="font-medium text-gray-800">
                  Manual Evaluation Required
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Enable this for Speaking and
                  Writing questions that require
                  teacher evaluation.
                </p>
              </div>

            </label>

          </div>

          {/* ==================================================
              Buttons
          ================================================== */}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/pte/questions"
                )
              }
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />

                  Updating...
                </>
              ) : (
                <>
                  <FaSave />

                  Update Question
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default EditPTEQuestion;