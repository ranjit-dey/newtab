/**
 * Aura Tab - Curated Daily Inspiration & Quotes
 */
const CURATED_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Focus is a muscle. The more you practice it, the stronger it gets.", author: "Cal Newport" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { text: "Stay hungry, stay foolish.", author: "Whole Earth Catalog" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Begin anywhere, but begin now.", author: "John Cage" },
  { text: "Light tomorrow with today.", author: "Elizabeth Barrett Browning" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" }
];

class QuoteManager {
  constructor() {
    this.textEl = document.getElementById('quote-text');
    this.authorEl = document.getElementById('quote-author');
    this.refreshBtn = document.getElementById('quote-refresh');
    this.quotes = CURATED_QUOTES;
    this.currentIndex = 0;
  }

  async init() {
    const saved = await window.StorageService.get('lastQuoteIndex');
    this.currentIndex = (saved.lastQuoteIndex !== undefined) ? (saved.lastQuoteIndex % this.quotes.length) : Math.floor(Math.random() * this.quotes.length);
    this.displayQuote(this.quotes[this.currentIndex]);

    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.nextQuote();
      });
    }
  }

  async nextQuote() {
    this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
    await window.StorageService.set({ lastQuoteIndex: this.currentIndex });
    
    if (this.textEl) {
      this.textEl.style.opacity = '0';
      this.textEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        this.displayQuote(this.quotes[this.currentIndex]);
        this.textEl.style.opacity = '1';
        this.textEl.style.transform = 'translateY(0)';
      }, 250);
    }
  }

  displayQuote(q) {
    if (this.textEl) this.textEl.textContent = `"${q.text}"`;
    if (this.authorEl) this.authorEl.textContent = `— ${q.author}`;
  }
}

window.QuoteManager = new QuoteManager();
