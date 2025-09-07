import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';

declare var Razorpay: any;

export interface PaymentDetails {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: ShippingAddress;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  message: string;
}

export interface OrderSummary {
  orderId: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  orderDate: Date;
  estimatedDelivery: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private currentOrder = new BehaviorSubject<OrderSummary | null>(null);
  currentOrder$ = this.currentOrder.asObservable();

  private razorpayLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadRazorpayScript();
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve(false);
        return;
      }

      if (this.razorpayLoaded) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  async initiatePayment(paymentDetails: PaymentDetails): Promise<Observable<PaymentResult>> {
    return new Observable(observer => {
      this.loadRazorpayScript().then(loaded => {
        if (!loaded) {
          observer.next({
            success: false,
            error: 'Payment gateway failed to load',
            message: 'Unable to load payment gateway. Please try again.'
          });
          observer.complete();
          return;
        }

        const options = {
          key: 'rzp_test_9YdCiSgIr8jWvW', // Demo key - replace with your actual key
          amount: paymentDetails.amount * 100, // Razorpay expects amount in paise
          currency: paymentDetails.currency,
          name: 'FurniCraft',
          description: 'Purchase from FurniCraft',
          order_id: paymentDetails.orderId,
          image: '/assets/logo.png',
          prefill: {
            name: paymentDetails.customerName,
            email: paymentDetails.customerEmail,
            contact: paymentDetails.customerPhone
          },
          notes: {
            address: `${paymentDetails.address.addressLine1}, ${paymentDetails.address.city}, ${paymentDetails.address.state} - ${paymentDetails.address.pincode}`
          },
          theme: {
            color: '#8B4513'
          },
          handler: (response: any) => {
            // Payment successful
            observer.next({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              message: 'Payment completed successfully!'
            });
            observer.complete();
          },
          modal: {
            ondismiss: () => {
              observer.next({
                success: false,
                error: 'Payment cancelled',
                message: 'Payment was cancelled by user'
              });
              observer.complete();
            }
          }
        };

        const rzp = new Razorpay(options);

        rzp.on('payment.failed', (response: any) => {
          observer.next({
            success: false,
            error: response.error.description,
            message: 'Payment failed. Please try again.'
          });
          observer.complete();
        });

        rzp.open();
      });
    });
  }

  // Create order (simulate backend API call)
  createOrder(orderData: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const orderId = 'ORD' + Date.now();
        const order = {
          id: orderId,
          amount: orderData.amount,
          currency: 'INR',
          status: 'created',
          receipt: `receipt_${orderId}`,
          notes: orderData.notes || {}
        };

        observer.next({
          success: true,
          order: order,
          message: 'Order created successfully'
        });
        observer.complete();
      }, 1000);
    });
  }

  // Verify payment (simulate backend verification)
  verifyPayment(paymentData: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        // In real scenario, this would verify the signature with Razorpay
        const isValid = paymentData.paymentId && paymentData.orderId;

        observer.next({
          success: isValid,
          verified: isValid,
          message: isValid ? 'Payment verified successfully' : 'Payment verification failed'
        });
        observer.complete();
      }, 1500);
    });
  }

  // Process cash on delivery
  processCOD(orderData: any): Observable<PaymentResult> {
    return new Observable(observer => {
      setTimeout(() => {
        const orderId = 'COD' + Date.now();
        observer.next({
          success: true,
          orderId: orderId,
          message: 'Order placed successfully! You can pay on delivery.'
        });
        observer.complete();
      }, 1000);
    });
  }

  // Save order summary
  saveOrderSummary(orderSummary: OrderSummary): void {
    this.currentOrder.next(orderSummary);

    // Save to localStorage for order history
    if (isPlatformBrowser(this.platformId)) {
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      existingOrders.unshift(orderSummary);
      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
    }
  }

  // Get order history
  getOrderHistory(): OrderSummary[] {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }
    return [];
  }

  // Calculate estimated delivery date
  calculateDeliveryDate(shippingType: 'standard' | 'express' = 'standard'): Date {
    const deliveryDate = new Date();
    const daysToAdd = shippingType === 'express' ? 2 : 5;
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    return deliveryDate;
  }

  // Validate shipping address
  validateAddress(address: ShippingAddress): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.fullName || address.fullName.trim().length < 2) {
      errors.push('Please enter a valid full name');
    }

    if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
      errors.push('Please enter a valid address');
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.push('Please enter a valid city');
    }

    if (!address.state || address.state.trim().length < 2) {
      errors.push('Please enter a valid state');
    }

    if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
      errors.push('Please enter a valid 6-digit pincode');
    }

    if (!address.phone || !/^\d{10}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid 10-digit phone number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get saved addresses
  getSavedAddresses(): ShippingAddress[] {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(localStorage.getItem('savedAddresses') || '[]');
    }
    return [];
  }

  // Save address
  saveAddress(address: ShippingAddress): void {
    const addresses = this.getSavedAddresses();

    // If this is set as default, remove default from others
    if (address.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    addresses.unshift(address);

    // Limit to 5 saved addresses
    if (addresses.length > 5) {
      addresses.pop();
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('savedAddresses', JSON.stringify(addresses));
    }
  }

  // Clear current order
  clearCurrentOrder(): void {
    this.currentOrder.next(null);
  }
}
