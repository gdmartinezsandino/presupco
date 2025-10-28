import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, OnInit, signal, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, Subject, takeUntil } from 'rxjs';

import {
  HeaderComponent,
  ToastComponent,
  LoaderComponent,
  ActionSheetComponent,
  ModalComponent,
  FooterComponent,
} from '@shared/components';
import * as fromServicesShared from '@shared/services';

@Component({
  selector: 'p-co-layout',
  styleUrls: ['./layout.component.scss'],
  templateUrl: './layout.component.html',
  imports: [
    CommonModule,
    RouterOutlet,
    LoaderComponent,
    ToastComponent,
    ActionSheetComponent,
    ModalComponent,
    HeaderComponent,
    FooterComponent, 
],
  providers: [
    fromServicesShared.UtilsService,
  ],
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _utilsService = inject(fromServicesShared.UtilsService);
  // private _storageService = inject(fromServicesShared.StorageService);
  private destroy$ = new Subject<void>();

  @ViewChild(LoaderComponent) loader!: LoaderComponent;
  @ViewChild(ToastComponent) toast!: ToastComponent;
  @ViewChild(ModalComponent) modal!: ModalComponent;
  @ViewChild(ActionSheetComponent) actionSheet!: ActionSheetComponent;

  public showBackButton = signal<boolean>(false);
  public showHeader = signal<boolean>(false);
  public showFooter = signal<boolean>(false);
  public bgLayout = signal<string>('');
  public title = signal<string>('');
  public subtitle = signal<string>('');
  public previousUrl = signal<string>('');
  public currentUrl = signal<string>('');

  public layoutClasses = computed(() => ({
    'p-co--bg-auth': this.bgLayout() === 'auth',
    'p-co--bg-gray': this.bgLayout() === 'gray',
    'p-co--bg-green': this.bgLayout() === 'green',
  }));

  public shouldShowFloatingButton = computed(() => {
    return this.showFooter() && !this.currentUrl().includes('/ai-scan');
  });

  constructor() { }

  ngOnInit(): void {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => {
          if (this.previousUrl()) {
            // store the previous url 
          }
          this.previousUrl.set(event.urlAfterRedirects);
          this.currentUrl.set(event.urlAfterRedirects);

          let currentRoute = this._route;
          while (currentRoute.firstChild) {
            currentRoute = currentRoute.firstChild;
          }
          return currentRoute;
        }),
        map((route) => route.snapshot.data),
        takeUntil(this.destroy$)
      )
      .subscribe(async (_data) => {
        // get params from the route
      });
  }

  ngAfterViewInit(): void {
    this._utilsService.registerLoader(this.loader);
    this._utilsService.registerToast(this.toast);
    this._utilsService.registerModal(this.modal);
    this._utilsService.registerActionSheet(this.actionSheet);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
