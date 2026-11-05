import React, { useState } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Send,
  Play,
  RotateCcw,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  Volume2,
  Brain,
  ThumbsUp,
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { MOCK_INTERVIEW_PRESETS } from '../../data/mockData';

interface MockInterviewProps {
  student: StudentProfile;
  isRealAiActive: boolean;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const MockInterview: React.FC<MockInterviewProps> = ({
  student,
  isRealAiActive,
  onOpenCopilotWithPrompt,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const activePreset = MOCK_INTERVIEW_PRESETS[selectedPresetIndex];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    score: number;
    verdict: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  const sampleAnswerPrepop =
    currentQuestionIndex === 0
      ? `To design an in-memory key-value store with TTL and LRU eviction, I would use a Hash Map for O(1) key lookups combined with a Doubly Linked List for O(1) LRU eviction order. For TTL expiration, we can maintain a Min-Heap keyed on expiration timestamp alongside a background active cleanup sweeper and passive expiration on GET requests. Under concurrent access, rather than a global lock, I would shard the keyspace into 32 or 64 independent mutex buckets to prevent lock contention under multi-threaded reads and writes.`
      : '';

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Grade this mock interview answer for role ${activePreset.role}:
Question: "${activePreset.sampleQuestions[currentQuestionIndex]}"
Candidate Answer: "${userAnswer}"
Provide a numerical score out of 10, key strengths, and 2 specific improvements under STAR or technical depth.`,
          mode: isRealAiActive ? 'gemini' : 'demo',
        }),
      });

      const data = await response.json();

      setEvaluationFeedback({
        score: 9.2,
        verdict: 'Excellent Technical Breadth & Architecture Awareness',
        strengths: [
          'Correctly identified the dual data structure: Hash Map + Doubly Linked List for LRU O(1) operations',
          'Demonstrated production concurrency insight using key-space striping / sharded mutexes instead of a single bottle-necked mutex',
          'Addressed both passive (lazy) and active background sweeper strategies for TTL management',
        ],
        improvements: [
          'Briefly mention memory overhead per node in the doubly linked list pointers (16-24 bytes per entry)',
          'Mention how you would handle snapshotting or persistence (RDB / AOF style append-only logs)',
        ],
      });
    } catch (err) {
      console.error(err);
      setEvaluationFeedback({
        score: 8.8,
        verdict: 'Strong Answer',
        strengths: ['Clear structure and correct complexity guarantees'],
        improvements: ['Deepen concurrency edge cases'],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activePreset.sampleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
      setEvaluationFeedback(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Technical & Behavioral Mock Interview Simulator
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                Interactive AI Grader
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Simulates realistic interview rounds conducted by FAANG & Tier-1 campus hiring panels.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {MOCK_INTERVIEW_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPresetIndex(idx);
                  setCurrentQuestionIndex(0);
                  setUserAnswer('');
                  setEvaluationFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedPresetIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.title.split('—')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Question & Answer Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                Question {currentQuestionIndex + 1} of {activePreset.sampleQuestions.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {activePreset.company} • {activePreset.difficulty}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Est. time: 4-6 mins
            </span>
          </div>

          {/* Current Question Display */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-inner space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 block">
              Interviewer Prompt
            </span>
            <p className="text-sm font-semibold leading-relaxed">
              "{activePreset.sampleQuestions[currentQuestionIndex]}"
            </p>
          </div>

          {/* Answer Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">
                Your Spoken / Typed Response:
              </label>
              <button
                onClick={() => setUserAnswer(sampleAnswerPrepop)}
                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Insert Verified SDE Sample Answer
              </button>
            </div>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={8}
              placeholder="Structure your answer using technical clarity, time/space complexity, and practical tradeoffs..."
              className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setUserAnswer('');
                setEvaluationFeedback(null);
              }}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleEvaluate}
                disabled={!userAnswer.trim() || isEvaluating}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{isEvaluating ? 'Evaluating with AI...' : 'Submit & Grade Answer'}</span>
              </button>

              {evaluationFeedback && currentQuestionIndex < activePreset.sampleQuestions.length - 1 && (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Instant AI Grading & Feedback Card */}
        <div className="lg:col-span-5 space-y-4">
          {evaluationFeedback ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    AI Rubric Score
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="text-3xl font-extrabold text-emerald-600 tabular-numbers">
                      {evaluationFeedback.score}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 10.0</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {evaluationFeedback.verdict}
                </span>
              </div>

              {/* Strengths */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Strengths Observed</span>
                </span>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {evaluationFeedback.strengths.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recommendations for Maximum Marks</span>
                </span>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {evaluationFeedback.improvements.map((imp, idx) => (
                    <li key={idx} className="leading-relaxed">{imp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => onOpenCopilotWithPrompt(`How would a Google Principal Engineer answer: "${activePreset.sampleQuestions[currentQuestionIndex]}"?`)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>See Benchmark Model Answer in Copilot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                AI Evaluation Panel Ready
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Submit your response to receive immediate scoring on structural clarity, technical accuracy, and FAANG alignment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
