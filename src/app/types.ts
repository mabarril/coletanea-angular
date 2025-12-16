export interface WheelItem {
    id: string;
    label: string;
    color: string;
    quantity: number;
}

export interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
    color: 'red' | 'blue' | 'yellow' | 'green';
    shape: 'triangle' | 'diamond' | 'circle' | 'square';
}

export interface Question {
    id: string;
    text: string;
    timeLimit: number;
    options: QuizOption[];
}
