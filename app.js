let mealsData = {};
let mealSchedule = [];
let maxMeals = 0;
let currentMealId = null;
let viewingMealId = null;
let lastRenderedMealId = null;
let completedMeals = new Set();

const defaultDescriptions = {
  "Poha": "Light, tasty & easy to digest",
  "Oats": "High fiber & healthy start to the day",
  "Eggs": "High protein & very filling",
  "Idli": "South Indian classic & nutritious",
  "Rice": "Classic Indian comfort food",
  "Dal": "Protein rich and comforting",
  "Paneer": "Rich in protein and flavor",
  "Fruit": "Fresh and full of vitamins",
  "Roti": "Wholesome and balanced meal",
  "Sabzi": "Rich in nutrients and fiber"
};

const dishImages = {
  // Specific meals first
  "omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80",
  "pulao": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
  "khichdi": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
  "upma": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
  "cheela": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80",
  "makhana": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80",
  "chole": "https://images.unsplash.com/photo-1539755530862-00f623c00f52?w=400&q=80",
  "poha": "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&q=80",
  "oats": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&q=80",
  // Ingredients/Components
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=400&q=80",
  "orange": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&q=80",
  "pear": "https://images.unsplash.com/photo-1615486171448-4fdcd9116e03?w=400&q=80",
  "muskmelon": "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=400&q=80",
  "almond": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80",
  "water": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&q=80",
  "egg": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80",
  "chicken": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80",
  "rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80",
  "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  "paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=400&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
  "seed": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
  "bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  "default": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"
};

const categoryImages = {
  "breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80",
  "morning": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "lunch": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "snack": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80",
  "dinner": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
  "bedtime": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
  "default": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"
};

function parseTimeToHour(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 0;
  const time = parts[0];
  const modifier = parts[1];
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  } else if (modifier === 'PM') {
    hours += 12;
  }
  return hours + ((parseInt(minutes, 10) || 0) / 60);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function getDishImage(dishName) {
  const name = dishName.toLowerCase();
  // Priority match for problematic dishes
  if (name.includes("oats")) return dishImages["oats"];
  if (name.includes("poha")) return dishImages["poha"];
  
  for (const [key, url] of Object.entries(dishImages)) {
    if (name.includes(key)) {
      return url;
    }
  }
  return dishImages["default"];
}

function getCategoryImage(title) {
  const name = title.toLowerCase();
  for (const [key, url] of Object.entries(categoryImages)) {
    if (name.includes(key)) {
      return url;
    }
  }
  return categoryImages["default"];
}

function getDishDescription(dishName) {
  for (const key in defaultDescriptions) {
    if (dishName.toLowerCase().includes(key.toLowerCase())) {
      return defaultDescriptions[key];
    }
  }
  return "Delicious and healthy choice for you";
}

// LocalStorage caching wrapper
// LocalStorage caching wrapper
const IMAGE_CACHE_KEY = 'dietPlanner_imageCache_v4';

const ImageCache = {
  get: function() {
    try {
      return JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY)) || {};
    } catch (e) {
      return {};
    }
  },
  set: function(key, url) {
    const cache = this.get();
    cache[key] = url;
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  },
  has: function(key) {
    return this.get().hasOwnProperty(key);
  }
};

function getEmojiForDish(dishName) {
  const name = dishName.toLowerCase();
  if (name.includes("chicken") || name.includes("egg")) return "🍗";
  if (name.includes("rice") || name.includes("pulao") || name.includes("khichdi")) return "🍛";
  if (name.includes("bread") || name.includes("roti") || name.includes("parantha")) return "🫓";
  if (name.includes("salad") || name.includes("veg")) return "🥗";
  if (name.includes("dal") || name.includes("chole") || name.includes("soup")) return "🍲";
  if (name.includes("paneer")) return "🧀";
  if (name.includes("fruit") || name.includes("apple") || name.includes("orange") || name.includes("melon")) return "🍎";
  if (name.includes("milk") || name.includes("water")) return "🥛";
  if (name.includes("seed") || name.includes("almond")) return "🥜";
  if (name.includes("oats") || name.includes("poha") || name.includes("upma")) return "🥣";
  return "🍽️";
}

async function extractAndFetchImages() {
  const allDishes = new Set();
  mealSchedule.forEach(meal => {
    meal.options.forEach(opt => allDishes.add(opt));
  });

  const ignoreWords = ["soaked", "overnight", "multigrain", "brown", "low", "fat", "with", "seed", "water", "boiled"];
  
  // Create an array of fetch promises to run in parallel
  const fetchPromises = Array.from(allDishes).map(async (dish) => {
    if (ImageCache.has(dish)) return;

    const curated = getDishImage(dish);
    if (curated !== dishImages["default"]) {
      ImageCache.set(dish, curated);
      return;
    }

    try {
      let keywords = dish.toLowerCase().split(' ').filter(w => !ignoreWords.includes(w));
      const query = encodeURIComponent(keywords[0] || dish.split(' ')[0]);
      
      const res = await fetch(`https://loremflickr.com/json/g/400/300/${query},food`);
      if (res.ok) {
        const data = await res.json();
        ImageCache.set(dish, data && data.file ? data.file : null);
      } else {
        ImageCache.set(dish, null);
      }
    } catch (e) {
      ImageCache.set(dish, null);
    }
  });

  // Run all fetches in parallel
  // Phase 1: Refresh UI for curated images that were just added to cache synchronously
  updateUI();

  await Promise.all(fetchPromises);
  
  // Phase 2: Final UI refresh once all remote fetches are cached
  updateUI();
}

function getIconForMeal(id) {
  if (id.includes("breakfast")) return "ph-sun";
  if (id.includes("lunch")) return "ph-fork-knife";
  if (id.includes("snack")) return "ph-coffee";
  if (id.includes("dinner")) return "ph-moon";
  return "ph-bowl-food";
}

function getMealTitleByTime(hour) {
  if (hour < 10) return "Breakfast";
  if (hour < 12) return "Mid Morning";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Evening Snack";
  return "Dinner";
}

function findMealArray(obj) {
  if (!obj) return null;
  if (Array.isArray(obj)) {
    // Check if it's an array of meal-like objects
    if (obj.length > 0 && (obj[0].time || obj[0].options || obj[0].items)) return obj;
  }
  if (typeof obj === 'object') {
    for (let key in obj) {
      const found = findMealArray(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

function processMealsData() {
  mealSchedule = [];

  // Universal Heuristic Search: Find the meal list no matter where it's hidden or what it's called
  const dataArray = findMealArray(mealsData);
  console.log('Found dataArray:', dataArray);

  if (dataArray && Array.isArray(dataArray)) {
    dataArray.forEach((entry, idx) => {
      console.log('Processing entry:', entry);
      let options = [];
      const rawOptions = entry.options || entry.meals || entry.dishes || [];
      console.log('Raw options:', rawOptions);
      
      if (Array.isArray(rawOptions)) {
        options = rawOptions.map(opt => {
          console.log('Processing option:', opt);
          if (typeof opt === 'string') return opt;
          // Handle { items: [...] } - check this first since it's more specific
          if (opt.items && Array.isArray(opt.items)) {
            const result = opt.items.map(item => `${item.dish} (${item.quantity || ''})`).join(' + ');
            console.log('Items result:', result);
            return result;
          }
          // Handle { dish: "...", quantity: "..." }
          if (opt.dish) return `${opt.dish} (${opt.quantity || ''})`;
          return opt.name || opt.title || "Option " + (idx + 1);
        });
      }
      
      const meal = {
        id: `meal_${idx}`,
        title: entry.meal || entry.title || entry.name || getMealTitleByTime(parseTimeToHour(entry.time)),
        timeStr: entry.time || "12:00 PM",
        hour: parseTimeToHour(entry.time),
        options: options
      };
      console.log('Created meal:', meal);
      mealSchedule.push(meal);
    });
  } 
  // ... (rest of the fallback logic)
  // Original object-based format
  else {
    for (const [key, val] of Object.entries(mealsData)) {
      let options = [];
      let timeStr = "12:00 PM";
      
      if (Array.isArray(val)) {
         options = val;
         if (key.includes('breakfast')) timeStr = '08:00 AM';
         else if (key.includes('lunch')) timeStr = '01:00 PM';
         else if (key.includes('snack')) timeStr = '05:00 PM';
         else if (key.includes('dinner')) timeStr = '08:00 PM';
      } else if (val && typeof val === 'object') {
         options = val.options || [];
         timeStr = val.time || timeStr;
      }

      mealSchedule.push({
        id: key,
        title: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        timeStr: timeStr,
        hour: parseTimeToHour(timeStr),
        options: options
      });
    }
  }

  mealSchedule.sort((a, b) => a.hour - b.hour);
  maxMeals = mealSchedule.length;

  updateUI();
  extractAndFetchImages();

  if (!window.updateInterval) {
    window.updateInterval = setInterval(updateUI, 60000);
  }
}

const USER_PLAN_KEY = 'dietPlanner_userPlan';

async function initData() {
  try {
    // 1. Try loading from LocalStorage first (User's uploaded plan)
    const savedPlan = localStorage.getItem(USER_PLAN_KEY);
    if (savedPlan) {
      mealsData = JSON.parse(savedPlan);
      processMealsData();
      return;
    }

    // 2. Fallback to default JSON file
    const res = await fetch('diet_plan.json');
    if (res.ok) {
      mealsData = await res.json();
      processMealsData();
    } else {
      renderUploadPrompt();
    }
  } catch (e) {
    console.warn("Init failed", e);
    renderUploadPrompt();
  }
}

function getCurrentMealInfo(hour) {
  if (mealSchedule.length === 0) return null;

  console.log('getCurrentMealInfo called with hour:', hour, 'mealSchedule:', mealSchedule);

  // Find the last meal that has already passed
  let lastPassedMeal = mealSchedule[0];
  let lastIdx = 1;
  let found = false;

  for (let i = 0; i < mealSchedule.length; i++) {
    if (hour >= mealSchedule[i].hour) {
      lastPassedMeal = mealSchedule[i];
      lastIdx = i + 1;
      found = true;
    }
  }

  // If we found a meal that passed today, check if it was too long ago
  if (found) {
    // If it's more than 4 hours after the last meal of the day, show rest state
    if (hour > mealSchedule[mealSchedule.length - 1].hour + 4) {
      console.log('Showing rest state - too late');
      return { id: 'rest_night', title: 'Rest & Recover', index: 0, timeStr: 'Night time', options: [] };
    }
    console.log('Found passed meal:', lastPassedMeal);
    return { ...lastPassedMeal, index: lastIdx };
  }

  // If no meal has passed yet today (early morning)
  if (hour < mealSchedule[0].hour) {
     // If it's within 2 hours of the first meal, show the first meal as "Up Next"
     if (hour >= mealSchedule[0].hour - 2) {
       console.log('Showing first meal as upcoming');
       return { ...mealSchedule[0], index: 1 };
     }
     console.log('Too early, showing rest');
     return { id: 'rest_morning', title: 'Rest & Recover', index: 0, timeStr: 'Night time', next: mealSchedule[0], options: [] };
  }

  // Default to first meal if nothing else matches
  console.log('Defaulting to first meal');
  return { ...mealSchedule[0], index: 1 };
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'Good Morning ☀️';
  if (hour >= 12 && hour < 17) return 'Good Afternoon 🌤️';
  if (hour >= 17 && hour < 21) return 'Good Evening 🌙';
  return 'Good Night 😴';
}

function renderUploadPrompt() {
  const container = document.getElementById('cards-container');
  container.innerHTML = `
      <div class="meal-card" style="grid-column: span 2; border: 1px dashed var(--accent-color); align-items:center; justify-content:center; padding: 40px;">
         <div style="font-size:1rem; color:var(--text-muted); text-align:center;">
            Open <b>Settings</b> (gear icon) to upload your personalized diet plan.
         </div>
      </div>
    `;
}

function renderCurrentMeal(mealInfo) {
  console.log('renderCurrentMeal called with:', mealInfo);
  document.getElementById('hero-meal-title').textContent = `It's ${mealInfo.title} Time!`;
  const timeText = mealInfo.timeStr ? `${mealInfo.timeStr} • ` : '';
  document.getElementById('hero-subtitle').textContent = `${timeText}Have a healthy and productive day!`;
  document.getElementById('options-title').textContent = `${mealInfo.title} Options`;

  const heroImg = document.getElementById('hero-image');
  heroImg.src = getCategoryImage(mealInfo.title);

  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  if (mealInfo.id.startsWith('rest_')) {
    container.innerHTML = `<div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 40px 0;">No active meal options right now.</div>`;
    return;
  }

  console.log('Rendering options:', mealInfo.options);
  mealInfo.options.forEach((opt, idx) => {
    console.log('Rendering option:', opt, 'at index:', idx);
    const isSelected = idx === 0;
    if (isSelected && !completedMeals.has(mealInfo.id)) completedMeals.add(mealInfo.id);

    const card = document.createElement('div');
    card.className = `meal-card ${isSelected ? 'selected' : ''}`;

    const desc = getDishDescription(opt);
    console.log('Description for', opt, ':', desc);
    
    let imgHTML = '';
    if (ImageCache.has(opt)) {
       const cachedUrl = ImageCache.get()[opt];
       if (cachedUrl) {
         imgHTML = `<img class="meal-card-img" src="${cachedUrl}" alt="${opt}" loading="lazy" onerror="this.outerHTML='<div class=&quot;emoji-fallback&quot;>${getEmojiForDish(opt)}</div>'">`;
       } else {
         imgHTML = `<div class="emoji-fallback">${getEmojiForDish(opt)}</div>`;
       }
    } else {
       imgHTML = `<div class="meal-card-img skeleton"></div>`;
    }

    card.innerHTML = `
      ${imgHTML}
      <div class="meal-card-content">
        <div>
          <div class="meal-card-title">${opt}</div>
          <div class="meal-card-desc">${desc}</div>
        </div>
        <button class="mark-btn">
          <i class="ph-fill ph-check-circle" style="display: ${isSelected ? 'inline-block' : 'none'}; color: var(--accent-color); font-size: 1.2rem;"></i>
          <i class="ph ph-check-circle" style="display: ${isSelected ? 'none' : 'inline-block'}; font-size: 1.2rem;"></i>
          <span>${isSelected ? 'Marked' : 'Mark as Eaten'}</span>
        </button>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.meal-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.ph-fill').style.display = 'none';
        c.querySelector('.ph.ph-check-circle').style.display = 'inline-block';
        c.querySelector('span').textContent = 'Mark as Eaten';
      });
      card.classList.add('selected');
      card.querySelector('.ph-fill').style.display = 'inline-block';
      card.querySelector('.ph.ph-check-circle').style.display = 'none';
      card.querySelector('span').textContent = 'Marked';

      completedMeals.add(mealInfo.id);
      updateUI();
    });

    container.appendChild(card);
  });
}

function renderTimeline(viewedMealInfo, actualCurrentMealInfo) {
  const container = document.getElementById('timeline-container');
  container.innerHTML = '';

  mealSchedule.forEach((meal) => {
    const isCompleted = completedMeals.has(meal.id);
    const isViewed = meal.id === viewedMealInfo.id;
    const isActual = meal.id === (actualCurrentMealInfo && actualCurrentMealInfo.id);

    let iconClass = getIconForMeal(meal.id || "");
    if (isCompleted && !isViewed) {
      iconClass = "ph-fill ph-check-circle";
    }

    const step = document.createElement('div');
    step.className = `timeline-step ${isCompleted ? 'completed' : ''} ${isViewed ? 'active' : ''}`;
    step.style.cursor = 'pointer';

    step.innerHTML = `
      <div class="step-icon" style="${isActual && !isViewed ? 'box-shadow: 0 0 0 2px var(--accent-light);' : ''}">
        <i class="ph ${iconClass}"></i>
      </div>
      <div class="step-title">${meal.title}</div>
      <div class="step-time">${meal.timeStr}</div>
    `;
    
    step.onclick = () => {
      viewingMealId = meal.id;
      lastRenderedMealId = null;
      updateUI();
    };

    container.appendChild(step);
  });
}

function updateUI() {
  if (mealSchedule.length === 0) return;

  const now = new Date();
  const currentHour = now.getHours() + (now.getMinutes() / 60);

  document.getElementById('greeting').textContent = getGreeting(now.getHours());

  // Temporarily force first meal for testing
  const actualCurrentMealInfo = mealSchedule.length > 0 ? mealSchedule[0] : getCurrentMealInfo(currentHour);
  console.log('Forcing first meal for testing:', actualCurrentMealInfo);

  if (currentMealId !== actualCurrentMealInfo.id) {
    currentMealId = actualCurrentMealInfo.id;
    viewingMealId = currentMealId;
  }
  
  const mealToRender = viewingMealId ? (mealSchedule.find(m => m.id === viewingMealId) || actualCurrentMealInfo) : actualCurrentMealInfo;

  if (lastRenderedMealId !== mealToRender.id) {
    lastRenderedMealId = mealToRender.id;
    renderCurrentMeal(mealToRender);
  }
  
  renderTimeline(mealToRender, actualCurrentMealInfo);

  setTimeout(() => {
    const activeStep = document.querySelector('.timeline-step.active');
    if (activeStep) {
      activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 100);
}

// Event Listeners
document.getElementById('settings-icon').addEventListener('click', () => {
  document.getElementById('settings-modal').classList.add('active');
});

document.getElementById('close-settings').addEventListener('click', () => {
  document.getElementById('settings-modal').classList.remove('active');
});

document.getElementById('settings-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('settings-modal')) {
    document.getElementById('settings-modal').classList.remove('active');
  }
});

document.getElementById('clear-btn')?.addEventListener('click', () => {
  mealsData = {};
  mealSchedule = [];
  currentMealId = null;
  viewingMealId = null;
  lastRenderedMealId = null;
  completedMeals.clear();
  localStorage.removeItem(IMAGE_CACHE_KEY);
  localStorage.removeItem(USER_PLAN_KEY);
  
  document.getElementById('hero-meal-title').textContent = 'Plan Cleared';
  document.getElementById('hero-subtitle').textContent = 'Please upload a new diet plan to continue.';
  document.getElementById('options-title').textContent = '';
  document.getElementById('timeline-container').innerHTML = '';
  document.getElementById('hero-image').src = categoryImages["default"];
  document.getElementById('settings-modal').classList.remove('active');
  
  renderUploadPrompt();
  
  const btn = document.getElementById('upload-btn');
  if (btn) btn.innerHTML = '<i class="ph ph-upload-simple"></i> Upload Plan Data (.json)';
});

document.getElementById('persistent-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      let content = ev.target.result.trim();
      // Auto-strip markdown code blocks (e.g. ```json ... ```)
      if (content.startsWith('```')) {
        content = content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
      }
      
      mealsData = JSON.parse(content);
      console.log('Parsed mealsData:', mealsData);
      if (Object.keys(mealsData).length === 0) {
        throw new Error('Empty JSON');
      }

      // Save to persistence
      localStorage.setItem(USER_PLAN_KEY, JSON.stringify(mealsData));
      
      const btn = document.getElementById('upload-btn');
      if (btn) btn.textContent = "Plan Loaded ✓";
      
      currentMealId = null; 
      lastRenderedMealId = null;
      processMealsData();
    } catch (err) {
      alert('Invalid JSON file. Ensure you didn\'t accidentally include extra text before or after the { } brackets.');
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
});

// "Surprise Me" shuffle
document.getElementById('surprise-btn')?.addEventListener('click', () => {
    const cards = document.querySelectorAll('.meal-card');
    if(cards.length > 0) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        cards[randomIndex].click();
    }
});

// Start app
initData();
