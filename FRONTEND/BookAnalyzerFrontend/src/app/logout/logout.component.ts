import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {

	router: Router;
	constructor(router: Router) {
		this.router = router;
	}

	ngOnInit(): void {

		localStorage.removeItem('token');
		localStorage.removeItem('userName');
		localStorage.removeItem('userId');
		localStorage.setItem('bookanalyzer-token', '');
		localStorage.setItem('bookanalyzer-token-expiration', '');
		localStorage.clear()

		this.router.navigate(['/login']);
	}

	

}
