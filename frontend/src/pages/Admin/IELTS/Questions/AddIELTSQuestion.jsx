import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createIELTSQuestion,
} from "../../../../services/ieltsQuestionService";

const AddIELTSQuestion = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    section: "Listening",
    questionType: "Multiple Choice",
    questionText: "",
    passage: "",
    difficulty: "Medium",
    correctAnswer: "",
    marks: 1,
  });

  const [options, setOptions] = useState([
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
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = {
        ...form,
        marks: Number(form.marks),
        options:
          form.questionType ===
          "Multiple Choice"
            ? options
            : [],
      };

      await createIELTSQuestion(data);

      navigate("/admin/ielts/questions");

    } catch (err) {
      console.error(
        "Create IELTS Question Error:",
        err
      );

      setError(
        err.message ||
          "Unable to create question."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">

      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-slate-800">
          Add IELTS Question
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a question for the IELTS module.
        </p>


        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* Section */}

          <div>

            <label className="mb-2 block text-sm font-medium">
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

            <label className="mb-2 block text-sm font-medium">
              Question Type
            </label>

            <select
              name="questionType"
              value={form.questionType}
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

            </select>

          </div>


          {/* Question */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Question
            </label>

            <textarea
              name="questionText"
              value={form.questionText}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Enter question..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

          </div>


          {/* Passage */}

          {(form.section === "Reading" ||
            form.section === "Listening") && (
            <div>

              <label className="mb-2 block text-sm font-medium">
                Passage / Context
              </label>

              <textarea
                name="passage"
                value={form.passage}
                onChange={handleChange}
                rows={8}
                placeholder="Enter passage or context..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

            </div>
          )}


          {/* MCQ Options */}

          {form.questionType ===
            "Multiple Choice" && (
            <div>

              <label className="mb-3 block text-sm font-medium">
                Options
              </label>

              <div className="space-y-3">

                {options.map(
                  (option, index) => (
                    <div
                      key={option.label}
                      className="flex items-center gap-3"
                    >

                      <span className="w-6 font-semibold">
                        {option.label}
                      </span>

                      <input
                        type="text"
                        value={option.text}
                        onChange={(event) =>
                          handleOptionChange(
                            index,
                            event.target.value
                          )
                        }
                        placeholder={`Option ${option.label}`}
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
                      />

                    </div>
                  )
                )}

              </div>

            </div>
          )}


          {/* Correct Answer */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Correct Answer
            </label>

            <input
              type="text"
              name="correctAnswer"
              value={form.correctAnswer}
              onChange={handleChange}
              placeholder="Enter correct answer"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

          </div>


          {/* Difficulty + Marks */}

          <div className="grid gap-4 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
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

              <label className="mb-2 block text-sm font-medium">
                Marks
              </label>

              <input
                type="number"
                name="marks"
                min="1"
                value={form.marks}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

            </div>

          </div>


          {/* Buttons */}

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/ielts/questions"
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : "Save Question"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddIELTSQuestion;