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
  styles: [`
    app-landing {
      --blue:#185FA5;
      --blue-deep:#0C447C;
      --navy:#042C53;
      --sky:#E6F1FB;
      --sky-2:#85B7EB;
      --cloud:#F4F8FD;
      --ink:#2C2C2A;
      --ink-mid:#5F5E5A;
      --border:#E0DED6;
      --green:#3B6D11;
      --green-tint:#EAF3DE;
      --amber:#854F0B;
      --amber-tint:#FAEEDA;
      --red:#A32D2D;
      --red-tint:#FCEBEB;
      --white:#FFFFFF;
      --shadow-sm:0 1px 2px rgba(4,44,83,.04),0 1px 1px rgba(4,44,83,.03);
      --shadow-md:0 8px 24px -8px rgba(4,44,83,.12),0 2px 6px rgba(4,44,83,.05);
      --shadow-lg:0 24px 48px -16px rgba(4,44,83,.18),0 8px 16px -8px rgba(4,44,83,.08);
      --radius-sm:8px;
      --radius:12px;
      --radius-lg:16px;
      --radius-xl:20px;
      display:block;
      font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-weight:400;
      color:var(--ink);
      background:var(--white);
      line-height:1.5;
      -webkit-font-smoothing:antialiased;
      overflow-x:hidden;
    }

    app-landing *{box-sizing:border-box;margin:0;padding:0}
    app-landing a{color:inherit;text-decoration:none;cursor:pointer}
    app-landing button{font-family:inherit;cursor:pointer;border:none;background:none}
    app-landing ul{list-style:none}

    /* Layout */
    app-landing .container{max-width:1200px;margin:0 auto;padding:0 24px}
    app-landing .section{padding:96px 0}
    app-landing .section-label{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mid);margin-bottom:16px}
    app-landing h2{font-size:44px;line-height:1.08;font-weight:700;letter-spacing:-0.02em;color:var(--ink)}
    app-landing h3{font-size:22px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:var(--ink)}
    app-landing p{color:var(--ink-mid)}

    /* Reveal */
    app-landing .reveal{opacity:0;transform:translateY(20px);transition:opacity .5s ease-out,transform .5s ease-out}
    app-landing .reveal.in{opacity:1;transform:none}
    app-landing .reveal[data-stagger="1"]{transition-delay:.1s}
    app-landing .reveal[data-stagger="2"]{transition-delay:.2s}
    app-landing .reveal[data-stagger="3"]{transition-delay:.3s}
    app-landing .reveal[data-stagger="4"]{transition-delay:.4s}
    app-landing .reveal[data-stagger="5"]{transition-delay:.5s}

    /* Buttons */
    app-landing .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;font-size:15px;font-weight:600;border-radius:10px;transition:all .15s ease;white-space:nowrap;border:1px solid transparent}
    app-landing .btn-primary{background:var(--blue);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,.15) inset,0 4px 12px -4px rgba(24,95,165,.5)}
    app-landing .btn-primary:hover{background:var(--blue-deep);transform:translateY(-1px);box-shadow:0 8px 18px -6px rgba(24,95,165,.55)}
    app-landing .btn-primary:active{transform:translateY(0)}
    app-landing .btn-ghost{background:transparent;color:var(--ink)}
    app-landing .btn-ghost:hover{background:var(--sky);color:var(--blue)}
    app-landing .btn-outline{background:transparent;color:var(--blue);border:1px solid var(--border)}
    app-landing .btn-outline:hover{border-color:var(--blue);background:var(--cloud);transform:translateY(-1px)}
    app-landing .btn-white{background:#fff;color:var(--navy)}
    app-landing .btn-white:hover{background:var(--cloud);transform:translateY(-1px)}
    app-landing .btn-white-outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}
    app-landing .btn-white-outline:hover{border-color:#fff;background:rgba(255,255,255,.08);transform:translateY(-1px)}
    app-landing .btn-lg{padding:14px 24px;font-size:16px;border-radius:12px}
    app-landing .btn-link{color:var(--blue);font-weight:600;font-size:15px;cursor:pointer}
    app-landing .btn-link:hover{text-decoration:underline}

    /* Logo */
    app-landing .logo{display:inline-flex;align-items:center;gap:10px;font-weight:700;font-size:20px;letter-spacing:-0.02em}
    app-landing .logo-mark{width:30px;height:30px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    app-landing .logo-text .pay{color:var(--ink)}
    app-landing .logo-text .lite{color:var(--blue)}

    /* Nav */
    app-landing .nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .2s ease,box-shadow .2s ease}
    app-landing .nav.scrolled{border-bottom-color:var(--border);box-shadow:0 1px 0 rgba(0,0,0,.02)}
    app-landing .nav-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
    app-landing .nav-links{display:flex;gap:6px;align-items:center}
    app-landing .nav-links a{font-size:14px;font-weight:500;color:var(--ink-mid);padding:8px 12px;border-radius:8px;transition:color .15s ease,background .15s ease;cursor:pointer}
    app-landing .nav-links a:hover{color:var(--ink);background:var(--cloud)}
    app-landing .nav-cta{display:flex;gap:8px;align-items:center}
    app-landing .nav-cta .btn{padding:9px 16px;font-size:14px}
    app-landing .hamburger{display:none;width:40px;height:40px;border-radius:8px;align-items:center;justify-content:center}
    app-landing .hamburger:hover{background:var(--cloud)}
    app-landing .hamburger span{display:block;width:18px;height:2px;background:var(--ink);position:relative;transition:transform .2s}
    app-landing .hamburger span::before,app-landing .hamburger span::after{content:"";position:absolute;left:0;width:18px;height:2px;background:var(--ink);transition:transform .2s}
    app-landing .hamburger span::before{top:-6px}
    app-landing .hamburger span::after{top:6px}
    app-landing .hamburger.open span{background:transparent}
    app-landing .hamburger.open span::before{top:0;transform:rotate(45deg)}
    app-landing .hamburger.open span::after{top:0;transform:rotate(-45deg)}
    app-landing .mobile-menu{display:none;border-top:1px solid var(--border);background:#fff;padding:16px 24px 24px}
    app-landing .mobile-menu a{display:block;padding:12px 4px;font-size:16px;font-weight:500;color:var(--ink);border-bottom:1px solid var(--border);cursor:pointer}
    app-landing .mobile-menu .mobile-cta{display:flex;flex-direction:column;gap:8px;margin-top:16px}
    app-landing .mobile-menu .mobile-cta .btn{width:100%;justify-content:center}
    app-landing .nav.menu-open .mobile-menu{display:block}

    /* Hero */
    app-landing .hero{background:var(--cloud);padding:80px 0 110px;text-align:center;position:relative;overflow:hidden}
    app-landing .hero::before{content:"";position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse at center,rgba(24,95,165,.06),transparent 60%);pointer-events:none}
    app-landing .hero-inner{position:relative;z-index:1}
    app-landing .pill{display:inline-flex;align-items:center;gap:6px;background:var(--sky);color:var(--blue);padding:6px 14px;border-radius:999px;font-size:13px;font-weight:500;margin-bottom:28px}
    app-landing .pill .spark{color:var(--blue);font-weight:600}
    app-landing .h1{font-size:64px;line-height:1.04;font-weight:700;letter-spacing:-0.03em;color:var(--ink);margin-bottom:24px}
    app-landing .h1 .blue{color:var(--blue)}
    app-landing .hero-sub{font-size:18px;color:var(--ink-mid);max-width:520px;margin:0 auto 36px;line-height:1.55}
    app-landing .cta-row{display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:32px}
    app-landing .social-bar{display:flex;gap:24px;justify-content:center;align-items:center;font-size:14px;color:var(--ink-mid);font-weight:500;flex-wrap:wrap}
    app-landing .social-bar .dot{width:3px;height:3px;border-radius:50%;background:var(--border)}

    /* Phone mockup */
    app-landing .mockup-wrap{margin-top:72px;display:flex;justify-content:center;perspective:1400px}
    app-landing .phone{width:340px;background:#fff;border-radius:32px;border:1px solid var(--border);padding:18px;box-shadow:var(--shadow-lg);transform:rotate(-1.5deg);position:relative}
    app-landing .phone::before{content:"";position:absolute;top:14px;left:50%;transform:translateX(-50%);width:80px;height:6px;border-radius:4px;background:#e8eaee}
    app-landing .phone-screen{background:var(--cloud);border-radius:18px;padding:18px 16px 16px;margin-top:18px}
    app-landing .phone-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
    app-landing .phone-header h4{font-size:15px;font-weight:600;color:var(--ink)}
    app-landing .phone-header span{font-size:11px;color:var(--ink-mid);font-weight:500;display:block;margin-top:2px}
    app-landing .phone-header .dots{display:flex;gap:3px}
    app-landing .phone-header .dots i{width:4px;height:4px;border-radius:50%;background:#cdd2dc;display:block}
    app-landing .metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
    app-landing .metric{background:#fff;border-radius:10px;padding:10px;border:1px solid var(--border)}
    app-landing .metric .label{font-size:9px;color:var(--ink-mid);font-weight:500;letter-spacing:.04em;text-transform:uppercase}
    app-landing .metric .value{font-size:15px;font-weight:700;color:var(--ink);margin-top:3px}
    app-landing .metric.ok .value{color:var(--green)}
    app-landing .metric.warn .value{color:var(--amber)}
    app-landing .metric.flag .value{color:var(--red)}
    app-landing .emp-list{background:#fff;border-radius:10px;border:1px solid var(--border);overflow:hidden;margin-bottom:14px}
    app-landing .emp{display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--border)}
    app-landing .emp:last-child{border-bottom:0}
    app-landing .emp .av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;flex-shrink:0}
    app-landing .emp .info{flex:1;min-width:0}
    app-landing .emp .name{font-size:12px;font-weight:600;color:var(--ink)}
    app-landing .emp .role{font-size:10px;color:var(--ink-mid)}
    app-landing .emp .pay{font-size:12px;font-weight:600;color:var(--ink);text-align:right}
    app-landing .emp .status{font-size:9px;font-weight:600;padding:2px 6px;border-radius:4px;margin-top:2px;display:inline-block}
    app-landing .status-paid{background:var(--green-tint);color:var(--green)}
    app-landing .status-pending{background:var(--amber-tint);color:var(--amber)}
    app-landing .status-flag{background:var(--red-tint);color:var(--red)}
    app-landing .run-btn{width:100%;background:var(--blue);color:#fff;border-radius:10px;padding:11px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 6px 18px -4px rgba(24,95,165,.5)}

    /* Logos band */
    app-landing .logos-band{padding:64px 0;background:#fff;text-align:center}
    app-landing .logos-label{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mid);margin-bottom:28px}
    app-landing .logos-row{display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap}
    app-landing .logos-row .lg{color:#9a988f;font-size:18px;font-weight:600;letter-spacing:-0.01em;transition:color .15s}
    app-landing .logos-row .lg:hover{color:var(--ink-mid)}

    /* Problem/Solution */
    app-landing .ps{background:#fff}
    app-landing .ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px}
    app-landing .ps-col h2{font-size:36px;margin-bottom:28px}
    app-landing .ps-label{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px}
    app-landing .ps-label.bad{color:var(--red)}
    app-landing .ps-label.good{color:var(--green)}
    app-landing .ps-list{display:flex;flex-direction:column;gap:14px}
    app-landing .ps-item{display:flex;gap:14px;align-items:flex-start;font-size:16px;color:var(--ink)}
    app-landing .ps-icon{width:24px;height:24px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-top:1px}
    app-landing .ps-icon.bad{background:var(--red-tint);color:var(--red)}
    app-landing .ps-icon.good{background:var(--green-tint);color:var(--green)}

    /* Features */
    app-landing .features{background:var(--cloud)}
    app-landing .section-head{text-align:center;max-width:680px;margin:0 auto 56px}
    app-landing .section-head h2{margin-bottom:14px}
    app-landing .section-head p{font-size:18px;color:var(--ink-mid)}
    app-landing .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
    app-landing .feat-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:28px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
    app-landing .feat-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:#d4d2c8}
    app-landing .feat-icon{width:44px;height:44px;border-radius:50%;background:var(--sky);color:var(--blue);display:flex;align-items:center;justify-content:center;margin-bottom:18px}
    app-landing .feat-card h3{font-size:18px;margin-bottom:8px}
    app-landing .feat-card p{font-size:15px;line-height:1.55}

    /* How it works */
    app-landing .how{background:#fff}
    app-landing .steps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;position:relative;margin-bottom:48px}
    app-landing .steps::before{content:"";position:absolute;top:54px;left:14%;right:14%;height:1px;background-image:linear-gradient(to right,var(--border) 50%,transparent 50%);background-size:10px 1px;z-index:0}
    app-landing .step{position:relative;z-index:1;text-align:left}
    app-landing .step .num{font-size:64px;font-weight:300;color:var(--sky-2);letter-spacing:-0.04em;line-height:1;margin-bottom:8px}
    app-landing .step .step-icon{width:48px;height:48px;border-radius:12px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--blue);margin-bottom:18px;box-shadow:var(--shadow-sm)}
    app-landing .step h3{font-size:20px;margin-bottom:8px}
    app-landing .step p{font-size:15px;line-height:1.55;max-width:300px}
    app-landing .how-cta{text-align:center;padding-top:24px;display:flex;flex-direction:column;gap:14px;align-items:center}
    app-landing .how-cta-text{font-size:16px;color:var(--ink-mid)}

    /* Industries */
    app-landing .industries{background:#fff}
    app-landing .ind-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:stretch}
    app-landing .ind-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column;transition:transform .2s ease,box-shadow .2s ease}
    app-landing .ind-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
    app-landing .ind-accent{height:4px;background:var(--blue)}
    app-landing .ind-card.featured{box-shadow:var(--shadow-md);transform:translateY(-8px)}
    app-landing .ind-card.featured:hover{transform:translateY(-10px);box-shadow:var(--shadow-lg)}
    app-landing .ind-card.featured .ind-accent{background:var(--blue-deep)}
    app-landing .ind-body{padding:32px 28px;display:flex;flex-direction:column;flex:1}
    app-landing .ind-icon{width:48px;height:48px;border-radius:50%;background:var(--sky);color:var(--blue);display:flex;align-items:center;justify-content:center;margin-bottom:18px}
    app-landing .badge{display:inline-flex;align-items:center;background:var(--sky);color:var(--blue);font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;margin-bottom:12px;align-self:flex-start}
    app-landing .ind-body h3{font-size:22px;margin-bottom:14px}
    app-landing .ind-points{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;flex:1}
    app-landing .ind-points li{font-size:15px;color:var(--ink-mid);padding-left:18px;position:relative;line-height:1.5}
    app-landing .ind-points li::before{content:"";position:absolute;left:0;top:9px;width:5px;height:5px;border-radius:50%;background:var(--blue)}
    app-landing .ind-link{color:var(--blue);font-size:15px;font-weight:600;display:inline-flex;align-items:center;gap:4px;transition:gap .2s ease}
    app-landing .ind-link:hover{gap:8px}

    /* Pricing */
    app-landing .pricing{background:var(--cloud)}
    app-landing .billing-toggle{display:inline-flex;background:#fff;border:1px solid var(--border);border-radius:999px;padding:4px;position:relative}
    app-landing .billing-toggle button{padding:8px 20px;font-size:14px;font-weight:500;border-radius:999px;color:var(--ink-mid);position:relative;z-index:1;transition:color .2s ease;display:flex;align-items:center;gap:8px}
    app-landing .billing-toggle button.active{color:#fff}
    app-landing .billing-toggle .save-pill{background:var(--green-tint);color:var(--green);font-size:11px;font-weight:600;padding:2px 7px;border-radius:6px}
    app-landing .billing-toggle button.active .save-pill{background:rgba(255,255,255,.2);color:#fff}
    app-landing .billing-toggle .slider{position:absolute;top:4px;left:4px;height:calc(100% - 8px);background:var(--blue);border-radius:999px;transition:transform .25s ease,width .25s ease}
    app-landing .toggle-row{text-align:center;margin-bottom:48px}
    app-landing .price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:stretch}
    app-landing .price-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:36px 32px;display:flex;flex-direction:column;transition:transform .2s ease,box-shadow .2s ease;position:relative}
    app-landing .price-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
    app-landing .price-card.feat{background:var(--navy);border-color:var(--navy);color:#fff;box-shadow:var(--shadow-lg);transform:translateY(-8px)}
    app-landing .price-card.feat:hover{transform:translateY(-10px)}
    app-landing .price-card.feat *{color:#fff}
    app-landing .price-name{font-size:14px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--blue);margin-bottom:8px}
    app-landing .price-card.feat .price-name{color:var(--sky-2)}
    app-landing .price-row{display:flex;align-items:baseline;gap:6px;margin-bottom:6px}
    app-landing .price-amt{font-size:48px;font-weight:700;letter-spacing:-0.03em;color:var(--ink);line-height:1;transition:opacity .15s ease,transform .15s ease}
    app-landing .price-amt.price-flip{opacity:0;transform:translateY(-4px)}
    app-landing .price-card.feat .price-amt{color:#fff}
    app-landing .price-per{font-size:14px;color:var(--ink-mid)}
    app-landing .price-card.feat .price-per{color:var(--sky-2)}
    app-landing .price-desc{font-size:14px;color:var(--ink-mid);margin-bottom:6px}
    app-landing .price-card.feat .price-desc{color:var(--sky-2)}
    app-landing .price-limit{font-size:13px;font-weight:600;color:var(--ink);padding-top:18px;border-top:1px solid var(--border);margin-top:18px;margin-bottom:18px}
    app-landing .price-card.feat .price-limit{color:#fff;border-top-color:rgba(255,255,255,.15)}
    app-landing .price-features{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1}
    app-landing .price-feat{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:var(--ink-mid);line-height:1.5}
    app-landing .price-feat .check{width:18px;height:18px;border-radius:50%;background:var(--green-tint);color:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:700;margin-top:1px}
    app-landing .price-feat .x{width:18px;height:18px;border-radius:50%;background:#f0eee6;color:#b6b3a8;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:700;margin-top:1px}
    app-landing .price-feat.disabled{color:#b6b3a8}
    app-landing .price-card.feat .price-feat{color:#fff}
    app-landing .price-card.feat .check{background:rgba(133,183,235,.15);color:var(--sky-2)}
    app-landing .price-pop-badge{position:absolute;top:20px;right:24px;background:var(--blue);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px}
    app-landing .price-cta .btn{width:100%;justify-content:center}
    app-landing .price-foot{text-align:center;color:var(--ink-mid);font-size:14px;margin-top:32px}

    /* Testimonials */
    app-landing .test{background:#fff}
    app-landing .test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    app-landing .test-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;position:relative;transition:transform .2s ease,box-shadow .2s ease;display:flex;flex-direction:column}
    app-landing .test-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
    app-landing .test-quote-mark{position:absolute;top:18px;right:24px;font-family:Georgia,serif;font-size:64px;color:var(--blue);line-height:1;opacity:.18;font-weight:700}
    app-landing .stars{color:#F5B400;font-size:14px;letter-spacing:2px;margin-bottom:16px}
    app-landing .test-q{font-size:16px;line-height:1.55;color:var(--ink);margin-bottom:24px;flex:1}
    app-landing .test-by{display:flex;align-items:center;gap:12px;padding-top:20px;border-top:1px solid var(--border)}
    app-landing .test-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;flex-shrink:0}
    app-landing .test-by .name{font-size:15px;font-weight:600;color:var(--ink)}
    app-landing .test-by .role{font-size:13px;color:var(--ink-mid)}

    /* FAQ */
    app-landing .faq{background:var(--cloud)}
    app-landing .faq-list{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
    app-landing .faq-item{background:#fff;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:border-color .2s ease,box-shadow .2s ease;position:relative}
    app-landing .faq-item.open{border-color:#d4d2c8;box-shadow:var(--shadow-sm)}
    app-landing .faq-item.open::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--blue)}
    app-landing .faq-q{width:100%;text-align:left;padding:20px 56px 20px 28px;font-size:16px;font-weight:500;color:var(--ink);display:flex;justify-content:space-between;align-items:center;gap:16px;position:relative}
    app-landing .faq-icon{width:24px;height:24px;flex-shrink:0;position:relative;transition:transform .25s ease;border-radius:50%}
    app-landing .faq-icon::before,app-landing .faq-icon::after{content:"";position:absolute;background:var(--ink-mid);border-radius:1px}
    app-landing .faq-icon::before{left:50%;top:5px;width:2px;height:14px;transform:translateX(-50%);transition:opacity .2s ease}
    app-landing .faq-icon::after{top:50%;left:5px;width:14px;height:2px;transform:translateY(-50%)}
    app-landing .faq-item.open .faq-icon::before{opacity:0}
    app-landing .faq-item.open .faq-icon{background:var(--blue)}
    app-landing .faq-item.open .faq-icon::after{background:#fff;left:5px;width:14px}
    app-landing .faq-a{overflow:hidden;max-height:0;transition:max-height .35s ease}
    app-landing .faq-a-inner{padding:0 28px 24px;font-size:15px;line-height:1.6;color:var(--ink-mid)}

    /* Final CTA */
    app-landing .final-cta{background:var(--navy);padding:96px 0;text-align:center;position:relative;overflow:hidden}
    app-landing .final-cta::before{content:"";position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:800px;height:400px;background:radial-gradient(ellipse at center,rgba(133,183,235,.12),transparent 60%)}
    app-landing .final-cta-inner{position:relative;z-index:1}
    app-landing .final-cta h2{font-size:48px;color:#fff;margin-bottom:18px;letter-spacing:-0.03em}
    app-landing .final-cta p.sub{font-size:18px;color:var(--sky-2);max-width:560px;margin:0 auto 36px}
    app-landing .final-cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
    app-landing .final-cta-fine{font-size:13px;color:var(--sky-2)}

    /* Footer */
    app-landing footer{background:var(--ink);color:#aaa9a4;padding:72px 0 28px}
    app-landing .foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px;margin-bottom:56px}
    app-landing .foot-brand .logo .pay{color:#fff}
    app-landing .foot-brand .logo .lite{color:var(--sky-2)}
    app-landing .foot-tagline{font-size:14px;color:#aaa9a4;margin:14px 0 22px;max-width:240px}
    app-landing .socials{display:flex;gap:8px}
    app-landing .socials a{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#aaa9a4;border:1px solid #3a3a38;transition:color .15s ease,border-color .15s ease,background .15s ease}
    app-landing .socials a:hover{color:#fff;border-color:#fff;background:#3a3a38}
    app-landing .foot-col h4{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#fff;margin-bottom:18px}
    app-landing .foot-col ul{display:flex;flex-direction:column;gap:12px}
    app-landing .foot-col a{font-size:14px;color:#aaa9a4;transition:color .15s;cursor:pointer}
    app-landing .foot-col a:hover{color:#fff}
    app-landing .foot-bottom{padding-top:24px;border-top:1px solid #3a3a38;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#888;flex-wrap:wrap;gap:12px}

    /* Responsive */
    @media (max-width:1024px){
      app-landing h2{font-size:36px}
      app-landing .h1{font-size:48px}
      app-landing .ps-grid{gap:48px}
      app-landing .feat-grid{grid-template-columns:repeat(2,1fr)}
      app-landing .ind-grid{grid-template-columns:1fr;gap:20px}
      app-landing .ind-card.featured{transform:none}
      app-landing .ind-card.featured:hover{transform:translateY(-2px)}
      app-landing .price-grid{grid-template-columns:1fr;gap:20px;max-width:480px;margin:0 auto}
      app-landing .price-card.feat{transform:none}
      app-landing .price-card.feat:hover{transform:translateY(-2px)}
      app-landing .test-grid{grid-template-columns:1fr;gap:20px}
      app-landing .foot-grid{grid-template-columns:1fr 1fr;gap:32px}
    }
    @media (max-width:640px){
      app-landing .section{padding:64px 0}
      app-landing .container{padding:0 20px}
      app-landing h2{font-size:30px}
      app-landing .h1{font-size:36px;line-height:1.1}
      app-landing .hero{padding:48px 0 72px}
      app-landing .hero-sub{font-size:16px}
      app-landing .nav-links,app-landing .nav-cta{display:none}
      app-landing .hamburger{display:flex}
      app-landing .phone{width:280px;transform:rotate(-1deg)}
      app-landing .ps-grid{grid-template-columns:1fr;gap:48px}
      app-landing .ps-col h2{font-size:28px}
      app-landing .feat-grid{grid-template-columns:1fr}
      app-landing .steps{grid-template-columns:1fr;gap:40px}
      app-landing .steps::before{display:none}
      app-landing .step .num{font-size:48px}
      app-landing .logos-row{justify-content:center;gap:24px 20px}
      app-landing .logos-row .lg{font-size:15px;flex-basis:calc(50% - 20px);text-align:center}
      app-landing .test-grid{display:grid;grid-auto-flow:column;grid-auto-columns:88%;grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;gap:16px;padding:4px 4px 16px;scrollbar-width:none;margin:0 -20px;padding-left:20px;padding-right:20px}
      app-landing .test-grid::-webkit-scrollbar{display:none}
      app-landing .test-card{scroll-snap-align:start}
      app-landing .foot-grid{grid-template-columns:1fr;gap:32px;margin-bottom:32px}
      app-landing .foot-bottom{justify-content:center;text-align:center;flex-direction:column}
      app-landing .final-cta h2{font-size:32px}
      app-landing .final-cta-btns .btn{width:100%;justify-content:center}
      app-landing .cta-row .btn-primary{width:100%;justify-content:center}
      app-landing .nav-inner{height:60px}
    }
  `]
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
