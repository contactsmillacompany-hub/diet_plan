const fs = require('fs');
let mealsData = JSON.parse(fs.readFileSync('diet_plan.json', 'utf8'));

mealSchedule = [];
function parseTimeToHour(timeStr) {
  const [time, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  } else if (modifier === 'PM') {
    hours += 12;
  }
  return hours + (parseInt(minutes, 10) / 60);
}

for (const [key, val] of Object.entries(mealsData)) {
  mealSchedule.push({
    id: key,
    title: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    timeStr: val.time,
    hour: parseTimeToHour(val.time),
    options: val.options
  });
}
mealSchedule.sort((a,b) => a.hour - b.hour);

function getCurrentMealInfo(hour) {
  let currentMeal = mealSchedule[0];
  let currentIdx = 1;
  let found = false;

  for (let i = 0; i < mealSchedule.length; i++) {
    if (i < mealSchedule.length - 1 && hour >= mealSchedule[i].hour && hour < mealSchedule[i+1].hour) {
       currentMeal = mealSchedule[i];
       currentIdx = i + 1;
       found = true;
       break;
    }
  }
  
  if (!found) {
    const lastMeal = mealSchedule[mealSchedule.length - 1];
    if (hour >= lastMeal.hour && hour < lastMeal.hour + 2.5) {
       currentMeal = lastMeal;
       currentIdx = mealSchedule.length;
       found = true;
    }
  }

  if (!found && hour < mealSchedule[0].hour) {
     return { id: 'rest', title: 'Rest & Recover', index: 0, options: [] };
  }

  if (found) {
     return { ...currentMeal, index: currentIdx };
  }
  return { id: 'rest', title: 'All Done!', index: 0, options: [] };
}

console.log("2AM:", getCurrentMealInfo(2 + 40/60));
console.log("8AM:", getCurrentMealInfo(8));
console.log("2PM:", getCurrentMealInfo(14));
