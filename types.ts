
export enum Difficulty {
  EASY = 'VIEGLS',
  MEDIUM = 'VIDĒJS',
  HARD = 'GRŪTS'
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  steps?: string[];
  baseCalories: number;
  difficulty: Difficulty[];
}

export interface SessionStats {
  completedExercises: number;
  totalCalories: number;
  startTime: number;
}

export interface ExerciseInstance {
  exercise: Exercise;
  reps: number;
  timestamp: number;
}
