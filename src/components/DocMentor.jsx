import { useState, useRef, useEffect } from 'react'
import { 
  Upload, FileText, AlertCircle, Send, Loader2, CheckCircle2 
} from 'lucide-react'
import { extractTextFromPdf, getDocumentInsights, queryDocMentor } from '../lib/docMentorService'

let msgIdCounter = 0;
const createMessage = (sender, text) => {
  msgIdCounter++;
  return {
    id: msgIdCounter,
    sender,
    text,
    timestamp: new Date()
  };
};

function MarkdownRenderer({ text }) {
  const parseMarkdown = (rawText) => {
    const lines = rawText.split('\n');
    const blocks = [];
    let currentBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Code Block
      if (trimmed.startsWith('```')) {
        if (currentBlock && currentBlock.type === 'code') {
          blocks.push(currentBlock);
          currentBlock = null;
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'code', content: [] };
        }
        continue;
      }

      if (currentBlock && currentBlock.type === 'code') {
        currentBlock.content.push(line);
        continue;
      }

      // Table Row
      if (trimmed.startsWith('|') && trimmed.includes('|')) {
        if (currentBlock && currentBlock.type === 'table') {
          currentBlock.rows.push(trimmed);
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'table', rows: [trimmed] };
        }
        continue;
      }

      // List Item (Unordered)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentBlock && currentBlock.type === 'list') {
          currentBlock.items.push(trimmed.slice(2));
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'list', items: [trimmed.slice(2)] };
        }
        continue;
      }

      // List Item (Ordered)
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);
        if (currentBlock && currentBlock.type === 'ordered-list') {
          currentBlock.items.push(match[2]);
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'ordered-list', items: [match[2]] };
        }
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const content = trimmed.startsWith('> ') ? trimmed.slice(2) : trimmed.slice(1);
        if (currentBlock && currentBlock.type === 'blockquote') {
          currentBlock.content.push(content);
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { type: 'blockquote', content: [content] };
        }
        continue;
      }

      // Empty Line
      if (trimmed === '') {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        continue;
      }

      // Headings
      if (trimmed.startsWith('#')) {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        const match = trimmed.match(/^(#{1,6})\s+(.*)/);
        if (match) {
          blocks.push({
            type: 'heading',
            level: match[1].length,
            text: match[2]
          });
          continue;
        }
      }

      // Paragraph lines group
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.text += ' ' + trimmed;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'paragraph', text: trimmed };
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks;
  };

  const renderInline = (inlineText) => {
    if (!inlineText) return '';
    const inlineRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[(?:Excerpt\s+)?Page\s+\d+(?:-\d+)?\])/g;
    const parts = [];
    let lastIndex = 0;
    const matches = [...inlineText.matchAll(inlineRegex)];

    if (matches.length === 0) {
      return inlineText;
    }

    matches.forEach((match, idx) => {
      const matchText = match[0];
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(inlineText.substring(lastIndex, matchIndex));
      }

      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong key={`b-${idx}`} className="font-black text-text-primary">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        parts.push(
          <code key={`c-${idx}`} className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono text-primary">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.startsWith('[') && matchText.endsWith(']')) {
        const pageMatch = matchText.match(/\d+(?:-\d+)?/);
        const pageNum = pageMatch ? pageMatch[0] : '';
        parts.push(
          <span key={`p-${idx}`} className="inline-flex items-center px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary font-bold rounded-full text-[9px] mx-1 leading-none uppercase select-none">
            Page {pageNum}
          </span>
        );
      }

      lastIndex = matchIndex + matchText.length;
    });

    if (lastIndex < inlineText.length) {
      parts.push(inlineText.substring(lastIndex));
    }

    return parts;
  };

  const blocks = parseMarkdown(text);

  return (
    <div className="space-y-4 max-w-none md:max-w-3xl leading-relaxed text-xs">
      {blocks.map((block, bIdx) => {
        switch (block.type) {
          case 'heading': {
            const level = block.level;
            const headingText = block.text;
            if (level === 1) {
              return <h1 key={bIdx} className="text-base font-black text-primary border-b border-border pb-1 mt-6 mb-3">{renderInline(headingText)}</h1>;
            } else if (level === 2) {
              return <h2 key={bIdx} className="text-sm font-black text-text-primary mt-5 mb-2">{renderInline(headingText)}</h2>;
            } else if (level === 3) {
              return <h3 key={bIdx} className="text-xs font-black text-text-primary mt-4 mb-2">{renderInline(headingText)}</h3>;
            } else {
              return <h4 key={bIdx} className="text-[11px] font-bold text-text-primary mt-3.5 mb-1.5">{renderInline(headingText)}</h4>;
            }
          }
          case 'paragraph': {
            return <p key={bIdx} className="mb-3.5 text-text-secondary leading-relaxed break-words">{renderInline(block.text)}</p>;
          }
          case 'list': {
            return (
              <ul key={bIdx} className="list-disc pl-5 mb-4 space-y-1.5 text-text-secondary">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          }
          case 'ordered-list': {
            return (
              <ol key={bIdx} className="list-decimal pl-5 mb-4 space-y-1.5 text-text-secondary">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          }
          case 'blockquote': {
            return (
              <blockquote key={bIdx} className="border-l-4 border-primary/40 pl-4 py-1.5 italic bg-background/50 text-text-secondary rounded-r-lg mb-4 font-medium">
                {block.content.map((line, iIdx) => (
                  <p key={iIdx}>{renderInline(line)}</p>
                ))}
              </blockquote>
            );
          }
          case 'code': {
            return (
              <pre key={bIdx} className="bg-background border border-border p-4 rounded-xl overflow-x-auto text-[11px] font-mono text-text-primary mb-4 leading-normal">
                <code>{block.content.join('\n')}</code>
              </pre>
            );
          }
          case 'table': {
            const headersRaw = block.rows[0];
            const rowsRaw = block.rows.slice(2); // Skip separator row
            const headers = headersRaw.split('|').map(s => s.trim()).filter(Boolean);
            const rows = rowsRaw.map(rowStr => rowStr.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));

            return (
              <div key={bIdx} className="overflow-x-auto border border-border rounded-xl mb-4 bg-background shadow-sm max-w-full">
                <table className="min-w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-primary/5 text-text-primary border-b border-border">
                      {headers.map((h, iIdx) => (
                        <th key={iIdx} className="p-3 font-extrabold uppercase tracking-wider">{renderInline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-primary/5 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-text-secondary font-medium">{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

export default function DocMentor() {
  const [file, setFile] = useState(null)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  // Document data states
  const [docMetadata, setDocMetadata] = useState(null)
  const [docChunks, setDocChunks] = useState([])
  const [insights, setInsights] = useState({ topics: [], structure: [] })
  
  // Chat States
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Handle PDF upload and extraction
  const handleFileUpload = async (uploadedFile) => {
    // 1. Verify uploaded PDF exists before processing
    if (!uploadedFile || typeof uploadedFile.size !== 'number' || !uploadedFile.name) {
      setError("Invalid file or empty document uploaded.")
      return
    }

    // 2. Validate supported format (PDF only)
    const isPDFType = uploadedFile.type === 'application/pdf'
    const isPDFExt = uploadedFile.name.toLowerCase().endsWith('.pdf')
    if (!isPDFType && !isPDFExt) {
      setError("Invalid PDF. Supported format is PDF only.")
      return
    }

    // 3. Validate size limits (50 MB)
    const maxBytes = 50 * 1024 * 1024
    if (uploadedFile.size > maxBytes) {
      setError("File too large. Maximum supported size is 50 MB.")
      return
    }

    setError(null)
    setIsProcessing(true)
    setParsingProgress(0)
    setDocChunks([])
    setDocMetadata(null)

    try {
      // 4. Wrap FileReader in a try/catch and Promise for reading
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            resolve(reader.result)
          } else {
            reject(new Error("File reading yielded empty result."))
          }
        }
        reader.onerror = () => reject(new Error("Corrupted PDF or file reading failed."))
        reader.readAsArrayBuffer(uploadedFile)
      })

      // 5. Wrap PDF parsing and text extraction in a nested try/catch for safety
      let extracted
      try {
        extracted = await extractTextFromPdf(arrayBuffer, (pct) => {
          setParsingProgress(pct)
        })
      } catch (parseErr) {
        console.error("PDF parsing/text extraction failed:", parseErr)
        throw new Error("Unable to process this PDF. Please upload another document. (PDF parsing failed)", { cause: parseErr })
      }

      // 6. Wrap chunk validation
      if (!extracted || !extracted.chunks || extracted.chunks.length === 0) {
        throw new Error("Unable to process this PDF. Please upload another document. (No text content found)")
      }

      // 7. Wrap AI processing (insights extraction) in try/catch to fallback gracefully
      let docInsights
      try {
        docInsights = await getDocumentInsights(extracted.firstSnippet)
      } catch (aiErr) {
        console.warn("DocMentor AI metadata processing failed, applying local fallback:", aiErr)
        docInsights = {
          topics: ["Study Guide", "Self Study Notes", "Reference Material"],
          structure: ["Chapter 1: Overview", "Chapter 2: Key Concepts", "Summary"]
        }
      }

      // 8. Assign all processed metadata and chunks first
      setDocChunks(extracted.chunks)
      setDocMetadata({
        name: uploadedFile.name,
        pages: extracted.numPages,
        words: extracted.wordCount
      })
      setInsights({
        topics: docInsights.topics || ["Study Document"],
        structure: docInsights.structure || ["Overview"]
      })

      setMessages([
        createMessage('assistant', `Welcome! I have successfully analyzed **${uploadedFile.name}**. I can tutor you on this document.\n\nHere are some things we can do:
- Use the quick buttons below to generate custom study sheets.
- Ask questions about specific pages or sections.
- Test your comprehension on core topics.\n\n*Note: All answers are strictly retrieved from this document.*`)
      ])

      // 9. ONLY set file state when everything has succeeded.
      // This prevents the workspace from rendering with null docMetadata!
      setFile(uploadedFile)
    } catch (err) {
      console.error("DocMentor processing crash caught:", err)
      
      // Determine friendly error message
      let friendlyError = "Unable to process this PDF. Please upload another document."
      if (err.message && err.message.includes("Corrupted")) {
        friendlyError = "Corrupted PDF. The file structure is invalid."
      } else if (err.message && err.message.includes("No text")) {
        friendlyError = "Invalid PDF. Unable to extract searchable text."
      } else if (err.message && err.message.includes("size")) {
        friendlyError = "File too large. Maximum supported size is 50 MB."
      }

      setError(friendlyError)
      setFile(null)
      setDocMetadata(null)
      setDocChunks([])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Submit Query to Groq Tutor
  const handleSendQuery = async (customQuery = "", actionType = "") => {
    const activeQuery = customQuery || query
    if (!activeQuery.trim() || !docChunks.length || chatLoading) return

    const newMsg = createMessage('user', activeQuery)

    setMessages(prev => [...prev, newMsg])
    if (!customQuery) setQuery('')
    setChatLoading(true)

    try {
      const response = await queryDocMentor(activeQuery, docChunks, messages, actionType)
      
      setMessages(prev => [...prev, createMessage('assistant', response)])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, createMessage('assistant', "Sorry, I encountered an error answering your question. Please try again.")])
    } finally {
      setChatLoading(false)
    }
  }

  // Handle pre-defined action buttons
  const triggerQuickAction = (actionLabel, queryPrompt, actionType) => {
    handleSendQuery(queryPrompt, actionType)
  }

  const handleReset = () => {
    setFile(null)
    setDocMetadata(null)
    setDocChunks([])
    setInsights({ topics: [], structure: [] })
    setMessages([])
    setQuery('')
    setError(null)
  }

  const quickActions = [
    { label: 'Generate MCQs', prompt: 'Generate 5 MCQs from the document', type: 'MCQ' },
    { label: 'Generate Short Answers', prompt: 'Generate 5 short-answer questions and solutions based on this text', type: 'Short Answers' },
    { label: 'Generate Long Answers', prompt: 'Generate 3 essay-style long-answer questions and reference rubrics from this text', type: 'Long Answers' },
    { label: 'Generate Viva Questions', prompt: 'Generate 5 oral exam/viva questions with accurate answer sheets', type: 'Viva Questions' },
    { label: 'Generate Interview Questions', prompt: 'Generate 5 placement interview questions with model answers from the text', type: 'Interview Questions' },
    { label: 'Generate Revision Notes', prompt: 'Create structured revision notes with summaries, lists, and key formulas from the text', type: 'Revision Notes' },
    { label: 'Generate Summary', prompt: 'Provide a structured overall summary of the document core lessons', type: 'Summary' },
    { label: 'Generate Important Questions', prompt: 'List 5 highly important exam questions and answer tips from the content', type: 'Important Questions' }
  ]

  const sampleQuestions = [
    "Summarize the main points of this document.",
    "What are the most difficult concepts explained here?",
    "Explain the headings in the first chapter.",
    "Give me key terms from this notes paper."
  ]

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-primary flex items-center gap-2">
            <span>DocMentor</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-black uppercase">AI PDF Tutor</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Upload study documents, textbooks or notes. Query tutor and build custom practice exams.</p>
        </div>
        {file && (
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-background border border-border hover:border-red-500/20 hover:text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Upload New File
          </button>
        )}
      </div>

      {!file ? (
        // Drop-zone Upload Interface
        <div className="flex-1 flex flex-col items-center justify-center">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xl bg-card border-2 border-dashed border-border hover:border-primary/45 rounded-3xl p-8 py-16 text-center shadow-md cursor-pointer transition-all hover:scale-[1.005] group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="animate-spin text-primary mx-auto" size={42} />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-text-primary">Processing PDF...</p>
                  <p className="text-xs text-text-secondary font-medium">Extracting PDF text: {parsingProgress}%</p>
                </div>
                <div className="w-48 bg-background rounded-full h-1.5 overflow-hidden border border-border mx-auto">
                  <div className="bg-primary h-full transition-all duration-150" style={{ width: `${parsingProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-105 transition-all">
                  <Upload size={30} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-text-primary">Drag and drop your study PDF here</p>
                  <p className="text-xs text-text-secondary font-medium">or click to browse your local device</p>
                </div>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider pt-2">Max Size: 50MB · Formats: PDF only</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex flex-col items-center gap-2 bg-rose-500/15 text-rose-500 border border-rose-500/20 px-5 py-3 rounded-xl text-xs font-semibold max-w-xl text-center">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-1 font-normal">
                Unable to process this PDF. Please upload another document.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Active Tutor Split Workspace
        <div className="flex-1 grid md:grid-cols-[30fr_70fr] gap-6 min-h-0">
          
          {/* Left Panel: PDF Insights */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm overflow-y-auto flex flex-col gap-5 text-xs text-text-secondary h-full">
            <div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">Document Metadata</span>
              <div className="mt-3 flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-text-primary truncate" title={docMetadata.name}>{docMetadata.name}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">{docMetadata.pages} pages · {docMetadata.words.toLocaleString()} words</p>
                </div>
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Identified Topics List */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Identified Core Topics</h3>
              <div className="space-y-1.5 pt-1">
                {insights.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 text-[11px] font-semibold text-text-primary">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))}
                {insights.topics.length === 0 && (
                  <p className="text-[10px] text-text-secondary italic">Extracting topics snippet...</p>
                )}
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Structural Headings Outline */}
            <div className="space-y-2 flex-1">
              <h3 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Document Outline</h3>
              <div className="space-y-2.5 pt-2 border-l border-border/70 pl-3.5 ml-1">
                {insights.structure.map((heading, index) => (
                  <div key={index} className="relative text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors">
                    <div className="absolute -left-[18.5px] top-[3.5px] w-2 h-2 rounded-full bg-background border border-border" />
                    <span>{heading}</span>
                  </div>
                ))}
                {insights.structure.length === 0 && (
                  <p className="text-[10px] text-text-secondary italic">Analyzing layout outline...</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Chat Workspace */}
          <div className="bg-card border border-border rounded-3xl shadow-sm flex flex-col h-full overflow-hidden">
            
            {/* Scrollable chat messages area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed text-left ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white font-medium shadow-sm'
                      : 'bg-background border border-border text-text-primary'
                  }`}>
                    {msg.sender === 'assistant' ? (
                      <MarkdownRenderer text={msg.text} />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    <span className={`block text-[9px] mt-2 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-text-secondary'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-2xl p-4 flex items-center gap-2 text-xs text-text-secondary">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span>DocMentor is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions Panel */}
            <div className="border-t border-border px-5 py-3.5 bg-background/45 flex flex-wrap gap-2 shrink-0 max-h-[140px] overflow-y-auto">
              {quickActions.map((act) => (
                <button
                  key={act.label}
                  onClick={() => triggerQuickAction(act.label, act.prompt, act.type)}
                  disabled={chatLoading}
                  className="px-3 py-1.5 bg-card border border-border hover:border-primary/30 text-[10px] text-text-primary font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {act.label}
                </button>
              ))}
            </div>

            {/* Suggested prompt chips */}
            {messages.length <= 1 && !chatLoading && (
              <div className="px-5 py-2.5 border-t border-border bg-background/20 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
                {sampleQuestions.map((qText) => (
                  <button
                    key={qText}
                    onClick={() => handleSendQuery(qText)}
                    className="px-3 py-1 bg-background border border-border rounded-full text-[10px] text-text-secondary hover:text-primary hover:border-primary/25 transition-colors cursor-pointer"
                  >
                    {qText}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
              className="border-t border-border p-4 bg-card flex gap-2.5 items-center shrink-0"
            >
              <input 
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={chatLoading}
                placeholder="Ask DocMentor a question about the PDF contents..."
                className="flex-1 px-4 py-3 border border-border bg-background text-text-primary text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !query.trim()}
                className="px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  )
}
