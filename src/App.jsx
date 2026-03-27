import { useState, useMemo, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F6F1E9; --card: #FFFFFF; --green: #1C3829; --green-mid: #2D5A3D;
    --green-light: #EAF1EC; --terra: #C85D28; --terra-light: #FAF0EA;
    --sage: #6A9B6A; --text: #1E1E1E; --muted: #8A8078; --border: #E2DAD0;
    --shadow: 0 2px 12px rgba(0,0,0,0.07); --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }
  h1,h2,h3 { font-family: 'Playfair Display', serif; }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
  input, select, textarea { font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 72px; background: var(--green); display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 6px; flex-shrink: 0; }
  .sidebar-logo { width: 40px; height: 40px; background: var(--terra); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 20px; }
  .nav-btn { width: 48px; height: 48px; border-radius: 14px; border: none; background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: rgba(255,255,255,0.5); transition: all 0.2s; font-size: 18px; position: relative; }
  .nav-btn span.label { font-size: 8px; font-weight: 500; letter-spacing: 0.3px; text-transform: uppercase; }
  .nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }
  .nav-btn.active { background: rgba(255,255,255,0.15); color: white; }
  .nav-btn.active::before { content: ''; position: absolute; left: -4px; top: 50%; transform: translateY(-50%); width: 4px; height: 24px; background: var(--terra); border-radius: 0 4px 4px 0; }

  .main { flex: 1; overflow-y: auto; padding: 32px; }
  .page-header { margin-bottom: 28px; }
  .page-header h1 { font-size: 28px; color: var(--green); line-height: 1.2; }
  .page-header p { color: var(--muted); font-size: 14px; margin-top: 4px; }

  .recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
  .recipe-card { background: var(--card); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); transition: all 0.25s; cursor: pointer; border: 1px solid var(--border); }
  .recipe-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .card-thumb { height: 160px; background: var(--green-light); display: flex; align-items: center; justify-content: center; font-size: 56px; position: relative; }
  .card-thumb .origin-badge { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.92); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: var(--muted); }
  .card-thumb .type-badge { position: absolute; top: 10px; left: 10px; background: var(--terra); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: white; }
  .card-body { padding: 16px; }
  .card-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; color: var(--text); }
  .card-meta { font-size: 12px; color: var(--muted); display: flex; gap: 12px; margin-bottom: 12px; }
  .card-stats { display: flex; gap: 8px; }
  .stat-pill { flex: 1; background: var(--bg); border-radius: 10px; padding: 8px 4px; text-align: center; }
  .stat-pill .val { font-size: 14px; font-weight: 700; color: var(--green); }
  .stat-pill .lbl { font-size: 9px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .card-actions { display: flex; gap: 6px; margin-top: 12px; }
  .btn-sm { flex: 1; padding: 8px; border-radius: 10px; border: none; font-size: 12px; font-weight: 600; transition: all 0.2s; }
  .btn-green { background: var(--green); color: white; }
  .btn-green:hover { background: var(--green-mid); }
  .btn-outline { background: transparent; border: 1.5px solid var(--border); color: var(--muted); }
  .btn-outline:hover { border-color: var(--green); color: var(--green); }
  .btn-edit { background: var(--terra-light); border: 1.5px solid #e8c4b0; color: var(--terra); }
  .btn-edit:hover { background: var(--terra); color: white; border-color: var(--terra); }

  .filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; align-items: center; }
  .filter-select { padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(--border); background: white; font-size: 12px; font-weight: 500; color: var(--text); cursor: pointer; appearance: none; padding-right: 28px; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A8078' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
  .filter-select:focus { outline: none; border-color: var(--green); }
  .randomize-btn { margin-left: auto; padding: 8px 20px; border-radius: 100px; background: var(--terra); color: white; border: none; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
  .randomize-btn:hover { background: #B04E20; transform: scale(1.02); }

  .planner-grid { display: grid; grid-template-columns: 80px repeat(7, 1fr); gap: 8px; }
  .planner-day-header { background: var(--green); color: white; border-radius: 12px; padding: 10px 6px; text-align: center; }
  .planner-day-header .day-name { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .planner-day-header .day-cal { font-size: 10px; opacity: 0.6; margin-top: 2px; }
  .planner-meal-label { display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .planner-cell { background: white; border-radius: 12px; min-height: 80px; border: 2px dashed var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; padding: 8px; text-align: center; gap: 4px; position: relative; }
  .planner-cell:hover { border-color: var(--sage); background: var(--green-light); }
  .planner-cell.filled { border-style: solid; border-color: var(--border); }
  .planner-cell .cell-emoji { font-size: 22px; }
  .planner-cell .cell-name { font-size: 10px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .planner-cell .cell-cal { font-size: 9px; color: var(--muted); }
  .planner-cell .cell-remove { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: var(--terra); border-radius: 50%; color: white; font-size: 9px; display: none; align-items: center; justify-content: center; border: none; }
  .planner-cell.filled:hover .cell-remove { display: flex; }
  .planner-cell .cell-add { font-size: 20px; color: var(--border); }

  .shopping-section { margin-bottom: 28px; }
  .shopping-section h3 { font-size: 16px; color: var(--green); margin-bottom: 12px; }
  .shopping-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: white; border-radius: 12px; margin-bottom: 6px; border: 1px solid var(--border); }
  .shopping-item input[type=checkbox] { width: 18px; height: 18px; accent-color: var(--green); }
  .shopping-item.checked .item-name { text-decoration: line-through; color: var(--muted); }
  .item-name { flex: 1; font-size: 14px; }
  .item-qty { font-size: 13px; color: var(--muted); font-weight: 500; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1/-1; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input { padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 14px; background: white; transition: border-color 0.15s; color: var(--text); }
  .form-input:focus { outline: none; border-color: var(--green); }
  .form-textarea { min-height: 80px; resize: vertical; }
  .form-select { padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: white; font-size: 14px; }
  .form-select:focus { outline: none; border-color: var(--green); }
  .ingredient-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
  .btn-add-ingredient { padding: 8px 16px; border-radius: 8px; background: var(--green-light); color: var(--green); border: 1.5px dashed var(--sage); font-size: 13px; font-weight: 600; width: 100%; margin-top: 4px; transition: all 0.15s; }
  .btn-add-ingredient:hover { background: var(--green); color: white; }
  .btn-remove { width: 28px; height: 28px; border-radius: 8px; background: #FEE; border: none; color: var(--terra); font-size: 14px; }
  .btn-submit { padding: 12px 32px; border-radius: 12px; background: var(--green); color: white; border: none; font-size: 15px; font-weight: 600; transition: all 0.2s; margin-top: 8px; }
  .btn-submit:hover { background: var(--green-mid); }

  .import-box { background: white; border-radius: 20px; padding: 32px; max-width: 580px; margin: 0 auto; border: 1px solid var(--border); box-shadow: var(--shadow); }
  .tiktok-input { flex: 1; padding: 12px 16px; border-radius: 12px; border: 2px solid var(--border); font-size: 14px; background: var(--bg); transition: border-color 0.15s; width: 100%; }
  .tiktok-input:focus { outline: none; border-color: var(--terra); }
  .btn-import { padding: 12px 24px; border-radius: 12px; background: var(--terra); color: white; border: none; font-size: 14px; font-weight: 600; transition: all 0.2s; white-space: nowrap; }
  .btn-import:hover { background: #B04E20; }
  .import-result { margin-top: 24px; padding: 20px; background: var(--green-light); border-radius: 16px; border: 1.5px solid var(--sage); }
  .loading-dots::after { content: ''; animation: dots 1.2s steps(3) infinite; }
  @keyframes dots { 0% { content: '.'; } 33% { content: '..'; } 66% { content: '...'; } }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: white; border-radius: 24px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
  .modal.wide { max-width: 620px; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { display: flex; align-items: center; gap: 16px; padding: 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: white; border-radius: 24px 24px 0 0; z-index: 1; }
  .modal-emoji { font-size: 48px; width: 72px; height: 72px; background: var(--green-light); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
  .modal-header h2 { font-size: 20px; color: var(--green); }
  .modal-header .modal-meta { font-size: 13px; color: var(--muted); margin-top: 3px; }
  .modal-close { margin-left: auto; width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; font-size: 18px; color: var(--muted); flex-shrink: 0; }
  .modal-close:hover { background: var(--bg); }
  .modal-body { padding: 24px; }
  .modal-stats { display: flex; gap: 12px; margin-bottom: 20px; }
  .modal-stat { flex: 1; background: var(--bg); border-radius: 12px; padding: 12px; text-align: center; }
  .modal-stat .val { font-size: 22px; font-weight: 700; color: var(--green); }
  .modal-stat .lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .section-title { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; margin-top: 20px; }
  .ingredient-list { list-style: none; }
  .ingredient-list li { padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 14px; display: flex; justify-content: space-between; }
  .ingredient-list li:last-child { border-bottom: none; }
  .steps-list { list-style: none; counter-reset: steps; }
  .steps-list li { counter-increment: steps; padding: 8px 0 8px 40px; position: relative; font-size: 14px; line-height: 1.5; border-bottom: 1px solid var(--border); }
  .steps-list li:last-child { border-bottom: none; }
  .steps-list li::before { content: counter(steps); position: absolute; left: 0; top: 8px; width: 26px; height: 26px; background: var(--green); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
  .modal-btn-row { display: flex; gap: 10px; margin-top: 20px; }
  .modal-add-btn { flex: 1; padding: 12px; border-radius: 12px; background: var(--green); color: white; border: none; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .modal-add-btn:hover { background: var(--green-mid); }
  .modal-edit-btn { padding: 12px 20px; border-radius: 12px; background: var(--terra-light); color: var(--terra); border: 1.5px solid #e8c4b0; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; }
  .modal-edit-btn:hover { background: var(--terra); color: white; border-color: var(--terra); }

  .pick-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 60vh; overflow-y: auto; padding-right: 4px; }
  .pick-item { padding: 10px; border-radius: 12px; border: 1.5px solid var(--border); cursor: pointer; transition: all 0.15s; background: white; display: flex; align-items: center; gap: 10px; }
  .pick-item:hover { border-color: var(--green); background: var(--green-light); }
  .pick-emoji { font-size: 24px; width: 36px; height: 36px; background: var(--bg); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .pick-name { font-size: 12px; font-weight: 600; line-height: 1.3; }
  .pick-cal { font-size: 11px; color: var(--muted); }

  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--green); color: white; padding: 12px 24px; border-radius: 100px; font-size: 14px; font-weight: 500; z-index: 200; box-shadow: var(--shadow-lg); animation: toastIn 0.3s ease; }
  @keyframes toastIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-state .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--green); margin-bottom: 6px; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  .badge-green { background: var(--green-light); color: var(--green); }

  .weekly-summary { background: var(--green); color: white; border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 24px; align-items: center; }
  .weekly-summary .s-val { font-size: 22px; font-weight: 700; }
  .weekly-summary .s-lbl { font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; }
  .weekly-summary .divider { width: 1px; background: rgba(255,255,255,0.2); align-self: stretch; }
  .shopping-actions { display: flex; gap: 10px; margin-bottom: 24px; }
  .btn-secondary { padding: 10px 20px; border-radius: 10px; background: white; border: 1.5px solid var(--border); font-size: 13px; font-weight: 600; color: var(--text); transition: all 0.15s; }
  .btn-secondary:hover { border-color: var(--green); color: var(--green); }
  .btn-primary { padding: 10px 20px; border-radius: 10px; background: var(--green); border: none; font-size: 13px; font-weight: 600; color: white; }

  .emoji-picker { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .emoji-btn { width: 36px; height: 36px; font-size: 20px; border-radius: 8px; border: 2px solid var(--border); background: white; transition: all 0.15s; }
  .emoji-btn.selected { border-color: var(--green); background: var(--green-light); }
`;

const INITIAL_RECIPES = [
  { id:1, emoji:"🥗", name:"Greek Chicken Bowl", calories:380, protein:42, carbs:28, fat:12, cookMethod:"Grilled", origin:"Mediterranean", type:"Savory", ingredientCount:8, prepTime:25, ingredients:[{n:"Chicken breast",q:"200g"},{n:"Cucumber",q:"1 cup"},{n:"Cherry tomatoes",q:"½ cup"},{n:"Kalamata olives",q:"10 pcs"},{n:"Feta cheese",q:"30g"},{n:"Red onion",q:"¼ pcs"},{n:"Quinoa",q:"½ cup"},{n:"Lemon juice",q:"2 tbsp"}], steps:["Cook quinoa per packet directions.","Grill chicken with oregano, garlic, lemon.","Dice all veggies.","Assemble bowl, crumble feta on top.","Drizzle olive oil and lemon juice."], tags:["High Protein","Meal Prep"] },
  { id:2, emoji:"🍳", name:"Egg White Omelette", calories:180, protein:28, carbs:6, fat:5, cookMethod:"Pan-fried", origin:"Western", type:"Savory", ingredientCount:5, prepTime:10, ingredients:[{n:"Egg whites",q:"5 pcs"},{n:"Spinach",q:"1 cup"},{n:"Mushrooms",q:"½ cup"},{n:"Red bell pepper",q:"¼ cup"},{n:"Salt & pepper",q:"to taste"}], steps:["Whisk egg whites with seasoning.","Sauté veggies until soft.","Pour egg whites over veggies.","Fold and cook until set."], tags:["Quick","Low Carb"] },
  { id:3, emoji:"🐟", name:"Lemon Herb Baked Cod", calories:260, protein:40, carbs:4, fat:9, cookMethod:"Baked", origin:"Western", type:"Savory", ingredientCount:6, prepTime:20, ingredients:[{n:"Cod fillet",q:"200g"},{n:"Lemon",q:"1 pcs"},{n:"Garlic",q:"3 cloves"},{n:"Fresh dill",q:"2 tbsp"},{n:"Olive oil",q:"1 tbsp"},{n:"Capers",q:"1 tbsp"}], steps:["Preheat oven to 200°C.","Place cod on baking tray.","Top with garlic, dill, lemon slices, capers.","Drizzle olive oil.","Bake 15-18 mins."], tags:["Omega-3","Low Calorie"] },
  { id:4, emoji:"🍚", name:"Cauliflower Fried Rice", calories:220, protein:18, carbs:20, fat:7, cookMethod:"Stir-fried", origin:"Asian", type:"Savory", ingredientCount:9, prepTime:20, ingredients:[{n:"Cauliflower rice",q:"2 cups"},{n:"Eggs",q:"2 pcs"},{n:"Edamame",q:"½ cup"},{n:"Carrots",q:"⅓ cup"},{n:"Soy sauce",q:"2 tbsp"},{n:"Sesame oil",q:"1 tsp"},{n:"Green onion",q:"2 stalks"},{n:"Garlic",q:"2 cloves"},{n:"Ginger",q:"1 tsp"}], steps:["Rice cauliflower in food processor.","Scramble eggs, set aside.","Stir-fry veggies in sesame oil.","Add cauliflower rice, cook 5 mins.","Add eggs, soy sauce, toss.","Top with green onion."], tags:["Low Carb","Vegetarian"] },
  { id:5, emoji:"🍤", name:"Shrimp & Zucchini Stir-fry", calories:280, protein:32, carbs:12, fat:10, cookMethod:"Stir-fried", origin:"Asian", type:"Savory", ingredientCount:8, prepTime:15, ingredients:[{n:"Shrimp",q:"200g"},{n:"Zucchini",q:"2 medium"},{n:"Red chili",q:"1 pcs"},{n:"Garlic",q:"3 cloves"},{n:"Oyster sauce",q:"2 tbsp"},{n:"Lime juice",q:"1 tbsp"},{n:"Coconut aminos",q:"1 tbsp"},{n:"Sesame seeds",q:"1 tsp"}], steps:["Devein and pat dry shrimp.","Slice zucchini into half-moons.","Stir-fry garlic and chili in oil.","Add shrimp, cook 3 mins.","Add zucchini, sauces.","Finish with lime and sesame seeds."], tags:["Quick","High Protein"] },
  { id:6, emoji:"🌮", name:"Turkey Lettuce Wraps", calories:200, protein:28, carbs:8, fat:7, cookMethod:"Pan-fried", origin:"Asian-Fusion", type:"Savory", ingredientCount:7, prepTime:15, ingredients:[{n:"Ground turkey",q:"150g"},{n:"Butter lettuce",q:"6 leaves"},{n:"Water chestnuts",q:"¼ cup"},{n:"Hoisin sauce",q:"2 tbsp"},{n:"Ginger",q:"1 tsp"},{n:"Garlic",q:"2 cloves"},{n:"Rice vinegar",q:"1 tsp"}], steps:["Brown turkey in pan, drain fat.","Add garlic, ginger, water chestnuts.","Stir in hoisin, rice vinegar.","Spoon mixture into lettuce cups.","Serve with chili sauce on side."], tags:["Low Carb","Quick"] },
  { id:7, emoji:"🥣", name:"Cottage Cheese Pancakes", calories:240, protein:22, carbs:24, fat:6, cookMethod:"Pan-fried", origin:"Western", type:"Savory", ingredientCount:5, prepTime:15, ingredients:[{n:"Cottage cheese",q:"1 cup"},{n:"Eggs",q:"2 pcs"},{n:"Oat flour",q:"¼ cup"},{n:"Vanilla extract",q:"½ tsp"},{n:"Blueberries",q:"⅓ cup"}], steps:["Blend cottage cheese, eggs, oat flour, vanilla.","Heat non-stick pan on medium.","Pour small circles, cook 2 mins each side.","Serve with fresh blueberries."], tags:["High Protein","Breakfast"] },
  { id:8, emoji:"🥩", name:"Baked Chicken Thighs", calories:350, protein:45, carbs:2, fat:16, cookMethod:"Baked", origin:"Western", type:"Savory", ingredientCount:6, prepTime:35, ingredients:[{n:"Chicken thighs (skinless)",q:"300g"},{n:"Paprika",q:"1 tsp"},{n:"Garlic powder",q:"1 tsp"},{n:"Onion powder",q:"½ tsp"},{n:"Olive oil",q:"1 tbsp"},{n:"Lemon",q:"½ pcs"}], steps:["Preheat oven to 210°C.","Mix spices and olive oil into paste.","Coat chicken thighs.","Bake 25-30 mins until 74°C internal.","Rest 5 mins before serving."], tags:["Meal Prep","High Protein"] },
  { id:9, emoji:"🍜", name:"Miso Soup with Tofu", calories:160, protein:12, carbs:14, fat:5, cookMethod:"Boiled", origin:"Japanese", type:"Savory", ingredientCount:6, prepTime:10, ingredients:[{n:"Soft tofu",q:"150g"},{n:"Miso paste",q:"2 tbsp"},{n:"Dashi powder",q:"1 tsp"},{n:"Wakame seaweed",q:"1 tbsp"},{n:"Green onion",q:"2 stalks"},{n:"Water",q:"3 cups"}], steps:["Bring water to near boil with dashi.","Dissolve miso paste in a ladle of broth.","Add tofu cubes and wakame.","Pour miso mixture back in.","Do not boil after adding miso.","Top with green onion."], tags:["Low Calorie","Vegan"] },
  { id:10, emoji:"🫙", name:"Salmon Salad Bowl", calories:320, protein:38, carbs:15, fat:13, cookMethod:"Raw/Poached", origin:"Nordic", type:"Savory", ingredientCount:8, prepTime:20, ingredients:[{n:"Salmon fillet",q:"150g"},{n:"Mixed greens",q:"2 cups"},{n:"Avocado",q:"¼ pcs"},{n:"Cucumber",q:"½ cup"},{n:"Radish",q:"4 pcs"},{n:"Capers",q:"1 tbsp"},{n:"Lemon juice",q:"1 tbsp"},{n:"Dijon mustard",q:"1 tsp"}], steps:["Poach salmon 8 mins, flake.","Arrange greens in bowl.","Slice avocado, cucumber, radish.","Make dressing with lemon + dijon + water.","Assemble bowl, drizzle dressing."], tags:["Omega-3","Gluten-Free"] },
  { id:11, emoji:"🥙", name:"Black Bean Tacos", calories:310, protein:16, carbs:42, fat:8, cookMethod:"Pan-fried", origin:"Mexican", type:"Savory", ingredientCount:9, prepTime:15, ingredients:[{n:"Black beans",q:"1 can"},{n:"Corn tortillas (small)",q:"3 pcs"},{n:"Red cabbage",q:"1 cup"},{n:"Avocado",q:"⅓ pcs"},{n:"Lime juice",q:"1 tbsp"},{n:"Cumin",q:"1 tsp"},{n:"Greek yogurt",q:"3 tbsp"},{n:"Salsa",q:"3 tbsp"},{n:"Cilantro",q:"¼ cup"}], steps:["Warm and season black beans with cumin.","Shred red cabbage, toss with lime.","Warm tortillas.","Build tacos: beans, cabbage, avocado.","Top with yogurt, salsa, cilantro."], tags:["Vegetarian","Budget-Friendly"] },
  { id:12, emoji:"🍧", name:"Frozen Yogurt Bark", calories:150, protein:8, carbs:22, fat:2, cookMethod:"Frozen", origin:"Western", type:"Dessert", ingredientCount:5, prepTime:10, ingredients:[{n:"Greek yogurt (0%)",q:"2 cups"},{n:"Honey",q:"2 tbsp"},{n:"Mixed berries",q:"1 cup"},{n:"Granola",q:"¼ cup"},{n:"Chia seeds",q:"1 tsp"}], steps:["Spread yogurt on parchment-lined tray.","Drizzle honey, scatter berries, granola.","Sprinkle chia seeds.","Freeze 2+ hours.","Break into shards and serve."], tags:["Dessert","Meal Prep"] },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MEALS = ["Breakfast","Lunch","Dinner"];
const METHODS = ["All","Baked","Grilled","Stir-fried","Pan-fried","Boiled","Raw/Poached","Frozen"];
const ORIGINS = ["All","Western","Asian","Mediterranean","Japanese","Mexican","Nordic","Asian-Fusion"];
const TYPES = ["All","Savory","Dessert"];
const EMOJIS = ["🍽️","🥗","🥩","🐟","🍳","🌮","🍜","🥣","🍤","🫙","🥙","🍧","🥦","🍱","🫕","🍲","🥘","🫔","🧆","🥚"];

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function EditRecipeModal({ recipe, onSave, onClose }) {
  const [form, setForm] = useState({
    ...recipe,
    steps: Array.isArray(recipe.steps) ? recipe.steps.join("\n") : (recipe.steps || ""),
    ingredients: recipe.ingredients?.length ? recipe.ingredients : [{n:"",q:""}],
  });

  function addIng() { setForm(f => ({...f, ingredients:[...f.ingredients,{n:"",q:""}]})); }
  function removeIng(i) { setForm(f => ({...f, ingredients:f.ingredients.filter((_,idx)=>idx!==i)})); }
  function updateIng(i, field, val) { setForm(f => ({...f, ingredients:f.ingredients.map((ing,idx)=>idx===i?{...ing,[field]:val}:ing)})); }

  function handleSave() {
    const updated = {
      ...form,
      calories: +form.calories || 0,
      protein: +form.protein || 0,
      carbs: +form.carbs || 0,
      fat: +form.fat || 0,
      prepTime: +form.prepTime || 0,
      ingredientCount: form.ingredients.filter(i=>i.n).length,
      steps: typeof form.steps === "string" ? form.steps.split("\n").filter(Boolean) : form.steps,
    };
    onSave(updated);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div style={{fontSize:32}}>{form.emoji}</div>
          <div>
            <h2 style={{fontSize:18}}>Edit Recipe</h2>
            <div className="modal-meta">Changes update everywhere this recipe appears</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          <div style={{marginBottom:16}}>
            <div className="form-label" style={{marginBottom:8}}>Emoji</div>
            <div className="emoji-picker">
              {EMOJIS.map(e=>(
                <button key={e} className={`emoji-btn ${form.emoji===e?"selected":""}`}
                  onClick={()=>setForm(f=>({...f,emoji:e}))}>{e}</button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Recipe Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Calories (kcal)</label>
              <input className="form-input" type="number" value={form.calories} onChange={e=>setForm(f=>({...f,calories:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Protein (g)</label>
              <input className="form-input" type="number" value={form.protein} onChange={e=>setForm(f=>({...f,protein:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Carbs (g)</label>
              <input className="form-input" type="number" value={form.carbs} onChange={e=>setForm(f=>({...f,carbs:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Fat (g)</label>
              <input className="form-input" type="number" value={form.fat} onChange={e=>setForm(f=>({...f,fat:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Prep Time (min)</label>
              <input className="form-input" type="number" value={form.prepTime} onChange={e=>setForm(f=>({...f,prepTime:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Cooking Method</label>
              <select className="form-select form-input" value={form.cookMethod} onChange={e=>setForm(f=>({...f,cookMethod:e.target.value}))}>
                {METHODS.filter(m=>m!=="All").map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Origin / Cuisine</label>
              <select className="form-select form-input" value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))}>
                {ORIGINS.filter(o=>o!=="All").map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select form-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option>Savory</option><option>Dessert</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{marginTop:16}}>
            <label className="form-label">Ingredients</label>
            {form.ingredients.map((ing,i) => (
              <div key={i} className="ingredient-row">
                <input className="form-input" style={{flex:2}} placeholder="Ingredient" value={ing.n} onChange={e=>updateIng(i,"n",e.target.value)}/>
                <input className="form-input" style={{flex:1}} placeholder="Qty" value={ing.q} onChange={e=>updateIng(i,"q",e.target.value)}/>
                {form.ingredients.length > 1 && <button className="btn-remove" onClick={()=>removeIng(i)}>✕</button>}
              </div>
            ))}
            <button className="btn-add-ingredient" onClick={addIng}>+ Add Ingredient</button>
          </div>

          <div className="form-group" style={{marginTop:16}}>
            <label className="form-label">Steps (one per line)</label>
            <textarea className="form-input form-textarea" value={form.steps} onChange={e=>setForm(f=>({...f,steps:e.target.value}))}/>
          </div>

          <div style={{display:"flex",gap:10,marginTop:20}}>
            <button className="btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button className="btn-submit" style={{flex:2,marginTop:0}} onClick={handleSave}>💾 Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onView, onAddToPlanner, onEdit }) {
  return (
    <div className="recipe-card" onClick={() => onView(recipe)}>
      <div className="card-thumb">
        <span>{recipe.emoji}</span>
        <span className="origin-badge">{recipe.origin}</span>
        <span className="type-badge" style={{background:recipe.type==="Dessert"?"#9B59B6":undefined}}>{recipe.type}</span>
      </div>
      <div className="card-body">
        <div className="card-title">{recipe.name}</div>
        <div className="card-meta"><span>⏱ {recipe.prepTime} min</span><span>🔧 {recipe.cookMethod}</span></div>
        <div className="card-stats">
          <div className="stat-pill"><div className="val">{recipe.calories}</div><div className="lbl">kcal</div></div>
          <div className="stat-pill"><div className="val">{recipe.protein}g</div><div className="lbl">protein</div></div>
          <div className="stat-pill"><div className="val">{recipe.ingredientCount}</div><div className="lbl">ingred.</div></div>
        </div>
        <div className="card-actions" onClick={e=>e.stopPropagation()}>
          <button className="btn-sm btn-edit" title="Edit recipe" onClick={()=>onEdit(recipe)}>✏️</button>
          <button className="btn-sm btn-outline" onClick={()=>onView(recipe)}>View</button>
          <button className="btn-sm btn-green" onClick={()=>onAddToPlanner(recipe)}>+ Plan</button>
        </div>
      </div>
    </div>
  );
}

function RecipeModal({ recipe, onClose, onAddToPlanner, onEdit }) {
  if (!recipe) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-emoji">{recipe.emoji}</div>
          <div>
            <h2>{recipe.name}</h2>
            <div className="modal-meta">⏱ {recipe.prepTime} min &nbsp;·&nbsp; 🔧 {recipe.cookMethod} &nbsp;·&nbsp; 🌍 {recipe.origin}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-stats">
            <div className="modal-stat"><div className="val">{recipe.calories}</div><div className="lbl">Calories</div></div>
            <div className="modal-stat"><div className="val">{recipe.protein}g</div><div className="lbl">Protein</div></div>
            <div className="modal-stat"><div className="val">{recipe.carbs}g</div><div className="lbl">Carbs</div></div>
            <div className="modal-stat"><div className="val">{recipe.fat}g</div><div className="lbl">Fat</div></div>
          </div>
          {recipe.tags?.map(t=><span key={t} className="badge badge-green" style={{marginRight:6}}>{t}</span>)}
          <div className="section-title">Ingredients</div>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing,i)=><li key={i}><span>{ing.n}</span><span style={{color:"var(--muted)",fontWeight:500}}>{ing.q}</span></li>)}
          </ul>
          <div className="section-title">Steps</div>
          <ol className="steps-list">
            {recipe.steps.map((step,i)=><li key={i}>{step}</li>)}
          </ol>
          <div className="modal-btn-row">
            <button className="modal-edit-btn" onClick={()=>{onEdit(recipe);onClose();}}>✏️ Edit</button>
            <button className="modal-add-btn" onClick={()=>{onAddToPlanner(recipe);onClose();}}>📅 Add to Meal Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PickRecipeModal({ recipes, onPick, onClose, day, meal }) {
  const [search, setSearch] = useState("");
  const filtered = recipes.filter(r=>r.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header" style={{padding:"16px 20px"}}>
          <div><h2 style={{fontSize:18}}>Pick a Recipe</h2><div className="modal-meta">{day} · {meal}</div></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{padding:"12px 20px",borderBottom:"1px solid var(--border)"}}>
          <input className="form-input" style={{width:"100%"}} placeholder="Search recipes..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{padding:16}}>
          <div className="pick-list">
            {filtered.map(r=>(
              <div key={r.id} className="pick-item" onClick={()=>{onPick(r);onClose();}}>
                <div className="pick-emoji">{r.emoji}</div>
                <div><div className="pick-name">{r.name}</div><div className="pick-cal">{r.calories} kcal · {r.protein}g protein</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2500); return ()=>clearTimeout(t); },[]);
  return <div className="toast">{message}</div>;
}

// ── VIEWS ─────────────────────────────────────────────────────────────────────
function DiscoverView({ recipes, onView, onAddToPlanner, onEdit }) {
  const [filters, setFilters] = useState({ maxCal:600, minProtein:0, method:"All", origin:"All", type:"All", maxIng:15 });
  const [search, setSearch] = useState("");
  const [displayed, setDisplayed] = useState(null);

  const filtered = useMemo(()=>recipes.filter(r=>
    r.calories<=filters.maxCal && r.protein>=filters.minProtein &&
    (filters.method==="All"||r.cookMethod===filters.method) &&
    (filters.origin==="All"||r.origin===filters.origin) &&
    (filters.type==="All"||r.type===filters.type) &&
    r.ingredientCount<=filters.maxIng &&
    r.name.toLowerCase().includes(search.toLowerCase())
  ),[recipes,filters,search]);

  const shown = displayed || filtered;

  return (
    <div>
      <div className="page-header"><h1>Discover Recipes 🥦</h1><p>Low-calorie, high-protein meals for your deficit goals</p></div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <input className="form-input" style={{flex:1,maxWidth:320}} placeholder="🔍  Search recipes..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="randomize-btn" onClick={()=>setDisplayed([...filtered].sort(()=>Math.random()-0.5).slice(0,6))}>🎲 Randomize</button>
        {displayed && <button className="btn-secondary" onClick={()=>setDisplayed(null)}>Show All</button>}
      </div>
      <div className="filter-row">
        <span style={{fontSize:12,fontWeight:600,color:"var(--muted)"}}>FILTER:</span>
        <select className="filter-select" value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
        <select className="filter-select" value={filters.method} onChange={e=>setFilters(f=>({...f,method:e.target.value}))}>{METHODS.map(m=><option key={m}>{m}</option>)}</select>
        <select className="filter-select" value={filters.origin} onChange={e=>setFilters(f=>({...f,origin:e.target.value}))}>{ORIGINS.map(o=><option key={o}>{o}</option>)}</select>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500}}>
          <span style={{color:"var(--muted)"}}>Max cal:</span>
          <input type="range" min={100} max={600} step={50} value={filters.maxCal} onChange={e=>setFilters(f=>({...f,maxCal:+e.target.value}))} style={{accentColor:"var(--green)"}}/>
          <span style={{color:"var(--green)",fontWeight:700,minWidth:30}}>{filters.maxCal}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500}}>
          <span style={{color:"var(--muted)"}}>Min protein:</span>
          <input type="range" min={0} max={50} step={5} value={filters.minProtein} onChange={e=>setFilters(f=>({...f,minProtein:+e.target.value}))} style={{accentColor:"var(--green)"}}/>
          <span style={{color:"var(--green)",fontWeight:700,minWidth:30}}>{filters.minProtein}g</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500}}>
          <span style={{color:"var(--muted)"}}>Max ingr:</span>
          <input type="range" min={3} max={15} step={1} value={filters.maxIng} onChange={e=>setFilters(f=>({...f,maxIng:+e.target.value}))} style={{accentColor:"var(--green)"}}/>
          <span style={{color:"var(--green)",fontWeight:700,minWidth:20}}>{filters.maxIng}</span>
        </div>
      </div>
      <div style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>{shown.length} recipe{shown.length!==1?"s":""} found</div>
      {shown.length===0 ? (
        <div className="empty-state"><div className="empty-icon">🔍</div><h3>No recipes match</h3><p>Try adjusting your filters</p></div>
      ) : (
        <div className="recipe-grid">
          {shown.map(r=><RecipeCard key={r.id} recipe={r} onView={onView} onAddToPlanner={onAddToPlanner} onEdit={onEdit}/>)}
        </div>
      )}
    </div>
  );
}

function PlannerView({ recipes, weeklyPlan, setWeeklyPlan, onShowShopping }) {
  const [picking, setPicking] = useState(false);
  const [pendingDay, setPendingDay] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);

  const totalCals = Object.values(weeklyPlan).reduce((sum,day)=>sum+Object.values(day).reduce((s,r)=>s+(r?.calories||0),0),0);
  const totalMeals = Object.values(weeklyPlan).reduce((sum,day)=>sum+Object.values(day).filter(Boolean).length,0);

  return (
    <div>
      <div className="page-header"><h1>Weekly Meal Plan 📅</h1><p>Plan your deficit meals for the week ahead</p></div>
      <div className="weekly-summary">
        <div><div className="s-val">{totalMeals}</div><div className="s-lbl">Meals Planned</div></div>
        <div className="divider"/>
        <div><div className="s-val">{totalCals}</div><div className="s-lbl">Total Calories</div></div>
        <div className="divider"/>
        <div><div className="s-val">{totalMeals>0?Math.round(totalCals/totalMeals):0}</div><div className="s-lbl">Avg per Meal</div></div>
        <div style={{marginLeft:"auto"}}>
          <button className="btn-import" style={{background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.4)"}} onClick={onShowShopping}>🛒 Shopping List</button>
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <div className="planner-grid" style={{minWidth:700}}>
          <div/>
          {DAYS.map(d=>{
            const dayCal=MEALS.reduce((s,m)=>s+(weeklyPlan[d]?.[m]?.calories||0),0);
            return <div key={d} className="planner-day-header"><div className="day-name">{d}</div><div className="day-cal">{dayCal>0?`${dayCal} kcal`:""}</div></div>;
          })}
          {MEALS.map(meal=>(
            <>
              <div key={meal} className="planner-meal-label">{meal}</div>
              {DAYS.map(day=>{
                const recipe=weeklyPlan[day]?.[meal];
                return (
                  <div key={day} className={`planner-cell ${recipe?"filled":""}`}
                    onClick={()=>{if(!recipe){setPendingDay(day);setPendingMeal(meal);setPicking(true);}}}>
                    {recipe ? (
                      <>
                        <div className="cell-emoji">{recipe.emoji}</div>
                        <div className="cell-name">{recipe.name}</div>
                        <div className="cell-cal">{recipe.calories} kcal</div>
                        <button className="cell-remove" onClick={e=>{e.stopPropagation();setWeeklyPlan(p=>({...p,[day]:{...p[day],[meal]:null}}));}}>✕</button>
                      </>
                    ) : <div className="cell-add">+</div>}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      {picking && <PickRecipeModal recipes={recipes} day={pendingDay} meal={pendingMeal}
        onPick={r=>setWeeklyPlan(p=>({...p,[pendingDay]:{...p[pendingDay],[pendingMeal]:r}}))} onClose={()=>setPicking(false)}/>}
    </div>
  );
}

function ShoppingView({ weeklyPlan }) {
  const [checked, setChecked] = useState({});
  const allIngredients = useMemo(()=>{
    const map={};
    Object.values(weeklyPlan).forEach(day=>Object.values(day).forEach(r=>{
      if(!r) return;
      r.ingredients.forEach(ing=>{
        const key=ing.n.toLowerCase();
        if(!map[key]) map[key]={name:ing.n,qty:ing.q};
      });
    }));
    return Object.values(map);
  },[weeklyPlan]);

  const categories = {
    Proteins: allIngredients.filter(i=>/chicken|turkey|salmon|cod|shrimp|egg|tofu|beef|tuna|yogurt|cheese/i.test(i.name)),
    "Vegetables & Fruit": allIngredients.filter(i=>/spinach|zucchini|cucumber|tomato|mushroom|pepper|cabbage|avocado|berries|onion|cauliflower|carrot|radish|lime|lemon|ginger|garlic/i.test(i.name)),
    Grains: allIngredients.filter(i=>/rice|quinoa|oat|tortilla|granola/i.test(i.name)),
    Pantry: allIngredients.filter(i=>!/chicken|turkey|salmon|cod|shrimp|egg|tofu|beef|tuna|yogurt|cheese|spinach|zucchini|cucumber|tomato|mushroom|pepper|cabbage|avocado|berries|onion|cauliflower|carrot|radish|lime|lemon|ginger|garlic|rice|quinoa|oat|tortilla|granola/i.test(i.name)),
  };

  if(allIngredients.length===0) return (
    <div>
      <div className="page-header"><h1>Shopping List 🛒</h1></div>
      <div className="empty-state"><div className="empty-icon">🛒</div><h3>No meals planned yet</h3><p>Add recipes to your weekly plan first</p></div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>Shopping List 🛒</h1><p>{allIngredients.length} ingredients from your meal plan</p></div>
      <div className="shopping-actions">
        <button className="btn-secondary" onClick={()=>setChecked({})}>Clear All</button>
        <button className="btn-secondary" onClick={()=>navigator.clipboard?.writeText(Object.entries(categories).map(([c,items])=>`${c}:\n${items.map(i=>`- ${i.name} (${i.qty})`).join("\n")}`).join("\n\n"))}>📋 Copy</button>
        <button className="btn-primary" onClick={()=>setChecked(Object.fromEntries(allIngredients.map(i=>[i.name,true])))}>Check All</button>
      </div>
      {Object.entries(categories).map(([cat,items])=>items.length>0&&(
        <div key={cat} className="shopping-section">
          <h3>{cat}</h3>
          {items.map(item=>(
            <div key={item.name} className={`shopping-item ${checked[item.name]?"checked":""}`}>
              <input type="checkbox" checked={!!checked[item.name]} onChange={e=>setChecked(c=>({...c,[item.name]:e.target.checked}))}/>
              <span className="item-name">{item.name}</span>
              <span className="item-qty">{item.qty}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CreateRecipeView({ onSave, toast }) {
  const empty = { name:"",emoji:"🍽️",calories:"",protein:"",carbs:"",fat:"",cookMethod:"Baked",origin:"Western",type:"Savory",prepTime:"",steps:"",ingredients:[{n:"",q:""}] };
  const [form, setForm] = useState(empty);
  function addIng(){ setForm(f=>({...f,ingredients:[...f.ingredients,{n:"",q:""}]})); }
  function removeIng(i){ setForm(f=>({...f,ingredients:f.ingredients.filter((_,idx)=>idx!==i)})); }
  function updateIng(i,field,val){ setForm(f=>({...f,ingredients:f.ingredients.map((ing,idx)=>idx===i?{...ing,[field]:val}:ing)})); }
  function handleSubmit(){
    if(!form.name||!form.calories||!form.protein){toast("Please fill required fields");return;}
    onSave({...form,id:Date.now(),calories:+form.calories,protein:+form.protein,carbs:+form.carbs||0,fat:+form.fat||0,prepTime:+form.prepTime||0,ingredientCount:form.ingredients.filter(i=>i.n).length,steps:form.steps.split("\n").filter(Boolean),tags:["Custom"]});
    toast("✅ Recipe created!");
    setForm(empty);
  }
  return (
    <div>
      <div className="page-header"><h1>Create Recipe ✏️</h1><p>Add your own healthy recipe to the collection</p></div>
      <div style={{background:"white",borderRadius:20,padding:28,border:"1px solid var(--border)",maxWidth:720}}>
        <div style={{marginBottom:20}}>
          <div className="form-label" style={{marginBottom:8}}>Choose an Emoji</div>
          <div className="emoji-picker">{EMOJIS.map(e=><button key={e} className={`emoji-btn ${form.emoji===e?"selected":""}`} onClick={()=>setForm(f=>({...f,emoji:e}))}>{e}</button>)}</div>
        </div>
        <div className="form-grid">
          <div className="form-group full"><label className="form-label">Recipe Name *</label><input className="form-input" placeholder="e.g. Spicy Tuna Bowl" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Calories *</label><input className="form-input" type="number" placeholder="350" value={form.calories} onChange={e=>setForm(f=>({...f,calories:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Protein (g) *</label><input className="form-input" type="number" placeholder="30" value={form.protein} onChange={e=>setForm(f=>({...f,protein:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Carbs (g)</label><input className="form-input" type="number" placeholder="20" value={form.carbs} onChange={e=>setForm(f=>({...f,carbs:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Fat (g)</label><input className="form-input" type="number" placeholder="10" value={form.fat} onChange={e=>setForm(f=>({...f,fat:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Prep Time (min)</label><input className="form-input" type="number" placeholder="20" value={form.prepTime} onChange={e=>setForm(f=>({...f,prepTime:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Cooking Method</label><select className="form-select form-input" value={form.cookMethod} onChange={e=>setForm(f=>({...f,cookMethod:e.target.value}))}>{METHODS.filter(m=>m!=="All").map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Origin</label><select className="form-select form-input" value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))}>{ORIGINS.filter(o=>o!=="All").map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Type</label><select className="form-select form-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Savory</option><option>Dessert</option></select></div>
        </div>
        <div className="form-group" style={{marginTop:16}}>
          <label className="form-label">Ingredients</label>
          {form.ingredients.map((ing,i)=>(
            <div key={i} className="ingredient-row">
              <input className="form-input" style={{flex:2}} placeholder="Ingredient name" value={ing.n} onChange={e=>updateIng(i,"n",e.target.value)}/>
              <input className="form-input" style={{flex:1}} placeholder="Qty" value={ing.q} onChange={e=>updateIng(i,"q",e.target.value)}/>
              {form.ingredients.length>1&&<button className="btn-remove" onClick={()=>removeIng(i)}>✕</button>}
            </div>
          ))}
          <button className="btn-add-ingredient" onClick={addIng}>+ Add Ingredient</button>
        </div>
        <div className="form-group" style={{marginTop:16}}>
          <label className="form-label">Steps (one per line)</label>
          <textarea className="form-input form-textarea" placeholder={"Step 1\nStep 2\nStep 3"} value={form.steps} onChange={e=>setForm(f=>({...f,steps:e.target.value}))}/>
        </div>
        <button className="btn-submit" onClick={handleSubmit}>Save Recipe 🥗</button>
      </div>
    </div>
  );
}

function ImportView({ onSave, toast }) {
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleImport() {
    if(!url&&!desc){setError("Please enter a TikTok URL or describe the recipe.");return;}
    setLoading(true);setError("");setResult(null);
    try {
      const prompt = `You are a recipe extraction assistant. Based on the following TikTok video URL or description, generate a healthy calorie-deficit recipe in JSON format.\n\nURL/Description: ${url||desc}\n\nReturn ONLY a valid JSON object with these exact fields:\n{\n  "name": "recipe name",\n  "emoji": "single emoji",\n  "calories": number,\n  "protein": number,\n  "carbs": number,\n  "fat": number,\n  "prepTime": number,\n  "cookMethod": "Baked|Grilled|Stir-fried|Pan-fried|Boiled|Raw/Poached|Frozen",\n  "origin": "cuisine origin",\n  "type": "Savory or Dessert",\n  "ingredients": [{"n": "name", "q": "quantity"}],\n  "steps": ["step 1", "step 2"],\n  "tags": ["tag1"]\n}\n\nReturn ONLY the JSON, no other text.`;
      const response = await fetch("/api/generate-recipe", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
      });
      const data = await response.json();
      const text = data.content?.[0]?.text||"";
      const recipe = JSON.parse(text.replace(/```json|```/g,"").trim());
      recipe.id=Date.now(); recipe.ingredientCount=recipe.ingredients?.length||0;
      setResult(recipe);
    } catch(e) { setError("Could not generate recipe. Try describing it differently."); }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header"><h1>Import from TikTok 🎵</h1><p>Describe a recipe and AI will generate it for you</p></div>
      <div className="import-box">
        <div style={{marginBottom:16,padding:12,background:"var(--terra-light)",borderRadius:12,fontSize:13,color:"var(--terra)",fontWeight:500}}>
          ⚠️ TikTok URLs can't be fetched directly. Paste the URL for context, or describe the recipe you saw below.
        </div>
        <div className="form-group" style={{marginBottom:12}}>
          <label className="form-label">TikTok URL (optional)</label>
          <input className="tiktok-input" placeholder="https://www.tiktok.com/@user/video/..." value={url} onChange={e=>setUrl(e.target.value)}/>
        </div>
        <div className="form-group" style={{marginBottom:16}}>
          <label className="form-label">Describe the recipe</label>
          <textarea className="form-input form-textarea" style={{fontSize:13}} placeholder="e.g. High-protein cottage cheese pasta with cherry tomatoes and basil..." value={desc} onChange={e=>setDesc(e.target.value)}/>
        </div>
        {error&&<div style={{color:"var(--terra)",fontSize:13,marginBottom:12}}>{error}</div>}
        <button className="btn-import" style={{width:"100%"}} onClick={handleImport} disabled={loading}>
          {loading?<span className="loading-dots">Generating recipe</span>:"🤖 Generate Recipe with AI"}
        </button>
        {result&&(
          <div className="import-result">
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:36}}>{result.emoji}</span>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"var(--green)"}}>{result.name}</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>⏱ {result.prepTime} min · {result.cookMethod} · {result.origin}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:12}}>
              {[["Calories",result.calories,"kcal"],["Protein",result.protein+"g",""],["Carbs",result.carbs+"g",""],["Fat",result.fat+"g",""]].map(([l,v,u])=>(
                <div key={l} style={{flex:1,background:"white",borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
                  <div style={{fontWeight:700,color:"var(--green)",fontSize:15}}>{v}{u}</div>
                  <div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
                </div>
              ))}
            </div>
            <button className="btn-submit" style={{width:"100%"}} onClick={()=>{onSave({...result,tags:[...(result.tags||[]),"Imported"]});toast("✅ Recipe imported!");setResult(null);setUrl("");setDesc("");}}>Save to My Recipes ➕</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MyRecipesView({ recipes, onView, onAddToPlanner, onEdit }) {
  const userRecipes = recipes.filter(r=>r.tags?.includes("Custom")||r.tags?.includes("Imported"));
  if(userRecipes.length===0) return (
    <div>
      <div className="page-header"><h1>My Recipes 📖</h1></div>
      <div className="empty-state"><div className="empty-icon">📖</div><h3>No custom recipes yet</h3><p>Create a recipe or import from TikTok</p></div>
    </div>
  );
  return (
    <div>
      <div className="page-header"><h1>My Recipes 📖</h1><p>{userRecipes.length} custom recipe{userRecipes.length!==1?"s":""}</p></div>
      <div className="recipe-grid">{userRecipes.map(r=><RecipeCard key={r.id} recipe={r} onView={onView} onAddToPlanner={onAddToPlanner} onEdit={onEdit}/>)}</div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("discover");
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [weeklyPlan, setWeeklyPlan] = useState(
    Object.fromEntries(DAYS.map(d=>[d,Object.fromEntries(MEALS.map(m=>[m,null]))]))
  );
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [toast, setToast] = useState("");
  const [addingRecipe, setAddingRecipe] = useState(null);

  function saveRecipe(recipe) { setRecipes(r=>[...r,{...recipe,tags:[...(recipe.tags||[]),"Custom"]}]); }

  function updateRecipe(updated) {
    setRecipes(r=>r.map(recipe=>recipe.id===updated.id?updated:recipe));
    setWeeklyPlan(plan=>{
      const newPlan={...plan};
      DAYS.forEach(day=>MEALS.forEach(meal=>{
        if(newPlan[day][meal]?.id===updated.id) newPlan[day]={...newPlan[day],[meal]:updated};
      }));
      return newPlan;
    });
    setToast("✅ Recipe updated!");
  }

  const NAV = [
    {id:"discover",icon:"🥗",label:"Discover"},
    {id:"planner",icon:"📅",label:"Planner"},
    {id:"shopping",icon:"🛒",label:"Shopping"},
    {id:"myrecipes",icon:"📖",label:"My Recipes"},
    {id:"create",icon:"✏️",label:"Create"},
    {id:"import",icon:"🎵",label:"Import"},
  ];

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-logo">🥦</div>
          {NAV.map(n=>(
            <button key={n.id} className={`nav-btn ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}>
              <span>{n.icon}</span><span className="label">{n.label}</span>
            </button>
          ))}
        </nav>
        <main className="main">
          {view==="discover"&&<DiscoverView recipes={recipes} onView={setSelectedRecipe} onAddToPlanner={r=>{setAddingRecipe(r);setView("planner");}} onEdit={setEditingRecipe}/>}
          {view==="planner"&&<PlannerView recipes={recipes} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} onShowShopping={()=>setView("shopping")}/>}
          {view==="shopping"&&<ShoppingView weeklyPlan={weeklyPlan}/>}
          {view==="myrecipes"&&<MyRecipesView recipes={recipes} onView={setSelectedRecipe} onAddToPlanner={r=>{setAddingRecipe(r);setView("planner");}} onEdit={setEditingRecipe}/>}
          {view==="create"&&<CreateRecipeView onSave={saveRecipe} toast={setToast}/>}
          {view==="import"&&<ImportView onSave={r=>setRecipes(prev=>[...prev,r])} toast={setToast}/>}
        </main>

        {selectedRecipe&&<RecipeModal recipe={selectedRecipe} onClose={()=>setSelectedRecipe(null)}
          onAddToPlanner={r=>{setAddingRecipe(r);setView("planner");setSelectedRecipe(null);}}
          onEdit={r=>{setEditingRecipe(r);setSelectedRecipe(null);}}/>}

        {editingRecipe&&<EditRecipeModal recipe={editingRecipe} onSave={updateRecipe} onClose={()=>setEditingRecipe(null)}/>}

        {toast&&<Toast message={toast} onDone={()=>setToast("")}/>}
      </div>
    </>
  );
}
