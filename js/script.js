document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navButtons = document.querySelectorAll('.nav-btn');
  const viewSections = document.querySelectorAll('.view-section');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  const activityForm = document.getElementById('activity-form');
  const activityList = document.getElementById('activity-list');
  const fullActivityList = document.getElementById('full-activity-list');
  const scoreValueEl = document.getElementById('score-value');
  const scoreBarEl = document.getElementById('score-bar');
  const totalHoursEl = document.getElementById('total-hours');
  const activityCountEl = document.getElementById('activity-count');
  const scoreStatusEl = document.getElementById('score-status');
  const currentDateEl = document.getElementById('current-date');
  const analyticsSummary = document.getElementById('analytics-summary');
  const targetHoursInput = document.getElementById('target-hours-input');
  const saveTargetBtn = document.getElementById('save-target-btn');

  let targetHours = parseFloat(localStorage.getItem('dayscore_target')) || 8;
  targetHoursInput.value = targetHours;

  currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  let activities = JSON.parse(localStorage.getItem('dayscore_activities')) || [
    { id: 1, name: 'Setup VS Code Project', category: 'Study', duration: 1.5, impact: 1.2 }
  ];

  // TAB NAVIGATION FUNCTIONALITY
  const titles = {
    'dashboard-view': { title: 'Productivity Dashboard', sub: 'Track activities, measure focus, and hit your daily score goals.' },
    'activities-view': { title: 'Activity Log', sub: 'Detailed breakdown of all tasks completed today.' },
    'goals-view': { title: 'Daily Goals', sub: 'Configure your target hours and daily expectations.' },
    'analytics-view': { title: 'Analytics', sub: 'Visual summary of your time distribution.' }
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');

      // Update Nav active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide all views, display selected view
      viewSections.forEach(sec => sec.style.display = 'none');
      document.getElementById(targetId).style.display = 'block';

      // Update Header Titles
      if (titles[targetId]) {
        pageTitle.textContent = titles[targetId].title;
        pageSubtitle.textContent = titles[targetId].sub;
      }
    });
  });

  // SAVE & RENDER DATA
  function saveAndRender() {
    localStorage.setItem('dayscore_activities', JSON.stringify(activities));
    renderActivities();
    calculateDayScore();
    renderAnalytics();
  }

  function renderActivities() {
    activityList.innerHTML = '';
    fullActivityList.innerHTML = '';

    if (activities.length === 0) {
      const emptyMsg = '<p style="color: var(--text-sub); padding: 10px;">No activities recorded yet.</p>';
      activityList.innerHTML = emptyMsg;
      fullActivityList.innerHTML = emptyMsg;
      return;
    }

    activities.forEach(act => {
      const createLi = () => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
          <div>
            <strong>${act.name}</strong> 
            <span style="color: var(--text-sub); font-size:0.85rem;">(${act.category})</span>
            <div><small>${act.duration} hrs • ${act.impact}x impact</small></div>
          </div>
          <button class="btn-delete" onclick="deleteActivity(${act.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        `;
        return li;
      };

      activityList.appendChild(createLi());
      fullActivityList.appendChild(createLi());
    });
  }

  window.deleteActivity = function(id) {
    activities = activities.filter(act => act.id !== id);
    saveAndRender();
  };

  function calculateDayScore() {
    let totalWeightedHours = 0;
    let totalHours = 0;

    activities.forEach(act => {
      totalHours += parseFloat(act.duration);
      totalWeightedHours += parseFloat(act.duration) * parseFloat(act.impact);
    });

    let rawScore = Math.min((totalWeightedHours / targetHours) * 100, 100);
    let finalScore = Math.round(rawScore);

    scoreValueEl.textContent = finalScore;
    scoreBarEl.style.width = `${finalScore}%`;
    totalHoursEl.textContent = `${totalHours.toFixed(1)} hrs`;
    activityCountEl.textContent = activities.length;

    if (finalScore >= 80) {
      scoreStatusEl.textContent = '🔥 Excellent';
      scoreStatusEl.style.color = '#4ade80';
    } else if (finalScore >= 50) {
      scoreStatusEl.textContent = '⚡ Good Pace';
      scoreStatusEl.style.color = '#38bdf8';
    } else {
      scoreStatusEl.textContent = '🌱 Getting Started';
      scoreStatusEl.style.color = '#f87171';
    }
  }

  function renderAnalytics() {
    const categories = {};
    activities.forEach(act => {
      categories[act.category] = (categories[act.category] || 0) + parseFloat(act.duration);
    });

    analyticsSummary.innerHTML = '';
    const keys = Object.keys(categories);
    if (keys.length === 0) {
      analyticsSummary.innerHTML = '<p style="color: var(--text-sub);">No analytics data yet.</p>';
      return;
    }

    keys.forEach(cat => {
      const item = document.createElement('div');
      item.style.padding = '10px';
      item.style.background = 'var(--bg-dark)';
      item.style.borderRadius = '6px';
      item.innerHTML = `<strong>${cat}:</strong> ${categories[cat].toFixed(1)} hours logged`;
      analyticsSummary.appendChild(item);
    });
  }

  activityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('act-name').value;
    const category = document.getElementById('act-category').value;
    const duration = parseFloat(document.getElementById('act-duration').value);
    const impact = parseFloat(document.getElementById('act-impact').value);

    activities.push({ id: Date.now(), name, category, duration, impact });
    activityForm.reset();
    saveAndRender();
  });

  saveTargetBtn.addEventListener('click', () => {
    targetHours = parseFloat(targetHoursInput.value) || 8;
    localStorage.setItem('dayscore_target', targetHours);
    calculateDayScore();
    alert(`Daily Target updated to ${targetHours} hours!`);
  });

  saveAndRender();
});