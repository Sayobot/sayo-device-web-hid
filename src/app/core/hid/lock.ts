
class O2Lock implements O2Lock {
  private _key;
  private _logEnable = false;
  private _lock = false;
  private _counter = 0;

  constructor(key: string) {
    this._key = key;
  }

  setLogEnable(ok: boolean) {
    this._logEnable = ok;
  }

  isLock() {
    return this._lock;
  }

  unlock() {
    this._lock = false;
    this._counter++;
    if (this._logEnable) {
      console.log(`${this._key} Unlock.`);
    }

    return this._lock;
  }

  lock() {
    this._lock = true;
    this._counter++;
    if (this._logEnable) {
      console.log(`${this._key} Lock.`);
    }

    return this._lock;
  }

  counter() {
    console.log(this._counter);
    return this._counter;
  }
}

export const lockFactory = (key: string) => new O2Lock(key);

