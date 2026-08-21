import React, {
  useEffect,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSave,
} from "react-icons/fa";

import {
  createPTEQuestion,
} from "../../../services/pteQuestionService";

import { useNavigate } from "react-router-dom";

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
// Speaking / Writing = Manual Evaluation
// ======================================================

const MANUAL_EVALUATION_SECTIONS = [
  "Speaking",
  "Writing",
];

// ======================================================
// Component
// ======================================================

const AddPTEQuestion = () => {
  const navigate = useNavigate();

  // ====================================================
  // Form State
  // ====================================================

  const [formData, setFormData] = useState({
    section: "",
    questionType: "",
    questionText: "",
    passage: "",
    options: [],
    correctAnswer: "",
    explanation: "",
    marks: 1,
    difficulty: "Medium",
    manualEvaluationRequired: false,
    lesson: "",
    status: "Draft",
  });

  // ====================================================
  // Option State
  // ====================================================

  const [newOption, setNewOption] = useState({
    label: "",
    text: "",
  });

  // ====================================================
  // UI State
  // ====================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ====================================================
  // Is Option Question?
  // ====================================================

  const isOptionQuestion =
    OPTION_QUESTION_TYPES.includes(
      formData.questionType
    );

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
  };

  // ====================================================
  // Handle Section Change
  // ====================================================

  const handleSectionChange = (e) => {
    const section = e.target.value;

    const manualEvaluation =
      MANUAL_EVALUATION_SECTIONS.includes(
        section
      );

    setFormData((previous) => ({
      ...previous,
      section,
      questionType: "",
      options: [],
      correctAnswer: "",
      manualEvaluationRequired:
        manualEvaluation,
    }));

    setNewOption({
      label: "",
      text: "",
    });
  };

  // ====================================================
  // Handle Question Type Change
  // ====================================================

  const handleQuestionTypeChange = (e) => {
    const questionType = e.target.value;

    setFormData((previous) => ({
      ...previous,
      questionType,
      options: OPTION_QUESTION_TYPES.includes(
        questionType
      )
        ? previous.options
        : [],
    }));

    setNewOption({
      label: "",
      text: "",
    });
  };

  // ====================================================
  // Add Option
  // ====================================================

  const handleAddOption = () => {
    if (
      !newOption.label.trim() ||
      !newOption.text.trim()
    ) {
      setError(
        "Please enter both option label and option text."
      );

      return;
    }

    const alreadyExists =
      formData.options.some(
        (option) =>
          option.label.toLowerCase() ===
          newOption.label
            .trim()
            .toLowerCase()
      );

    if (alreadyExists) {
      setError(
        "This option label already exists."
      );

      return;
    }

    setFormData((previous) => ({
      ...previous,
      options: [
        ...previous.options,
        {
          label: newOption.label.trim(),
          text: newOption.text.trim(),
        },
      ],
    }));

    setNewOption({
      label: "",
      text: "",
    });

    setError("");
  };

  // ====================================================
  // Remove Option
  // ====================================================

  const handleRemoveOption = (index) => {
    setFormData((previous) => ({
      ...previous,
      options: previous.options.filter(
        (_, optionIndex) =>
          optionIndex !== index
      ),
    }));
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

    if (!formData.questionText.trim()) {
      return "Please enter the question.";
    }

    if (
      isOptionQuestion &&
      formData.options.length < 2
    ) {
      return "Please add at least two options.";
    }

    if (
      !formData.manualEvaluationRequired &&
      !formData.correctAnswer.trim()
    ) {
      return "Please enter the correct answer.";
    }

    if (
      !formData.marks ||
      Number(formData.marks) < 1
    ) {
      return "Marks must be at least 1.";
    }

    return null;
  };

  // ====================================================
  // Submit Form
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
      setLoading(true);

      const payload = {
        section: formData.section,
        questionType:
          formData.questionType,
        questionText:
          formData.questionText.trim(),
        passage:
          formData.passage.trim(),
        options: formData.options,
        correctAnswer:
          formData.correctAnswer.trim(),
        explanation:
          formData.explanation.trim(),
        marks: Number(formData.marks),
        difficulty:
          formData.difficulty,
        manualEvaluationRequired:
          formData.manualEvaluationRequired,
        lesson:
          formData.lesson.trim() || null,
        status: formData.status,
      };

      await createPTEQuestion(payload);

      setSuccess(
        "PTE question created successfully."
      );

      // Reset form
      setFormData({
        section: "",
        questionType: "",
        questionText: "",
        passage: "",
        options: [],
        correctAnswer: "",
        explanation: "",
        marks: 1,
        difficulty: "Medium",
        manualEvaluationRequired: false,
        lesson: "",
        status: "Draft",
      });

      setNewOption({
        label: "",
        text: "",
      });

      // Go back after short delay
      setTimeout(() => {
        navigate("/admin/pte/questions");
      }, 1000);
    } catch (err) {
      console.error(
        "Create PTE Question Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create PTE question."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // Render
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ==================================================
          Header
      ================================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add PTE Question
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new question for PTE practice.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/pte/questions")
          }
          className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
        >
          <FaArrowLeft />
          Back
        </button>

      </div>

      {/* ==================================================
          Messages
      ================================================== */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ==================================================
          Form
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-6"
      >

        {/* ==================================================
            Basic Information
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Question Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Section */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Section *
              </label>

              <select
                value={formData.section}
                onChange={
                  handleSectionChange
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Select Section
                </option>

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

            {/* Question Type */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Question Type *
              </label>

              <select
                value={
                  formData.questionType
                }
                onChange={
                  handleQuestionTypeChange
                }
                disabled={!formData.section}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
              >
                <option value="">
                  Select Question Type
                </option>

                {formData.section &&
                  QUESTION_TYPES[
                    formData.section
                  ].map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
              </select>
            </div>

          </div>

        </div>

        {/* ==================================================
            Question
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Question
          </h2>

          {/* Question Text */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Question *
            </label>

            <textarea
              name="questionText"
              value={
                formData.questionText
              }
              onChange={handleChange}
              rows={5}
              placeholder="Enter the question..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Passage */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Passage / Context
            </label>

            <textarea
              name="passage"
              value={formData.passage}
              onChange={handleChange}
              rows={5}
              placeholder="Enter passage or context if required..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* ==================================================
            Options
        ================================================== */}

        {isOptionQuestion && (
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold text-gray-800">
              Options
            </h2>

            {/* Add Option */}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_auto]">

              <input
                type="text"
                placeholder="Label"
                value={
                  newOption.label
                }
                onChange={(e) =>
                  setNewOption(
                    (previous) => ({
                      ...previous,
                      label: e.target.value,
                    })
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Option text"
                value={
                  newOption.text
                }
                onChange={(e) =>
                  setNewOption(
                    (previous) => ({
                      ...previous,
                      text: e.target.value,
                    })
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={
                  handleAddOption
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <FaPlus />
                Add
              </button>

            </div>

            {/* Existing Options */}

            {formData.options.length >
              0 && (
              <div className="mt-5 space-y-3">

                {formData.options.map(
                  (
                    option,
                    index
                  ) => (
                    <div
                      key={`${option.label}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >

                      <div>
                        <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {option.label}
                        </span>

                        <span className="text-sm text-gray-700">
                          {option.text}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveOption(
                            index
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <FaTrash />
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}

        {/* ==================================================
            Answer
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Answer & Evaluation
          </h2>

          {/* Correct Answer */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Correct Answer
            </label>

            <input
              type="text"
              name="correctAnswer"
              value={
                formData.correctAnswer
              }
              onChange={handleChange}
              disabled={
                formData.manualEvaluationRequired
              }
              placeholder={
                formData.manualEvaluationRequired
                  ? "Manual evaluation required"
                  : "Enter correct answer..."
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-blue-500"
            />
          </div>

          {/* Explanation */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Explanation
            </label>

            <textarea
              name="explanation"
              value={
                formData.explanation
              }
              onChange={handleChange}
              rows={4}
              placeholder="Explain the correct answer..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Manual Evaluation */}

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">

            <label className="flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                name="manualEvaluationRequired"
                checked={
                  formData.manualEvaluationRequired
                }
                onChange={handleChange}
                disabled={MANUAL_EVALUATION_SECTIONS.includes(
                  formData.section
                )}
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Manual Evaluation Required
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Speaking and Writing questions
                  are initially evaluated manually.
                </p>
              </div>

            </label>

          </div>

        </div>

        {/* ==================================================
            Test Settings
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Question Settings
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Marks */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Marks *
              </label>

              <input
                type="number"
                name="marks"
                min="1"
                value={formData.marks}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Difficulty */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={
                  formData.difficulty
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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

        </div>

        {/* ==================================================
            Lesson
        ================================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Lesson Reference
          </h2>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Lesson ID
          </label>

          <input
            type="text"
            name="lesson"
            value={formData.lesson}
            onChange={handleChange}
            placeholder="Optional PTE Lesson ObjectId"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            Leave empty if this question is not
            associated with a specific lesson.
          </p>

        </div>

        {/* ==================================================
            Submit
        ================================================== */}

        <div className="flex items-center justify-end gap-3 pb-8">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/pte/questions")
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSave />

            {loading
              ? "Saving..."
              : "Save Question"}
          </button>

        </div>

      </form>
    </div>
  );
};

export default AddPTEQuestion;