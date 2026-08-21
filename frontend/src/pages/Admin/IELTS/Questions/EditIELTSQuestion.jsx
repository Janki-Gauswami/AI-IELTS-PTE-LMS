import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getIELTSQuestionById,
  updateIELTSQuestion,
} from "../../../../services/ieltsQuestionService";

const EditIELTSQuestion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    section: "Listening",
    questionType: "Multiple Choice",
    questionText: "",
    passage: "",
    difficulty: "Medium",
    correctAnswer: "",
    explanation: "",
    marks: 1,
    status: "Draft",
  });

  const [options, setOptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ======================================================
  // Load Question
  // ======================================================

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getIELTSQuestionById(id);

      const question =
        response.data;

      if (!question) {
        setError(
          "IELTS question not found."
        );

        return;
      }

      setForm({
        section:
          question.section ||
          "Listening",

        questionType:
          question.questionType ||
          "Multiple Choice",

        questionText:
          question.questionText ||
          "",

        passage:
          question.passage ||
          "",

        difficulty:
          question.difficulty ||
          "Medium",

        correctAnswer:
          question.correctAnswer ||
          "",

        explanation:
          question.explanation ||
          "",

        marks:
          question.marks || 1,

        status:
          question.status ||
          "Draft",
      });

      setOptions(
        question.options || []
      );

    } catch (err) {
      console.error(
        "Load IELTS Question Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load IELTS question."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Handle Form Change
  // ======================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // Handle Option Change
  // ======================================================

  const handleOptionChange = (
    index,
    value
  ) => {
    setOptions((previous) =>
      previous.map(
        (option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                text: value,
              }
            : option
      )
    );
  };

  // ======================================================
  // Submit
  // ======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = {
        ...form,

        marks: Number(
          form.marks
        ),

        options:
          form.questionType ===
          "Multiple Choice"
            ? options
            : [],
      };

      await updateIELTSQuestion(
        id,
        data
      );

      navigate(
        `/admin/ielts/questions/${id}`
      );

    } catch (err) {
      console.error(
        "Update IELTS Question Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update IELTS question."
      );

    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="text-slate-500">
            Loading question...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        {/* Header */}

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Edit IELTS Question
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update the IELTS question details.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* Section */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              IELTS Section
            </label>

            <select
              name="section"
              value={form.section}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >

              <option value="Listening">
                Listening
              </option>

              <option value="Reading">
                Reading
              </option>

              <option value="Writing">
                Writing
              </option>

              <option value="Speaking">
                Speaking
              </option>

            </select>

          </div>


          {/* Question Type */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Question Type
            </label>

            <select
              name="questionType"
              value={
                form.questionType
              }
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >

              <option value="Multiple Choice">
                Multiple Choice
              </option>

              <option value="True False Not Given">
                True / False / Not Given
              </option>

              <option value="Yes No Not Given">
                Yes / No / Not Given
              </option>

              <option value="Matching">
                Matching
              </option>

              <option value="Matching Headings">
                Matching Headings
              </option>

              <option value="Fill in the Blanks">
                Fill in the Blanks
              </option>

              <option value="Sentence Completion">
                Sentence Completion
              </option>

              <option value="Short Answer">
                Short Answer
              </option>

              <option value="Essay">
                Essay
              </option>

              <option value="Speaking Prompt">
                Speaking Prompt
              </option>

            </select>

          </div>


          {/* Question */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Question
            </label>

            <textarea
              name="questionText"
              value={
                form.questionText
              }
              onChange={handleChange}
              rows={4}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

          </div>


          {/* Passage */}

          {(form.section ===
            "Reading" ||
            form.section ===
              "Listening") && (

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Passage / Context
              </label>

              <textarea
                name="passage"
                value={
                  form.passage
                }
                onChange={handleChange}
                rows={8}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

            </div>

          )}


          {/* Options */}

          {form.questionType ===
            "Multiple Choice" && (

            <div>

              <label className="mb-3 block text-sm font-medium text-slate-700">
                Options
              </label>

              <div className="space-y-3">

                {options.length === 0 ? (

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No options available.
                  </div>

                ) : (

                  options.map(
                    (
                      option,
                      index
                    ) => (

                      <div
                        key={
                          option.label ||
                          index
                        }
                        className="flex items-center gap-3"
                      >

                        <span className="w-6 font-semibold text-slate-700">
                          {option.label}
                        </span>

                        <input
                          type="text"
                          value={
                            option.text ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleOptionChange(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
                        />

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          )}


          {/* Correct Answer */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Correct Answer
            </label>

            <input
              type="text"
              name="correctAnswer"
              value={
                form.correctAnswer
              }
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

          </div>


          {/* Explanation */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Explanation
            </label>

            <textarea
              name="explanation"
              value={
                form.explanation
              }
              onChange={handleChange}
              rows={5}
              placeholder="Enter explanation..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

          </div>


          {/* Difficulty + Marks */}

          <div className="grid gap-4 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={
                  form.difficulty
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
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


            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Marks
              </label>

              <input
                type="number"
                name="marks"
                min="1"
                value={
                  form.marks
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

            </div>

          </div>


          {/* Status */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={
                form.status
              }
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
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


          {/* Buttons */}

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/ielts/questions/${id}`
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "Updating..."
                : "Update Question"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditIELTSQuestion;