// Groq API integration service for Quiz Generation & Evaluation
// Model recommendation: llama-3.3-70b-versatile

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Retrieve API key from Vite environment
const getApiKey = (): string => {
  return import.meta.env.VITE_GROQ_API_KEY || '';
};

// Types definition for questions
export interface QuizQuestion {
  id: number;
  type: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  expectedKeywords: string[];
  expectedConcept: string;
  explanation: string;
  improvements: string;
}

export interface StudentAnswerSubmission {
  id: number;
  type: string;
  question: string;
  expectedKeywords: string[];
  expectedConcept: string;
  studentAns: any;
}

export interface EvaluationDetail {
  score: number;
  isCorrect: boolean;
  feedback: string;
  missing: string[];
  similarity?: number;
}

/**
 * Generates quiz questions from Groq API based on curriculum.
 */
export async function generateQuizFromGroq(
  curriculum: any,
  count: number,
  difficulty: string,
  types: string[],
  quizMode: string = "Practice Quiz",
  examStyle: boolean = false
): Promise<QuizQuestion[]> {
  try {
    if (!curriculum || !curriculum.semesters) return [];

    // Compile all topics from curriculum
    const allTopics: any[] = [];
    curriculum.semesters.forEach((sem: any) => {
      sem.units.forEach((unit: any) => {
        if (unit.topics && unit.topics.length > 0) {
          unit.topics.forEach((t: any) => {
            allTopics.push({
              topic: t,
              unitName: unit.name,
              semesterTheme: sem.theme,
              learningOutcomes: unit.learning_outcomes || [],
            });
          });
        } else {
          allTopics.push({
            topic: unit.name,
            unitName: unit.name,
            semesterTheme: sem.theme,
            learningOutcomes: unit.learning_outcomes || [],
          });
        }
      });
    });

    if (allTopics.length === 0) {
      allTopics.push({
        topic: "Core Foundations",
        unitName: "Introductory Concepts",
        semesterTheme: "Foundations",
        learningOutcomes: [],
      });
    }

    // Retrieve previous questions to avoid repetition
    const memoryKey = `groq_quiz_memory_${curriculum.id}`;
    let usedQuestions: string[] = [];
    try {
      const stored = localStorage.getItem(memoryKey);
      if (stored) {
        usedQuestions = JSON.parse(stored);
      }
    } catch (err) {
      console.warn("Could not read groq quiz memory:", err);
    }

    // Select subset of topics to send to Groq for generation context
    // We shuffle allTopics and pick up to 15 topics to keep prompt size reasonable
    const shuffledTopics = [...allTopics].sort(() => 0.5 - Math.random());
    const selectedTopics = shuffledTopics.slice(0, 15);

    const prompt = `You are a professional educational assessment engine. Your task is to generate exactly ${count} quiz questions based on the provided curriculum, course details, difficulty, types, and settings.

Curriculum Context:
- Course Name: ${curriculum.program_name}
- Skill Domain: ${curriculum.skill}
- Industry Focus: ${curriculum.industry_focus}
- Difficulty Level: ${difficulty}
- Assessment Mode: ${quizMode}
- Exam Style Enabled: ${examStyle} (If true, you MUST prefix the questions with exam styles like '[University Exam - Course Name]' or '[Professional Certification - Domain Architect]' or '[Technical Assessment - Placement Prep]')

Topics to cover in this quiz (selected from the syllabus):
${JSON.stringify(selectedTopics, null, 2)}

Allowed Question Types (select from these and distribute them evenly):
${JSON.stringify(types)}

Previously Generated Questions (DO NOT generate questions similar to these, avoid duplicate concepts/phrases):
${JSON.stringify(usedQuestions.slice(-20))}

Return a JSON object containing a "questions" key which is an array of exactly ${count} questions.
Each question object in the array MUST strictly match the following JSON structure:
{
  "id": number (sequential index from 1 to ${count}),
  "type": "string" (MUST be exactly one of: MCQ, True/False, Short Answer, Descriptive, Fill in the Blanks, Scenario Based, Application Based, Case Study, Interview Style),
  "topic": "string" (the syllabus topic this question covers),
  "question": "string" (the complete question prompt. Avoid generic software engineering templates. MCQ questions should resemble real-world exams like AWS/Cisco certifications, NPTEL or placement preps, with realistic distractors, avoiding obvious or silly choices),
  "options": ["string"] (For MCQ: exactly 4 choices starting with 'A. ', 'B. ', 'C. ', 'D. '. For True/False: exactly ["True", "False"]. For other types: exactly one element detailing expected answer rubric prefixing with expected guide like ["[Expected Guide]: ..."] or ["[Expected Word]: ..."] or ["[Expected Concept]: ..."] or ["[Expected Essay Concept]: ..."] or ["[Expected Snippet Guide]: ..."] or ["[Expected Case Study Rubric]: ..."] or ["[Expected Interview Guide]: ..."]),
  "correct": number (For MCQ: 0, 1, 2, or 3 representing the correct index. For True/False: 0 for True, 1 for False. For others: 0),
  "expectedKeywords": ["string"] (2-5 key technical terms expected in the answer),
  "expectedConcept": "string" (the ideal reference concept/answer matching the question),
  "explanation": "string" (a detailed educational explanation of why the correct option or concept is right),
  "improvements": "string" (personalized suggestions for improvement or study tips if a student fails this question)
}

Ensure high technical quality, zero templates, and realistic distractors.
Your response MUST be a single raw JSON object. Do not wrap in markdown or any text other than JSON.`;

    const apiKey = getApiKey();
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional educational assessment editor that outputs JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API Error: ${res.statusText} (${res.status})`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    const parsed = JSON.parse(content);
    const questions: QuizQuestion[] = parsed.questions || [];

    if (questions.length > 0) {
      // Store generated questions in memory to prevent future repetition
      const generatedTexts = questions.map((q) => q.question);
      const updatedMemory = [...usedQuestions, ...generatedTexts].slice(-50);
      try {
        localStorage.setItem(memoryKey, JSON.stringify(updatedMemory));
      } catch (err) {
        console.warn("Could not write to local storage memory:", err);
      }
    }

    return questions;
  } catch (error) {
    console.error("Error generating quiz from Groq:", error);
    // Return empty array to trigger fallback or propagation
    throw error;
  }
}

/**
 * Evaluates student answers using Groq API.
 */
export async function evaluateAnswersWithGroq(
  questionsWithAnswers: StudentAnswerSubmission[]
): Promise<Record<number, EvaluationDetail>> {
  try {
    const prompt = `You are a senior academic evaluator and technical grading assistant. Your task is to evaluate the student's responses to open-ended questions.

For each response, analyze the correctness, key concepts matched, missing critical topics, and provide constructive, detailed feedback.

Questions and Student Answers:
${JSON.stringify(questionsWithAnswers, null, 2)}

Return a JSON object with a single key "evaluations", which is an array of evaluation objects.
Each evaluation object in the array MUST strictly match the following structure:
{
  "questionId": number (corresponds to the ID of the evaluated question),
  "score": number (For Descriptive/Case Study/Interview Style: a grade between 0 and 10 based on depth, architecture, and correctness. For Short Answer/Scenario-Based: a grade of 0 or 1, or scaled appropriately),
  "isCorrect": boolean (true if score is >= 5 for Descriptive, or similarity is high enough; or true if the student answered the short question correctly),
  "similarity": number (For Short Answer: keyword overlap similarity as an integer percentage from 0 to 100. For others: 0),
  "feedback": "string" (constructive, detailed feedback explaining the score and what the student wrote),
  "missing": ["string"] (list of concepts/terms that were expected but missing from the student's response)
}

Your response MUST be a single raw JSON object. Do not wrap in markdown or any text other than JSON.`;

    const apiKey = getApiKey();
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert technical grading evaluator that outputs JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Low temperature for consistent grading
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq Evaluation API Error: ${res.statusText} (${res.status})`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq evaluation API");
    }

    const parsed = JSON.parse(content);
    const evaluationsList = parsed.evaluations || [];
    
    // Map list to a record keyed by question ID
    const evaluationsRecord: Record<number, EvaluationDetail> = {};
    evaluationsList.forEach((item: any) => {
      evaluationsRecord[item.questionId] = {
        score: item.score,
        isCorrect: item.isCorrect,
        feedback: item.feedback,
        missing: item.missing || [],
        similarity: item.similarity,
      };
    });

    return evaluationsRecord;
  } catch (error) {
    console.error("Error evaluating answers with Groq:", error);
    throw error;
  }
}
