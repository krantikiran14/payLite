import {
  Component, AfterViewInit, OnDestroy, HostListener, ViewChild,
  ElementRef, ChangeDetectorRef, ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./landing.component.css'],
  templateUrl: './landing.component.html',
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
    { q: 'Do employees need to download an app to use QR attendance?', a: 'No. Employees just scan the QR code with their phone camera or WhatsApp. A lightweight web page opens — no download needed.' },
    { q: 'How accurate is the payroll calculation?', a: 'PayLite calculates PF at 12% of basic, ESI at 0.75% for eligible employees, overtime at 1.5× hourly rate, and unpaid leave as daily salary deductions — all per current Indian labour regulations.' },
    { q: 'Can I use PayLite for shift-based staff?', a: 'Yes. Define morning and evening shifts per employee. PayLite tracks check-in times, flags late arrivals, and calculates overtime automatically when shift hours are exceeded.' },
    { q: 'What happens if an employee forgets to check in?', a: 'The admin can manually mark attendance for any employee on any day. Manual entries are logged separately in the audit trail.' },
    { q: 'Is my data secure?', a: "All data is encrypted in transit and at rest. PayLite is compliant with India's DPDP Act 2023. You can export or delete all data at any time." },
    { q: 'Does PayLite work for contract or daily wage workers?', a: 'Yes. You can set daily wage rates per employee. PayLite calculates payment based on actual days worked automatically.' },
    { q: 'Can multiple admins access the account?', a: 'Multi-admin is available on the Scale plan. The Starter and Professional plans support one admin account.' },
    { q: 'Is there a free trial?', a: 'Yes — 14 days free on any plan. No credit card required. Full access to all features on your chosen plan.' },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:scroll') onWindowScroll() { this.navScrolled = window.scrollY > 60; }
  @HostListener('window:resize') onResize() { this.positionSlider(); }

  ngAfterViewInit() {
    this.initReveal();
    setTimeout(() => this.positionSlider(), 100);
  }
  ngOnDestroy() { this.revealObserver?.disconnect(); }

  private initReveal() {
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('in');
          this.revealObserver!.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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

  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobileMenu() { this.mobileMenuOpen = false; }

  setBilling(mode: 'monthly' | 'annual') {
    if (this.billingMode === mode) return;
    this.priceFlipping = true;
    setTimeout(() => { this.billingMode = mode; this.priceFlipping = false; setTimeout(() => this.positionSlider(), 0); }, 150);
  }

  getPrice(monthly: string, annual: string): string {
    return this.billingMode === 'annual' ? annual : monthly;
  }

  toggleFaq(index: number) { this.openFaqIndex = this.openFaqIndex === index ? null : index; }

  scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}
