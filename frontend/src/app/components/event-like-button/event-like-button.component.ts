import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLikeService } from '../../services/event-like.service';

@Component({
  selector: 'app-event-like-button',
  templateUrl: './event-like-button.component.html',
  styleUrls: ['./event-like-button.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class EventLikeButtonComponent implements OnInit {
  @Input() eventId!: number;
  @Input() participantId: number = 1; // TODO: Get from auth service

  isLiked = false;
  likesCount = 0;
  loading = false;

  constructor(private likeService: EventLikeService) {}

  ngOnInit() {
    this.loadLikeStatus();
    this.loadLikesCount();
  }

  loadLikeStatus() {
    this.likeService.isLiked(this.eventId, this.participantId).subscribe({
      next: (liked) => this.isLiked = liked,
      error: (error) => console.error('Erreur chargement like status:', error)
    });
  }

  loadLikesCount() {
    this.likeService.getLikesCount(this.eventId).subscribe({
      next: (count) => this.likesCount = count,
      error: (error) => console.error('Erreur chargement likes count:', error)
    });
  }

  toggleLike() {
    if (this.loading) return;

    this.loading = true;

    if (this.isLiked) {
      this.likeService.unlikeEvent(this.eventId, this.participantId).subscribe({
        next: () => {
          this.isLiked = false;
          this.loadLikesCount();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur unlike:', error);
          this.loading = false;
        }
      });
    } else {
      this.likeService.likeEvent(this.eventId, this.participantId).subscribe({
        next: () => {
          this.isLiked = true;
          this.loadLikesCount();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur like:', error);
          this.loading = false;
        }
      });
    }
  }
}
