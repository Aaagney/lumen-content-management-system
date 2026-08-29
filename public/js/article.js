document.addEventListener('DOMContentLoaded', () => {
  // Parse article ID from query parameters
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');

  if (!articleId) {
    // If no ID is provided, go back to main browse page
    window.location.href = 'index.html';
    return;
  }

  // User simulator components
  const userDropdown = document.getElementById('userDropdown');
  const userAvatar = document.getElementById('userAvatar');

  const updateUserState = () => {
    const selectedUser = userDropdown.value;
    const initials = selectedUser
      .split(' ')
      .map(name => name[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    userAvatar.textContent = initials;
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

  // DOM elements for article details
  const detailCategory = document.getElementById('detailCategory');
  const detailReadingTime = document.getElementById('detailReadingTime');
  const detailDate = document.getElementById('detailDate');
  const detailTitle = document.getElementById('detailTitle');
  const detailDesc = document.getElementById('detailDesc');
  const detailAuthorAvatar = document.getElementById('detailAuthorAvatar');
  const detailAuthorName = document.getElementById('detailAuthorName');
  const detailAuthorBio = document.getElementById('detailAuthorBio');
  const detailViews = document.getElementById('detailViews');
  const detailLikes = document.getElementById('detailLikes');
  const detailImg = document.getElementById('detailImg');
  const detailBody = document.getElementById('detailBody');
  const detailTags = document.getElementById('detailTags');
  const quizSubtitle = document.getElementById('quizSubtitle');

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

  // Helper to parse article body content (paragraphs and headers)
  const parseArticleBody = (text) => {
    if (!text) return '';
    
    // Split into paragraphs by double newlines
    const blocks = text.split(/\n\s*\n/);
    
    return blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      
      // Match markdown h3 (### Header)
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s+/, '');
        return `<h3>${headerText}</h3>`;
      }
      
      // Match markdown h2 (## Header)
      if (trimmed.startsWith('##')) {
        const headerText = trimmed.replace(/^##\s+/, '');
        return `<h3>${headerText}</h3>`;
      }

      // Match bold titles like **Title**
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const headerText = trimmed.replace(/^\*\*|\*\*$/g, '');
        return `<h3>${headerText}</h3>`;
      }

      // Standard paragraph
      // Simple link conversion or other light styling if needed
      return `<p>${trimmed}</p>`;
    }).join('');
  };

  // Fetch article details
  const fetchArticleDetails = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found');
        }
        throw new Error('Failed to load article');
      }

      const article = await response.json();
      
      // Render details
      document.title = `${article.title} - Lumen`;
      detailCategory.textContent = article.category;
      detailReadingTime.textContent = article.reading_time;
      detailDate.textContent = article.published_date;
      detailTitle.textContent = article.title;
      detailDesc.textContent = article.description;
      
      detailAuthorAvatar.textContent = getInitials(article.author);
      detailAuthorName.textContent = article.author;
      detailAuthorBio.textContent = article.author_description || 'Writer for Lumen CMS.';
      
      // We display views (+1 is already done on backend, so we display the updated views returned)
      detailViews.textContent = Number(article.views).toLocaleString();
      detailLikes.textContent = Number(article.likes).toLocaleString();
      
      detailImg.src = article.image || 'images/crispr.png';
      detailImg.alt = article.title;
      
      // Parse and inject body
      detailBody.innerHTML = parseArticleBody(article.content);
      
      // Parse tags
      detailTags.innerHTML = '';
      if (article.tags) {
        const tagsList = article.tags.split(',');
        tagsList.forEach(tag => {
          const tagClean = tag.trim();
          if (tagClean) {
            const pill = document.createElement('span');
            pill.className = 'tag-pill';
            pill.innerHTML = `
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              ${tagClean}
            `;
            detailTags.appendChild(pill);
          }
        });
      }

      // Quiz card custom title
      // Example: CRISPR -> Test Your CRISPR Knowledge
      let quizTopic = article.title.includes('CRISPR') ? 'CRISPR' : article.category;
      quizSubtitle.textContent = `Test Your ${quizTopic} Knowledge — 3 questions`;

      // Quiz Interaction Logic
      const quizCard = document.getElementById('quizCard');
      const quizBtn = quizCard.querySelector('.quiz-btn');
      const initialQuizHtml = quizCard.innerHTML;

      let quizQuestions = [];
      let currentQuestionIndex = 0;
      let score = 0;

      const loadQuiz = async () => {
        try {
          const res = await fetch('/data/quizzes.json');
          if (!res.ok) throw new Error('Failed to load quiz data');
          const quizData = await res.json();
          quizQuestions = quizData[articleId] || [];
          if (quizQuestions.length > 0) {
            startQuiz();
          } else {
            quizCard.style.display = 'none';
          }
        } catch (err) {
          console.error('Error initializing quiz:', err);
          quizCard.style.display = 'none';
        }
      };

      quizBtn.addEventListener('click', loadQuiz);

      const startQuiz = () => {
        currentQuestionIndex = 0;
        score = 0;
        renderQuestion();
      };

      const renderQuestion = () => {
        const question = quizQuestions[currentQuestionIndex];
        const progressPercent = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);
        
        quizCard.innerHTML = `
          <div class="quiz-progress-container quiz-fade-in">
            <div class="quiz-progress-text">
              <span>Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</span>
              <span>${progressPercent}% Complete</span>
            </div>
            <div class="quiz-progress-bar-bg">
              <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%"></div>
            </div>
          </div>

          <div class="quiz-question-container quiz-fade-in">
            <h3 class="quiz-question-text">${question.question}</h3>
            
            <div class="quiz-options-list">
              ${question.options.map((option, idx) => {
                const label = String.fromCharCode(65 + idx); // A, B, C, D
                return `
                  <div class="quiz-option-card" data-index="${idx}">
                    <span class="quiz-option-label">${label}</span>
                    <span class="quiz-option-text">${option}</span>
                    <div class="quiz-option-status-icon"></div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="quiz-action-wrapper">
              <button class="quiz-next-btn">
                <span>${currentQuestionIndex === quizQuestions.length - 1 ? 'See Results' : 'Next Question'}</span>
                <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </button>
            </div>
          </div>
        `;

        // Setup option click listeners
        const optionCards = quizCard.querySelectorAll('.quiz-option-card');
        optionCards.forEach(card => {
          card.addEventListener('click', () => selectOption(card, optionCards, question.answer));
        });

        // Setup next button listener
        const nextBtn = quizCard.querySelector('.quiz-next-btn');
        nextBtn.addEventListener('click', () => {
          currentQuestionIndex++;
          if (currentQuestionIndex < quizQuestions.length) {
            renderQuestion();
          } else {
            showResults();
          }
        });
      };

      const selectOption = (selectedCard, allCards, correctIdx) => {
        const selectedIdx = parseInt(selectedCard.getAttribute('data-index'), 10);
        const isCorrect = selectedIdx === correctIdx;

        if (isCorrect) {
          score++;
          selectedCard.classList.add('correct');
          selectedCard.querySelector('.quiz-option-status-icon').innerHTML = `
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          `;
        } else {
          selectedCard.classList.add('incorrect');
          selectedCard.querySelector('.quiz-option-status-icon').innerHTML = `
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          `;

          // Also highlight correct answer
          const correctCard = Array.from(allCards).find(c => parseInt(c.getAttribute('data-index'), 10) === correctIdx);
          if (correctCard) {
            correctCard.classList.add('correct');
            correctCard.querySelector('.quiz-option-status-icon').innerHTML = `
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            `;
          }
        }

        // Disable all cards
        allCards.forEach(card => {
          card.classList.add('disabled');
        });

        // Show next button
        const nextBtn = quizCard.querySelector('.quiz-next-btn');
        nextBtn.classList.add('visible');
      };

      const showResults = () => {
        let title = '';
        let message = '';

        if (score === quizQuestions.length) {
          title = 'Perfect Score!';
          message = 'Excellent! You clearly have a deep understanding of this topic. Keep up the amazing work!';
        } else if (score >= 2) {
          title = 'Great Job!';
          message = 'You answered most questions correctly. A solid grasp of the core concepts!';
        } else {
          title = 'Keep Learning!';
          message = 'A quick review of the article might help clarify some of the key concepts. Give it another try!';
        }

        quizCard.innerHTML = `
          <div class="quiz-results-container quiz-fade-in">
            <div class="quiz-score-badge">
              <span class="quiz-score-num">${score}</span>
              <span class="quiz-score-total">of ${quizQuestions.length}</span>
            </div>
            
            <h3 class="quiz-results-headline">${title}</h3>
            <p class="quiz-results-body">${message}</p>
            
            <div class="quiz-results-actions">
              <button class="quiz-secondary-btn" id="retakeQuizBtn">Retake Quiz</button>
              <button class="quiz-secondary-btn" id="resetQuizCardBtn">Back to Article</button>
            </div>
          </div>
        `;

        document.getElementById('retakeQuizBtn').addEventListener('click', startQuiz);
        document.getElementById('resetQuizCardBtn').addEventListener('click', () => {
          quizCard.innerHTML = initialQuizHtml;
          // Re-attach listener to the newly rendered button
          const newQuizBtn = quizCard.querySelector('.quiz-btn');
          newQuizBtn.addEventListener('click', loadQuiz);
          // Update the custom subtitle title again
          let quizTopic = article.title.includes('CRISPR') ? 'CRISPR' : article.category;
          document.getElementById('quizSubtitle').textContent = `Test Your ${quizTopic} Knowledge — 3 questions`;
        });
      };

    } catch (error) {
      console.error('Error fetching article:', error);
      document.title = 'Article Not Found - Lumen';
      
      // Render error message in title
      detailTitle.textContent = 'Article Not Found';
      detailDesc.textContent = 'The article you are looking for does not exist or may have been removed.';
      
      // Hide sections
      document.querySelector('.detail-author-block').style.display = 'none';
      document.querySelector('.detail-img-wrapper').style.display = 'none';
      detailBody.style.display = 'none';
      detailTags.style.display = 'none';
      document.getElementById('quizCard').style.display = 'none';
    }
  };

  fetchArticleDetails();
});
