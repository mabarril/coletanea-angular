import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast.service';
import { AnalyticsService } from '../../services/analytics.service';

describe('ToastComponent', () => {
    let component: ToastComponent;
    let fixture: ComponentFixture<ToastComponent>;
    let toastService: ToastService;

    beforeEach(async () => {
        // Create spy for AnalyticsService
        const analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['trackEvent']);

        await TestBed.configureTestingModule({
            imports: [ToastComponent],
            providers: [
                ToastService,
                { provide: AnalyticsService, useValue: analyticsSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ToastComponent);
        component = fixture.componentInstance;
        toastService = TestBed.inject(ToastService);
        fixture.detectChanges();
    });

    afterEach(() => {
        toastService.clearAll();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display toasts from service', () => {
        toastService.success('Test success message');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const toastElements = compiled.querySelectorAll('[data-toast-type]');

        expect(toastElements.length).toBe(1);
        expect(toastElements[0].textContent).toContain('Test success message');
    });

    it('should display multiple toasts', () => {
        toastService.success('Message 1');
        toastService.error('Message 2');
        toastService.warning('Message 3');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const toastElements = compiled.querySelectorAll('[data-toast-type]');

        expect(toastElements.length).toBe(3);
    });

    it('should apply correct styling for success toast', () => {
        toastService.success('Success');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const toastElement = compiled.querySelector('[data-toast-type="success"]');

        expect(toastElement).toBeTruthy();
        expect(toastElement?.classList.contains('bg-green-50/95')).toBe(true);
    });

    it('should apply correct styling for error toast', () => {
        toastService.error('Error');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const toastElement = compiled.querySelector('[data-toast-type="error"]');

        expect(toastElement).toBeTruthy();
        expect(toastElement?.classList.contains('bg-red-50/95')).toBe(true);
    });

    it('should apply correct styling for warning toast', () => {
        toastService.warning('Warning');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const toastElement = compiled.querySelector('[data-toast-type="warning"]');

        expect(toastElement).toBeTruthy();
        expect(toastElement?.classList.contains('bg-yellow-50/95')).toBe(true);
    });

    it('should apply correct styling for info toast', () => {
        toastService.info('Info');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const toastElement = compiled.querySelector('[data-toast-type="info"]');

        expect(toastElement).toBeTruthy();
        expect(toastElement?.classList.contains('bg-blue-50/95')).toBe(true);
    });

    it('should remove toast when close button is clicked', () => {
        toastService.success('Test message');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const closeButton = compiled.querySelector('button[aria-label*="Close"]') as HTMLButtonElement;

        expect(closeButton).toBeTruthy();

        closeButton.click();
        fixture.detectChanges();

        const toastElements = compiled.querySelectorAll('[data-toast-type]');
        expect(toastElements.length).toBe(0);
    });

    it('should have proper ARIA attributes', () => {
        toastService.success('Accessible message');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const container = compiled.querySelector('[role="region"]');
        const toast = compiled.querySelector('[role="alert"]');

        expect(container).toBeTruthy();
        expect(container?.getAttribute('aria-live')).toBe('polite');
        expect(toast).toBeTruthy();
        expect(toast?.getAttribute('aria-label')).toContain('success notification');
    });

    it('should return correct icon for each toast type', () => {
        expect(component.getIcon('success')).toBe(component.icons.success);
        expect(component.getIcon('error')).toBe(component.icons.error);
        expect(component.getIcon('warning')).toBe(component.icons.warning);
        expect(component.getIcon('info')).toBe(component.icons.info);
    });

    it('should call removeToast method when close button is clicked', () => {
        spyOn(component, 'removeToast');

        toastService.success('Test');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const closeButton = compiled.querySelector('button[aria-label*="Close"]') as HTMLButtonElement;

        closeButton.click();

        expect(component.removeToast).toHaveBeenCalled();
    });
});
