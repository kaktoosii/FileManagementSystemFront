import { Injectable } from "@angular/core";
import { Semaphore } from "./semaphore";
@Injectable({
  providedIn: "root",
})
export class LoadingBarService {
  private _isLoading: boolean;
  mutex = new Semaphore(1);
  loading_counter = 0;
  constructor() {
    this._isLoading = false;
  }
  public get isLoading(): boolean {
    return this._isLoading;
  }
  public async show() {
    if (this.loading_counter > 0) {
      this.loading_counter++;
      return;
    }
    this.loading_counter++;
    await this.mutex.wait();
    this._isLoading = true;
    this.mutex.signal();
  }
  public async hide() {
    if (this.loading_counter > 1) {
      this.loading_counter--;
      return;
    }
    this.loading_counter--;
    await this.mutex.wait();
    this._isLoading = false;
    this.mutex.signal();
  }
}
