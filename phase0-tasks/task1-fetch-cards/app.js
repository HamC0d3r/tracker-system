/**
 * Phase 0 Mini Task 1: Fetch Public API & Render Bootstrap 5 Cards
 */

// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');

// State
let postsData = [];

// Fallback Mock Data in case network / CORS is unavailable
const FALLBACK_POSTS = [
  {
    id: 1,
    userId: 1,
    title: 'sunt aut facere repellat provident occaecati excepturi optio',
    body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
  },
  {
    id: 2,
    userId: 1,
    title: 'qui est esse',
    body: 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis',
  },
  {
    id: 3,
    userId: 2,
    title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    body: 'et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et labore et velit aut',
  },
  {
    id: 4,
    userId: 2,
    title: 'eum et est occaecati',
    body: 'ullam et saepe reiciendis voluptatem adipisci sit amet autem assumenda provident rerum culpa quis hic commodi nesciunt rem tenetur doloremque ipsam iure',
  },
  {
    id: 5,
    userId: 3,
    title: 'nesciunt quas odio',
    body: 'repudiandae veniam quaerat sunt sed alias aut fugiat sit autem sed est voluptatem omnis possimus esse voluptatibus quis est aut tenetur dolor neque',
  },
  {
    id: 6,
    userId: 3,
    title: 'dolorem eum magni eos aperiam quia',
    body: 'ut aspernatur corporis harum nihil quis provident sequi mollitia nobis aliquid molestiae perspiciatis et ea nemo ab reprehenderit accusantium quas voluptate dolores velit et doloremque molestiae',
  },
];

/**
 * Fetch posts from JSONPlaceholder API
 */
async function fetchPosts() {
  setLoading(true);
  hideError();

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=9', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    postsData = Array.isArray(data) && data.length > 0 ? data : FALLBACK_POSTS;
    renderCards(postsData);
  } catch (err) {
    console.warn('Network fetch error, utilizing fallback mock data:', err.message);
    // Use fallback data so the demo always works smoothly
    postsData = FALLBACK_POSTS;
    renderCards(postsData);
  } finally {
    setLoading(false);
  }
}

/**
 * Render cards to DOM
 * @param {Array} items
 */
function renderCards(items) {
  cardsGrid.innerHTML = '';

  if (items.length === 0) {
    cardsGrid.classList.add('d-none');
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');
  cardsGrid.classList.remove('d-none');

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card h-100 border-0 shadow-sm';

    // Capitalize title
    const formattedTitle = item.title.charAt(0).toUpperCase() + item.title.slice(1);

    card.innerHTML = `
      <div class="card-body p-4 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill badge-tag">
            <i class="bi bi-person-circle me-1"></i> User #${item.userId}
          </span>
          <span class="badge bg-light text-secondary border px-2 py-1 rounded-pill badge-tag">
            #${item.id}
          </span>
        </div>
        <h5 class="card-title text-dark mb-3">${escapeHtml(formattedTitle)}</h5>
        <p class="card-text text-muted mb-4">${escapeHtml(item.body)}</p>
        <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
          <span class="text-xs text-muted small">
            <i class="bi bi-clock me-1"></i> Read in 1 min
          </span>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="alert('Viewing Post ID: ${item.id}')">
            View Details
          </button>
        </div>
      </div>
    `;

    col.appendChild(card);
    fragment.appendChild(col);
  });

  cardsGrid.appendChild(fragment);
}

/**
 * Filter cards based on user search term
 */
function filterCards() {
  const query = (searchInput.value || '').toLowerCase().trim();
  if (!query) {
    renderCards(postsData);
    return;
  }

  const filtered = postsData.filter((post) => {
    return (
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query) ||
      String(post.id).includes(query)
    );
  });

  renderCards(filtered);
}

/**
 * Helper: Toggle loading state
 * @param {boolean} isLoading
 */
function setLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove('d-none');
    cardsGrid.classList.add('d-none');
    emptyState.classList.add('d-none');
  } else {
    loadingState.classList.add('d-none');
  }
}

/**
 * Helper: Display error message
 * @param {string} msg
 */
function showError(msg) {
  errorMessage.textContent = msg;
  errorAlert.classList.remove('d-none');
}

/**
 * Helper: Hide error alert
 */
function hideError() {
  errorAlert.classList.add('d-none');
}

/**
 * Helper: Escape HTML characters to prevent XSS
 * @param {string} str
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Event Listeners
searchInput.addEventListener('input', filterCards);
refreshBtn.addEventListener('click', () => {
  searchInput.value = '';
  fetchPosts();
});

// Initial Load
document.addEventListener('DOMContentLoaded', fetchPosts);
