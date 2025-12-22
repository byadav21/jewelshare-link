import { useState, useCallback, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Star,
  Palette,
  Search,
  ArrowRight,
  Lightbulb
} from "lucide-react";

const RealisticDiamond3D = lazy(() => import("./RealisticDiamond3D"));

type QuizType = 'color' | 'clarity' | 'mixed';

interface Question {
  id: number;
  type: 'color' | 'clarity';
  correctAnswer: string;
  options: string[];
  seed: number;
}

const COLOR_GRADES = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'] as const;
const CLARITY_GRADES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'] as const;

const generateQuestion = (type: 'color' | 'clarity', id: number): Question => {
  const seed = Math.floor(Math.random() * 100000);
  
  if (type === 'color') {
    const correctIdx = Math.floor(Math.random() * COLOR_GRADES.length);
    const correct = COLOR_GRADES[correctIdx];
    
    // Generate nearby options
    const options = new Set<string>([correct]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const idx = Math.max(0, Math.min(COLOR_GRADES.length - 1, correctIdx + offset));
      options.add(COLOR_GRADES[idx]);
    }
    
    return {
      id,
      type: 'color',
      correctAnswer: correct,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      seed,
    };
  } else {
    const correctIdx = Math.floor(Math.random() * CLARITY_GRADES.length);
    const correct = CLARITY_GRADES[correctIdx];
    
    const options = new Set<string>([correct]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 3) - 1;
      const idx = Math.max(0, Math.min(CLARITY_GRADES.length - 1, correctIdx + offset));
      options.add(CLARITY_GRADES[idx]);
    }
    
    return {
      id,
      type: 'clarity',
      correctAnswer: correct,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      seed,
    };
  }
};

const generateQuiz = (type: QuizType, count: number = 10): Question[] => {
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    if (type === 'mixed') {
      questions.push(generateQuestion(Math.random() > 0.5 ? 'color' : 'clarity', i));
    } else {
      questions.push(generateQuestion(type, i));
    }
  }
  return questions;
};

const getGradeHint = (type: 'color' | 'clarity', grade: string): string => {
  if (type === 'color') {
    const idx = COLOR_GRADES.indexOf(grade as typeof COLOR_GRADES[number]);
    if (idx <= 2) return 'Look for absence of any warmth - ice white appearance';
    if (idx <= 5) return 'Check for very subtle warmth compared to colorless';
    if (idx <= 7) return 'Notice the faint yellow/warm tint becoming visible';
    return 'Observe the noticeable yellow coloration';
  } else {
    const idx = CLARITY_GRADES.indexOf(grade as typeof CLARITY_GRADES[number]);
    if (idx <= 1) return 'No inclusions visible - perfectly clean';
    if (idx <= 3) return 'Extremely tiny inclusions, very hard to spot';
    if (idx <= 5) return 'Minor inclusions visible with close inspection';
    if (idx <= 7) return 'Noticeable inclusions, check center and edges';
    return 'Obvious inclusions affecting the diamond appearance';
  }
};

interface QuizResultsProps {
  score: number;
  total: number;
  onRestart: () => void;
  onNewQuiz: () => void;
}

const QuizResults = ({ score, total, onRestart, onNewQuiz }: QuizResultsProps) => {
  const percentage = (score / total) * 100;
  const grade = percentage >= 90 ? 'Expert' : percentage >= 70 ? 'Proficient' : percentage >= 50 ? 'Learning' : 'Beginner';
  const gradeColor = percentage >= 90 ? 'text-emerald-400' : percentage >= 70 ? 'text-sky-400' : percentage >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      <div className="flex justify-center">
        <div className="relative">
          <Trophy className={`h-24 w-24 ${gradeColor}`} />
          {percentage >= 70 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-2 -right-2"
            >
              <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
            </motion.div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold">{score} / {total}</h3>
        <p className={`text-xl font-semibold ${gradeColor}`}>{grade} Level</p>
        <p className="text-muted-foreground mt-2">
          {percentage >= 90 ? 'Outstanding! You have excellent diamond grading skills!' :
           percentage >= 70 ? 'Great job! You have a solid understanding of diamond grading.' :
           percentage >= 50 ? 'Good effort! Keep practicing to improve your skills.' :
           'Keep learning! Practice makes perfect in diamond grading.'}
        </p>
      </div>

      <div className="w-full max-w-md mx-auto">
        <Progress value={percentage} className="h-3" />
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry Same Quiz
        </Button>
        <Button onClick={onNewQuiz}>
          <ArrowRight className="h-4 w-4 mr-2" />
          New Quiz
        </Button>
      </div>
    </motion.div>
  );
};

export const DiamondGradingQuiz = () => {
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const startQuiz = useCallback((type: QuizType) => {
    setQuizType(type);
    setQuestions(generateQuiz(type, 10));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setQuizComplete(false);
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  }, [showResult, currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      setQuizComplete(true);
    }
  }, [currentIndex, questions.length]);

  const resetQuiz = useCallback(() => {
    setQuizType(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setQuizComplete(false);
  }, []);

  const restartSameQuiz = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setQuizComplete(false);
  }, []);

  // Quiz type selection
  if (!quizType) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-violet-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-center justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            Diamond Grading Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Test your diamond grading skills! Identify the correct grade based on the 3D diamond visualization.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz('color')}
              className="p-6 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border-2 border-sky-500/30 hover:border-sky-400/50 transition-all"
            >
              <Palette className="h-10 w-10 text-sky-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Color Grading</h3>
              <p className="text-sm text-muted-foreground">
                Identify diamond color grades from D to M
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz('clarity')}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border-2 border-purple-500/30 hover:border-purple-400/50 transition-all"
            >
              <Search className="h-10 w-10 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Clarity Grading</h3>
              <p className="text-sm text-muted-foreground">
                Identify diamond clarity grades from FL to I2
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz('mixed')}
              className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/30 hover:border-amber-400/50 transition-all"
            >
              <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">Mixed Challenge</h3>
              <p className="text-sm text-muted-foreground">
                Test both color and clarity grading skills
              </p>
            </motion.button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz complete
  if (quizComplete) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-violet-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuizResults
            score={score}
            total={questions.length}
            onRestart={restartSameQuiz}
            onNewQuiz={resetQuiz}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-violet-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">
                {currentQuestion.type === 'color' ? 'Color' : 'Clarity'} Grading Quiz
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
              Score: {score}/{currentIndex + (showResult ? 1 : 0)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={resetQuiz}>
              <XCircle className="h-4 w-4 mr-1" />
              Exit
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">
            What is the {currentQuestion.type === 'color' ? 'color' : 'clarity'} grade of this diamond?
          </h3>
          <p className="text-sm text-muted-foreground">
            Examine the diamond carefully and select your answer
          </p>
        </div>

        {/* 3D Diamond */}
        <div className="relative">
          <div className="h-[350px] rounded-xl overflow-hidden border-2 border-primary/30">
            <Suspense fallback={<div className="h-full flex items-center justify-center bg-muted/50">Loading Diamond...</div>}>
              <RealisticDiamond3D
                colorGrade={currentQuestion.type === 'color' ? currentQuestion.correctAnswer as any : 'G'}
                clarityGrade={currentQuestion.type === 'clarity' ? currentQuestion.correctAnswer as any : 'VVS1'}
                autoRotate={true}
                microscopeMode={currentQuestion.type === 'clarity'}
                viewMode="faceUp"
                showControls={true}
                seed={currentQuestion.seed}
              />
            </Suspense>
          </div>
          
          {/* Hint button */}
          {!showResult && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className={`h-4 w-4 mr-1 ${showHint ? 'text-amber-400' : ''}`} />
              Hint
            </Button>
          )}
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && !showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <p className="text-sm text-amber-400">
                💡 {getGradeHint(currentQuestion.type, currentQuestion.correctAnswer)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <motion.button
                key={option}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={`
                  p-4 rounded-xl border-2 font-semibold text-lg transition-all
                  ${showCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                    showIncorrect ? 'bg-red-500/20 border-red-500 text-red-400' :
                    isSelected ? 'bg-primary/20 border-primary' :
                    'bg-muted/50 border-border/50 hover:border-primary/50'}
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {showCorrect && <CheckCircle2 className="h-5 w-5" />}
                  {showIncorrect && <XCircle className="h-5 w-5" />}
                  {option}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-400" />
                    <span className="font-semibold text-red-400">
                      Incorrect. The answer was {currentQuestion.correctAnswer}
                    </span>
                  </>
                )}
              </div>
              <Button onClick={nextQuestion}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
