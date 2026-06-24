import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileCode, 
  ChevronRight, 
  Copy, 
  HelpCircle, 
  RefreshCw, 
  Code,
  GraduationCap,
  Award,
  BookMarked
} from "lucide-react";
import { LEAN_CHALLENGES, TACTIC_GUIDE } from "./challenges";
import { TheoremChallenge, VerificationResult, NextStepSuggestion } from "./types";

export default function App() {
  // Challenges & Editor state
  const [challenges, setChallenges] = useState<TheoremChallenge[]>(LEAN_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<TheoremChallenge>(LEAN_CHALLENGES[0]);
  const [code, setCode] = useState<string>(LEAN_CHALLENGES[0].starterCode);
  const [selectedLine, setSelectedLine] = useState<number>(1);
  
  // Tabs & Panels
  const [rightPanelTab, setRightPanelTab] = useState<"infoview" | "cheat_sheet" | "tutor_chat">("infoview");
  
  // API interaction states
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<NextStepSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userSuccessCount, setUserSuccessCount] = useState<number>(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Trigger verification on initial load of active challenge
  useEffect(() => {
    handleVerify(LEAN_CHALLENGES[0].starterCode);
  }, []);

  // Set code when challenge changes
  const handleSelectChallenge = (challenge: TheoremChallenge) => {
    setActiveChallenge(challenge);
    setCode(challenge.starterCode);
    setSelectedLine(1);
    setVerificationResult(null);
    setSuggestion(null);
    setSuccessMessage(null);
    handleVerify(challenge.starterCode);
  };

  // Helper to retrieve line count
  const lines = code.split("\n");

  // Calculate cursor line number on click or keyup
  const handleEditorSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selectionStart = textarea.selectionStart;
    const textUpToCursor = textarea.value.substring(0, selectionStart);
    const lineNumber = textUpToCursor.split("\n").length;
    setSelectedLine(lineNumber);
  };

  // Call /api/verify to verify the proof
  const handleVerify = async (codeToVerify: string) => {
    setIsVerifying(true);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToVerify }),
      });
      if (!response.ok) {
        throw new Error("Verification failed on the server.");
      }
      const data: VerificationResult = await response.json();
      setVerificationResult(data);

      if (data.success) {
        setSuccessMessage("Congratulations! Your proof is 100% complete and mathematically sound! 🎉");
        if (!completedChallenges.includes(activeChallenge.id)) {
          setCompletedChallenges(prev => [...prev, activeChallenge.id]);
          setUserSuccessCount(prev => prev + 1);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Call /api/suggest-step for next-step suggestions
  const handleSuggestStep = async () => {
    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const response = await fetch("/api/suggest-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, currentLine: selectedLine }),
      });
      if (!response.ok) {
        throw new Error("Failed to retrieve suggestion.");
      }
      const data: NextStepSuggestion = await response.json();
      setSuggestion(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Apply the suggested code step
  const handleApplySuggestion = () => {
    if (!suggestion) return;
    
    // Split code into lines
    const codeLines = [...lines];
    // Insert suggestion at current line (or append it as a new line below current)
    const index = selectedLine - 1;
    
    // Check if the current line is blank or just comments, we can replace it. Otherwise, insert it.
    if (codeLines[index].trim() === "" || codeLines[index].trim().startsWith("--")) {
      codeLines[index] = "  " + suggestion.suggestion;
    } else {
      codeLines.splice(selectedLine, 0, "  " + suggestion.suggestion);
    }

    const newCode = codeLines.join("\n");
    setCode(newCode);
    setSuggestion(null);
    
    // Re-verify after inserting
    handleVerify(newCode);
    // Move selected line to the newly inserted step
    setSelectedLine(selectedLine + 1);
  };

  // Reveal pre-defined solution
  const handleRevealSolution = () => {
    setCode(activeChallenge.solutionCode);
    handleVerify(activeChallenge.solutionCode);
    setSuccessMessage("Loaded the standard solution block. Explore the proof steps below!");
  };

  // Call /api/generate to build a custom Lean 4 theorem from plain English
  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    setSuggestion(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate code.");
      }
      const data = await response.json();
      if (data.success && data.code) {
        // Build a temporary custom challenge object to load
        const customChallenge: TheoremChallenge = {
          id: `custom_${Date.now()}`,
          title: data.theoremName || "Custom Generated Theorem",
          category: "AI Generated",
          difficulty: "Intermediate",
          description: data.explanation || "A custom theorem generated by Gemini based on your prompt.",
          starterCode: data.code,
          solutionCode: data.code,
          tacticsTip: `Uses: ${data.tacticsUsed?.join(", ") || "various tactics"}.`
        };
        
        setActiveChallenge(customChallenge);
        setCode(data.code);
        setSelectedLine(1);
        setCustomPrompt("");
        handleVerify(data.code);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Find active proof state for the selected line
  const activeState = verificationResult?.proofStates?.find(ps => ps.line === selectedLine);
  
  // Find compile-time errors at the selected line
  const selectedLineError = verificationResult?.errors?.find(e => e.line === selectedLine);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200" id="app_root">
      {/* Upper Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between" id="app_header">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold flex items-center justify-center">
            <span className="font-mono text-xl">⊢</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Lean 4 Proof Companion
              <span className="text-xs bg-slate-800 text-indigo-400 border border-slate-700 px-2 py-0.5 rounded-full font-normal">
                v4.0 Simulator
              </span>
            </h1>
            <p className="text-xs text-slate-400">Interactive theorem prover & logic tutor powered by Gemini</p>
          </div>
        </div>

        {/* User statistics counter */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Level Progress</span>
              <span className="text-slate-200 font-medium">{completedChallenges.length} / {challenges.length} Solved</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs">
            <Award className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Achievements</span>
              <span className="text-slate-200 font-medium">Logic Practitioner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden" id="workspace_container">
        
        {/* Sidebar Panel: Challenges & AI Prompt Creator */}
        <aside className="w-full md:w-80 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0" id="sidebar_panel">
          
          {/* Section 1: Pre-loaded Challenges List */}
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
              <BookMarked className="w-4 h-4 text-indigo-400" />
              Theorem Challenges
            </h2>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {challenges.map((challenge) => {
                const isCompleted = completedChallenges.includes(challenge.id);
                const isActive = activeChallenge.id === challenge.id;
                
                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleSelectChallenge(challenge)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 ${
                      isActive 
                        ? "bg-indigo-600/10 border-indigo-500/50 text-white" 
                        : "bg-slate-900/50 border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-sm truncate pr-1">{challenge.title}</span>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{challenge.category}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        challenge.difficulty === "Beginner" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : challenge.difficulty === "Intermediate"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Active Challenge Card Instructions */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/20 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Challenge Goals</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 mb-3">
              {activeChallenge.description}
            </p>
            
            {activeChallenge.tacticsTip && (
              <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-lg text-xs">
                <span className="font-semibold text-indigo-400 flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Proof Strategy Tip:
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{activeChallenge.tacticsTip}</p>
              </div>
            )}
          </div>

          {/* Section 3: AI Custom Theorem Generator Form */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Custom Theorem Builder
              </h3>
            </div>
            
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Prove that A ∧ B → B ∨ A"
              className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 resize-none h-16 mb-2"
            />
            
            <button
              onClick={handleGenerateCustom}
              disabled={isGenerating || !customPrompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-550 transition-colors py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Proof...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate with Gemini
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Central Panel: The Interactive Code Editor */}
        <main className="flex-1 flex flex-col bg-slate-900" id="editor_panel">
          
          {/* Editor Action Bar Controls */}
          <div className="border-b border-slate-800 bg-slate-900 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-indigo-300">
                {activeChallenge.title}.lean
              </span>
              <span className="text-xs text-slate-400">
                Active Line: <strong className="text-slate-200 font-mono">Line {selectedLine}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Proof status bubble */}
              {isVerifying ? (
                <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-850 px-2 py-1 rounded">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Checking Proof...
                </span>
              ) : verificationResult?.success ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Proof Complete
                </span>
              ) : verificationResult?.errors && verificationResult.errors.length > 0 ? (
                <span className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded font-semibold">
                  <XCircle className="w-3 h-3" />
                  Compile Error
                </span>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-850 px-2 py-1 rounded">
                  <Code className="w-3 h-3" />
                  Editing
                </span>
              )}
            </div>
          </div>

          {/* Interactive Gutter + Textarea Code Editor */}
          <div className="flex-1 flex relative overflow-hidden bg-slate-950 font-mono text-sm leading-relaxed">
            
            {/* Gutter with line numbers */}
            <div className="w-12 bg-slate-950 border-r border-slate-850/80 py-4 flex flex-col text-right pr-3 select-none text-slate-600">
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const isSelected = selectedLine === lineNum;
                const hasError = verificationResult?.errors?.some(e => e.line === lineNum);
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedLine(lineNum)}
                    className={`text-xs block h-6 focus:outline-none transition-colors ${
                      isSelected 
                        ? "text-indigo-400 font-bold" 
                        : hasError 
                        ? "text-rose-500 hover:text-rose-400" 
                        : "hover:text-slate-400"
                    }`}
                  >
                    {lineNum}
                  </button>
                );
              })}
            </div>

            {/* Custom Background highlights for selected lines */}
            <div className="absolute inset-0 left-12 pointer-events-none select-none py-4">
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const isSelected = selectedLine === lineNum;
                const hasError = verificationResult?.errors?.some(e => e.line === lineNum);
                
                return (
                  <div
                    key={i}
                    className={`h-6 w-full ${
                      isSelected 
                        ? "bg-indigo-500/5 border-l-2 border-indigo-500" 
                        : hasError 
                        ? "bg-rose-500/5" 
                        : ""
                    }`}
                  />
                );
              })}
            </div>

            {/* Actual code input textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                // Also update the selected line if count changes
                handleEditorSelectionChange(e);
              }}
              onSelect={handleEditorSelectionChange}
              onKeyUp={handleEditorSelectionChange}
              onClick={handleEditorSelectionChange}
              spellCheck="false"
              className="flex-1 bg-transparent text-slate-100 p-4 focus:outline-none resize-none font-mono text-xs md:text-sm h-full leading-6 z-10 lean-editor"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Quick AI Suggestion Overlay Drawer */}
          <AnimatePresence>
            {suggestion && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-slate-950 border-t border-indigo-500/20 p-4 font-sans text-xs md:text-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                    <Sparkles className="w-4 h-4" />
                    AI Proof Assistant Suggestion
                  </div>
                  <div className="mb-2">
                    <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Tactic Code</span>
                    <code className="font-mono bg-indigo-950 border border-indigo-800/40 px-2 py-1 rounded text-indigo-300 font-semibold">
                      {suggestion.suggestion}
                    </code>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {suggestion.explanation}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSuggestion(null)}
                    className="border border-slate-800 bg-slate-900 hover:bg-slate-850 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleApplySuggestion}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-900/20 cursor-pointer"
                  >
                    Insert Suggestion
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor bottom bar controls */}
          <div className="border-t border-slate-800 bg-slate-950 px-4 py-3.5 flex flex-wrap gap-2.5 items-center justify-between" id="editor_footer">
            <div className="flex gap-2">
              <button
                onClick={() => handleVerify(code)}
                disabled={isVerifying}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 transition-all text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-900/10 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Verifying Proof...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-indigo-200 fill-indigo-200" />
                    Verify Proof (by)
                  </>
                )}
              </button>

              <button
                onClick={handleSuggestStep}
                disabled={isSuggesting}
                className="bg-slate-905 border border-slate-800 hover:bg-slate-900 disabled:text-slate-500 disabled:border-slate-850 transition-all text-indigo-400 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isSuggesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Ask Tutor for Next Step
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRevealSolution}
                className="text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Reveal Solution
              </button>
              
              <button
                onClick={() => {
                  setCode(activeChallenge.starterCode);
                  setVerificationResult(null);
                  setSuggestion(null);
                  setSuccessMessage(null);
                  handleVerify(activeChallenge.starterCode);
                }}
                className="text-slate-400 hover:text-rose-400 border border-slate-800 hover:bg-slate-900 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Starter
              </button>
            </div>
          </div>
        </main>

        {/* Right Panel: Lean 4 Interactive Infoview (Goal Visualizer) / Tactic Cheat Sheet */}
        <section className="w-full md:w-96 border-l border-slate-800 bg-slate-950 flex flex-col shrink-0" id="right_panel">
          
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800 bg-slate-950">
            <button
              onClick={() => setRightPanelTab("infoview")}
              className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                rightPanelTab === "infoview" 
                  ? "border-indigo-500 text-white bg-slate-900/40" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Lean Infoview
            </button>
            <button
              onClick={() => setRightPanelTab("cheat_sheet")}
              className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                rightPanelTab === "cheat_sheet" 
                  ? "border-indigo-500 text-white bg-slate-900/40" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Tactic Guide
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col" id="right_panel_content">
            
            <AnimatePresence mode="wait">
              {rightPanelTab === "infoview" && (
                <motion.div
                  key="infoview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 flex flex-col gap-4"
                >
                  
                  {/* Proof Successful Notification Banner */}
                  {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3.5 text-xs text-emerald-300">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Proof Accomplished!
                      </div>
                      <p className="leading-relaxed">{successMessage}</p>
                    </div>
                  )}

                  {/* Active Selected Line Compile Error alerts */}
                  {selectedLineError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3.5 text-xs text-rose-300">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        Compiler Error at Line {selectedLine}
                      </div>
                      <p className="font-mono text-[11px] leading-relaxed p-1.5 bg-rose-950/20 rounded border border-rose-900/30 mt-1">
                        {selectedLineError.message}
                      </p>
                    </div>
                  )}

                  {/* Complete Proof Compilation Errors List */}
                  {verificationResult && verificationResult.errors && verificationResult.errors.length > 0 && !selectedLineError && (
                    <div className="bg-rose-500/5 border border-rose-900/20 rounded-lg p-3 text-xs">
                      <span className="font-semibold text-rose-400 block mb-1">Outstanding Compilation Errors:</span>
                      <div className="space-y-1">
                        {verificationResult.errors.map((err, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedLine(err.line)}
                            className="w-full text-left font-mono text-[10px] text-slate-400 hover:text-rose-300 block py-1 border-b border-slate-900/40 last:border-0"
                          >
                            Line {err.line}: {err.message}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Simulated Lean 4 State Infoview Screen */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg flex-1 flex flex-col overflow-hidden">
                    <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-850 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        Tactic Goal State
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Line {selectedLine} of {lines.length}
                      </span>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                      {isVerifying ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                          <span className="text-xs text-slate-400">Querying Lean Type Checker...</span>
                        </div>
                      ) : activeState ? (
                        <div className="space-y-4">
                          
                          {/* 1. Goals BEFORE executing the active line */}
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                              Goal state before line {selectedLine}:
                            </span>
                            <div className="font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5">
                              {activeState.goalsBefore && activeState.goalsBefore.length > 0 ? (
                                activeState.goalsBefore.map((g, idx) => {
                                  // Style hypotheses versus goals
                                  const isGoal = g.includes("⊢");
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`whitespace-pre-wrap leading-relaxed py-0.5 ${
                                        isGoal ? "text-indigo-300 border-t border-slate-800 pt-1.5 mt-1.5 font-semibold" : "text-emerald-400"
                                      }`}
                                    >
                                      {g}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Goals solved! 🎉
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 2. Goals AFTER executing the active line */}
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                              Goal state after line {selectedLine}:
                            </span>
                            <div className="font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5">
                              {activeState.goalsAfter && activeState.goalsAfter.length > 0 ? (
                                activeState.goalsAfter.map((g, idx) => {
                                  const isGoal = g.includes("⊢");
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`whitespace-pre-wrap leading-relaxed py-0.5 ${
                                        isGoal ? "text-indigo-300 border-t border-slate-800 pt-1.5 mt-1.5 font-semibold" : "text-emerald-400"
                                      }`}
                                    >
                                      {g}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Goals accomplished! 🎉
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 3. Tactic explanation card */}
                          {activeState.explanation && (
                            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3 text-xs leading-relaxed text-indigo-200">
                              <span className="font-bold block text-indigo-400 mb-1">
                                {activeState.activeTactic ? `Tactic: ${activeState.activeTactic}` : "Tactic Explanation"}
                              </span>
                              {activeState.explanation}
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                          <Code className="w-8 h-8 text-slate-700 mb-2.5" />
                          <p className="text-xs max-w-xs leading-relaxed">
                            {verificationResult 
                              ? "Selected line is outside the active 'by' proof block. Select a line containing tactics to display active goal states."
                              : "Click 'Verify Proof' to inspect syntax, test completeness, and generate the interactive proof states."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary of logic strategy */}
                  {verificationResult?.overallSummary && (
                    <div className="bg-slate-900/50 border border-slate-850 p-3.5 rounded-lg text-xs leading-relaxed">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        AI Logic Tutor Summary:
                      </span>
                      <p className="text-slate-400">{verificationResult.overallSummary}</p>
                    </div>
                  )}

                </motion.div>
              )}

              {rightPanelTab === "cheat_sheet" && (
                <motion.div
                  key="cheat_sheet"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-xs mb-4">
                    <p className="text-slate-300 leading-relaxed">
                      Lean 4 proofs generally follow an interactive block style initiated with the <strong className="text-indigo-400 font-mono">by</strong> keyword. Explore definitions for basic tactics:
                    </p>
                  </div>

                  {TACTIC_GUIDE.map((t, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-indigo-400 font-bold bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">
                          {t.name}
                        </code>
                        <span className="text-[10px] font-mono text-slate-500">{t.syntax}</span>
                      </div>
                      
                      <p className="text-slate-300 text-[11px] leading-relaxed">{t.description}</p>
                      
                      <div className="bg-slate-950 p-2 rounded text-[11px] font-mono border border-slate-850 text-slate-400">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-600 block mb-1">Example</span>
                        <div className="text-slate-300">{t.example}</div>
                        <p className="text-[10px] text-slate-400 mt-1 font-sans leading-relaxed">{t.explanation}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

      </div>
    </div>
  );
}
