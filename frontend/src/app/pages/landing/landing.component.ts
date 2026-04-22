import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="landing-wrapper">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="logo">
          <mat-icon>payments</mat-icon>
          <span>PayLite</span>
        </div>
        <div class="nav-links">
          <a routerLink="/login" mat-button>Sign In</a>
          <a routerLink="/login" mat-flat-button color="primary" class="cta-nav">Get Started</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <header class="hero">
        <div class="container">
          <span class="badge">Designed for Micro-Businesses</span>
          <h1>Payroll Management <br><span class="accent">Simplified.</span></h1>
          <p>Automate your attendance, calculations, and payslips in minutes. No complex software, no massive fees. Just easy payroll.</p>
          <div class="hero-actions">
            <button mat-flat-button color="primary" routerLink="/login">Start Free Demo</button>
            <button mat-stroked-button (click)="scrollTo('features')">View Features</button>
          </div>
          <div class="hero-preview">
            <img src="https://images.unsplash.com/photo-1551288049-bbda48658a7d?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview">
          </div>
        </div>
      </header>

      <!-- Features Section -->
      <section id="features" class="features">
        <div class="container">
          <div class="section-header">
            <h2>Why Choose PayLite?</h2>
            <p>Everything you need to manage your small team efficiently.</p>
          </div>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="icon-box"><mat-icon>qr_code_scanner</mat-icon></div>
              <h3>QR Attendance</h3>
              <p>Self-service attendance with secure daily QR tokens. No manual entry required.</p>
            </div>
            
            <div class="feature-card">
              <div class="icon-box"><mat-icon>location_on</mat-icon></div>
              <h3>Geofencing</h3>
              <p>Ensure employees check in only when they are at the office premises using GPS verification.</p>
            </div>

            <div class="feature-card">
              <div class="icon-box"><mat-icon>flash_on</mat-icon></div>
              <h3>1-Click Payroll</h3>
              <p>Process your entire team's payroll with a single click, including PF, ESI, and bonuses.</p>
            </div>

            <div class="feature-card">
              <div class="icon-box"><mat-icon>picture_as_pdf</mat-icon></div>
              <h3>Digital Payslips</h3>
              <p>Generate professional PDF payslips and WhatsApp them directly to your staff.</p>
            </div>

            <div class="feature-card">
              <div class="icon-box"><mat-icon>security</mat-icon></div>
              <h3>Compliance Ready</h3>
              <p>Built-in Indian payroll logic for ESI/PF thresholds and professional tax calculations.</p>
            </div>

            <div class="feature-card">
              <div class="icon-box"><mat-icon>insights</mat-icon></div>
              <h3>Instant Exports</h3>
              <p>Export payroll reports to Excel for your CA or accounting software instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-card">
            <h2>Ready to transform your payroll?</h2>
            <p>Join micro-businesses across India using PayLite to save hours every month.</p>
            <button mat-flat-button color="primary" routerLink="/login" class="cta-large">Get Started Now</button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-bottom">
            <p>&copy; 2026 PayLite Systems. Built for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { --primary: #185FA5; --bg: #ffffff; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    
    .navbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 40px; position: sticky; top: 0; background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px); z-index: 100;
    }
    .logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.5rem; color: var(--primary); }
    .logo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }

    .hero { padding: 80px 0; text-align: center; background: radial-gradient(circle at top right, #f0f7ff, #ffffff); }
    .badge { 
      display: inline-block; padding: 6px 16px; background: #e0f2fe; color: #0369a1; 
      border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 24px;
    }
    .hero h1 { font-size: 4rem; font-weight: 900; line-height: 1.1; color: #1e293b; margin-bottom: 24px; }
    .hero .accent { color: var(--primary); }
    .hero p { font-size: 1.25rem; color: #64748b; max-width: 700px; margin: 0 auto 40px; line-height: 1.6; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; }
    .hero-actions button { height: 56px; padding: 0 32px; border-radius: 12px !important; font-weight: 700; font-size: 1rem; }
    
    .hero-preview { margin-top: 60px; max-width: 1000px; margin-left: auto; margin-right: auto; }
    .hero-preview img { width: 100%; border-radius: 24px; box-shadow: 0 40px 100px rgba(0,0,0,0.1); border: 8px solid white; }

    .features { padding: 100px 0; background: #f8fafc; }
    .section-header { text-align: center; margin-bottom: 60px; }
    .section-header h2 { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
    .section-header p { font-size: 1.1rem; color: #64748b; }

    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
    .feature-card { 
      background: white; padding: 40px; border-radius: 24px; transition: transform 0.3s ease;
      border: 1px solid #f1f5f9;
    }
    .feature-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
    .icon-box { 
      width: 56px; height: 56px; background: #eff6ff; color: var(--primary); 
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
    }
    .icon-box mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .feature-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
    .feature-card p { color: #64748b; line-height: 1.6; }

    .cta-section { padding: 100px 0; }
    .cta-card { 
      background: linear-gradient(135deg, #185FA5, #1e40af); padding: 80px 40px;
      border-radius: 32px; text-align: center; color: white;
    }
    .cta-card h2 { font-size: 3rem; font-weight: 800; margin-bottom: 24px; }
    .cta-card p { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto; }
    .cta-large { height: 64px !important; padding: 0 48px !important; border-radius: 16px !important; font-size: 1.1rem !important; background: white !important; color: var(--primary) !important; font-weight: 800 !important; }

    .footer { padding: 40px 0; border-top: 1px solid #f1f5f9; color: #94a3b8; text-align: center; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .hero p { font-size: 1.1rem; }
      .nav-links { display: none; }
      .cta-card h2 { font-size: 2rem; }
    }
  `]
})
export class LandingComponent {
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
