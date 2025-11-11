import { Component, OnInit, inject, output } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { NavigationItem, NavigationItems } from '../navigation';

import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { SharedModule } from '../../../shared/shared.module'
import { AuthService } from '../../../../domain/services/auth/auth.service';

@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, NavCollapseComponent, NavGroupComponent, NavItemComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);

  navigations: NavigationItem[];
  wrapperWidth!: number;
  windowWidth: number;

  NavMobCollapse = output();
  constructor(private authService: AuthService) {
    this.windowWidth = window.innerWidth;
    this.navigations = this.filterNavigationByRole(NavigationItems);
  }

  ngOnInit() {
    if (this.windowWidth < 992) {
      document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
    }
  }

  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      this.NavMobCollapse.emit();
    }
  }

  private filterNavigationByRole(items: NavigationItem[]): NavigationItem[] {
    return items
      .map(item => {
        if (item.roles && item.roles.length > 0) {
          if (!this.authService.hasRole(item.roles)) {
            return null; 
          }
        }
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterNavigationByRole(item.children);
          if (filteredChildren.length === 0) {
            return null;
          }
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(item => item !== null) as NavigationItem[];
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}
