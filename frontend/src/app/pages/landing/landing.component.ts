import {
  Component,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./landing.component.css'],
  template: `
    <!-- NAV -->
    <nav class="nav" [class.scrolled]="navScrolled" [class.menu-open]="mobileMenuOpen">
      <div class="container nav-inner">
        <a routerLink="/" class="logo" aria-label="PayLite home">
          <span class="logo-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="2" rx="1" fill="white"/>
              <rect x="2" y="8" width="14" height="2" rx="1" fill="white"/>
              <rect x="2" y="13" width="9" height="2" rx="1" fill="white"/>
              <circle cx="13.5" cy="14" r="1.4" fill="#185FA5"/>
            </svg>
          </span>
          <span class="logo-text"><span class="pay">Pay</span><span class="lite">Lite</span></span>
        </a>

        <div class="nav-links">
          <a (click)="scrollTo('features')">Features</a>
          <a (click)="scrollTo('pricing')">Pricing</a>
          <a (click)="scrollTo('how')">How it works</a>
          <a (click)="scrollTo('industries')">For Schools</a>
          <a (click)="scrollTo('industries')">For Clinics</a>
        </div>

        <div class="nav-cta">
          <a routerLink="/login" class="btn btn-ghost">Login</a>
          <a routerLink="/login" class="btn btn-primary">Start free</a>
        </div>

        <button class="hamburger" [class.open]="mobileMenuOpen" (click)="toggleMobileMenu()"
          aria-label="Open menu" [attr.aria-expanded]="mobileMenuOpen">
          <span></span>
        </button>
      </div>

      <div class="mobile-menu">
        <a (click)="closeMobileMenu(); scrollTo('features')">Features</a>
        <a (click)="closeMobileMenu(); scrollTo('pricing')">Pricing</a>
        <a (click)="closeMobileMenu(); scrollTo('how')">How it works</a>
        <a (click)="closeMobileMenu(); scrollTo('industries')">For Schools</a>
        <a (click)="closeMobileMenu(); scrollTo('industries')">For Clinics</a>
        <div class="mobile-cta">
          <a routerLink="/login" class="btn btn-outline" (click)="closeMobileMenu()">Login</a>
          <a routerLink="/login" class="btn btn-primary" (click)="closeMobileMenu()">Start free</a>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="reveal">
          <span class="pill"><span class="spark">✦</span> Now with QR attendance check-in</span>
        </div>
        <h1 class="h1 reveal" data-stagger="1">
          Payroll and attendance<br/>
          for small teams.<br/>
          <span class="blue">Done</span> in one tap.
        </h1>
        <p class="hero-sub reveal" data-stagger="2">
          PayLite handles QR check-in, shift tracking, overtime, bonuses, PF, ESI and payslips — automatically.
          Built for MSMEs, schools, hospitals and clinics under 30 employees.
        </p>
        <div class="cta-row reveal" data-stagger="3">
          <a routerLink="/login" class="btn btn-primary btn-lg">Start free — no card needed</a>
          <a (click)="scrollTo('how')" class="btn-link">See how it works →</a>
        </div>
        <div class="social-bar reveal" data-stagger="4">
          <span>500+ businesses</span>
          <span class="dot"></span>
          <span>14 countries</span>
          <span class="dot"></span>
          <span>₹0 to get started</span>
        </div>

        <div class="mockup-wrap reveal" data-stagger="5">
          <div class="phone" aria-hidden="true">
            <div class="phone-screen">
              <div class="phone-header">
                <div>
                  <h4>Payroll</h4>
                  <span>April 2026 · 8 employees</span>
                </div>
                <div class="dots"><i></i><i></i><i></i></div>
              </div>
              <div class="metrics">
                <div class="metric">
                  <div class="label">Total payout</div>
                  <div class="value">₹3.42L</div>
                </div>
                <div class="metric ok">
                  <div class="label">Processed</div>
                  <div class="value">6</div>
                </div>
                <div class="metric warn">
                  <div class="label">Pending</div>
                  <div class="value">2</div>
                </div>
                <div class="metric flag">
                  <div class="label">Flagged</div>
                  <div class="value">1</div>
                </div>
              </div>
              <div class="emp-list">
                <div class="emp">
                  <div class="av" style="background:#185FA5">PM</div>
                  <div class="info">
                    <div class="name">Priya Menon</div>
                    <div class="role">Senior Teacher</div>
                  </div>
                  <div>
                    <div class="pay">₹48,200</div>
                    <span class="status status-paid">Paid</span>
                  </div>
                </div>
                <div class="emp">
                  <div class="av" style="background:#3B6D11">RK</div>
                  <div class="info">
                    <div class="name">Rajesh Kumar</div>
                    <div class="role">Floor Supervisor</div>
                  </div>
                  <div>
                    <div class="pay">₹32,500</div>
                    <span class="status status-pending">Pending</span>
                  </div>
                </div>
                <div class="emp">
                  <div class="av" style="background:#854F0B">AS</div>
                  <div class="info">
                    <div class="name">Anita Sharma</div>
                    <div class="role">Reception</div>
                  </div>
                  <div>
                    <div class="pay">₹24,800</div>
                    <span class="status status-flag">Review</span>
                  </div>
                </div>
              </div>
              <button class="run-btn">⚡ Run all payroll</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- LOGOS BAND -->
    <section class="logos-band">
      <div class="container">
        <div class="logos-label reveal">Trusted by teams across India</div>
        <div class="logos-row reveal" data-stagger="1">
          <span class="lg">Sunrise Clinic</span>
          <span class="lg">Greenfield School</span>
          <span class="lg">Apex Manufacturing</span>
          <span class="lg">CareFirst Hospital</span>
          <span class="lg">Nova Diagnostics</span>
        </div>
      </div>
    </section>

    <!-- PROBLEM / SOLUTION -->
    <section class="section ps">
      <div class="container">
        <div class="ps-grid">
          <div class="ps-col reveal">
            <div class="ps-label bad">The old way</div>
            <h2>Manual payroll<br/>is costing you<br/>more than time.</h2>
            <ul class="ps-list" style="margin-top:28px">
              <li class="ps-item"><span class="ps-icon bad">✕</span>Hours spent on salary calculations every month</li>
              <li class="ps-item"><span class="ps-icon bad">✕</span>Attendance disputes with no proof</li>
              <li class="ps-item"><span class="ps-icon bad">✕</span>Overtime miscalculated manually</li>
              <li class="ps-item"><span class="ps-icon bad">✕</span>Payslips shared days late or not at all</li>
              <li class="ps-item"><span class="ps-icon bad">✕</span>PF and ESI errors causing legal risk</li>
              <li class="ps-item"><span class="ps-icon bad">✕</span>No record of who came in and when</li>
            </ul>
          </div>
          <div class="ps-col reveal" data-stagger="1">
            <div class="ps-label good">The PayLite way</div>
            <h2>Everything calculated.<br/>Everything recorded.<br/>One tap.</h2>
            <ul class="ps-list" style="margin-top:28px">
              <li class="ps-item"><span class="ps-icon good">✓</span>QR check-in logs attendance automatically</li>
              <li class="ps-item"><span class="ps-icon good">✓</span>Shifts, overtime and late arrivals tracked</li>
              <li class="ps-item"><span class="ps-icon good">✓</span>Payroll calculated in under 30 seconds</li>
              <li class="ps-item"><span class="ps-icon good">✓</span>Payslips sent via WhatsApp instantly</li>
              <li class="ps-item"><span class="ps-icon good">✓</span>PF and ESI calculated to the rupee</li>
              <li class="ps-item"><span class="ps-icon good">✓</span>Full audit trail for every employee</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section features" id="features">
      <div class="container">
        <div class="section-head reveal">
          <div class="section-label">Features</div>
          <h2>Everything a small team needs.<br/>Nothing they don't.</h2>
        </div>
        <div class="feat-grid">
          <div class="feat-card reveal" data-stagger="1">
            <div class="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="2.5" y="2.5" width="6" height="6" rx="1"/><rect x="11.5" y="2.5" width="6" height="6" rx="1"/>
                <rect x="2.5" y="11.5" width="6" height="6" rx="1"/><rect x="13" y="13" width="2" height="2" fill="currentColor"/>
                <rect x="16" y="16" width="1.5" height="1.5" fill="currentColor"/><rect x="11.5" y="16" width="1.5" height="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h3>QR Check-in</h3>
            <p>Employees scan once at the door. Attendance logged automatically, no manual entry ever.</p>
          </div>
          <div class="feat-card reveal" data-stagger="2">
            <div class="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="3.5" y="2" width="13" height="16" rx="2"/>
                <rect x="6" y="5" width="8" height="3" rx="0.5" fill="currentColor" opacity=".15"/>
                <circle cx="7" cy="11" r=".7" fill="currentColor"/><circle cx="10" cy="11" r=".7" fill="currentColor"/>
                <circle cx="13" cy="11" r=".7" fill="currentColor"/><circle cx="7" cy="14" r=".7" fill="currentColor"/>
                <circle cx="10" cy="14" r=".7" fill="currentColor"/><circle cx="13" cy="14" r=".7" fill="currentColor"/>
              </svg>
            </div>
            <h3>One-tap payroll</h3>
            <p>Every variable calculated — overtime, bonuses, PF, ESI, deductions. Run your entire team in 30 seconds.</p>
          </div>
          <div class="feat-card reveal" data-stagger="3">
            <div class="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="10" cy="10" r="7.5"/>
                <path d="M10 5.5V10l3 2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Shift tracking</h3>
            <p>Define morning and evening shifts. Late arrivals flagged. Overtime calculated to the minute.</p>
          </div>
          <div class="feat-card reveal" data-stagger="1">
            <div class="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M5 2h7l3 3v13H5z" stroke-linejoin="round"/>
                <path d="M12 2v3h3" stroke-linejoin="round"/>
                <line x1="7.5" y1="9.5" x2="12.5" y2="9.5" stroke-linecap="round"/>
                <line x1="7.5" y1="12.5" x2="12.5" y2="12.5" stroke-linecap="round"/>
                <line x1="7.5" y1="15.5" x2="10.5" y2="15.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>WhatsApp payslips</h3>
            <p>Professional payslips generated and sent to each employee on WhatsApp the moment you're done.</p>
          </div>
          <div class="feat-card reveal" data-stagger="2">
            <div class="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="2.5" y="4" width="15" height="13" rx="1.5"/>
                <line x1="2.5" y1="8" x2="17.5" y2="8"/>
                <line x1="6.5" y1="2.5" x2="6.5" y2="5.5" stroke-linecap="round"/>
                <line x1="13.5" y1="2.5" x2="13.5" y2="5.5" stroke-linecap="round"/>
                <rect x="9" y="10.5" width="2.5" height="2.5" rx=".4" fill="currentColor"/>
              </svg>
            </div>
            <h3>Leave management</h3>
            <p>Employees request leave via link. You approve. Payroll adjusts automatically. No spreadsheet.</p>
          </div>
          <div class="feat-card reveal" data-stagger="3">
            <div class="feat-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M10 2.5l6.5 2.5v5c0 4-3 7-6.5 8-3.5-1-6.5-4-6.5-8V5z" stroke-linejoin="round"/>
                <path d="M7.5 10l1.8 1.8 3.5-3.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Full audit trail</h3>
            <p>Every check-in timestamped. Every payroll recorded. Dispute-proof and compliance-ready.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section how" id="how">
      <div class="container">
        <div class="section-head reveal">
          <div class="section-label">How it works</div>
          <h2>Set up in minutes.<br/>Run payroll in seconds.</h2>
        </div>
        <div class="steps">
          <div class="step reveal" data-stagger="1">
            <div class="num">01</div>
            <div class="step-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="9" cy="7.5" r="3.5"/>
                <path d="M3 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke-linecap="round"/>
                <line x1="17" y1="5" x2="17" y2="11" stroke-linecap="round"/>
                <line x1="14" y1="8" x2="20" y2="8" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Add your team</h3>
            <p>Enter employee details, set their shift, salary, and PF/ESI status once.</p>
          </div>
          <div class="step reveal" data-stagger="2">
            <div class="num">02</div>
            <div class="step-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="13" y="3" width="6" height="6" rx="1"/>
                <rect x="3" y="13" width="6" height="6" rx="1"/>
                <rect x="14.5" y="14.5" width="2" height="2" fill="currentColor"/>
                <rect x="17.5" y="17.5" width="1.5" height="1.5" fill="currentColor"/>
                <rect x="13" y="17.5" width="1.5" height="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h3>Attendance runs itself</h3>
            <p>Print the QR code. Stick it at your entrance. Employees scan in and out every day.</p>
          </div>
          <div class="step reveal" data-stagger="3">
            <div class="num">03</div>
            <div class="step-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M12 2L4 13h6l-1 7 8-11h-6z"/>
              </svg>
            </div>
            <h3>Tap to run payroll</h3>
            <p>On any day of the month, open PayLite and tap once. Every salary calculated and payslips sent automatically.</p>
          </div>
        </div>
        <div class="how-cta reveal">
          <div class="how-cta-text">Ready to try it?</div>
          <a routerLink="/login" class="btn btn-primary btn-lg">Start free — takes 3 minutes</a>
        </div>
      </div>
    </section>

    <!-- INDUSTRIES -->
    <section class="section industries" id="industries">
      <div class="container">
        <div class="section-head reveal">
          <h2>Built for your industry</h2>
          <p>Same powerful engine. Configured for how your team actually works.</p>
        </div>
        <div class="ind-grid">
          <div class="ind-card reveal" data-stagger="1">
            <div class="ind-accent"></div>
            <div class="ind-body">
              <div class="ind-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                  <path d="M11 4L1.5 8.5 11 13l9.5-4.5z"/>
                  <path d="M5 10.5v4.5c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>
                  <line x1="20.5" y1="8.5" x2="20.5" y2="14" stroke-linecap="round"/>
                </svg>
              </div>
              <h3>Schools &amp; Institutes</h3>
              <ul class="ind-points">
                <li>Teacher shift management</li>
                <li>Mid-month joining support</li>
                <li>Leave and substitution tracking</li>
                <li>Automated salary for teaching staff</li>
              </ul>
              <a href="#" class="ind-link">PayLite for Schools →</a>
            </div>
          </div>
          <div class="ind-card featured reveal" data-stagger="2">
            <div class="ind-accent"></div>
            <div class="ind-body">
              <span class="badge">Most popular</span>
              <div class="ind-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="8" y="2.5" width="6" height="17" rx="1" fill="currentColor"/>
                  <rect x="2.5" y="8" width="17" height="6" rx="1" fill="currentColor"/>
                </svg>
              </div>
              <h3>Hospitals &amp; Clinics</h3>
              <ul class="ind-points">
                <li>Morning and evening shift support</li>
                <li>Nurse and doctor roster tracking</li>
                <li>Overtime for on-call hours</li>
                <li>Compliance-ready payslips</li>
              </ul>
              <a href="#" class="ind-link">PayLite for Healthcare →</a>
            </div>
          </div>
          <div class="ind-card reveal" data-stagger="3">
            <div class="ind-accent"></div>
            <div class="ind-body">
              <div class="ind-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                  <path d="M2.5 19V8l6-3v3l6-3v3l4.5-2v14z"/>
                  <line x1="6" y1="14" x2="6" y2="16" stroke-linecap="round"/>
                  <line x1="10.5" y1="14" x2="10.5" y2="16" stroke-linecap="round"/>
                  <line x1="15" y1="14" x2="15" y2="16" stroke-linecap="round"/>
                </svg>
              </div>
              <h3>MSMEs &amp; Small Business</h3>
              <ul class="ind-points">
                <li>Factory floor shift tracking</li>
                <li>Contract and daily wage support</li>
                <li>Festival bonus management</li>
                <li>PF and ESI auto-calculation</li>
              </ul>
              <a href="#" class="ind-link">PayLite for Business →</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="section pricing" id="pricing">
      <div class="container">
        <div class="section-head reveal">
          <div class="section-label">Pricing</div>
          <h2>Simple pricing.<br/>No hidden fees. Ever.</h2>
          <p>Pay per employee. Scale as your team grows.</p>
        </div>
        <div class="toggle-row reveal">
          <div class="billing-toggle" #billingToggle role="tablist">
            <span class="slider" [style.width]="sliderWidth" [style.transform]="sliderTransform"></span>
            <button [class.active]="billingMode==='monthly'" (click)="setBilling('monthly')"
              role="tab" [attr.aria-selected]="billingMode==='monthly'">Monthly</button>
            <button [class.active]="billingMode==='annual'" (click)="setBilling('annual')"
              role="tab" [attr.aria-selected]="billingMode==='annual'">
              Annual <span class="save-pill">Save 20%</span>
            </button>
          </div>
        </div>
        <div class="price-grid">
          <div class="price-card reveal" data-stagger="1">
            <div class="price-name">Starter</div>
            <div class="price-row">
              <span class="price-amt" [class.price-flip]="priceFlipping">{{ getPrice('₹99','₹79') }}</span>
              <span class="price-per">/employee/mo</span>
            </div>
            <div class="price-desc">For small teams getting started</div>
            <div class="price-limit">Up to 10 employees</div>
            <ul class="price-features">
              <li class="price-feat"><span class="check">✓</span>Manual attendance entry</li>
              <li class="price-feat"><span class="check">✓</span>One-tap payroll</li>
              <li class="price-feat"><span class="check">✓</span>PF and ESI calculation</li>
              <li class="price-feat"><span class="check">✓</span>WhatsApp payslips</li>
              <li class="price-feat"><span class="check">✓</span>Basic reporting</li>
              <li class="price-feat disabled"><span class="x">✕</span>QR attendance</li>
              <li class="price-feat disabled"><span class="x">✕</span>Shift management</li>
              <li class="price-feat disabled"><span class="x">✕</span>Leave management</li>
            </ul>
            <div class="price-cta"><a routerLink="/login" class="btn btn-outline">Start free</a></div>
          </div>
          <div class="price-card feat reveal" data-stagger="2">
            <span class="price-pop-badge">Most popular</span>
            <div class="price-name">Professional</div>
            <div class="price-row">
              <span class="price-amt" [class.price-flip]="priceFlipping">{{ getPrice('₹149','₹119') }}</span>
              <span class="price-per">/employee/mo</span>
            </div>
            <div class="price-desc">For growing teams under 30</div>
            <div class="price-limit">Up to 30 employees</div>
            <ul class="price-features">
              <li class="price-feat"><span class="check">✓</span>Everything in Starter</li>
              <li class="price-feat"><span class="check">✓</span>QR check-in attendance</li>
              <li class="price-feat"><span class="check">✓</span>Shift and late tracking</li>
              <li class="price-feat"><span class="check">✓</span>Leave management</li>
              <li class="price-feat"><span class="check">✓</span>Full audit trail</li>
              <li class="price-feat"><span class="check">✓</span>Priority support</li>
            </ul>
            <div class="price-cta"><a routerLink="/login" class="btn btn-white">Start free</a></div>
          </div>
          <div class="price-card reveal" data-stagger="3">
            <div class="price-name">Scale</div>
            <div class="price-row">
              <span class="price-amt" [class.price-flip]="priceFlipping">{{ getPrice('₹199','₹159') }}</span>
              <span class="price-per">/employee/mo</span>
            </div>
            <div class="price-desc">For multi-location operations</div>
            <div class="price-limit">Up to 75 employees</div>
            <ul class="price-features">
              <li class="price-feat"><span class="check">✓</span>Everything in Professional</li>
              <li class="price-feat"><span class="check">✓</span>Geo-fence attendance</li>
              <li class="price-feat"><span class="check">✓</span>Multi-admin access</li>
              <li class="price-feat"><span class="check">✓</span>Compliance document export</li>
              <li class="price-feat"><span class="check">✓</span>API access</li>
              <li class="price-feat"><span class="check">✓</span>Dedicated onboarding</li>
            </ul>
            <div class="price-cta"><a routerLink="/login" class="btn btn-outline">Contact us</a></div>
          </div>
        </div>
        <div class="price-foot reveal">All plans include a 14-day free trial. No credit card required.</div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="section test">
      <div class="container">
        <div class="section-head reveal">
          <h2>Trusted by teams who had<br/>better things to do.</h2>
        </div>
        <div class="test-grid">
          <div class="test-card reveal" data-stagger="1">
            <span class="test-quote-mark">"</span>
            <div class="stars">★★★★★</div>
            <p class="test-q">We used to spend every month-end evening doing payroll. Now it takes 2 minutes. Our staff get payslips on WhatsApp before they reach home.</p>
            <div class="test-by">
              <div class="test-av" style="background:#185FA5">PM</div>
              <div>
                <div class="name">Priya Menon</div>
                <div class="role">Principal, Greenfield Academy</div>
              </div>
            </div>
          </div>
          <div class="test-card reveal" data-stagger="2">
            <span class="test-quote-mark">"</span>
            <div class="stars">★★★★★</div>
            <p class="test-q">The QR attendance alone was worth it. No more arguments about who came in which day. Everything is recorded.</p>
            <div class="test-by">
              <div class="test-av" style="background:#3B6D11">RK</div>
              <div>
                <div class="name">Dr. Rajesh Khanna</div>
                <div class="role">Director, CareFirst Clinic</div>
              </div>
            </div>
          </div>
          <div class="test-card reveal" data-stagger="3">
            <span class="test-quote-mark">"</span>
            <div class="stars">★★★★★</div>
            <p class="test-q">I run a 12-person manufacturing unit. PayLite handles shifts, overtime and festival bonuses automatically. My CA loves the payslip format.</p>
            <div class="test-by">
              <div class="test-av" style="background:#854F0B">SP</div>
              <div>
                <div class="name">Suresh Patil</div>
                <div class="role">Owner, Apex Industries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section faq">
      <div class="container">
        <div class="section-head reveal">
          <h2>Questions we get a lot.</h2>
        </div>
        <div class="faq-list">
          <div class="faq-item reveal" *ngFor="let faq of faqs; let i = index" [class.open]="openFaqIndex === i">
            <button class="faq-q" (click)="toggleFaq(i)" [attr.aria-expanded]="openFaqIndex === i">
              <span>{{ faq.q }}</span>
              <span class="faq-icon" aria-hidden="true"></span>
            </button>
            <div class="faq-a" [style.max-height]="openFaqIndex === i ? '300px' : '0'">
              <div class="faq-a-inner">{{ faq.a }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta">
      <div class="container final-cta-inner">
        <h2 class="reveal">Your team works hard.<br/>Payroll should not.</h2>
        <p class="sub reveal" data-stagger="1">Join 500+ businesses who run payroll in under 30 seconds every month.</p>
        <div class="final-cta-btns reveal" data-stagger="2">
          <a routerLink="/login" class="btn btn-white btn-lg">Start free today</a>
          <a routerLink="/login" class="btn btn-white-outline btn-lg">Book a demo</a>
        </div>
        <div class="final-cta-fine reveal" data-stagger="3">14-day free trial · No card needed · Setup in 3 minutes</div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer>
      <div class="container">
        <div class="foot-grid">
          <div class="foot-brand">
            <div class="logo">
              <span class="logo-mark" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="2" rx="1" fill="white"/>
                  <rect x="2" y="8" width="14" height="2" rx="1" fill="white"/>
                  <rect x="2" y="13" width="9" height="2" rx="1" fill="white"/>
                  <circle cx="13.5" cy="14" r="1.4" fill="#185FA5"/>
                </svg>
              </span>
              <span class="logo-text"><span class="pay">Pay</span><span class="lite">Lite</span></span>
            </div>
            <div class="foot-tagline">Payroll in one tap.</div>
            <div class="socials">
              <a href="#" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 2A1.5 1.5 0 1 0 3.5 5 1.5 1.5 0 0 0 3.5 2zM2 6h3v8H2V6zm5 0h2.9v1.1h.04C10.4 6.45 11.36 6 12.6 6 15.3 6 16 7.6 16 10.1V14h-3v-3.4c0-.84-.02-1.92-1.18-1.92-1.18 0-1.36.92-1.36 1.86V14H7V6z"/></svg>
              </a>
              <a href="#" aria-label="Twitter / X">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.7 2H14.9l-4.8 5.5L15.7 14H11.3L7.9 9.6 4 14H1.8l5.1-5.9L1.5 2H6l3.1 4.1L12.7 2zm-.8 10.6h1.2L4.2 3.3H3l8.9 9.3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <rect x="2" y="2" width="12" height="12" rx="3.5"/>
                  <circle cx="8" cy="8" r="3"/>
                  <circle cx="11.5" cy="4.5" r=".7" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
          <div class="foot-col">
            <h4>Product</h4>
            <ul>
              <li><a (click)="scrollTo('features')">Features</a></li>
              <li><a (click)="scrollTo('pricing')">Pricing</a></li>
              <li><a (click)="scrollTo('how')">How it works</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Roadmap</a></li>
            </ul>
          </div>
          <div class="foot-col">
            <h4>Industries</h4>
            <ul>
              <li><a href="#">For Schools</a></li>
              <li><a href="#">For Hospitals</a></li>
              <li><a href="#">For Clinics</a></li>
              <li><a href="#">For MSMEs</a></li>
              <li><a href="#">For Manufacturers</a></li>
            </ul>
          </div>
          <div class="foot-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <span>© 2026 PayLite. All rights reserved.</span>
          <span>Made with care for India's small businesses.</span>
        </div>
      </div>
    </footer>
  `,
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  navScrolled = false;
  mobileMenuOpen = false;
  billingMode: 'monthly' | 'annual' = 'monthly';
  openFaqIndex: number | null = null;
  priceFlipping = false;
  sliderWidth = '0px';
  sliderTransform = 'translateX(0px)';

  @ViewChild('billingToggle') billingToggleRef!: ElementRef;

  private revealObserver?: IntersectionObserver;

  faqs = [
    {
      q: 'Do employees need to download an app to use QR attendance?',
      a: 'No. Employees just scan the QR code with their phone camera or WhatsApp. A lightweight web page opens — no download needed.'
    },
    {
      q: 'How accurate is the payroll calculation?',
      a: 'PayLite calculates PF at 12% of basic, ESI at 0.75% for eligible employees, overtime at 1.5× hourly rate, and unpaid leave as daily salary deductions — all per current Indian labour regulations.'
    },
    {
      q: 'Can I use PayLite for shift-based staff?',
      a: 'Yes. Define morning and evening shifts per employee. PayLite tracks check-in times, flags late arrivals, and calculates overtime automatically when shift hours are exceeded.'
    },
    {
      q: 'What happens if an employee forgets to check in?',
      a: 'The admin can manually mark attendance for any employee on any day. Manual entries are logged separately in the audit trail.'
    },
    {
      q: 'Is my data secure?',
      a: "All data is encrypted in transit and at rest. PayLite is compliant with India's DPDP Act 2023. You can export or delete all data at any time."
    },
    {
      q: 'Does PayLite work for contract or daily wage workers?',
      a: 'Yes. You can set daily wage rates per employee. PayLite calculates payment based on actual days worked automatically.'
    },
    {
      q: 'Can multiple admins access the account?',
      a: 'Multi-admin is available on the Scale plan. The Starter and Professional plans support one admin account.'
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes — 14 days free on any plan. No credit card required. Full access to all features on your chosen plan.'
    },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.navScrolled = window.scrollY > 60;
  }

  @HostListener('window:resize')
  onResize() {
    this.positionSlider();
  }

  ngAfterViewInit() {
    this.initReveal();
    setTimeout(() => this.positionSlider(), 100);
  }

  ngOnDestroy() {
    this.revealObserver?.disconnect();
  }

  private initReveal() {
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('in');
            this.revealObserver!.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => this.revealObserver!.observe(el));
  }

  private positionSlider() {
    const container = this.billingToggleRef?.nativeElement as HTMLElement;
    if (!container) return;
    const active = container.querySelector('button.active') as HTMLElement;
    if (!active) return;
    this.sliderWidth = active.offsetWidth + 'px';
    this.sliderTransform = `translateX(${active.offsetLeft - 4}px)`;
    this.cdr.detectChanges();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  setBilling(mode: 'monthly' | 'annual') {
    if (this.billingMode === mode) return;
    this.priceFlipping = true;
    setTimeout(() => {
      this.billingMode = mode;
      this.priceFlipping = false;
      setTimeout(() => this.positionSlider(), 0);
    }, 150);
  }

  getPrice(monthly: string, annual: string): string {
    return this.billingMode === 'annual' ? annual : monthly;
  }

  toggleFaq(index: number) {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
