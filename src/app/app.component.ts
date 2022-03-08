import { Component, OnInit } from '@angular/core';
import { User } from './user.class';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppService } from './app.service';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  filteredUsers: User[] = [];
  usersForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private appService: AppService) {}

  ngOnInit() {
    this.usersForm = this.fb.group({
      userInput: null,
    });

    this.usersForm
      .get('userInput')
      .valueChanges.pipe(
        debounceTime(300),
        tap(() => (this.isLoading = true)),
        switchMap((value) =>
          this.appService
            .search({ name: value }, 1)
            .pipe(finalize(() => (this.isLoading = false)))
        )
      )
      .subscribe((users) => (this.filteredUsers = users.results));
  }

  displayFn(user: User) {
    if (user) {
      return user.name;
    }
  }
}
