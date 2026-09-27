const IELTSTestAttempt =
  require("../models/IELTSTestAttempt");


// ======================================================
// Helper: Calculate Average
// ======================================================

const calculateAverage = (values) => {
  const validValues = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      !Number.isNaN(Number(value))
  );

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce(
    (sum, value) =>
      sum + Number(value),
    0
  );

  return Number(
    (total / validValues.length).toFixed(2)
  );
};


// ======================================================
// Helper: Calculate Improvement
// ======================================================

const calculateImprovement = (
  firstBand,
  latestBand
) => {
  if (
    firstBand === null ||
    firstBand === undefined ||
    latestBand === null ||
    latestBand === undefined
  ) {
    return null;
  }

  return Number(
    (
      Number(latestBand) -
      Number(firstBand)
    ).toFixed(2)
  );
};


// ======================================================
// Helper: Get Strongest Section
// ======================================================

const getStrongestSection = (
  listening,
  reading,
  writing,
  speaking
) => {
  const sections = {
    Listening: listening,
    Reading: reading,
    Writing: writing,
    Speaking: speaking,
  };

  const validSections =
    Object.entries(sections).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value))
    );

  if (validSections.length === 0) {
    return null;
  }

  validSections.sort(
    (a, b) =>
      Number(b[1]) -
      Number(a[1])
  );

  return validSections[0][0];
};


// ======================================================
// Helper: Get Weakest Section
// ======================================================

const getWeakestSection = (
  listening,
  reading,
  writing,
  speaking
) => {
  const sections = {
    Listening: listening,
    Reading: reading,
    Writing: writing,
    Speaking: speaking,
  };

  const validSections =
    Object.entries(sections).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value))
    );

  if (validSections.length === 0) {
    return null;
  }

  validSections.sort(
    (a, b) =>
      Number(a[1]) -
      Number(b[1])
  );

  return validSections[0][0];
};


// ======================================================
// Get Student IELTS Progress
// Student can view own progress
// Admin / Teacher can view student progress
// ======================================================

exports.getStudentProgress = async (
  req,
  res
) => {
  try {

    const {
      studentId,
    } = req.params;


    // ==================================================
    // Determine Student
    // ==================================================

    let targetStudentId =
      studentId;


    if (
      req.user.role ===
      "student"
    ) {
      targetStudentId =
        req.user._id;
    }


    // ==================================================
    // Find Submitted / Evaluated Attempts
    // ==================================================

    const attempts =
      await IELTSTestAttempt
        .find({
          student:
            targetStudentId,

          status: {
            $in: [
              "Submitted",
              "Evaluated",
            ],
          },
        })
        .populate(
          "test",
          "title section difficulty duration"
        )
        .sort({
          submittedAt: 1,
        });


    // ==================================================
    // No Attempts
    // ==================================================

    if (
      attempts.length === 0
    ) {
      return res.status(200).json({
        success: true,

        message:
          "No IELTS attempts found.",

        data: {
          totalAttempts: 0,

          currentOverallBand: null,

          bestOverallBand: null,

          averageOverallBand: null,

          improvement: null,

          listening: {
            averageBand: null,
            bestBand: null,
            attempts: 0,
          },

          reading: {
            averageBand: null,
            bestBand: null,
            attempts: 0,
          },

          writing: {
            averageBand: null,
            bestBand: null,
            attempts: 0,
          },

          speaking: {
            averageBand: null,
            bestBand: null,
            attempts: 0,
          },

          strongestSection: null,

          weakestSection: null,

          recentAttempts: [],
        },
      });
    }


    // ==================================================
    // Overall Bands
    // ==================================================

    const overallBands =
      attempts
        .map(
          (attempt) =>
            attempt.overallBand ??
            attempt.readingBand ??
            attempt.listeningBand ??
            attempt.writingBand ??
            attempt.speakingBand ??
            (attempt.totalMarks > 0
              ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
              : (attempt.score > 0 ? Number(((attempt.score / 40) * 9).toFixed(1)) : null))
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    // ==================================================
    // Section Bands
    // ==================================================

    const listeningBands =
      attempts
        .map(
          (attempt) =>
            attempt.listeningBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    const readingBands =
      attempts
        .map(
          (attempt) =>
            attempt.readingBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    const writingBands =
      attempts
        .map(
          (attempt) =>
            attempt.writingBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    const speakingBands =
      attempts
        .map(
          (attempt) =>
            attempt.speakingBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    // ==================================================
    // Current Overall Band
    // ==================================================

    const currentOverallBand =
      overallBands.length > 0
        ? overallBands[
            overallBands.length - 1
          ]
        : null;


    // ==================================================
    // Best Overall Band
    // ==================================================

    const bestOverallBand =
      overallBands.length > 0
        ? Math.max(
            ...overallBands.map(
              Number
            )
          )
        : null;


    // ==================================================
    // Average Overall Band
    // ==================================================

    const averageOverallBand =
      calculateAverage(
        overallBands
      );


    // ==================================================
    // Improvement
    // First Attempt → Latest Attempt
    // ==================================================

    const improvement =
      overallBands.length >= 2
        ? calculateImprovement(
            overallBands[0],
            overallBands[
              overallBands.length - 1
            ]
          )
        : null;


    // ==================================================
    // Average Section Bands
    // ==================================================

    const averageListening =
      calculateAverage(
        listeningBands
      );

    const averageReading =
      calculateAverage(
        readingBands
      );

    const averageWriting =
      calculateAverage(
        writingBands
      );

    const averageSpeaking =
      calculateAverage(
        speakingBands
      );


    // ==================================================
    // Best Section Bands
    // ==================================================

    const bestListening =
      listeningBands.length > 0
        ? Math.max(
            ...listeningBands.map(
              Number
            )
          )
        : null;

    const bestReading =
      readingBands.length > 0
        ? Math.max(
            ...readingBands.map(
              Number
            )
          )
        : null;

    const bestWriting =
      writingBands.length > 0
        ? Math.max(
            ...writingBands.map(
              Number
            )
          )
        : null;

    const bestSpeaking =
      speakingBands.length > 0
        ? Math.max(
            ...speakingBands.map(
              Number
            )
          )
        : null;


    // ==================================================
    // Strongest / Weakest Section
    // Based On Average Band
    // ==================================================

    const strongestSection =
      getStrongestSection(
        averageListening,
        averageReading,
        averageWriting,
        averageSpeaking
      );

    const weakestSection =
      getWeakestSection(
        averageListening,
        averageReading,
        averageWriting,
        averageSpeaking
      );


    // ==================================================
    // Recent Attempts
    // ==================================================

    const recentAttempts =
      [...attempts]
        .reverse()
        .slice(0, 10)
        .map(
          (attempt) => ({
            attemptId:
              attempt._id,

            test:
              attempt.test
                ? {
                    id:
                      attempt.test._id,

                    title:
                      attempt.test.title,

                    section:
                      attempt.test.section,

                    difficulty:
                      attempt.test.difficulty,
                  }
                : null,

            listeningBand:
              attempt.listeningBand,

            readingBand:
              attempt.readingBand,

            writingBand:
              attempt.writingBand,

            speakingBand:
              attempt.speakingBand,

            overallBand:
              attempt.overallBand ??
              attempt.readingBand ??
              attempt.listeningBand ??
              attempt.writingBand ??
              attempt.speakingBand ??
              (attempt.totalMarks > 0
                ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
                : null),

            score:
              attempt.score,

            totalMarks:
              attempt.totalMarks,

            percentage:
              attempt.percentage,

            status:
              attempt.status,

            submittedAt:
              attempt.submittedAt,
          })
        );


    // ==================================================
    // Final Response
    // ==================================================

    return res.status(200).json({

      success: true,

      data: {

        // ==============================================
        // Overall Progress
        // ==============================================

        totalAttempts:
          attempts.length,

        currentOverallBand,

        bestOverallBand,

        averageOverallBand,

        improvement,


        // ==============================================
        // Listening
        // ==============================================

        listening: {

          averageBand:
            averageListening,

          bestBand:
            bestListening,

          attempts:
            listeningBands.length,

        },


        // ==============================================
        // Reading
        // ==============================================

        reading: {

          averageBand:
            averageReading,

          bestBand:
            bestReading,

          attempts:
            readingBands.length,

        },


        // ==============================================
        // Writing
        // ==============================================

        writing: {

          averageBand:
            averageWriting,

          bestBand:
            bestWriting,

          attempts:
            writingBands.length,

        },


        // ==============================================
        // Speaking
        // ==============================================

        speaking: {

          averageBand:
            averageSpeaking,

          bestBand:
            bestSpeaking,

          attempts:
            speakingBands.length,

        },


        // ==============================================
        // Strength Analysis
        // ==============================================

        strongestSection,

        weakestSection,


        // ==============================================
        // Recent Attempts
        // ==============================================

        recentAttempts,

      },

    });

  } catch (error) {

    console.error(
      "Get IELTS Student Progress Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load IELTS student progress.",

    });

  }
};


// ======================================================
// Get My IELTS Progress
// Student Only
// ======================================================

exports.getMyProgress = async (
  req,
  res
) => {
  try {

    const studentId =
      req.user._id;


    const attempts =
      await IELTSTestAttempt
        .find({
          student:
            studentId,

          status: {
            $in: [
              "Submitted",
              "Evaluated",
            ],
          },
        })
        .populate(
          "test",
          "title section difficulty duration"
        )
        .sort({
          submittedAt: 1,
        });


    // ==================================================
    // No Attempts
    // ==================================================

    if (
      attempts.length === 0
    ) {

      return res.status(200).json({

        success: true,

        data: {

          totalAttempts: 0,

          currentOverallBand:
            null,

          bestOverallBand:
            null,

          averageOverallBand:
            null,

          improvement:
            null,

          strongestSection:
            null,

          weakestSection:
            null,

          recentAttempts: [],

        },

      });

    }


    // ==================================================
    // Overall Bands
    // ==================================================

    const overallBands =
      attempts
        .map(
          (attempt) =>
            attempt.overallBand ??
            attempt.readingBand ??
            attempt.listeningBand ??
            attempt.writingBand ??
            attempt.speakingBand ??
            (attempt.totalMarks > 0
              ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
              : (attempt.score > 0 ? Number(((attempt.score / 40) * 9).toFixed(1)) : null))
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    // ==================================================
    // Section Bands
    // ==================================================

    const listeningBands =
      attempts
        .map(
          (attempt) =>
            attempt.listeningBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    const readingBands =
      attempts
        .map(
          (attempt) =>
            attempt.readingBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    const writingBands =
      attempts
        .map(
          (attempt) =>
            attempt.writingBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    const speakingBands =
      attempts
        .map(
          (attempt) =>
            attempt.speakingBand
        )
        .filter(
          (band) =>
            band !== null &&
            band !== undefined
        );


    // ==================================================
    // Averages
    // ==================================================

    const averageListening =
      calculateAverage(
        listeningBands
      );

    const averageReading =
      calculateAverage(
        readingBands
      );

    const averageWriting =
      calculateAverage(
        writingBands
      );

    const averageSpeaking =
      calculateAverage(
        speakingBands
      );


    // ==================================================
    // Overall
    // ==================================================

    const currentOverallBand =
      overallBands.length > 0
        ? overallBands[
            overallBands.length - 1
          ]
        : null;


    const bestOverallBand =
      overallBands.length > 0
        ? Math.max(
            ...overallBands.map(
              Number
            )
          )
        : null;


    const averageOverallBand =
      calculateAverage(
        overallBands
      );


    const improvement =
      overallBands.length >= 2
        ? calculateImprovement(
            overallBands[0],
            overallBands[
              overallBands.length - 1
            ]
          )
        : null;


    // ==================================================
    // Strongest / Weakest
    // ==================================================

    const strongestSection =
      getStrongestSection(
        averageListening,
        averageReading,
        averageWriting,
        averageSpeaking
      );

    const weakestSection =
      getWeakestSection(
        averageListening,
        averageReading,
        averageWriting,
        averageSpeaking
      );


    // ==================================================
    // Recent Attempts
    // ==================================================

    const recentAttempts =
      [...attempts]
        .reverse()
        .slice(0, 10)
        .map(
          (attempt) => ({

            attemptId:
              attempt._id,

            test:
              attempt.test
                ? {
                    id:
                      attempt.test._id,

                    title:
                      attempt.test.title,

                    section:
                      attempt.test.section,

                    difficulty:
                      attempt.test.difficulty,
                  }
                : null,

            listeningBand:
              attempt.listeningBand,

            readingBand:
              attempt.readingBand,

            writingBand:
              attempt.writingBand,

            speakingBand:
              attempt.speakingBand,

            overallBand:
              attempt.overallBand ??
              attempt.readingBand ??
              attempt.listeningBand ??
              attempt.writingBand ??
              attempt.speakingBand ??
              (attempt.totalMarks > 0
                ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
                : null),

            score:
              attempt.score,

            totalMarks:
              attempt.totalMarks,

            percentage:
              attempt.percentage,

            status:
              attempt.status,

            submittedAt:
              attempt.submittedAt,

          })
        );


    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({

      success: true,

      data: {

        totalAttempts:
          attempts.length,

        currentOverallBand,

        bestOverallBand,

        averageOverallBand,

        improvement,

        listening: {

          averageBand:
            averageListening,

          bestBand:
            listeningBands.length > 0
              ? Math.max(
                  ...listeningBands.map(
                    Number
                  )
                )
              : null,

          attempts:
            listeningBands.length,

        },

        reading: {

          averageBand:
            averageReading,

          bestBand:
            readingBands.length > 0
              ? Math.max(
                  ...readingBands.map(
                    Number
                  )
                )
              : null,

          attempts:
            readingBands.length,

        },

        writing: {

          averageBand:
            averageWriting,

          bestBand:
            writingBands.length > 0
              ? Math.max(
                  ...writingBands.map(
                    Number
                  )
                )
              : null,

          attempts:
            writingBands.length,

        },

        speaking: {

          averageBand:
            averageSpeaking,

          bestBand:
            speakingBands.length > 0
              ? Math.max(
                  ...speakingBands.map(
                    Number
                  )
                )
              : null,

          attempts:
            speakingBands.length,

        },

        strongestSection,

        weakestSection,

        recentAttempts,

      },

    });

  } catch (error) {

    console.error(
      "Get My IELTS Progress Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load your IELTS progress.",

    });

  }
};
// ======================================================
// Get IELTS Section Performance
// Student
// ======================================================

exports.getSectionPerformance = async (
  req,
  res
) => {
  try {
    const {
      studentId,
    } = req.params;

    // ==================================================
    // Determine Student
    // ==================================================

    let targetStudentId =
      studentId;

    if (
      req.user.role ===
      "student"
    ) {
      targetStudentId =
        req.user._id;
    }

    // ==================================================
    // Get Submitted / Evaluated Attempts
    // ==================================================

    const attempts =
      await IELTSTestAttempt
        .find({
          student:
            targetStudentId,

          status: {
            $in: [
              "Submitted",
              "Evaluated",
            ],
          },
        })
        .sort({
          submittedAt: 1,
        });

    // ==================================================
    // Helper
    // ==================================================

    const getSectionStats = (
      values
    ) => {
      const validValues =
        values.filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            !Number.isNaN(
              Number(value)
            )
        );

      if (
        validValues.length === 0
      ) {
        return {
          currentBand: null,
          bestBand: null,
          averageBand: null,
          improvement: null,
          attempts: 0,
        };
      }

      const numbers =
        validValues.map(Number);

      const currentBand =
        numbers[
          numbers.length - 1
        ];

      const bestBand =
        Math.max(...numbers);

      const total =
        numbers.reduce(
          (sum, value) =>
            sum + value,
          0
        );

      const averageBand =
        Number(
          (
            total /
            numbers.length
          ).toFixed(2)
        );

      const improvement =
        numbers.length >= 2
          ? Number(
              (
                currentBand -
                numbers[0]
              ).toFixed(2)
            )
          : null;

      return {
        currentBand,
        bestBand,
        averageBand,
        improvement,
        attempts:
          numbers.length,
      };
    };

    // ==================================================
    // Listening Performance
    // ==================================================

    const listeningPerformance =
      getSectionStats(
        attempts.map(
          (attempt) =>
            attempt.listeningBand
        )
      );

    // ==================================================
    // Reading Performance
    // ==================================================

    const readingPerformance =
      getSectionStats(
        attempts.map(
          (attempt) =>
            attempt.readingBand
        )
      );

    // ==================================================
    // Writing Performance
    // ==================================================

    const writingPerformance =
      getSectionStats(
        attempts.map(
          (attempt) =>
            attempt.writingBand
        )
      );

    // ==================================================
    // Speaking Performance
    // ==================================================

    const speakingPerformance =
      getSectionStats(
        attempts.map(
          (attempt) =>
            attempt.speakingBand
        )
      );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      data: {
        listening:
          listeningPerformance,

        reading:
          readingPerformance,

        writing:
          writingPerformance,

        speaking:
          speakingPerformance,
      },
    });

  } catch (error) {
    console.error(
      "Get IELTS Section Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load IELTS section performance.",
    });
  }
};
// ======================================================
// Get IELTS Score Trends
// Student
// ======================================================

exports.getScoreTrends = async (
  req,
  res
) => {
  try {
    const {
      studentId,
    } = req.params;

    // ==================================================
    // Determine Student
    // ==================================================

    let targetStudentId =
      studentId;

    if (
      req.user.role ===
      "student"
    ) {
      targetStudentId =
        req.user._id;
    }

    // ==================================================
    // Get Submitted / Evaluated Attempts
    // ==================================================

    const attempts =
      await IELTSTestAttempt
        .find({
          student:
            targetStudentId,

          status: {
            $in: [
              "Submitted",
              "Evaluated",
            ],
          },
        })
        .populate(
          "test",
          "title section difficulty"
        )
        .sort({
          submittedAt: 1,
        });

    // ==================================================
    // No Attempts
    // ==================================================

    if (
      attempts.length === 0
    ) {
      return res.status(200).json({
        success: true,

        data: {
          totalAttempts: 0,

          overall: [],

          listening: [],

          reading: [],

          writing: [],

          speaking: [],
        },
      });
    }

    // ==================================================
    // Overall Band Trend
    // ==================================================

    const overall =
      attempts.map(
        (attempt, index) => ({
          attemptNumber:
            index + 1,

          attemptId:
            attempt._id,

          band:
            attempt.overallBand,

          submittedAt:
            attempt.submittedAt,

          test:
            attempt.test
              ? {
                  id:
                    attempt.test._id,

                  title:
                    attempt.test.title,

                  section:
                    attempt.test.section,
                }
              : null,
        })
      );

    // ==================================================
    // Listening Band Trend
    // ==================================================

    const listening =
      attempts
        .filter(
          (attempt) =>
            attempt.listeningBand !==
              null &&
            attempt.listeningBand !==
              undefined
        )
        .map(
          (attempt, index) => ({
            attemptNumber:
              index + 1,

            attemptId:
              attempt._id,

            band:
              attempt.listeningBand,

            submittedAt:
              attempt.submittedAt,
          })
        );

    // ==================================================
    // Reading Band Trend
    // ==================================================

    const reading =
      attempts
        .filter(
          (attempt) =>
            attempt.readingBand !==
              null &&
            attempt.readingBand !==
              undefined
        )
        .map(
          (attempt, index) => ({
            attemptNumber:
              index + 1,

            attemptId:
              attempt._id,

            band:
              attempt.readingBand,

            submittedAt:
              attempt.submittedAt,
          })
        );

    // ==================================================
    // Writing Band Trend
    // ==================================================

    const writing =
      attempts
        .filter(
          (attempt) =>
            attempt.writingBand !==
              null &&
            attempt.writingBand !==
              undefined
        )
        .map(
          (attempt, index) => ({
            attemptNumber:
              index + 1,

            attemptId:
              attempt._id,

            band:
              attempt.writingBand,

            submittedAt:
              attempt.submittedAt,
          })
        );

    // ==================================================
    // Speaking Band Trend
    // ==================================================

    const speaking =
      attempts
        .filter(
          (attempt) =>
            attempt.speakingBand !==
              null &&
            attempt.speakingBand !==
              undefined
        )
        .map(
          (attempt, index) => ({
            attemptNumber:
              index + 1,

            attemptId:
              attempt._id,

            band:
              attempt.speakingBand,

            submittedAt:
              attempt.submittedAt,
          })
        );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      data: {
        totalAttempts:
          attempts.length,

        overall,

        listening,

        reading,

        writing,

        speaking,
      },
    });

  } catch (error) {
    console.error(
      "Get IELTS Score Trends Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load IELTS score trends.",
    });
  }
};
// ======================================================
// Get IELTS Weak Areas
// Student
// ======================================================

exports.getWeakAreas = async (
  req,
  res
) => {
  try {
    const {
      studentId,
    } = req.params;

    // ==================================================
    // Determine Student
    // ==================================================

    let targetStudentId =
      studentId;

    if (
      req.user.role ===
      "student"
    ) {
      targetStudentId =
        req.user._id;
    }

    // ==================================================
    // Get Submitted / Evaluated Attempts
    // ==================================================

    const attempts =
      await IELTSTestAttempt
        .find({
          student:
            targetStudentId,

          status: {
            $in: [
              "Submitted",
              "Evaluated",
            ],
          },
        })
        .populate(
          "test",
          "title section"
        )
        .sort({
          submittedAt: 1,
        });

    // ==================================================
    // No Attempts
    // ==================================================

    if (
      attempts.length === 0
    ) {
      return res.status(200).json({
        success: true,

        data: {
          weakestSection: null,

          sections: [],

          questionTypes: [],

          difficulties: [],
        },
      });
    }

    // ==================================================
    // Section Performance
    // ==================================================

    const sectionScores = {
      Listening: [],
      Reading: [],
      Writing: [],
      Speaking: [],
    };

    attempts.forEach(
      (attempt) => {
        if (
          attempt.listeningBand !==
            null &&
          attempt.listeningBand !==
            undefined
        ) {
          sectionScores.Listening.push(
            Number(
              attempt.listeningBand
            )
          );
        }

        if (
          attempt.readingBand !==
            null &&
          attempt.readingBand !==
            undefined
        ) {
          sectionScores.Reading.push(
            Number(
              attempt.readingBand
            )
          );
        }

        if (
          attempt.writingBand !==
            null &&
          attempt.writingBand !==
            undefined
        ) {
          sectionScores.Writing.push(
            Number(
              attempt.writingBand
            )
          );
        }

        if (
          attempt.speakingBand !==
            null &&
          attempt.speakingBand !==
            undefined
        ) {
          sectionScores.Speaking.push(
            Number(
              attempt.speakingBand
            )
          );
        }
      }
    );

    // ==================================================
    // Calculate Section Statistics
    // ==================================================

    const sections = [];

    Object.entries(
      sectionScores
    ).forEach(
      ([
        section,
        values,
      ]) => {
        if (
          values.length === 0
        ) {
          return;
        }

        const total =
          values.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        const average =
          Number(
            (
              total /
              values.length
            ).toFixed(2)
          );

        const best =
          Math.max(
            ...values
          );

        const current =
          values[
            values.length - 1
          ];

        sections.push({
          section,

          currentBand:
            current,

          averageBand:
            average,

          bestBand:
            best,

          attempts:
            values.length,

          weak:
            average < 6.5,
        });
      }
    );

    // ==================================================
    // Find Weakest Section
    // ==================================================

    let weakestSection =
      null;

    if (
      sections.length > 0
    ) {
      const sortedSections =
        [...sections].sort(
          (a, b) =>
            a.averageBand -
            b.averageBand
        );

      weakestSection =
        sortedSections[0].section;
    }

    // ==================================================
    // Question-Type Analysis
    // Listening + Reading
    // ==================================================

    const questionTypeStats = {};

    // ==================================================
    // Difficulty Analysis
    // ==================================================

    const difficultyStats = {};

    // ==================================================
    // Process Attempts
    // ==================================================

    for (
      const attempt of attempts
    ) {

      if (
        !attempt.answers ||
        attempt.answers.length === 0
      ) {
        continue;
      }

      const questionIds =
        attempt.answers
          .map(
            (item) =>
              item.question
          )
          .filter(Boolean);

      if (
        questionIds.length === 0
      ) {
        continue;
      }

      const questions =
        await IELTSQuestion.find({
          _id: {
            $in:
              questionIds,
          },
        }).select(
          "correctAnswer questionType difficulty section marks"
        );

      const questionMap =
        new Map();

      questions.forEach(
        (question) => {
          questionMap.set(
            String(
              question._id
            ),
            question
          );
        }
      );

      // ==================================================
      // Evaluate Answers
      // ==================================================

      attempt.answers.forEach(
        (submitted) => {

          const question =
            questionMap.get(
              String(
                submitted.question
              )
            );

          if (!question) {
            return;
          }

          // ----------------------------------------------
          // Only Objective Sections
          // ----------------------------------------------

          if (
            question.section !==
              "Listening" &&
            question.section !==
              "Reading"
          ) {
            return;
          }

          const questionType =
            question.questionType ||
            "Unknown";

          const difficulty =
            question.difficulty ||
            "Unknown";

          const userAnswer =
            String(
              submitted.answer ??
                ""
            )
              .trim()
              .toLowerCase();

          const correctAnswer =
            String(
              question.correctAnswer ??
                ""
            )
              .trim()
              .toLowerCase();

          const unanswered =
            userAnswer === "";

          const correct =
            !unanswered &&
            userAnswer ===
              correctAnswer;

          // ==================================================
          // Question Type
          // ==================================================

          if (
            !questionTypeStats[
              questionType
            ]
          ) {
            questionTypeStats[
              questionType
            ] = {
              questionType,

              total: 0,

              correct: 0,

              incorrect: 0,

              unanswered: 0,

              accuracy: 0,
            };
          }

          questionTypeStats[
            questionType
          ].total++;

          if (correct) {

            questionTypeStats[
              questionType
            ].correct++;

          } else if (
            unanswered
          ) {

            questionTypeStats[
              questionType
            ].unanswered++;

          } else {

            questionTypeStats[
              questionType
            ].incorrect++;

          }

          // ==================================================
          // Difficulty
          // ==================================================

          if (
            !difficultyStats[
              difficulty
            ]
          ) {
            difficultyStats[
              difficulty
            ] = {
              difficulty,

              total: 0,

              correct: 0,

              incorrect: 0,

              unanswered: 0,

              accuracy: 0,
            };
          }

          difficultyStats[
            difficulty
          ].total++;

          if (correct) {

            difficultyStats[
              difficulty
            ].correct++;

          } else if (
            unanswered
          ) {

            difficultyStats[
              difficulty
            ].unanswered++;

          } else {

            difficultyStats[
              difficulty
            ].incorrect++;

          }
        }
      );
    }

    // ==================================================
    // Calculate Question-Type Accuracy
    // ==================================================

    const questionTypes =
      Object.values(
        questionTypeStats
      )
        .map(
          (item) => ({
            ...item,

            accuracy:
              item.total > 0
                ? Number(
                    (
                      (
                        item.correct /
                        item.total
                      ) *
                      100
                    ).toFixed(2)
                  )
                : 0,

            weak:
              item.total > 0 &&
              (
                (
                  item.correct /
                  item.total
                ) *
                100
              ) < 60,
          })
        )
        .sort(
          (a, b) =>
            a.accuracy -
            b.accuracy
        );

    // ==================================================
    // Calculate Difficulty Accuracy
    // ==================================================

    const difficulties =
      Object.values(
        difficultyStats
      )
        .map(
          (item) => ({
            ...item,

            accuracy:
              item.total > 0
                ? Number(
                    (
                      (
                        item.correct /
                        item.total
                      ) *
                      100
                    ).toFixed(2)
                  )
                : 0,

            weak:
              item.total > 0 &&
              (
                (
                  item.correct /
                  item.total
                ) *
                100
              ) < 60,
          })
        )
        .sort(
          (a, b) =>
            a.accuracy -
            b.accuracy
        );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({

      success: true,

      data: {

        weakestSection,

        sections,

        questionTypes,

        difficulties,

      },

    });

  } catch (error) {

    console.error(
      "Get IELTS Weak Areas Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load IELTS weak areas.",

    });

  }
};
// ======================================================
// Get IELTS Performance Statistics
// Student
// ======================================================

exports.getPerformanceStatistics = async (
  req,
  res
) => {
  try {
    const {
      studentId,
    } = req.params;

    // ==================================================
    // Determine Student
    // ==================================================

    let targetStudentId =
      studentId;

    if (
      req.user.role ===
      "student"
    ) {
      targetStudentId =
        req.user._id;
    }

    // ==================================================
    // Get Submitted / Evaluated Attempts
    // ==================================================

    const attempts =
      await IELTSTestAttempt.find({
        student:
          targetStudentId,

        status: {
          $in: [
            "Submitted",
            "Evaluated",
          ],
        },
      }).sort({
        submittedAt: 1,
      });

    // ==================================================
    // No Attempts
    // ==================================================

    if (
      attempts.length === 0
    ) {
      return res.status(200).json({
        success: true,

        data: {
          totalAttempts: 0,

          completedAttempts: 0,

          score: {
            average: null,
            highest: null,
            lowest: null,
          },

          percentage: {
            average: null,
            highest: null,
            lowest: null,
          },

          overallBand: {
            average: null,
            highest: null,
            lowest: null,
          },

          answers: {
            correct: 0,
            incorrect: 0,
            unanswered: 0,
          },
        },
      });
    }

    // ==================================================
    // Helper
    // ==================================================

    const getValidNumbers = (
      values
    ) => {
      return values
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            !Number.isNaN(
              Number(value)
            )
        )
        .map(Number);
    };

    // ==================================================
    // Scores
    // ==================================================

    const scores =
      getValidNumbers(
        attempts.map(
          (attempt) =>
            attempt.score
        )
      );

    // ==================================================
    // Percentages
    // ==================================================

    const percentages =
      getValidNumbers(
        attempts.map(
          (attempt) =>
            attempt.percentage
        )
      );

    // ==================================================
    // Overall Bands
    // ==================================================

    const overallBands =
      getValidNumbers(
        attempts.map(
          (attempt) =>
            attempt.overallBand ??
            attempt.readingBand ??
            attempt.listeningBand ??
            attempt.writingBand ??
            attempt.speakingBand ??
            (attempt.totalMarks > 0
              ? Number(((attempt.score / attempt.totalMarks) * 9).toFixed(1))
              : (attempt.score > 0 ? Number(((attempt.score / 40) * 9).toFixed(1)) : null))
        )
      );

    // ==================================================
    // Average Helper
    // ==================================================

    const getAverage = (
      values
    ) => {
      if (
        values.length === 0
      ) {
        return null;
      }

      const total =
        values.reduce(
          (
            sum,
            value
          ) =>
            sum + value,
          0
        );

      return Number(
        (
          total /
          values.length
        ).toFixed(2)
      );
    };

    // ==================================================
    // Score Statistics
    // ==================================================

    const averageScore =
      getAverage(scores);

    const highestScore =
      scores.length > 0
        ? Math.max(...scores)
        : null;

    const lowestScore =
      scores.length > 0
        ? Math.min(...scores)
        : null;

    // ==================================================
    // Percentage Statistics
    // ==================================================

    const averagePercentage =
      getAverage(
        percentages
      );

    const highestPercentage =
      percentages.length > 0
        ? Math.max(
            ...percentages
          )
        : null;

    const lowestPercentage =
      percentages.length > 0
        ? Math.min(
            ...percentages
          )
        : null;

    // ==================================================
    // Overall Band Statistics
    // ==================================================

    const averageOverallBand =
      getAverage(
        overallBands
      );

    const highestOverallBand =
      overallBands.length > 0
        ? Math.max(
            ...overallBands
          )
        : null;

    const lowestOverallBand =
      overallBands.length > 0
        ? Math.min(
            ...overallBands
          )
        : null;

    // ==================================================
    // Answer Statistics
    // ==================================================

    const totalCorrect =
      attempts.reduce(
        (
          total,
          attempt
        ) =>
          total +
          Number(
            attempt.correctAnswers ||
              0
          ),
        0
      );

    const totalIncorrect =
      attempts.reduce(
        (
          total,
          attempt
        ) =>
          total +
          Number(
            attempt.incorrectAnswers ||
              0
          ),
        0
      );

    const totalUnanswered =
      attempts.reduce(
        (
          total,
          attempt
        ) =>
          total +
          Number(
            attempt.unanswered ||
              0
          ),
        0
      );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      data: {
        // ==============================================
        // Attempts
        // ==============================================

        totalAttempts:
          attempts.length,

        completedAttempts:
          attempts.length,

        // ==============================================
        // Score
        // ==============================================

        score: {
          average:
            averageScore,

          highest:
            highestScore,

          lowest:
            lowestScore,
        },

        // ==============================================
        // Percentage
        // ==============================================

        percentage: {
          average:
            averagePercentage,

          highest:
            highestPercentage,

          lowest:
            lowestPercentage,
        },

        // ==============================================
        // Overall Band
        // ==============================================

        overallBand: {
          average:
            averageOverallBand,

          highest:
            highestOverallBand,

          lowest:
            lowestOverallBand,
        },

        // ==============================================
        // Answers
        // ==============================================

        answers: {
          correct:
            totalCorrect,

          incorrect:
            totalIncorrect,

          unanswered:
            totalUnanswered,
        },
      },
    });

  } catch (error) {
    console.error(
      "Get IELTS Performance Statistics Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load IELTS performance statistics.",
    });
  }
};
