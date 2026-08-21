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

import { useNavigate, useParams } from "react-router-dom";

import {
  getPTEQuestionById,
  updatePTEQuestion,
} from "../../../services/pteQuestionService";

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
// Initial Form
// ======================================================

const INITIAL_FORM = {
  section: "Reading",
  questionType: "Multiple Choice Single Answer",
  questionText: "",
  passage: "",
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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />

          <p className="text-gray-600">
            Loading PTE question...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // Render
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit PTE Question
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Update the PTE question details.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/pte/questions"
              )
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            <FaArrowLeft />

            Back
          </button>

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
    </div>
  );
};

export default EditPTEQuestion;