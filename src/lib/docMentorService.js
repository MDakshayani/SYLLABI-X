// Service for DocMentor (AI PDF Tutor)
// Dynamic PDF parsing using pdf.js and local RAG retrieval

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const getApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || '';
};

// Simple list of stop words to filter search tokens in local RAG
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'of', 'and', 'a', 'to', 'in', 'for', 'it', 'or', 'as', 'an', 'by', 'with', 'about',
  'from', 'this', 'that', 'these', 'those', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'but', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'who', 'whom', 'can', 'could', 'will', 'would', 'shall', 'should',
  'not', 'no', 'only', 'other', 'some', 'such', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should', 'now'
]);

/**
 * Dynamically loads pdf.js from CDN if not already loaded.
 */
export const loadPdfJS = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      reject(new Error("Failed to load PDF.js script from CDN: " + err.message));
    };
    document.head.appendChild(script);
  });
};

/**
 * Extracts raw text page by page from PDF ArrayBuffer
 */
export const extractTextFromPdf = async (arrayBuffer, onProgress) => {
  const pdfjs = await loadPdfJS();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts = [];
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageItems = textContent.items;
    
    // Join text strings on page
    const pageText = pageItems.map(item => item.str).join(" ");
    pageTexts.push({ pageNum: i, text: pageText });
    fullText += pageText + "\n";
    
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }

  // Calculate word count
  const wordCount = fullText.trim().split(/\s+/).filter(w => w.length > 0).length;

  // Create semantic chunks for RAG
  const chunks = [];
  pageTexts.forEach(pt => {
    const text = pt.text.trim();
    if (!text) return;

    // Segment page text if it exceeds 1600 characters to keep context clean
    if (text.length > 1600) {
      let start = 0;
      while (start < text.length) {
        const end = start + 1600;
        const chunkText = text.substring(start, end);
        chunks.push({
          pageNum: pt.pageNum,
          text: chunkText
        });
        start += 1200; // 400 overlap
      }
    } else {
      chunks.push({
        pageNum: pt.pageNum,
        text: text
      });
    }
  });

  return {
    numPages,
    wordCount,
    fullText,
    chunks,
    firstSnippet: fullText.substring(0, 8000)
  };
};

/**
 * Local TF-IDF keyword semantic search over extracted document chunks.
 */
export const retrieveContext = (query, chunks, topN = 8) => {
  const queryTokens = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));

  if (queryTokens.length === 0) {
    // If no search tokens (e.g. stop words), return first few chunks
    return chunks.slice(0, topN);
  }

  const scored = chunks.map(chunk => {
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;

    queryTokens.forEach(token => {
      // Find term matches in chunk
      const regex = new RegExp('\\b' + token + '\\b', 'g');
      const matches = chunkLower.match(regex);
      if (matches) {
        score += matches.length * (token.length > 4 ? 2 : 1);
      }
    });

    return { chunk, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Filter chunks with score > 0, fallback to first N chunks if no matches
  const matched = scored.filter(s => s.score > 0).map(s => s.chunk);
  if (matched.length === 0) {
    return chunks.slice(0, topN);
  }

  return matched.slice(0, topN);
};

/**
 * Analyzes document snippet via Groq to identify topics and structure
 */
export const getDocumentInsights = async (textSnippet) => {
  try {
    const apiKey = getApiKey();
    const prompt = `Analyze the following academic document notes text excerpt and extract:
1. 4-6 key technical topics or themes covered (e.g., ["Smart Contracts", "Ethereum", "Cryptography"]). Avoid generic terms like "Introduction" or "Section".
2. A high-level list of major headings, chapters, or sections (up to 8) to construct the structure outline of the document.

Text snippet:
${textSnippet}

Return a single JSON object strictly matching this format:
{
  "topics": ["string"],
  "structure": ["string"]
}
Ensure no markdown code wraps or conversational prefixes. Return only the JSON object.`;

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional academic document analyzer that outputs JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!res.ok) throw new Error("Insights API call failed");
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  } catch (err) {
    console.warn("Groq insights extraction failed, running local fallback parser:", err);
    // Local fallback heuristic parser
    const topics = ["Document Reading", "Study Notes", "Self Study Guide"];
    const structure = ["Introduction", "Overview", "Key Concepts", "Core Themes", "Summary"];
    return { topics, structure };
  }
};

/**
 * Chats with the DocMentor tutor based on retrieved context
 */
export const queryDocMentor = async (query, chunks, chatHistory = [], actionType = "") => {
  try {
    // Retrieve context chunks using RAG
    const relevantChunks = retrieveContext(query, chunks, 8);
    const contextStr = relevantChunks.map(c => `[Excerpt Page ${c.pageNum}]: ${c.text}`).join("\n\n");
    
    let systemPrompt = `You are DocMentor, a professional AI academic tutor. Your goal is to guide students and answer their questions based strictly and ONLY on the provided PDF document excerpts.
    
CRITICAL RULES:
1. Respond based ONLY on the provided PDF excerpts. Do not hallucinate or use external knowledge.
2. If the relevant information is NOT present in the provided excerpts, you MUST respond exactly with:
"This information is not available in the uploaded document."
Do not attempt to answer from external sources.
3. Whenever you formulate an answer from the document excerpts, you MUST explicitly cite the page numbers at the end of relevant statements (e.g., "[Page 3]").
4. Never display raw extracted PDF text verbatim. Always analyze, digest, and structure the content professionally before outputting.

Format your responses cleanly in markdown using the appropriate headings and structures below:

### For Summary requests / overview:
Structure the output exactly as follows:
## Overview
(Your overall overview summary here)
## Key Concepts
(Bullet list of key concepts)
## Important Points
(Bullet list of important points)
## Quick Revision Notes
(Concise takeaways/notes)

### For Explanation / Definition / What is / Why requests:
Structure the output exactly as follows:
## Definition
(Formal definition)
## Explanation
(Detailed conceptual breakdown)
## Example
(A concrete practical or illustrative example)
## Conclusion
(Concluding thoughts)

### For Short Answer Q&As:
Structure each short answer exactly as follows:
# SHORT ANSWER
## Direct Answer
(Direct and concise response)
## Supporting Points
(Key supporting points/evidence from the text)

### For Long Answer / Essay Q&As:
Structure each long answer exactly as follows:
# LONG ANSWER
## Introduction
(Introductory context)
## Main Explanation
(Deep conceptual explanation)
## Example
(Concrete application or code snippet example)
## Conclusion
(Concluding remarks)

### For Interview Questions:
Structure each interview question exactly as follows:
# INTERVIEW QUESTION
## Question
(The technical question description)
## Ideal Answer
(Highly professional ideal developer/coordinator response)
## Interview Tips
(Key tips, technical terms to mention, and potential gotchas)

### For MCQs / Quiz Questions:
Structure each MCQ exactly as follows:
# MULTIPLE CHOICE QUESTION
## Question
(The question description)
## Options
(The 4 options: A, B, C, D)
## Correct Answer
(E.g., Correct Answer: A)
## Explanation
(Detailed conceptual explanation of why the correct option is right and others are wrong)

Format all headings, tables, lists, and bold text properly using markdown format. Always check page citations.`;

    if (actionType) {
      systemPrompt += `\n\nSPECIAL REQUEST TYPE: ${actionType}. Adjust your output format accordingly:
- MCQ: Generate exactly 5 challenging multiple-choice questions. Format each question using the MULTIPLE CHOICE QUESTION structure defined above.
- Short Answers / Viva Questions / Important Questions: Generate exactly 5 questions. Format each using the SHORT ANSWER structure defined above.
- Long Answers: Generate exactly 3 questions. Format each using the LONG ANSWER structure defined above.
- Interview Questions: Generate exactly 5 questions. Format each using the INTERVIEW QUESTION structure defined above.
- Revision Notes / Summary: Format the response using the Summary structure defined above.`;
    }

    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Append last 6 turns of chat history for continuity
    chatHistory.slice(-6).forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Append active turn
    messages.push({
      role: "user",
      content: `Context Excerpts:\n${contextStr}\n\nUser Prompt: ${query}`
    });

    const apiKey = getApiKey();
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.2
      })
    });

    if (!res.ok) {
      throw new Error(`Groq API Error: ${res.statusText} (${res.status})`);
    }

    const data = await res.json();
    const tutorResponse = data.choices?.[0]?.message?.content;
    
    if (!tutorResponse) {
      return "This information is not available in the uploaded document.";
    }

    return tutorResponse;
  } catch (err) {
    console.error("DocMentor query failed:", err);
    return "Error communicating with Groq AI. Please check your network connection and API key settings.";
  }
};
