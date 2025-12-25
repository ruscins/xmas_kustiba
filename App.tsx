
import React, { useState, useEffect, useCallback } from 'react';
import { Difficulty, Exercise, ExerciseInstance, SessionStats } from './types';
import { EXERCISES, DIFFICULTY_CONFIG } from './constants';

// Reusable Components
const Button: React.FC<{
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, className = '', children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-card rounded-3xl shadow-2xl p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentExercise, setCurrentExercise] = useState<ExerciseInstance | null>(null);
  const [usedExerciseIds, setUsedExerciseIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<SessionStats>({
    completedExercises: 0,
    totalCalories: 0,
    startTime: Date.now()
  });
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const generateNewExercise = useCallback(async (selectedDifficulty: Difficulty, currentUsedIds: Set<string>) => {
    setLoading(true);
    setShowExplanation(false);
    
    const difficultyPool = EXERCISES.filter(ex => ex.difficulty.includes(selectedDifficulty));
    let availableExercises = difficultyPool.filter(ex => !currentUsedIds.has(ex.id));
    
    if (availableExercises.length === 0) {
      availableExercises = difficultyPool;
      setUsedExerciseIds(new Set());
      currentUsedIds = new Set();
    }

    const randomExercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
    const config = DIFFICULTY_CONFIG[selectedDifficulty];
    const reps = Math.floor(Math.random() * (config.repRange[1] - config.repRange[0] + 1)) + config.repRange[0];

    const newInstance: ExerciseInstance = {
      exercise: randomExercise,
      reps,
      timestamp: Date.now()
    };

    setCurrentExercise(newInstance);
    setUsedExerciseIds(prev => new Set(prev).add(randomExercise.id));
    setLoading(false);
  }, []);

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    const emptySet = new Set<string>();
    setUsedExerciseIds(emptySet);
    generateNewExercise(diff, emptySet);
  };

  const handleExerciseComplete = async () => {
    if (!currentExercise || !difficulty) return;

    const caloriesGained = currentExercise.exercise.baseCalories * currentExercise.reps;
    
    setStats(prev => ({
      ...prev,
      completedExercises: prev.completedExercises + 1,
      totalCalories: prev.totalCalories + caloriesGained
    }));

    generateNewExercise(difficulty, usedExerciseIds);
  };

  const resetSession = () => {
    setDifficulty(null);
    setCurrentExercise(null);
    setUsedExerciseIds(new Set());
    setStats({
      completedExercises: 0,
      totalCalories: 0,
      startTime: Date.now()
    });
  };

  return (
    <div className="min-h-screen snow-bg text-slate-900 selection:bg-red-200">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-block bg-red-600 text-white px-5 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-4 shadow-lg shadow-red-900/40">
            🎁 Ziemassvētku Enerģijas Lādiņš
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tighter">
            Svētku <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Fitness</span> 🎅
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">
            Sadedzini svētku našķus un sagatavo sevi jaunajam gadam ar jautru rūķu treniņu!
          </p>
        </header>

        {!difficulty ? (
          /* Difficulty Selection View */
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => handleDifficultySelect(level)}
                className="group relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/10 hover:border-red-500/50 hover:bg-white/15 transition-all text-left overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl">❄️</span>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${
                    level === Difficulty.EASY ? 'bg-emerald-600' : level === Difficulty.MEDIUM ? 'bg-amber-500' : 'bg-red-600'
                } flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl`}>
                  {level === Difficulty.EASY ? '🕯️' : level === Difficulty.MEDIUM ? '🦌' : '🔥'}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{level}</h3>
                <p className="text-slate-400 text-sm">
                  {level === Difficulty.EASY && "Viegla iesildīšanās pirms svētku vakariņām."}
                  {level === Difficulty.MEDIUM && "Enerģisks treniņš pēc kārtīgas mielošanās."}
                  {level === Difficulty.HARD && "Īsts izaicinājums Ziemeļpola stilā!"}
                </p>
                <div className="mt-6 flex items-center text-sm font-bold text-red-400 group-hover:text-red-300 transition-colors uppercase tracking-wider">
                  Sākt treniņu <span className="ml-2 group-hover:translate-x-2 transition-transform">🎄</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Training View */
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/95 p-4 rounded-2xl shadow-xl flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pieveikti</span>
                <span className="text-2xl font-black text-slate-800">{stats.completedExercises}</span>
              </div>
              <div className="bg-white/95 p-4 rounded-2xl shadow-xl flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sadedzināts</span>
                <span className="text-2xl font-black text-red-600">{stats.totalCalories.toFixed(1)} <span className="text-xs">kcal</span></span>
              </div>
              <div className="bg-white/95 p-4 rounded-2xl shadow-xl flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Grūtība</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full mt-1 text-white ${
                    difficulty === Difficulty.EASY ? 'bg-emerald-600' : difficulty === Difficulty.MEDIUM ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {difficulty}
                </span>
              </div>
              <button 
                onClick={resetSession}
                className="bg-white/10 hover:bg-red-600/30 text-white p-4 rounded-2xl flex flex-col items-center transition-all border border-white/10"
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Atpūsties</span>
                <span className="text-2xl">🏠</span>
              </button>
            </div>

            {/* Exercise Card */}
            {currentExercise && (
              <Card className="relative overflow-hidden border-t-8 border-red-600">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-emerald-600 to-red-600 opacity-50"></div>
                <div className="absolute -top-1 left-0 w-full text-center text-xs opacity-50 select-none">
                    🔔 ✨ 🔔 ✨ 🔔 ✨ 🔔 ✨ 🔔 ✨ 🔔 ✨ 🔔 ✨ 🔔
                </div>

                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 text-slate-800">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold italic">Rūķi gatavo nākamo vingrinājumu...</p>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
                          {currentExercise.exercise.name}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-red-600 text-5xl font-black drop-shadow-sm">
                                {currentExercise.reps}
                            </span>
                            <span className="text-slate-400 font-bold text-xl uppercase tracking-tighter">atkārtojumi</span>
                        </div>
                      </div>
                      <div className="bg-red-50 text-red-600 w-20 h-20 rounded-3xl text-5xl hidden sm:flex items-center justify-center shadow-inner">
                        {currentExercise.exercise.id.startsWith('sq') ? '🦵' : 
                         currentExercise.exercise.id.startsWith('ub') ? '💪' : 
                         currentExercise.exercise.id.startsWith('ab') ? '🧘' : '🏃'}
                      </div>
                    </div>

                    <div className="bg-slate-100 p-5 rounded-2xl border-l-4 border-emerald-500">
                      <p className="text-slate-700 italic font-medium">"{currentExercise.exercise.description}"</p>
                    </div>

                    {currentExercise.exercise.steps && (
                      <div className="mt-4">
                        <button 
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="text-emerald-600 font-black text-sm flex items-center gap-1 hover:text-emerald-700 transition-colors uppercase tracking-wider"
                        >
                          {showExplanation ? 'Paslēpt dāvanas saturu' : 'Kā pareizi pildīt?'}
                          <span className={showExplanation ? 'rotate-180' : ''}>▾</span>
                        </button>
                        
                        {showExplanation && (
                          <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-4">
                            {currentExercise.exercise.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-4 items-start bg-emerald-50/50 p-3 rounded-xl">
                                <span className="bg-emerald-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-md">
                                  {idx + 1}
                                </span>
                                <p className="text-slate-700 text-sm leading-relaxed font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-8">
                      <Button 
                        onClick={handleExerciseComplete}
                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 py-5 text-2xl uppercase tracking-tighter"
                      >
                        Pabeigts! Nākamais 🎁
                      </Button>
                      <p className="text-center text-slate-400 text-xs mt-4 font-bold uppercase tracking-widest">
                        Nepadodies, svētku gariņš ir ar Tevi! ✨
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-500 text-sm pb-12 border-t border-white/10 pt-8">
          <div className="flex justify-center gap-4 mb-4 opacity-50">
            <span>❄️</span><span>🎄</span><span>🦌</span><span>❄️</span>
          </div>
          <p className="font-bold">© 2024 Ziemassvētku Fitnesa Izaicinājums</p>
          <p className="mt-1 opacity-60 italic">Nav nepieciešams aprīkojums. Tikai svētku prieks!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
