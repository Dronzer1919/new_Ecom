import { Routes } from '@angular/router';
import { AddToCartComponent } from './users/user/products/add-to-cart/add-to-cart.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { AddProductComponent } from './users/admin/productManagement/add-product/add-product.component';
import { EditProductComponent } from './users/admin/productManagement/edit-product/edit-product.component';
import { LiveLocationTrackerComponent } from './shared/components/live-location-tracker/live-location-tracker.component';
import { HomeComponent } from './users/user/products/home/home.component';
import { AddUserComponent } from './users/admin/userManagement/add-user/add-user.component';
import { AdminLoginComponent } from './users/admin/userManagement/admin-login/admin-login.component';
// import { AddBannerComponent } from './users/user/products/add-banner/add-banner.component';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'home',
        redirectTo: ''
    },
    {
        path: 'home-full',
        component: HomeComponent // Full home component available at /home-full
    },
    {
        path: 'login',
        loadComponent : () => import('./users/user/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent : () => import('./users/user/auth/sign-in/sign-in.component').then(m => m.SignInComponent)
    },
    {
        path: 'wishlist',
        loadComponent : () => import('./users/user/products/wishlist/wishlist.component').then(m => m.WishlistComponent)
    },
    {
        path: 'productCategory/:id',
        loadComponent: () => import('./users/user/products/product-list/product-list.component').then(m => m.ProductListComponent)
    },
    {
        path: 'productDetails/:id',
        loadComponent: () => import('./users/user/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
    },
    // Enhanced e-commerce routes
    {
        path: 'product/:id',
        loadComponent: () => import('./users/user/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./users/user/products/product-list/product-list.component').then(m => m.ProductListComponent)
    },
    {
        path: 'products/:category',
        loadComponent: () => import('./users/user/products/product-list/product-list.component').then(m => m.ProductListComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
    },
    {
        path: 'checkout',
        loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'orders',
        loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'offers',
        loadComponent: () => import('./components/offers/offers.component').then(m => m.OffersComponent)
    },
    // Legacy routes (keeping for compatibility)
    {
        path: 'addToCart/:id',
        component: AddToCartComponent
    },
    {
        path: 'addProduct',
        component: AddProductComponent,
    },
    {
        path: 'editproduct',
        component: EditProductComponent,
    },
    {
        path: 'liveTracking',
        component: LiveLocationTrackerComponent,
    },

    //user management
    {
        path: 'userManagement',
        component: AddUserComponent
    },

    {
        path: 'admin-login',
        component: AdminLoginComponent
    },

    {
        path: 'dashboard',
        loadComponent: () => import('./../app/users/admin/dashboard/dashboard/dashboard.component').then(m=> m.DashboardComponent)
    },
    {
        path: 'sample-dashboard',
        loadComponent: () => import('./sample-dashboard/sample-dashboard.component').then(m => m.SampleDashboardComponent)
    },
    {
        path: 'product-map',
        loadComponent: () => import('./product-map/product-map.component').then(m => m.ProductMapComponent)
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
    },
    {
        path: '**',
        component: PageNotFoundComponent
    },


];
