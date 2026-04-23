// src/app/admin/admin-events/admin-events.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { EventStatisticsService, EventStatistics } from '../../services/event-statistics.service';
import { Event, EventStatus } from '../../models/event.model';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-admin-events',
    templateUrl: './admin-events.component.html',
    styleUrls: ['./admin-events.component.scss'],
    standalone: false,
})
export class AdminEventsComponent implements OnInit {
    events: Event[] = [];
    filteredEvents: Event[] = [];
    searchTerm = '';
    filterStatus = '';
    filterCategory = '';
    isModalOpen = false;
    isDeleteModalOpen = false;
    eventToDeleteId: number | null = null;
    eventForm: FormGroup;
    isEditing = false;
    editingEventId: number | null = null;
    selectedPhoto: File | null = null;
    photoPreviewUrl: string | null = null;
    categories: string[] = [];
    statuses = Object.values(EventStatus);
    backendUrl = environment.apiBase.replace(/\/?api$/, '');
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;
    paginatedEvents: Event[] = [];
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';
    showToast = false;
    
    // Statistics
    stats: EventStatistics | null = null;
    loadingStats = false;

    constructor(
        private eventService: EventService,
        private statsService: EventStatisticsService,
        private fb: FormBuilder
    ) {
        this.eventForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            category: ['', Validators.required],
            status: ['', Validators.required],
            date: ['', [Validators.required, this.futureDateValidator]],
            placesLimit: [50, [Validators.required, Validators.min(50)]],
            description: ['', [Validators.required, Validators.maxLength(1000)]],
            location: ['', Validators.required],
            organizerFirstName: ['', Validators.required],
            organizerLastName: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.loadEvents();
        this.loadCategories();
        this.loadStatistics();
    }
    
    loadStatistics(): void {
        this.loadingStats = true;
        this.statsService.getStatistics().subscribe({
            next: (data) => {
                this.stats = data;
                this.loadingStats = false;
            },
            error: () => {
                this.loadingStats = false;
                this.showNotification('Error loading statistics', 'error');
            }
        });
    }

    /** fetch categories from server into the dropdown */
    loadCategories(): void {
        this.eventService.getCategories().subscribe({
            next: (c) => {
                this.categories = c || [];
                // if the selected filter is no longer valid, clear it and reapply filters
                if (this.filterCategory && !this.categories.includes(this.filterCategory)) {
                    this.filterCategory = '';
                    this.applyFilters();
                }
            },
            error: () => this.showNotification('Failed to load categories', 'error'),
        });
    }

    // Validators
    futureDateValidator(control: AbstractControl) {
        if (!control.value) return null;
        const selectedDate = new Date(control.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate > today ? null : { futureDate: true };
    }

    // Load events
    loadEvents(): void {
        this.eventService.getAll().subscribe({
            next: (data: Event[]) => {
                this.events = data ?? [];
                this.applyFilters();
            },
            error: () => this.showNotification('Error loading events.', 'error'),
        });
    }

    // Filter events
    applyFilters(): void {
        let result = this.events;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(
                (e) =>
                    e.name.toLowerCase().includes(term) ||
                    e.location.toLowerCase().includes(term)
            );
        }

        if (this.filterStatus) {
            result = result.filter((e) => e.status === this.filterStatus);
        }

        if (this.filterCategory) {
            result = result.filter((e) => e.category === this.filterCategory);
        }

        this.filteredEvents = result;
        this.totalPages =
            Math.ceil(this.filteredEvents.length / this.itemsPerPage) || 1;
        this.currentPage = 1;
        this.updatePagination();
    }

    // Pagination
    updatePagination(): void {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.paginatedEvents = this.filteredEvents.slice(start, end);
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePagination();
        }
    }

    // Modals
    openCreateModal(): void {
        this.isEditing = false;
        this.editingEventId = null;
        this.eventForm.reset({ placesLimit: 50 });
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
        // ensure we have latest categories before user starts filling the form
        this.loadCategories();
        this.isModalOpen = true;
    }

    openEditModal(event: Event): void {
        this.isEditing = true;
        this.editingEventId = event.id;

        // refresh categories before populating the form in case they changed
        this.loadCategories();

        const dateStr = event.date
            ? new Date(event.date).toISOString().split('T')[0]
            : '';

        this.eventForm.patchValue({
            name: event.name,
            category: event.category,
            status: event.status,
            date: dateStr,
            placesLimit: event.placesLimit,
            description: event.description,
            location: event.location,
            organizerFirstName: event.organizerFirstName || '',
            organizerLastName: event.organizerLastName || '',
        });

        this.photoPreviewUrl = event.photoUrl
            ? this.getFullPhotoUrl(event.photoUrl)
            : null;
        this.selectedPhoto = null;
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.eventForm.reset({ placesLimit: 50 });
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
    }

    openDeleteModal(id: number): void {
        this.eventToDeleteId = id;
        this.isDeleteModalOpen = true;
    }

    closeDeleteModal(): void {
        this.isDeleteModalOpen = false;
        this.eventToDeleteId = null;
    }

    confirmDelete(): void {
        if (!this.eventToDeleteId) return;
        this.eventService.delete(this.eventToDeleteId).subscribe({
            next: () => {
                this.showNotification('Event deleted successfully', 'success');
                this.closeDeleteModal();
                this.loadEvents();
            },
            error: () => {
                this.showNotification('Failed to delete event', 'error');
                this.closeDeleteModal();
            },
        });
    }

    onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedPhoto = file;
            const reader = new FileReader();
            reader.onload = () => (this.photoPreviewUrl = reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    getFullPhotoUrl(path: string | undefined | null): string {
        if (!path) return '';
        return path.startsWith('http') ? path : this.backendUrl + path;
    }

    saveEvent(): void {
        this.eventForm.markAllAsTouched();
        if (this.eventForm.invalid) {
            this.showNotification(
                'Please fill all required fields correctly',
                'error'
            );
            return;
        }
        if (!this.isEditing && !this.selectedPhoto) {
            this.showNotification('Photo is required for new events', 'error');
            return;
        }

        const formData = new FormData();
        const formVals = this.eventForm.value;

        formData.append('name', formVals.name);
        formData.append('category', formVals.category?.toUpperCase() || '');
        formData.append(
            'status',
            formVals.status?.charAt(0).toUpperCase() +
            formVals.status?.slice(1).toLowerCase()
        );
        formData.append('date', formVals.date);
        formData.append('placesLimit', String(formVals.placesLimit));
        formData.append('description', formVals.description);
        formData.append('location', formVals.location);
        formData.append('organizerFirstName', formVals.organizerFirstName);
        formData.append('organizerLastName', formVals.organizerLastName);

        if (this.selectedPhoto) formData.append('photo', this.selectedPhoto);

        const request$ =
            this.isEditing && this.editingEventId
                ? this.eventService.update(this.editingEventId, formData)
                : this.eventService.create(formData);

        request$.subscribe({
            next: () => {
                this.showNotification(
                    this.isEditing ? 'Event updated successfully' : 'Event created successfully',
                    'success'
                );
                this.closeModal();
                this.loadEvents();
                // reload categories in case backend added a new one when saving this event
                this.loadCategories();
            },
            error: (err: any) => {
                // log full error for debugging
                console.error('saveEvent error', err);

                // Spring's default error response is a JSON object with several fields
                // (timestamp, status, error, message, path, etc.).  Using `err.error`
                // directly in a toast yields `[object Object]` because it is coerced to a
                // string.  Pick a human readable value instead.
                let msg = 'Failed to save event';
                if (err?.error) {
                    if (typeof err.error === 'string') {
                        msg = err.error;
                    } else if (err.error?.message) {
                        msg = err.error.message;
                    } else {
                        // fallback to JSON representation so the developer can see what
                        // came back (useful during development, remove in production)
                        msg = JSON.stringify(err.error);
                    }
                } else if (err?.message) {
                    msg = err.message;
                }

                this.showNotification(msg, 'error');
            },
        });
    }

    hasError(controlName: string, errorName: string): boolean {
        const control = this.eventForm.get(controlName);
        return !!(
            control &&
            control.hasError(errorName) &&
            (control.dirty || control.touched)
        );
    }

    showNotification(message: string, type: 'success' | 'error'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        setTimeout(() => (this.showToast = false), 3000);
    }
}