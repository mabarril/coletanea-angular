import { Component, signal, effect, computed, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Gamepad2, Plus, Trash2, Play, Edit3, Save, X,
  Triangle, Square, Circle, Hexagon, Check, Clock, ChevronRight, RotateCcw
} from 'lucide-angular';
import { Question, QuizOption } from '../../types';
import confetti from 'canvas-confetti';

type GameState = 'setup' | 'question' | 'reveal' | 'finished';

const DEFAULT_OPTIONS: QuizOption[] = [
  { id: '1', text: '', isCorrect: false, color: 'red', shape: 'triangle' },
  { id: '2', text: '', isCorrect: false, color: 'blue', shape: 'diamond' },
  { id: '3', text: '', isCorrect: false, color: 'yellow', shape: 'circle' },
  { id: '4', text: '', isCorrect: false, color: 'green', shape: 'square' },
];

@Component({
  selector: 'app-quiz-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
})
export class QuizPage {
  // Icons
  readonly Gamepad2 = Gamepad2;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Play = Play;
  readonly Edit3 = Edit3;
  readonly Save = Save;
  readonly X = X;
  readonly Triangle = Triangle;
  readonly Square = Square;
  readonly Circle = Circle;
  readonly Hexagon = Hexagon;
  readonly Check = Check;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly RotateCcw = RotateCcw;

  // State
  gameState = signal<GameState>('setup');
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);
  timeLeft = signal(0);

  // Editor State
  isEditing = signal(false);
  editQId = signal<string | null>(null);
  editText = signal('');
  editTime = signal(30);
  editOptions = signal<QuizOption[]>(JSON.parse(JSON.stringify(DEFAULT_OPTIONS)));

  private audio: HTMLAudioElement | null = null;
  private analytics = inject(AnalyticsService);
  private timerInterval: any;

  // Computed helpers
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  progress = computed(() => {
    if (this.questions().length === 0) return 0;
    const q = this.currentQuestion();
    return (this.timeLeft() / q.timeLimit) * 100;
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initAudio();
      this.loadQuestions();
    }

    // Effect to persist questions
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('colabbs-quiz-data', JSON.stringify(this.questions()));
      }
    });
  }

  initAudio() {
    this.audio = new Audio('assets/tada.mp3');
  }

  loadQuestions() {
    const saved = localStorage.getItem('colabbs-quiz-data');
    if (saved) {
      try {
        this.questions.set(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }

  // Timer Logic
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(prev => {
        if (prev <= 1) {
          this.setGameState('reveal');
          this.stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  setGameState(state: GameState) {
    this.gameState.set(state);
    if (state === 'question') {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  // Actions
  handleSaveQuestion() {
    if (!this.editText().trim()) return;

    // Validate
    if (!this.editOptions().some(o => o.isCorrect)) {
      alert("Selecione pelo menos uma resposta correta!");
      return;
    }

    const newQuestion: Question = {
      id: this.editQId() || Date.now().toString(),
      text: this.editText(),
      timeLimit: this.editTime(),
      options: this.editOptions()
    };

    this.questions.update(prev => {
      const isEdit = !!this.editQId();
      if (isEdit) {
        return prev.map(q => q.id === this.editQId() ? newQuestion : q);
      } else {
        return [...prev, newQuestion];
      }
    });

    this.closeEditor();
  }

  deleteQuestion(id: string) {
    if (confirm("Tem certeza?")) {
      this.questions.update(prev => prev.filter(q => q.id !== id));
    }
  }

  openEditor(q?: Question) {
    if (q) {
      this.editQId.set(q.id);
      this.editText.set(q.text);
      this.editTime.set(q.timeLimit);
      this.editOptions.set(JSON.parse(JSON.stringify(q.options)));
    } else {
      this.editQId.set(null);
      this.editText.set('');
      this.editTime.set(20);
      this.editOptions.set(JSON.parse(JSON.stringify(DEFAULT_OPTIONS)));
    }
    this.isEditing.set(true);
  }

  closeEditor() {
    this.isEditing.set(false);
    this.editQId.set(null);
  }

  toggleOptionCorrect(idx: number) {
    this.editOptions.update(prev => {
      const newOpts = [...prev];
      newOpts[idx].isCorrect = !newOpts[idx].isCorrect;
      return newOpts;
    });
  }

  updateOptionText(idx: number, text: string) {
    this.editOptions.update(prev => {
      const newOpts = [...prev];
      newOpts[idx].text = text;
      return newOpts;
    });
  }

  startGame() {
    if (this.questions().length === 0) return;
    this.currentQuestionIndex.set(0);
    this.loadQuestion(0);
    this.analytics.trackEvent('quiz_started', {
      question_count: this.questions().length
    });
  }

  loadQuestion(index: number) {
    const q = this.questions()[index];
    this.timeLeft.set(q.timeLimit);
    this.setGameState('question');
  }

  nextQuestion() {
    const currentIdx = this.currentQuestionIndex();
    if (currentIdx + 1 < this.questions().length) {
      this.currentQuestionIndex.set(currentIdx + 1);
      this.loadQuestion(currentIdx + 1);
    } else {
      this.setGameState('finished');
      confetti();
      this.analytics.trackEvent('quiz_finished', {
        question_count: this.questions().length
      });
      if (this.audio) this.audio.play().catch(() => { });
    }
  }

  skipTime() {
    this.setGameState('reveal');
  }

  resetGame() {
    this.currentQuestionIndex.set(0);
    this.loadQuestion(0);
  }

  // Template Helpers
  countCorrect(q: Question) {
    return q.options.filter(o => o.isCorrect).length;
  }

  getBgColor(color: string) {
    switch (color) {
      case 'red': return 'bg-red-500 hover:bg-red-400';
      case 'blue': return 'bg-blue-600 hover:bg-blue-500';
      case 'yellow': return 'bg-yellow-500 hover:bg-yellow-400';
      case 'green': return 'bg-green-600 hover:bg-green-500';
      default: return 'bg-slate-500';
    }
  }

  getBgColorEdit(color: string) {
    // slightly different utility for the editor headers
    // actually the original used the same getBgColor
    return this.getBgColor(color);
  }
}
