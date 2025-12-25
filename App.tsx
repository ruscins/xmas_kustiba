
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
  <div className={`bg-white rounded-3xl shadow-xl p-6 md:p-8 ${className}`}>
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
    
    // 1. Get all exercises for this difficulty
    const difficultyPool = EXERCISES.filter(ex => ex.difficulty.includes(selectedDifficulty));
    
    // 2. Filter out already used exercises
    let availableExercises = difficultyPool.filter(ex => !currentUsedIds.has(ex.id));
    
    // 3. If all exercises used, reset the used list for this difficulty
    if (availableExercises.length === 0) {
      availableExercises = difficultyPool;
      setUsedExerciseIds(new Set());
      currentUsedIds = new Set();
    }

    const randomExercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
    
    // Get rep range for difficulty
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

    // Generate next one while excluding already used ones
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
    <div className="min-h-screen bg-slate-50 snow-bg text-slate-900 selection:bg-orange-200">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            🔥 Pēc-svētku detokss
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Ziemas <span className="text-blue-500">Izaicinājums</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Izkusties, sadedzini kalorijas un atgriezies formā ar jautru, mainīgu treniņu programmu mājās!
          </p>
        </header>

        {!difficulty ? (
          /* Difficulty Selection View */
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => handleDifficultySelect(level)}
                className="group relative bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-slate-200 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-2xl ${DIFFICULTY_CONFIG[level].color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {level === Difficulty.EASY ? '🌱' : level === Difficulty.MEDIUM ? '⚡' : '🔥'}
                </div>
                <h3 className="text-2xl font-bold mb-2">{level}</h3>
                <p className="text-slate-500 text-sm">
                  {level === Difficulty.EASY && "Piemērots iesācējiem vai saudzīgam treniņam."}
                  {level === Difficulty.MEDIUM && "Standarta intensitāte aktīviem cilvēkiem."}
                  {level === Difficulty.HARD && "Izaicinošs līmenis pieredzējušiem sportotājiem."}
                </p>
                <div className="mt-6 flex items-center text-sm font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                  Izvēlēties <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Training View */
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">Izpildīti</span>
                <span className="text-2xl font-black text-slate-800">{stats.completedExercises}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">Kalorijas</span>
                <span className="text-2xl font-black text-orange-500">{stats.totalCalories.toFixed(1)}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">Līmenis</span>
                <span className={`text-sm font-black px-2 py-0.5 rounded ${DIFFICULTY_CONFIG[difficulty].color} text-white mt-1`}>
                  {difficulty}
                </span>
              </div>
              <button 
                onClick={resetSession}
                className="bg-slate-100 hover:bg-slate-200 p-4 rounded-2xl flex flex-col items-center transition-colors"
              >
                <span className="text-xs text-slate-400 font-bold uppercase">Beigt</span>
                <span className="text-2xl">🛑</span>
              </button>
            </div>

            {/* Exercise Card */}
            {currentExercise && (
              <Card className="relative overflow-hidden border-t-4 border-blue-500">
                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium italic">Izlozējam nākamo izaicinājumu...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                          {currentExercise.exercise.name}
                        </h2>
                        <p className="text-slate-500 text-lg">
                          Izpildi šo vingrinājumu <span className="text-blue-600 font-bold underline decoration-blue-200 decoration-4 underline-offset-4">{currentExercise.reps} reizes</span>.
                        </p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl text-4xl hidden sm:block">
                        🏋️‍♂️
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-slate-700 italic">"{currentExercise.exercise.description}"</p>
                    </div>

                    {currentExercise.exercise.steps && (
                      <div className="mt-4">
                        <button 
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="text-blue-500 font-bold text-sm flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          {showExplanation ? 'Paslēpt pamācību' : 'Kā to izpildīt?'}
                          <span className={showExplanation ? 'rotate-180' : ''}>▾</span>
                        </button>
                        
                        {showExplanation && (
                          <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                            {currentExercise.exercise.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-4 items-start">
                                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                  {idx + 1}
                                </span>
                                <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                      <Button 
                        onClick={handleExerciseComplete}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 py-4 text-xl"
                      >
                        Gatavs! Nākamais 🚀
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-400 text-sm pb-8">
          <p>© 2024 Ziemas Fitnesa Izaicinājums. Nav nepieciešams aprīkojums.</p>
          <p className="mt-2">Radi savu sapņu formu mājās! ✨</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
