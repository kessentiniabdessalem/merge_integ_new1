import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-device-reject',
  standalone: false,
  templateUrl: './device-reject.html',
  styleUrls: ['./device-reject.css', '../signin/signin.css']
})
export class DeviceRejectComponent implements OnInit {

  message = 'Processing...';

  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.message = 'Missing token';
      return;
    }

    this.auth.rejectDevice(token).subscribe({
      next: () => this.message = 'Access rejected. If this was not you, change your password.',
      error: () => this.message = 'Reject failed'
    });
  }
}
