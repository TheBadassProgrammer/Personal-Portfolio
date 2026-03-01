document.addEventListener('DOMContentLoaded', function () {
  // Set current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.innerText = new Date().getFullYear();

  // About tabs
  const tabButtons = document.querySelectorAll('.tab-links');
  const tabPanels = document.querySelectorAll('.tab-contents');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('active-link');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active-tab'));

      btn.classList.add('active-link');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add('active-tab');
    });
  });

  // Matrix rain
  const canvas = document.getElementById('matrix-bg');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const characters = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789".split("");
    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    // Keep columns in sync after resize
    setInterval(() => {
      const nextColumns = Math.floor(canvas.width / fontSize);
      if (nextColumns !== columns) {
        columns = nextColumns;
        drops = new Array(columns).fill(1);
      }
    }, 600);

    setInterval(draw, 35);
  }

  // Terminal typing effect
  const firstPara = document.querySelector('.terminal-content p');
  if (firstPara && !reduceMotion) {
    const originalText = firstPara.textContent || '';
    firstPara.textContent = '';
    let i = 0;
    function typeWriter() {
      if (i < originalText.length) {
        firstPara.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 35);
      }
    }
    setTimeout(typeWriter, 600);
  }

  // Animate skill bars when section appears
  const skillLevels = document.querySelectorAll('.skill-level');
  const skillsSection = document.getElementById('skills');
  function runSkillAnimation() {
    skillLevels.forEach(el => {
      const width = el.getAttribute('style')?.match(/width:\s*([^;]+)/)?.[1] || el.style.width || '0%';
      el.style.width = '0%';
      setTimeout(() => (el.style.width = width), 250);
    });
  }

  if (skillsSection && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        if (!reduceMotion) runSkillAnimation();
        obs.disconnect();
      }
    }, { threshold: 0.25 });
    obs.observe(skillsSection);
  } else {
    if (!reduceMotion) runSkillAnimation();
  }

  // ---------- GitHub integration ----------
  const GITHUB_USERNAME = 'TheBadassProgrammer';
  const loadBtn = document.getElementById('load-gh');
  const usernameInput = document.getElementById('gh-username');
  const projectsGrid = document.getElementById('projects-grid');
  const restoreBtn = document.getElementById('use-placeholder');

  function setLoadingState(isLoading) {
    if (!loadBtn) return;
    loadBtn.disabled = isLoading;
    loadBtn.innerText = isLoading ? 'Loading…' : 'Load';
  }

  function createRepoCard(repo) {
    const article = document.createElement('article');
    article.className = 'project-card';

    const img = document.createElement('img');
    img.className = 'project-img';
    img.alt = repo.name + ' thumbnail';
    img.loading = 'lazy';
    img.src = (repo.owner && repo.owner.avatar_url) ? repo.owner.avatar_url : ('https://github.com/' + GITHUB_USERNAME + '.png');
    article.appendChild(img);

    const body = document.createElement('div');
    body.className = 'project-body';

    const h3 = document.createElement('h3');
    h3.innerText = repo.name;
    body.appendChild(h3);

    const p = document.createElement('p');
    p.innerText = repo.description ? repo.description : 'No description yet.';
    body.appendChild(p);

    const tags = document.createElement('div');
    tags.className = 'project-tags';

    if (repo.language) {
      const lang = document.createElement('span');
      lang.innerText = repo.language;
      tags.appendChild(lang);
    }

    const stars = document.createElement('span');
    stars.innerText = '★ ' + (repo.stargazers_count ?? 0);
    tags.appendChild(stars);

    const forks = document.createElement('span');
    forks.innerText = '⑂ ' + (repo.forks_count ?? 0);
    tags.appendChild(forks);

    const upd = document.createElement('span');
    const updatedAt = new Date(repo.updated_at);
    upd.innerText = 'Updated: ' + updatedAt.toLocaleDateString();
    tags.appendChild(upd);

    body.appendChild(tags);

    const actions = document.createElement('div');
    actions.className = 'project-actions';

    const repoLink = document.createElement('a');
    repoLink.className = 'button small';
    repoLink.href = repo.html_url;
    repoLink.target = '_blank';
    repoLink.rel = 'noopener';
    repoLink.innerText = 'Repo';
    actions.appendChild(repoLink);

    const secondary = document.createElement('a');
    secondary.className = 'button small outline';
    secondary.target = '_blank';
    secondary.rel = 'noopener';
    if (repo.homepage) {
      secondary.href = repo.homepage.startsWith('http') ? repo.homepage : ('https://' + repo.homepage);
      secondary.innerText = 'Live';
    } else {
      secondary.href = repo.html_url;
      secondary.innerText = 'Details';
    }
    actions.appendChild(secondary);

    body.appendChild(actions);
    article.appendChild(body);
    return article;
  }

  function renderRepoSkeleton() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const sk = document.createElement('div');
      sk.className = 'skeleton-card';
      sk.innerHTML = '<div class="skeleton-img"></div><div class="skeleton-lines"><div></div><div></div><div></div></div>';
      projectsGrid.appendChild(sk);
    }
  }

  async function loadReposFor(username) {
    if (!projectsGrid) return;
    if (!username) {
      alert('Please enter a GitHub username.');
      return;
    }

    renderRepoSkeleton();
    setLoadingState(true);

    try {
      const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=6&sort=updated`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
      if (!resp.ok) throw new Error('Could not fetch GitHub repos (rate-limit or user not found).');

      const repos = await resp.json();
      if (!Array.isArray(repos) || repos.length === 0) {
        projectsGrid.innerHTML = '<p class="muted">No public repos found.</p>';
        return;
      }

      projectsGrid.innerHTML = '';
      repos.forEach(repo => projectsGrid.appendChild(createRepoCard(repo)));
    } catch (err) {
      console.error(err);
      projectsGrid.innerHTML = '<p class="muted">Could not load repos right now. Try again later.</p>';
    } finally {
      setLoadingState(false);
    }
  }

  if (usernameInput) usernameInput.value = GITHUB_USERNAME;
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const username = (usernameInput && usernameInput.value.trim()) ? usernameInput.value.trim() : GITHUB_USERNAME;
      loadReposFor(username);
    });
  }
  if (restoreBtn) restoreBtn.addEventListener('click', () => location.reload());

  // Auto-run
  loadReposFor(GITHUB_USERNAME);
});