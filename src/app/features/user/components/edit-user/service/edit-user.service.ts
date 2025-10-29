import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditUserService {

  private userId!: number;

  set userToEdit(userId) {
    this.userId = userId;
  }

  get userToEdit() {
    return this.userId;
  }
}
