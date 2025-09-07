import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { PaymentService, ShippingAddress, PaymentDetails, OrderSummary } from '../../services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  cartSummary$: Observable<CartSummary>;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  };

  // Forms
  addressForm!: FormGroup;
  paymentForm!: FormGroup;

  // State
  currentStep: number = 1;
  loading: boolean = false;
  orderPlaced: boolean = false;
  savedAddresses: ShippingAddress[] = [];
  selectedAddressIndex: number = -1;
  showAddressForm: boolean = false;
  paymentMethod: string = 'razorpay';
  orderSummary: OrderSummary | null = null;

  // Validation
  addressErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.cartSummary$ = this.cartService.cartSummary$;

  // Initialize forms using the method that defines controls matching the template
  this.initializeForms();
  }

  ngOnInit() {
    this.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });

    this.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });

    this.loadSavedAddresses();
  }

  initializeForms() {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      isDefault: [false]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['razorpay', Validators.required]
    });
  }

  loadSavedAddresses() {
    this.savedAddresses = this.paymentService.getSavedAddresses();
  }

  // Step Navigation
  nextStep() {
    if (this.currentStep === 1) {
      if (this.validateAddress()) {
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep + 1) {
      this.currentStep = step;
    }
  }

  // Address Management
  selectAddress(index: number) {
    this.selectedAddressIndex = index;
    const address = this.savedAddresses[index];
    this.addressForm.patchValue(address);
    this.showAddressForm = false;
  }

  addNewAddress() {
    this.selectedAddressIndex = -1;
    this.addressForm.reset();
    this.showAddressForm = true;
  }

  saveAddress() {
    if (this.addressForm.valid) {
      const address: ShippingAddress = this.addressForm.value;
      this.paymentService.saveAddress(address);
      this.loadSavedAddresses();
      this.selectedAddressIndex = 0;
      this.showAddressForm = false;
      this.toastr.success('Address saved successfully');
    }
  }

  validateAddress(): boolean {
    let selectedAddress: ShippingAddress;

    if (this.selectedAddressIndex >= 0) {
      selectedAddress = this.savedAddresses[this.selectedAddressIndex];
    } else if (this.addressForm.valid) {
      selectedAddress = this.addressForm.value;
    } else {
      this.toastr.error('Please provide a valid shipping address');
      return false;
    }

    const validation = this.paymentService.validateAddress(selectedAddress);
    this.addressErrors = validation.errors;

    if (!validation.isValid) {
      this.toastr.error('Please fix address errors');
      return false;
    }

    return true;
  }

  // Payment Processing
  async processPayment() {
    if (!this.validateAddress()) {
      return;
    }

    this.loading = true;

    try {
      const shippingAddress = this.selectedAddressIndex >= 0
        ? this.savedAddresses[this.selectedAddressIndex]
        : this.addressForm.value;

      if (this.paymentMethod === 'cod') {
        this.processCODPayment(shippingAddress);
      } else {
        await this.processOnlinePayment(shippingAddress);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.toastr.error('Payment processing failed. Please try again.');
      this.loading = false;
    }
  }

  private processCODPayment(shippingAddress: ShippingAddress) {
    this.paymentService.processCOD({
      items: this.cartItems,
      address: shippingAddress,
      total: this.cartSummary.total
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.createOrderSummary(response.orderId!, shippingAddress, 'Cash on Delivery', 'Pending');
          this.completeOrder();
        } else {
          this.toastr.error(response.message);
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Error processing cash on delivery order');
        this.loading = false;
      }
    });
  }

  private async processOnlinePayment(shippingAddress: ShippingAddress) {
    // Create order first
    const orderData = {
      amount: this.cartSummary.total,
      currency: 'INR',
      notes: {
        items: this.cartItems.length,
        customer: shippingAddress.fullName
      }
    };

    this.paymentService.createOrder(orderData).subscribe({
      next: async (orderResponse) => {
        if (orderResponse.success) {
          const paymentDetails: PaymentDetails = {
            amount: this.cartSummary.total,
            currency: 'INR',
            orderId: orderResponse.order.id,
            customerName: shippingAddress.fullName,
            customerEmail: 'customer@example.com', // You might want to collect this
            customerPhone: shippingAddress.phone,
            address: shippingAddress
          };

          const paymentObservable = await this.paymentService.initiatePayment(paymentDetails);
          paymentObservable.subscribe({
            next: (paymentResponse) => {
              if (paymentResponse.success) {
                // Verify payment
                this.paymentService.verifyPayment({
                  paymentId: paymentResponse.paymentId,
                  orderId: paymentResponse.orderId,
                  signature: paymentResponse.signature
                }).subscribe({
                  next: (verificationResponse) => {
                    if (verificationResponse.success) {
                      this.createOrderSummary(
                        paymentResponse.orderId!,
                        shippingAddress,
                        'Online Payment',
                        'Completed'
                      );
                      this.completeOrder();
                    } else {
                      this.toastr.error('Payment verification failed');
                    }
                    this.loading = false;
                  }
                });
              } else {
                this.toastr.error(paymentResponse.message);
                this.loading = false;
              }
            }
          });
        } else {
          this.toastr.error('Failed to create order');
          this.loading = false;
        }
      },
      error: () => {
        this.toastr.error('Error creating order');
        this.loading = false;
      }
    });
  }

  private createOrderSummary(orderId: string, shippingAddress: ShippingAddress, paymentMethod: string, paymentStatus: string) {
    this.orderSummary = {
      orderId,
      items: [...this.cartItems],
      subtotal: this.cartSummary.subtotal,
      discount: this.cartSummary.discount,
      tax: this.cartSummary.tax,
      shipping: this.cartSummary.shipping,
      total: this.cartSummary.total,
      paymentMethod,
      paymentStatus,
      shippingAddress,
      orderDate: new Date(),
      estimatedDelivery: this.paymentService.calculateDeliveryDate()
    };

    this.paymentService.saveOrderSummary(this.orderSummary);
  }

  private completeOrder() {
    this.cartService.clearCart();
    this.orderPlaced = true;
    this.currentStep = 4;
    this.toastr.success('Order placed successfully!');
  }

  // Helper Methods
  getSelectedAddress(): ShippingAddress | null {
    return this.selectedAddressIndex >= 0 ? this.savedAddresses[this.selectedAddressIndex] : null;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  getEstimatedDelivery(): string {
    const deliveryDate = this.paymentService.calculateDeliveryDate();
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  viewOrderDetails() {
    this.router.navigate(['/orders']);
  }

  // Form Getters
  get fullName() { return this.addressForm.get('fullName'); }
  get addressLine1() { return this.addressForm.get('addressLine1'); }
  get city() { return this.addressForm.get('city'); }
  get state() { return this.addressForm.get('state'); }
  get pincode() { return this.addressForm.get('pincode'); }
  get phone() { return this.addressForm.get('phone'); }
}
