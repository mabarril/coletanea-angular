import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { AnalyticsService } from './analytics.service';

describe('ToastService', () => {
    let service: ToastService;
    let analyticsService: jasmine.SpyObj<AnalyticsService>;

    beforeEach(() => {
        // Create spy for AnalyticsService
        const analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['trackEvent']);

        TestBed.configureTestingModule({
            providers: [
                ToastService,
                { provide: AnalyticsService, useValue: analyticsSpy }
            ]
        });

        service = TestBed.inject(ToastService);
        analyticsService = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
    });

    afterEach(() => {
        // Clear all toasts after each test
        service.clearAll();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('success()', () => {
        it('should add a success toast', () => {
            service.success('Success message');

            const toasts = service.toasts();
            expect(toasts.length).toBe(1);
            expect(toasts[0].type).toBe('success');
            expect(toasts[0].message).toBe('Success message');
        });

        it('should use default duration for success toast', () => {
            service.success('Success message');

            const toasts = service.toasts();
            expect(toasts[0].duration).toBe(5000);
        });

        it('should use custom duration when provided', () => {
            service.success('Success message', 3000);

            const toasts = service.toasts();
            expect(toasts[0].duration).toBe(3000);
        });
    });

    describe('error()', () => {
        it('should add an error toast', () => {
            service.error('Error message');

            const toasts = service.toasts();
            expect(toasts.length).toBe(1);
            expect(toasts[0].type).toBe('error');
            expect(toasts[0].message).toBe('Error message');
        });

        it('should use error duration (8s) by default', () => {
            service.error('Error message');

            const toasts = service.toasts();
            expect(toasts[0].duration).toBe(8000);
        });

        it('should track error in analytics', () => {
            service.error('Error message');

            expect(analyticsService.trackEvent).toHaveBeenCalledWith(
                'toast_error',
                jasmine.objectContaining({
                    error_message: 'Error message'
                })
            );
        });
    });

    describe('warning()', () => {
        it('should add a warning toast', () => {
            service.warning('Warning message');

            const toasts = service.toasts();
            expect(toasts.length).toBe(1);
            expect(toasts[0].type).toBe('warning');
            expect(toasts[0].message).toBe('Warning message');
        });
    });

    describe('info()', () => {
        it('should add an info toast', () => {
            service.info('Info message');

            const toasts = service.toasts();
            expect(toasts.length).toBe(1);
            expect(toasts[0].type).toBe('info');
            expect(toasts[0].message).toBe('Info message');
        });
    });

    describe('remove()', () => {
        it('should remove a toast by id', () => {
            service.success('Message 1');
            service.success('Message 2');

            const toasts = service.toasts();
            expect(toasts.length).toBe(2);

            const firstToastId = toasts[0].id;
            service.remove(firstToastId);

            const updatedToasts = service.toasts();
            expect(updatedToasts.length).toBe(1);
            expect(updatedToasts[0].message).toBe('Message 2');
        });

        it('should handle removing non-existent toast gracefully', () => {
            service.success('Message');

            service.remove('non-existent-id');

            const toasts = service.toasts();
            expect(toasts.length).toBe(1);
        });
    });

    describe('clearAll()', () => {
        it('should remove all toasts', () => {
            service.success('Message 1');
            service.error('Message 2');
            service.warning('Message 3');

            expect(service.toasts().length).toBe(3);

            service.clearAll();

            expect(service.toasts().length).toBe(0);
        });
    });

    describe('auto-dismiss', () => {
        it('should auto-dismiss toast after duration', fakeAsync(() => {
            service.success('Message', 1000);

            expect(service.toasts().length).toBe(1);

            tick(1000);

            expect(service.toasts().length).toBe(0);
        }));

        it('should not auto-dismiss if duration is 0', fakeAsync(() => {
            service.success('Message', 0);

            expect(service.toasts().length).toBe(1);

            tick(10000);

            expect(service.toasts().length).toBe(1);

            flush();
        }));
    });

    describe('max toasts limit', () => {
        it('should limit toasts to maximum of 5', () => {
            // Add 6 toasts
            for (let i = 0; i < 6; i++) {
                service.info(`Message ${i + 1}`);
            }

            const toasts = service.toasts();
            expect(toasts.length).toBe(5);

            // First toast should be removed, so we should have messages 2-6
            expect(toasts[0].message).toBe('Message 2');
            expect(toasts[4].message).toBe('Message 6');
        });
    });

    describe('toast id generation', () => {
        it('should generate unique ids for each toast', () => {
            service.success('Message 1');
            service.success('Message 2');
            service.success('Message 3');

            const toasts = service.toasts();
            const ids = toasts.map(t => t.id);

            // Check that all ids are unique
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(3);
        });
    });
});
