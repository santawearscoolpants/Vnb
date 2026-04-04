import jsPDF from 'jspdf';

const BRAND = 'Vines & Branches';
const TAG = 'Luxury African Fashion';
const BLACK = '#000000';
const GREY = '#666666';
const LIGHT = '#F5F5F5';

function drawSlideBackground(doc: jsPDF, fill = '#FFFFFF') {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(fill);
  doc.rect(0, 0, w, h, 'F');
}

function footer(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(GREY);
  doc.text('Confidential — For prospective investors only', w / 2, h - 10, { align: 'center' });
}

export function generateInvestorDeck() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // --- Slide 1: Title ---
  drawSlideBackground(doc, BLACK);
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(36);
  doc.text(BRAND.toUpperCase(), W / 2, H / 2 - 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text(TAG, W / 2, H / 2, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Investor Deck — Confidential', W / 2, H / 2 + 16, { align: 'center' });
  doc.setFontSize(10);
  const now = new Date();
  doc.text(now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), W / 2, H / 2 + 26, { align: 'center' });

  // --- Slide 2: The Opportunity ---
  doc.addPage();
  drawSlideBackground(doc, '#FFFFFF');
  doc.setTextColor(BLACK);
  doc.setFontSize(24);
  doc.text('The Opportunity', 20, 30);
  doc.setDrawColor(BLACK);
  doc.line(20, 34, 100, 34);

  doc.setFontSize(12);
  doc.setTextColor(GREY);
  const opp = [
    'VNB focuses on premium African fashion with disciplined, data-backed growth.',
    'Current operations are commerce-first with verified checkout and order controls.',
    'Expansion assumptions are staged and validated against operational performance.',
    'Investor updates should be tied to current internal metrics, not static hype claims.',
  ];
  opp.forEach((line, i) => {
    doc.circle(24, 52 + i * 14 - 1, 1.5, 'F');
    doc.text(line, 30, 52 + i * 14);
  });
  footer(doc);

  // --- Slide 3: Traction ---
  doc.addPage();
  drawSlideBackground(doc, LIGHT);
  doc.setTextColor(BLACK);
  doc.setFontSize(24);
  doc.text('Traction & Milestones', 20, 30);
  doc.line(20, 34, 120, 34);

  const kpis: [string, string][] = [
    ['Year Founded', '2024'],
    ['Online Store', 'Live'],
    ['Payment Verification', 'Implemented (Paystack)'],
    ['Admin Operations', 'Catalog, media, order controls live'],
    ['Investor Reporting', 'Use live internal dashboard exports'],
    ['Data Policy', 'Avoid static unverifiable claims in decks'],
  ];
  doc.setFontSize(12);
  kpis.forEach(([label, value], i) => {
    const y = 52 + i * 14;
    doc.setTextColor(GREY);
    doc.text(label, 30, y);
    doc.setTextColor(BLACK);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 130, y);
    doc.setFont('helvetica', 'normal');
  });
  footer(doc);

  // --- Slide 4: Investment Tiers ---
  doc.addPage();
  drawSlideBackground(doc, '#FFFFFF');
  doc.setTextColor(BLACK);
  doc.setFontSize(24);
  doc.text('Investment Tiers', 20, 30);
  doc.line(20, 34, 110, 34);

  const tiers: [string, string, string][] = [
    ['Seed', 'GHS 50,000', '2–5% equity'],
    ['Growth', 'GHS 250,000', '5–10% equity'],
    ['Strategic', 'GHS 1,000,000+', '10–20% equity'],
  ];
  const colX = [30, 110, 180];
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tier', colX[0], 50);
  doc.text('Amount', colX[1], 50);
  doc.text('Equity', colX[2], 50);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(GREY);
  tiers.forEach(([tier, amount, equity], i) => {
    const y = 62 + i * 12;
    doc.text(tier, colX[0], y);
    doc.text(amount, colX[1], y);
    doc.text(equity, colX[2], y);
  });

  doc.setTextColor(BLACK);
  doc.setFontSize(10);
  doc.text('All tiers include quarterly reports, investor newsletter, and product previews.', 30, 110);
  footer(doc);

  // --- Slide 5: Use of Funds ---
  doc.addPage();
  drawSlideBackground(doc, LIGHT);
  doc.setTextColor(BLACK);
  doc.setFontSize(24);
  doc.text('Use of Funds', 20, 30);
  doc.line(20, 34, 100, 34);

  const uses: [string, string][] = [
    ['Inventory & Production', '35%'],
    ['Marketing & Brand Building', '25%'],
    ['Technology & E-Commerce', '15%'],
    ['Retail Expansion', '15%'],
    ['Operations & Working Capital', '10%'],
  ];
  doc.setFontSize(12);
  uses.forEach(([label, pct], i) => {
    const y = 52 + i * 14;
    doc.setTextColor(GREY);
    doc.text(label, 30, y);
    doc.setTextColor(BLACK);
    doc.setFont('helvetica', 'bold');
    doc.text(pct, 160, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });
  footer(doc);

  // --- Slide 6: Contact ---
  doc.addPage();
  drawSlideBackground(doc, BLACK);
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(30);
  doc.text('Get in Touch', W / 2, H / 2 - 24, { align: 'center' });
  doc.setFontSize(13);
  doc.text('invest@vnb.style', W / 2, H / 2, { align: 'center' });
  doc.setFontSize(11);
  doc.text('www.vnb.style', W / 2, H / 2 + 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor('#999999');
  doc.text('Confidential — For prospective investors only', W / 2, H - 10, { align: 'center' });

  doc.save('VNB_Investor_Deck.pdf');
}
