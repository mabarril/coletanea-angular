import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { WheelPage } from './pages/wheel-page/wheel-page';
import { RafflePage } from './pages/raffle-page/raffle-page';
import { QRCodePage } from './pages/qrcode-page/qrcode-page';
import { TimerPage } from './pages/timer-page/timer-page';
import { ShortenerPage } from './pages/shortener-page/shortener-page';
import { TeamGeneratorPage } from './pages/team-generator-page/team-generator-page';
import { ScreenGeneratorPage } from './pages/screen-generator-page/screen-generator-page';
import { QuizPage } from './pages/quiz-page/quiz-page';
import { ColendarioPageComponent } from './pages/colendario-page/colendario-page';

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'wheel', component: WheelPage },
    { path: 'raffle', component: RafflePage },
    { path: 'qrcode', component: QRCodePage },
    { path: 'timer', component: TimerPage },
    { path: 'shortener', component: ShortenerPage },
    { path: 'teams', component: TeamGeneratorPage },
    { path: 'screen', component: ScreenGeneratorPage },
    { path: 'quiz', component: QuizPage },
    { path: 'colendario', component: ColendarioPageComponent },
    { path: '**', redirectTo: '' }
];
