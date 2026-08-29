document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryPills = document.querySelectorAll('.pill');
  const articlesGrid = document.getElementById('articlesGrid');
  const noResults = document.getElementById('noResults');
  
  // User simulator components
  const userDropdown = document.getElementById('userDropdown');
  const userAvatar = document.getElementById('userAvatar');

  let activeCategory = 'All';
  let searchQuery = '';

  // Setup user simulator initial state
  const updateUserState = () => {
    const selectedUser = userDropdown.value;
    // Get initials
    const initials = selectedUser
      .split(' ')
      .map(name => name[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    userAvatar.textContent = initials;
    // Store in sessionStorage so it persists between pages
    sessionStorage.setItem('lumenUser', selectedUser);
    sessionStorage.setItem('lumenInitials', initials);

    // Hide/show Write section for reader
    const writeLink = document.getElementById('writeLink');
    if (writeLink) {
      if (selectedUser === 'Lena Kaufmann') {
        writeLink.style.display = 'none';
      } else {
        writeLink.style.display = 'flex';
      }
    }
  };

  userDropdown.addEventListener('change', updateUserState);
  
  // Initialize user from sessionStorage if available
  const storedUser = sessionStorage.getItem('lumenUser');
  if (storedUser) {
    userDropdown.value = storedUser;
  }
  updateUserState();

  // Helper to fetch and render articles
  const fetchArticles = async () => {
    try {
      let url = '/api/articles';
      const params = new URLSearchParams();

      if (searchQuery.trim() !== '') {
        url = '/api/articles/search';
        params.append('q', searchQuery);
      }
      
      if (activeCategory !== 'All') {
        params.append('category', activeCategory);
      }

      const queryString = params.toString();
      const finalUrl = queryString ? `${url}?${queryString}` : url;

      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const articles = await response.json();
      renderArticles(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      articlesGrid.innerHTML = '';
      noResults.style.display = 'flex';
    }
  };

  // Helper to get initials from author name
  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to render articles in the grid
  const renderArticles = (articles) => {
    articlesGrid.innerHTML = '';
    
    if (articles.length === 0) {
      articlesGrid.style.display = 'none';
      noResults.style.display = 'flex';
      return;
    }

    articlesGrid.style.display = 'grid';
    noResults.style.display = 'none';

    articles.forEach(article => {
      // Format view count and likes count with commas
      const formattedViews = Number(article.views).toLocaleString();
      const formattedLikes = Number(article.likes).toLocaleString();
      const authorInitials = getInitials(article.author);

      const card = document.createElement('a');
      card.href = `article.html?id=${article.id}`;
      card.className = 'article-card';
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img class="card-img" src="${article.image || 'images/crispr.png'}" alt="${article.title}">
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-category">${article.category}</span>
            <span class="card-reading-time">${article.reading_time}</span>
          </div>
          <h2 class="card-title">${article.title}</h2>
          <p class="card-desc">${article.description}</p>
          <div class="card-footer">
            <div class="card-author-info">
              <div class="card-author-avatar">${authorInitials}</div>
              <span class="card-author-name">${article.author}</span>
            </div>
            <div class="card-stats">
              <div class="stat-item" title="Views">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span>${formattedViews}</span>
              </div>
              <div class="stat-item" title="Likes">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.722l1.293-7a2 2 0 00-2-2.278H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                </svg>
                <span>${formattedLikes}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      articlesGrid.appendChild(card);
    });
  };

  // Search input event with a small debounce
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchArticles();
    }, 200);
  });

  // Category pills event
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Remove active from all
      categoryPills.forEach(p => p.classList.remove('active'));
      // Add active to clicked
      pill.classList.add('active');
      
      activeCategory = pill.getAttribute('data-category');
      fetchArticles();
    });
  });

  // Initial load
  fetchArticles();
});
