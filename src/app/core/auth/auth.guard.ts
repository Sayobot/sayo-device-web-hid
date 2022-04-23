import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private _auth: AuthService) {}

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): true | UrlTree {
    return this._auth.isLogin() ? true : this.router.parseUrl('/device');
  }
}
