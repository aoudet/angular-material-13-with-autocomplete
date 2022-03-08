import { Component, OnInit } from '@angular/core';
import { User } from './user.class';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppService } from './app.service';
import {
  switchMap,
  debounceTime,
  tap,
  finalize,
  map,
  filter,
} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  filteredUsers: User[] = [];
  usersForm: FormGroup;
  isLoading = false;

  usersOption: Observable<User[]>;

  constructor(private fb: FormBuilder, private appService: AppService) {}

  ngOnInit() {
    this.usersForm = this.fb.group({
      userInput: null,
    });

    this.usersOption = this.usersForm.get('userInput').valueChanges.pipe(
      filter(() => !this.usersForm.pristine),
      debounceTime(300),
      // tap(() => (this.isLoading = true)),
      switchMap(
        (value) => this.filter(value) //.pipe(finalize(() => (this.isLoading = false)))
      )
      //map((users) => users.results)
    );
    //.subscribe((users) => (this.filteredUsers = users.results));

    this.usersForm.valueChanges.subscribe((data) =>
      console.log(`form value changed`, data)
    );
  }

  displayFn(user: User): string {
    console.log(`display fn `, user);
    if (user) {
      return user.name;
    }
  }

  onOpened(event) {
    console.log(`onOpened fn `, event);
  }
  onSelection(event: MatAutocompleteSelectedEvent) {
    // sync controls with value
    const value = event.option.value;
    // console.log(value);
    // if (this.autoTrigger.activeOption) {
    //   this.autoTrigger.activeOption.value = value;
    //   if (this.selectedValue) { this.selectedValue.setValue(value); }
    //   this.autoTrigger.writeValue(value);

    //   this.valueChange.emit(value); //fix grid update value
    // }
  }

  onMouseDown(event: Event) {
    // Prevent the grid from losing focus when an resource is selected in the popup
    //event.preventDefault();
  }

  private filter(value: any): Observable<User[]> {
    console.log(`filter fctn input`, value);
    // if value is string, this is oki,
    // but if value is User... then we have a pb...
    // new user name takes value as name....
    return this.appService.search({ name: value }, 1).pipe(
      map((data) => data.results),
      tap((data) => {
        if (data.length === 0) {
          data.unshift(new User(-1, value));
        }
        console.log(`filter fctn outputing`, data);
      })
    );
  }
}
