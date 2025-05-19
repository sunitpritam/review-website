// --- Configurable items ---
const ITEMS = [
  { id: 'product-a', name: 'Product A' },
  { id: 'product-b', name: 'Product B' },
  { id: 'product-c', name: 'Product C' },
];

// --- Utilities ---
function getReviews(itemId) {
  return JSON.parse(localStorage.getItem('reviews_' + itemId) || '[]');
}
function saveReview(itemId, review) {
  const reviews = getReviews(itemId);
  reviews.push(review);
  localStorage.setItem('reviews_' + itemId, JSON.stringify(reviews));
}
function averageRating(reviews) {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span>${i <= rating ? '★' : '☆'}</span>`;
  }
  return html;
}

// --- Routing ---
window.addEventListener('hashchange', renderPage);
window.addEventListener('DOMContentLoaded', renderPage);

function renderPage() {
  const main = document.getElementById('main-content');
  const hash = window.location.hash;
  if (!hash || hash === '#') {
    renderHome(main);
  } else if (hash.startsWith('#item-')) {
    const itemId = hash.replace('#item-', '');
    const item = ITEMS.find(i => i.id === itemId);
    if (item) {
      renderDetail(main, item);
    } else {
      main.innerHTML = '<p>Item not found.</p>';
    }
  }
}

// --- Home Page ---
function renderHome(main) {
  main.innerHTML = `<h2>Items</h2>
    <div class="item-list">
      ${ITEMS.map(item => {
        const reviews = getReviews(item.id);
        const avg = averageRating(reviews);
        return `<div class="item-card" onclick="window.location.hash='#item-${item.id}'">
          <span>${item.name}</span>
          <span class="stars">${renderStars(Math.round(avg))} <span style="font-size:0.9em;color:#64748b;">${reviews.length ? avg.toFixed(1) : 'N/A'}</span></span>
        </div>`;
      }).join('')}
    </div>`;
}

// --- Detail Page ---
function renderDetail(main, item) {
  const reviews = getReviews(item.id);
  main.innerHTML = `
    <a href="#" class="back-link">&larr; Back to items</a>
    <div class="detail-header">
      <h2>${item.name}</h2>
      <span class="stars">${renderStars(Math.round(averageRating(reviews)))} <span style="font-size:0.9em;color:#64748b;">${reviews.length ? averageRating(reviews).toFixed(1) : 'N/A'}</span></span>
    </div>
    <div class="review-list">
      <h3>Reviews (${reviews.length})</h3>
      ${reviews.length ? reviews.map(r => `
        <div class="review">
          <div class="review-header">
            <span class="review-name">${escapeHTML(r.name)}</span>
            <span class="stars">${renderStars(r.rating)}</span>
          </div>
          <div class="review-comment">${escapeHTML(r.comment)}</div>
        </div>
      `).join('') : '<p>No reviews yet.</p>'}
    </div>
    <form id="review-form">
      <h3>Add a Review</h3>
      <label>Name <input type="text" name="name" required maxlength="32" /></label>
      <label>Rating
        <select name="rating" required>
          <option value="">Select</option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
      </label>
      <label>Comment
        <textarea name="comment" required maxlength="300"></textarea>
      </label>
      <button type="submit">Submit Review</button>
    </form>
  `;
  document.querySelector('.back-link').onclick = (e) => {
    e.preventDefault();
    window.location.hash = '';
  };
  document.getElementById('review-form').onsubmit = function(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const rating = parseInt(form.rating.value);
    const comment = form.comment.value.trim();
    if (!name || !rating || !comment) return;
    saveReview(item.id, { name, rating, comment });
    renderDetail(main, item); // re-render
  };
}

// --- Helpers ---
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(tag) {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return chars[tag] || tag;
  });
} 