import { useState, useMemo, useEffect, useRef } from "react";

// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────
// Set these in your Vercel environment variables:
// VITE_SUPABASE_URL = https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY = your-anon-key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = "recipe-images";

async function uploadImageToSupabase(file) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filename}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": file.type, "x-upsert": "true" },
    body: file,
  });
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F6F1E9; --card: #FFFFFF; --green: #1C3829; --green-mid: #2D5A3D;
    --green-light: #EAF1EC; --terra: #C85D28; --terra-light: #FAF0EA;
    --sage: #6A9B6A; --text: #1E1E1E; --muted: #8A8078; --border: #E2DAD0;
    --shadow: 0 2px 12px rgba(0,0,0,0.07); --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    --bottom-nav-h: 68px;
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-tap-highlight-color: transparent; }
  h1,h2,h3 { font-family: 'Playfair Display', serif; }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
  input, select, textarea { font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ── LAYOUT ── */
  .app { display: flex; height: 100dvh; overflow: hidden; }

  /* DESKTOP SIDEBAR */
  .sidebar {
    width: 72px; background: var(--green); display: flex; flex-direction: column;
    align-items: center; padding: 20px 0; gap: 6px; flex-shrink: 0;
  }
  .sidebar-logo { width: 40px; height: 40px; background: var(--terra); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 20px; }
  .sidebar .nav-btn { width: 48px; height: 48px; border-radius: 14px; background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: rgba(255,255,255,0.5); transition: all 0.2s; font-size: 18px; position: relative; }
  .sidebar .nav-btn span.label { font-size: 8px; font-weight: 500; letter-spacing: 0.3px; text-transform: uppercase; }
  .sidebar .nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }
  .sidebar .nav-btn.active { background: rgba(255,255,255,0.15); color: white; }
  .sidebar .nav-btn.active::before { content: ''; position: absolute; left: -4px; top: 50%; transform: translateY(-50%); width: 4px; height: 24px; background: var(--terra); border-radius: 0 4px 4px 0; }

  /* MOBILE BOTTOM NAV */
  .bottom-nav {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    height: var(--bottom-nav-h);
    background: var(--green);
    padding: 0 4px;
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
  }
  .bottom-nav-inner { display: flex; align-items: center; justify-content: space-around; height: 60px; }
  .bottom-nav .nav-btn { flex: 1; height: 52px; border-radius: 14px; background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: rgba(255,255,255,0.45); transition: all 0.15s; font-size: 20px; }
  .bottom-nav .nav-btn span.label { font-size: 9px; font-weight: 600; letter-spacing: 0.2px; text-transform: uppercase; }
  .bottom-nav .nav-btn.active { color: white; }
  .bottom-nav .nav-btn.active .nav-icon { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 4px 16px; }

  .main {
    flex: 1; overflow-y: auto; padding: 28px 28px;
    -webkit-overflow-scrolling: touch;
  }

  /* MOBILE ADJUSTMENTS */
  @media (max-width: 767px) {
    .sidebar { display: none; }
    .bottom-nav { display: flex; flex-direction: column; justify-content: flex-start; }
    .main { padding: 20px 16px; padding-bottom: calc(var(--bottom-nav-h) + 16px); }
    .page-header h1 { font-size: 22px; }
    .recipe-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    .card-thumb { height: 120px; font-size: 40px; }
    .planner-grid { grid-template-columns: 56px repeat(7, 1fr); gap: 4px; }
    .planner-cell { min-height: 60px; }
    .filter-row { gap: 6px; }
    .weekly-summary { gap: 12px; padding: 12px 14px; }
    .weekly-summary .s-val { font-size: 18px; }
    .modal { border-radius: 20px 20px 0 0; max-height: 92dvh; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; max-width: 100%; margin: 0; }
    .modal-overlay { align-items: flex-end; padding: 0; }
    .form-grid { grid-template-columns: 1fr; }
    .pick-list { grid-template-columns: 1fr; }
  }

  .page-header { margin-bottom: 20px; }
  .page-header h1 { font-size: 26px; color: var(--green); line-height: 1.2; }
  .page-header p { color: var(--muted); font-size: 13px; margin-top: 4px; }

  /* RECIPE GRID & CARDS */
  .recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .recipe-card { background: var(--card); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow); transition: all 0.2s; cursor: pointer; border: 1px solid var(--border); }
  .recipe-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .card-thumb { height: 150px; background: var(--green-light); display: flex; align-items: center; justify-content: center; font-size: 52px; position: relative; overflow: hidden; }
  .card-thumb img { width:100%; height:100%; object-fit:cover; }
  .card-thumb .origin-badge { position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.92); border-radius:20px; padding:2px 8px; font-size:10px; font-weight:600; color:var(--muted); }
  .card-thumb .type-badge { position:absolute; top:8px; left:8px; background:var(--terra); border-radius:20px; padding:2px 8px; font-size:10px; font-weight:600; color:white; }
  .card-body { padding: 12px; }
  .card-title { font-size: 13px; font-weight: 700; margin-bottom: 3px; color: var(--text); }
  .card-meta { font-size: 11px; color: var(--muted); display: flex; gap: 8px; margin-bottom: 10px; }
  .card-stats { display: flex; gap: 6px; }
  .stat-pill { flex:1; background:var(--bg); border-radius:8px; padding:6px 2px; text-align:center; }
  .stat-pill .val { font-size:13px; font-weight:700; color:var(--green); }
  .stat-pill .lbl { font-size:8px; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }
  .card-actions { display:flex; gap:5px; margin-top:10px; }
  .btn-sm { flex:1; padding:7px 4px; border-radius:9px; font-size:11px; font-weight:600; transition:all 0.15s; }
  .btn-green { background:var(--green); color:white; }
  .btn-green:hover { background:var(--green-mid); }
  .btn-outline { background:transparent; border:1.5px solid var(--border); color:var(--muted); }
  .btn-outline:hover { border-color:var(--green); color:var(--green); }
  .btn-edit { background:var(--terra-light); border:1.5px solid #e8c4b0; color:var(--terra); }
  .btn-edit:hover { background:var(--terra); color:white; }

  /* FILTERS */
  .filter-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; align-items:center; }
  .filter-select { padding:6px 12px; border-radius:100px; border:1.5px solid var(--border); background:white; font-size:11px; font-weight:500; color:var(--text); cursor:pointer; appearance:none; padding-right:24px; background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A8078' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 8px center; }
  .filter-select:focus { outline:none; border-color:var(--green); }
  .randomize-btn { margin-left:auto; padding:7px 16px; border-radius:100px; background:var(--terra); color:white; font-size:12px; font-weight:600; display:flex; align-items:center; gap:5px; transition:all 0.2s; }
  .randomize-btn:hover { background:#B04E20; }

  /* PLANNER */
  .planner-grid { display:grid; grid-template-columns:60px repeat(7,1fr); gap:5px; }
  .planner-day-header { border-radius:12px; padding:8px 4px; text-align:center; background:var(--green); color:white; }
  .planner-day-header.today { background:var(--terra); }
  .planner-day-header .day-name { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; opacity:0.8; }
  .planner-day-header .day-num { font-size:17px; font-weight:700; font-family:'Playfair Display',serif; line-height:1.1; }
  .planner-day-header .day-month { font-size:8px; opacity:0.65; }
  .planner-day-header .day-cal { font-size:8px; opacity:0.65; margin-top:1px; }
  .planner-meal-label { display:flex; align-items:center; justify-content:flex-end; padding-right:6px; font-size:9px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }
  .planner-cell { background:white; border-radius:10px; min-height:72px; border:2px dashed var(--border); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; padding:5px; text-align:center; gap:2px; position:relative; }
  .planner-cell:hover,.planner-cell:active { border-color:var(--sage); background:var(--green-light); }
  .planner-cell.filled { border-style:solid; border-color:var(--border); }
  .planner-cell.today-col { background:#fdf8ff; border-color:#d4b8f0; }
  .planner-cell.today-col.filled { border-color:#b89fd4; background:white; }
  .planner-cell .cell-img { width:28px; height:28px; border-radius:7px; object-fit:cover; }
  .planner-cell .cell-emoji { font-size:18px; }
  .planner-cell .cell-name { font-size:8px; font-weight:600; color:var(--text); line-height:1.2; }
  .planner-cell .cell-cal { font-size:7px; color:var(--muted); }
  .planner-cell .cell-remove { position:absolute; top:2px; right:2px; width:14px; height:14px; background:var(--terra); border-radius:50%; color:white; font-size:7px; display:none; align-items:center; justify-content:center; }
  .planner-cell.filled:hover .cell-remove { display:flex; }
  .planner-cell .cell-add { font-size:16px; color:var(--border); }
  .week-nav { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .week-nav-btn { width:32px; height:32px; border-radius:9px; border:1.5px solid var(--border); background:white; font-size:15px; color:var(--green); display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .week-nav-btn:hover { background:var(--green); color:white; border-color:var(--green); }
  .week-label { font-size:13px; font-weight:600; color:var(--text); }
  .week-today-btn { padding:5px 12px; border-radius:100px; border:1.5px solid var(--border); background:white; font-size:11px; font-weight:600; color:var(--muted); transition:all 0.15s; margin-left:auto; }
  .week-today-btn:hover { border-color:var(--terra); color:var(--terra); }

  /* SHOPPING */
  .shopping-section { margin-bottom:24px; }
  .shopping-section h3 { font-size:15px; color:var(--green); margin-bottom:10px; }
  .shopping-item { display:flex; align-items:center; gap:10px; padding:10px 14px; background:white; border-radius:11px; margin-bottom:5px; border:1px solid var(--border); }
  .shopping-item input[type=checkbox] { width:18px; height:18px; accent-color:var(--green); flex-shrink:0; }
  .shopping-item.checked .item-name { text-decoration:line-through; color:var(--muted); }
  .item-name { flex:1; font-size:14px; }
  .item-qty { font-size:12px; color:var(--muted); font-weight:500; }

  /* FORMS */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .form-group { display:flex; flex-direction:column; gap:5px; }
  .form-group.full { grid-column:1/-1; }
  .form-label { font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }
  .form-input { padding:10px 12px; border-radius:10px; border:1.5px solid var(--border); font-size:14px; background:white; transition:border-color 0.15s; color:var(--text); }
  .form-input:focus { outline:none; border-color:var(--green); }
  .form-textarea { min-height:80px; resize:vertical; }
  .form-select { padding:10px 12px; border-radius:10px; border:1.5px solid var(--border); background:white; font-size:14px; color:var(--text); }
  .form-select:focus { outline:none; border-color:var(--green); }
  .ingredient-row { display:flex; gap:7px; margin-bottom:7px; align-items:center; }
  .btn-add-ingredient { padding:8px 14px; border-radius:8px; background:var(--green-light); color:var(--green); border:1.5px dashed var(--sage); font-size:12px; font-weight:600; width:100%; margin-top:4px; transition:all 0.15s; }
  .btn-add-ingredient:hover { background:var(--green); color:white; }
  .btn-remove { width:28px; height:28px; border-radius:8px; background:#FEE; color:var(--terra); font-size:14px; flex-shrink:0; }
  .btn-submit { padding:12px 28px; border-radius:12px; background:var(--green); color:white; font-size:14px; font-weight:600; transition:all 0.2s; margin-top:8px; }
  .btn-submit:hover { background:var(--green-mid); }

  /* IMAGE PICKER */
  .image-picker-tabs { display:flex; gap:4px; background:var(--bg); border-radius:12px; padding:4px; margin-bottom:12px; }
  .img-tab { flex:1; padding:8px; border-radius:9px; font-size:12px; font-weight:600; color:var(--muted); background:transparent; transition:all 0.15s; }
  .img-tab.active { background:white; color:var(--green); box-shadow:var(--shadow); }
  .emoji-picker { display:flex; flex-wrap:wrap; gap:6px; }
  .emoji-btn { width:36px; height:36px; font-size:20px; border-radius:8px; border:2px solid var(--border); background:white; transition:all 0.15s; }
  .emoji-btn.selected { border-color:var(--green); background:var(--green-light); }
  .photo-upload-area { border:2px dashed var(--border); border-radius:14px; padding:28px; text-align:center; cursor:pointer; transition:all 0.2s; background:var(--bg); }
  .photo-upload-area:hover,.photo-upload-area:active { border-color:var(--sage); background:var(--green-light); }
  .photo-upload-area.has-photo { border-style:solid; border-color:var(--sage); padding:8px; }
  .photo-preview { width:100%; height:130px; object-fit:cover; border-radius:10px; display:block; }
  .photo-upload-icon { font-size:32px; margin-bottom:8px; }
  .photo-upload-text { font-size:13px; color:var(--muted); font-weight:500; }
  .photo-upload-sub { font-size:11px; color:var(--border); margin-top:4px; }
  .photo-change-btn { margin-top:8px; font-size:12px; color:var(--muted); background:none; text-decoration:underline; cursor:pointer; }
  .uploading-indicator { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--sage); padding:12px; background:var(--green-light); border-radius:10px; }

  /* IMPORT */
  .import-box { background:white; border-radius:18px; padding:24px; max-width:560px; margin:0 auto; border:1px solid var(--border); box-shadow:var(--shadow); }
  .tiktok-input { padding:11px 14px; border-radius:11px; border:2px solid var(--border); font-size:14px; background:var(--bg); transition:border-color 0.15s; width:100%; }
  .tiktok-input:focus { outline:none; border-color:var(--terra); }
  .btn-import { padding:12px 24px; border-radius:12px; background:var(--terra); color:white; font-size:14px; font-weight:600; transition:all 0.2s; white-space:nowrap; }
  .btn-import:hover { background:#B04E20; }
  .import-result { margin-top:20px; padding:18px; background:var(--green-light); border-radius:14px; border:1.5px solid var(--sage); }
  .loading-dots::after { content:''; animation:dots 1.2s steps(3) infinite; }
  @keyframes dots { 0%{content:'.';} 33%{content:'..';} 66%{content:'...';} }

  /* MODAL */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(4px); animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  .modal { background:white; border-radius:22px; width:100%; max-width:520px; max-height:88dvh; overflow-y:auto; box-shadow:var(--shadow-lg); animation:slideUp 0.25s ease; }
  .modal.wide { max-width:620px; }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  @media (max-width:767px) {
    @keyframes slideUp { from{transform:translateY(100%);} to{transform:translateY(0);} }
    .modal { animation:slideUp 0.3s cubic-bezier(0.32,0.72,0,1); }
  }
  .modal-handle { width:36px; height:4px; background:var(--border); border-radius:2px; margin:10px auto 0; display:none; }
  @media (max-width:767px) { .modal-handle { display:block; } }
  .modal-header { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--border); position:sticky; top:0; background:white; border-radius:22px 22px 0 0; z-index:1; }
  .modal-thumb { width:56px; height:56px; background:var(--green-light); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:32px; overflow:hidden; flex-shrink:0; }
  .modal-thumb img { width:100%; height:100%; object-fit:cover; }
  .modal-header h2 { font-size:18px; color:var(--green); }
  .modal-header .modal-meta { font-size:12px; color:var(--muted); margin-top:2px; }
  .modal-close { margin-left:auto; width:34px; height:34px; border-radius:9px; border:1.5px solid var(--border); background:transparent; font-size:16px; color:var(--muted); flex-shrink:0; }
  .modal-close:hover { background:var(--bg); }
  .modal-body { padding:20px; }
  .modal-stats { display:flex; gap:10px; margin-bottom:18px; }
  .modal-stat { flex:1; background:var(--bg); border-radius:11px; padding:10px 6px; text-align:center; }
  .modal-stat .val { font-size:20px; font-weight:700; color:var(--green); }
  .modal-stat .lbl { font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }
  .section-title { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; margin-top:18px; }
  .ingredient-list { list-style:none; }
  .ingredient-list li { padding:6px 0; border-bottom:1px solid var(--border); font-size:13px; display:flex; justify-content:space-between; }
  .ingredient-list li:last-child { border-bottom:none; }
  .steps-list { list-style:none; counter-reset:steps; }
  .steps-list li { counter-increment:steps; padding:7px 0 7px 36px; position:relative; font-size:13px; line-height:1.5; border-bottom:1px solid var(--border); }
  .steps-list li:last-child { border-bottom:none; }
  .steps-list li::before { content:counter(steps); position:absolute; left:0; top:7px; width:24px; height:24px; background:var(--green); color:white; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; }
  .modal-btn-row { display:flex; gap:8px; margin-top:18px; }
  .modal-add-btn { flex:1; padding:12px; border-radius:11px; background:var(--green); color:white; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; }
  .modal-add-btn:hover { background:var(--green-mid); }
  .modal-edit-btn { padding:12px 16px; border-radius:11px; background:var(--terra-light); color:var(--terra); border:1.5px solid #e8c4b0; font-size:13px; font-weight:600; white-space:nowrap; }
  .modal-edit-btn:hover { background:var(--terra); color:white; }

  .pick-list { display:grid; grid-template-columns:1fr 1fr; gap:7px; max-height:52dvh; overflow-y:auto; }
  @media (max-width:767px) { .pick-list { grid-template-columns:1fr; } }
  .pick-item { padding:10px; border-radius:11px; border:1.5px solid var(--border); cursor:pointer; transition:all 0.12s; background:white; display:flex; align-items:center; gap:9px; }
  .pick-item:hover,.pick-item:active { border-color:var(--green); background:var(--green-light); }
  .pick-thumb { font-size:20px; width:38px; height:38px; background:var(--bg); border-radius:9px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
  .pick-thumb img { width:100%; height:100%; object-fit:cover; }
  .pick-name { font-size:12px; font-weight:600; line-height:1.3; }
  .pick-cal { font-size:10px; color:var(--muted); }

  .toast { position:fixed; bottom:calc(var(--bottom-nav-h) + 12px); left:50%; transform:translateX(-50%); background:var(--green); color:white; padding:11px 22px; border-radius:100px; font-size:13px; font-weight:500; z-index:200; box-shadow:var(--shadow-lg); animation:toastIn 0.3s ease; white-space:nowrap; }
  @media (min-width:768px) { .toast { bottom:20px; } }
  @keyframes toastIn { from{transform:translateX(-50%) translateY(20px);opacity:0;} to{transform:translateX(-50%) translateY(0);opacity:1;} }

  .empty-state { text-align:center; padding:48px 20px; color:var(--muted); }
  .empty-state .empty-icon { font-size:44px; margin-bottom:10px; }
  .empty-state h3 { font-family:'Playfair Display',serif; font-size:19px; color:var(--green); margin-bottom:5px; }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:100px; font-size:10px; font-weight:600; }
  .badge-green { background:var(--green-light); color:var(--green); }

  .weekly-summary { background:var(--green); color:white; border-radius:14px; padding:14px 18px; margin-bottom:14px; display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
  .weekly-summary .s-val { font-size:20px; font-weight:700; }
  .weekly-summary .s-lbl { font-size:9px; opacity:0.7; text-transform:uppercase; letter-spacing:0.5px; }
  .weekly-summary .divider { width:1px; background:rgba(255,255,255,0.2); align-self:stretch; }
  .shopping-actions { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
  .btn-secondary { padding:9px 16px; border-radius:10px; background:white; border:1.5px solid var(--border); font-size:12px; font-weight:600; color:var(--text); transition:all 0.15s; }
  .btn-secondary:hover { border-color:var(--green); color:var(--green); }
  .btn-primary { padding:9px 16px; border-radius:10px; background:var(--green); font-size:12px; font-weight:600; color:white; }

  /* MOBILE SEARCH BAR */
  .search-row { display:flex; gap:8px; margin-bottom:14px; }
  .search-input { flex:1; padding:10px 14px; border-radius:100px; border:1.5px solid var(--border); font-size:13px; background:white; }
  .search-input:focus { outline:none; border-color:var(--green); }
`;

const EMOJIS = ["🍽️","🥗","🥩","🐟","🍳","🌮","🍜","🥣","🍤","🫙","🥙","🍧","🥦","🍱","🫕","🍲","🥘","🫔","🧆","🥚","🥑","🍣","🥞","🍛","🫶"];
const METHODS = ["All","Baked","Grilled","Stir-fried","Pan-fried","Boiled","Raw/Poached","Frozen"];
const ORIGINS = ["All","Western","Asian","Mediterranean","Japanese","Mexican","Nordic","Asian-Fusion"];
const TYPES = ["All","Savory","Dessert"];
const MEALS = ["Breakfast","Lunch","Dinner"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getWeekDays(startDate) {
  return Array.from({length:7},(_,i)=>{ const d=new Date(startDate); d.setDate(startDate.getDate()+i); return d; });
}
function dateKey(date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
function isToday(date) {
  const t=new Date();
  return date.getDate()===t.getDate()&&date.getMonth()===t.getMonth()&&date.getFullYear()===t.getFullYear();
}

// ── IMAGE PICKER ──────────────────────────────────────────────────────────────
function ImagePicker({ value, onChange }) {
  const [tab, setTab] = useState(value?.type==='photo'?'photo':'emoji');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    // Try Supabase first, fall back to base64
    const url = await uploadImageToSupabase(file);
    if (url) {
      onChange({ type:'photo', photoUrl: url, emoji: value?.emoji||'🍽️' });
    } else {
      // base64 fallback
      const reader = new FileReader();
      reader.onload = ev => onChange({ type:'photo', photoUrl: ev.target.result, emoji: value?.emoji||'🍽️' });
      reader.readAsDataURL(file);
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="image-picker-tabs">
        <button className={`img-tab ${tab==='emoji'?'active':''}`} onClick={()=>setTab('emoji')}>😊 Choose Emoji</button>
        <button className={`img-tab ${tab==='photo'?'active':''}`} onClick={()=>setTab('photo')}>📷 Upload Photo</button>
      </div>
      {tab==='emoji' && (
        <div className="emoji-picker">
          {EMOJIS.map(e=>(
            <button key={e} className={`emoji-btn ${value?.emoji===e&&value?.type==='emoji'?'selected':''}`}
              onClick={()=>onChange({type:'emoji',emoji:e,photoUrl:null})}>{e}</button>
          ))}
        </div>
      )}
      {tab==='photo' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          {uploading && (
            <div className="uploading-indicator">
              <span>⏳</span> Uploading photo...
            </div>
          )}
          {!uploading && value?.type==='photo' && value?.photoUrl ? (
            <div className="photo-upload-area has-photo" onClick={()=>fileRef.current.click()}>
              <img src={value.photoUrl} className="photo-preview" alt="recipe"/>
              <button className="photo-change-btn" onClick={e=>{e.stopPropagation();fileRef.current.click();}}>Change photo</button>
            </div>
          ) : !uploading && (
            <div className="photo-upload-area" onClick={()=>fileRef.current.click()}>
              <div className="photo-upload-icon">📸</div>
              <div className="photo-upload-text">Tap to upload a photo</div>
              <div className="photo-upload-sub">
                {SUPABASE_URL ? "Photos saved to cloud ☁️" : "JPG, PNG, WEBP supported"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecipeThumb({ recipe, size=50 }) {
  if (recipe.image?.type==='photo' && recipe.image?.photoUrl)
    return <img src={recipe.image.photoUrl} alt={recipe.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>;
  return <span style={{fontSize:size}}>{recipe.image?.emoji||recipe.emoji||'🍽️'}</span>;
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const INITIAL_RECIPES = [
  {id:1,emoji:"🥗",image:{type:'emoji',emoji:'🥗'},name:"Greek Chicken Bowl",calories:380,protein:42,carbs:28,fat:12,cookMethod:"Grilled",origin:"Mediterranean",type:"Savory",ingredientCount:8,prepTime:25,ingredients:[{n:"Chicken breast",q:"200g"},{n:"Cucumber",q:"1 cup"},{n:"Cherry tomatoes",q:"½ cup"},{n:"Kalamata olives",q:"10 pcs"},{n:"Feta cheese",q:"30g"},{n:"Red onion",q:"¼ pcs"},{n:"Quinoa",q:"½ cup"},{n:"Lemon juice",q:"2 tbsp"}],steps:["Cook quinoa per packet directions.","Grill chicken with oregano, garlic, lemon.","Dice all veggies.","Assemble bowl, crumble feta on top.","Drizzle olive oil and lemon juice."],tags:["High Protein","Meal Prep"]},
  {id:2,emoji:"🍳",image:{type:'emoji',emoji:'🍳'},name:"Egg White Omelette",calories:180,protein:28,carbs:6,fat:5,cookMethod:"Pan-fried",origin:"Western",type:"Savory",ingredientCount:5,prepTime:10,ingredients:[{n:"Egg whites",q:"5 pcs"},{n:"Spinach",q:"1 cup"},{n:"Mushrooms",q:"½ cup"},{n:"Red bell pepper",q:"¼ cup"},{n:"Salt & pepper",q:"to taste"}],steps:["Whisk egg whites with seasoning.","Sauté veggies until soft.","Pour egg whites over veggies.","Fold and cook until set."],tags:["Quick","Low Carb"]},
  {id:3,emoji:"🐟",image:{type:'emoji',emoji:'🐟'},name:"Lemon Herb Baked Cod",calories:260,protein:40,carbs:4,fat:9,cookMethod:"Baked",origin:"Western",type:"Savory",ingredientCount:6,prepTime:20,ingredients:[{n:"Cod fillet",q:"200g"},{n:"Lemon",q:"1 pcs"},{n:"Garlic",q:"3 cloves"},{n:"Fresh dill",q:"2 tbsp"},{n:"Olive oil",q:"1 tbsp"},{n:"Capers",q:"1 tbsp"}],steps:["Preheat oven to 200°C.","Place cod on baking tray.","Top with garlic, dill, lemon slices, capers.","Drizzle olive oil.","Bake 15-18 mins."],tags:["Omega-3","Low Calorie"]},
  {id:4,emoji:"🍚",image:{type:'emoji',emoji:'🍚'},name:"Cauliflower Fried Rice",calories:220,protein:18,carbs:20,fat:7,cookMethod:"Stir-fried",origin:"Asian",type:"Savory",ingredientCount:9,prepTime:20,ingredients:[{n:"Cauliflower rice",q:"2 cups"},{n:"Eggs",q:"2 pcs"},{n:"Edamame",q:"½ cup"},{n:"Carrots",q:"⅓ cup"},{n:"Soy sauce",q:"2 tbsp"},{n:"Sesame oil",q:"1 tsp"},{n:"Green onion",q:"2 stalks"},{n:"Garlic",q:"2 cloves"},{n:"Ginger",q:"1 tsp"}],steps:["Rice cauliflower in food processor.","Scramble eggs, set aside.","Stir-fry veggies in sesame oil.","Add cauliflower rice, cook 5 mins.","Add eggs, soy sauce, toss.","Top with green onion."],tags:["Low Carb","Vegetarian"]},
  {id:5,emoji:"🍤",image:{type:'emoji',emoji:'🍤'},name:"Shrimp & Zucchini Stir-fry",calories:280,protein:32,carbs:12,fat:10,cookMethod:"Stir-fried",origin:"Asian",type:"Savory",ingredientCount:8,prepTime:15,ingredients:[{n:"Shrimp",q:"200g"},{n:"Zucchini",q:"2 medium"},{n:"Red chili",q:"1 pcs"},{n:"Garlic",q:"3 cloves"},{n:"Oyster sauce",q:"2 tbsp"},{n:"Lime juice",q:"1 tbsp"},{n:"Coconut aminos",q:"1 tbsp"},{n:"Sesame seeds",q:"1 tsp"}],steps:["Devein and pat dry shrimp.","Slice zucchini into half-moons.","Stir-fry garlic and chili in oil.","Add shrimp, cook 3 mins.","Add zucchini, sauces.","Finish with lime and sesame seeds."],tags:["Quick","High Protein"]},
  {id:6,emoji:"🌮",image:{type:'emoji',emoji:'🌮'},name:"Turkey Lettuce Wraps",calories:200,protein:28,carbs:8,fat:7,cookMethod:"Pan-fried",origin:"Asian-Fusion",type:"Savory",ingredientCount:7,prepTime:15,ingredients:[{n:"Ground turkey",q:"150g"},{n:"Butter lettuce",q:"6 leaves"},{n:"Water chestnuts",q:"¼ cup"},{n:"Hoisin sauce",q:"2 tbsp"},{n:"Ginger",q:"1 tsp"},{n:"Garlic",q:"2 cloves"},{n:"Rice vinegar",q:"1 tsp"}],steps:["Brown turkey in pan, drain fat.","Add garlic, ginger, water chestnuts.","Stir in hoisin, rice vinegar.","Spoon mixture into lettuce cups.","Serve with chili sauce on side."],tags:["Low Carb","Quick"]},
  {id:7,emoji:"🥣",image:{type:'emoji',emoji:'🥣'},name:"Cottage Cheese Pancakes",calories:240,protein:22,carbs:24,fat:6,cookMethod:"Pan-fried",origin:"Western",type:"Savory",ingredientCount:5,prepTime:15,ingredients:[{n:"Cottage cheese",q:"1 cup"},{n:"Eggs",q:"2 pcs"},{n:"Oat flour",q:"¼ cup"},{n:"Vanilla extract",q:"½ tsp"},{n:"Blueberries",q:"⅓ cup"}],steps:["Blend cottage cheese, eggs, oat flour, vanilla.","Heat non-stick pan on medium.","Pour small circles, cook 2 mins each side.","Serve with fresh blueberries."],tags:["High Protein","Breakfast"]},
  {id:8,emoji:"🥩",image:{type:'emoji',emoji:'🥩'},name:"Baked Chicken Thighs",calories:350,protein:45,carbs:2,fat:16,cookMethod:"Baked",origin:"Western",type:"Savory",ingredientCount:6,prepTime:35,ingredients:[{n:"Chicken thighs (skinless)",q:"300g"},{n:"Paprika",q:"1 tsp"},{n:"Garlic powder",q:"1 tsp"},{n:"Onion powder",q:"½ tsp"},{n:"Olive oil",q:"1 tbsp"},{n:"Lemon",q:"½ pcs"}],steps:["Preheat oven to 210°C.","Mix spices and olive oil into paste.","Coat chicken thighs.","Bake 25-30 mins until 74°C internal.","Rest 5 mins before serving."],tags:["Meal Prep","High Protein"]},
  {id:9,emoji:"🍜",image:{type:'emoji',emoji:'🍜'},name:"Miso Soup with Tofu",calories:160,protein:12,carbs:14,fat:5,cookMethod:"Boiled",origin:"Japanese",type:"Savory",ingredientCount:6,prepTime:10,ingredients:[{n:"Soft tofu",q:"150g"},{n:"Miso paste",q:"2 tbsp"},{n:"Dashi powder",q:"1 tsp"},{n:"Wakame seaweed",q:"1 tbsp"},{n:"Green onion",q:"2 stalks"},{n:"Water",q:"3 cups"}],steps:["Bring water to near boil with dashi.","Dissolve miso paste in ladle of broth.","Add tofu cubes and wakame.","Pour miso mixture back in.","Do not boil after adding miso.","Top with green onion."],tags:["Low Calorie","Vegan"]},
  {id:10,emoji:"🫙",image:{type:'emoji',emoji:'🫙'},name:"Salmon Salad Bowl",calories:320,protein:38,carbs:15,fat:13,cookMethod:"Raw/Poached",origin:"Nordic",type:"Savory",ingredientCount:8,prepTime:20,ingredients:[{n:"Salmon fillet",q:"150g"},{n:"Mixed greens",q:"2 cups"},{n:"Avocado",q:"¼ pcs"},{n:"Cucumber",q:"½ cup"},{n:"Radish",q:"4 pcs"},{n:"Capers",q:"1 tbsp"},{n:"Lemon juice",q:"1 tbsp"},{n:"Dijon mustard",q:"1 tsp"}],steps:["Poach salmon 8 mins, flake.","Arrange greens in bowl.","Slice avocado, cucumber, radish.","Make dressing with lemon + dijon + water.","Assemble bowl, drizzle dressing."],tags:["Omega-3","Gluten-Free"]},
  {id:11,emoji:"🥙",image:{type:'emoji',emoji:'🥙'},name:"Black Bean Tacos",calories:310,protein:16,carbs:42,fat:8,cookMethod:"Pan-fried",origin:"Mexican",type:"Savory",ingredientCount:9,prepTime:15,ingredients:[{n:"Black beans",q:"1 can"},{n:"Corn tortillas (small)",q:"3 pcs"},{n:"Red cabbage",q:"1 cup"},{n:"Avocado",q:"⅓ pcs"},{n:"Lime juice",q:"1 tbsp"},{n:"Cumin",q:"1 tsp"},{n:"Greek yogurt",q:"3 tbsp"},{n:"Salsa",q:"3 tbsp"},{n:"Cilantro",q:"¼ cup"}],steps:["Warm and season black beans with cumin.","Shred red cabbage, toss with lime.","Warm tortillas.","Build tacos: beans, cabbage, avocado.","Top with yogurt, salsa, cilantro."],tags:["Vegetarian","Budget-Friendly"]},
  {id:12,emoji:"🍧",image:{type:'emoji',emoji:'🍧'},name:"Frozen Yogurt Bark",calories:150,protein:8,carbs:22,fat:2,cookMethod:"Frozen",origin:"Western",type:"Dessert",ingredientCount:5,prepTime:10,ingredients:[{n:"Greek yogurt (0%)",q:"2 cups"},{n:"Honey",q:"2 tbsp"},{n:"Mixed berries",q:"1 cup"},{n:"Granola",q:"¼ cup"},{n:"Chia seeds",q:"1 tsp"}],steps:["Spread yogurt on parchment-lined tray.","Drizzle honey, scatter berries, granola.","Sprinkle chia seeds.","Freeze 2+ hours.","Break into shards and serve."],tags:["Dessert","Meal Prep"]},
];

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function EditRecipeModal({ recipe, onSave, onClose }) {
  const [form, setForm] = useState({
    ...recipe,
    image: recipe.image||{type:'emoji',emoji:recipe.emoji||'🍽️',photoUrl:null},
    steps: Array.isArray(recipe.steps)?recipe.steps.join("\n"):(recipe.steps||""),
    ingredients: recipe.ingredients?.length?recipe.ingredients:[{n:"",q:""}],
  });
  function addIng(){setForm(f=>({...f,ingredients:[...f.ingredients,{n:"",q:""}]}));}
  function removeIng(i){setForm(f=>({...f,ingredients:f.ingredients.filter((_,idx)=>idx!==i)}));}
  function updateIng(i,field,val){setForm(f=>({...f,ingredients:f.ingredients.map((ing,idx)=>idx===i?{...ing,[field]:val}:ing)}));}
  function handleSave(){
    onSave({...form,calories:+form.calories||0,protein:+form.protein||0,carbs:+form.carbs||0,fat:+form.fat||0,
      prepTime:+form.prepTime||0,ingredientCount:form.ingredients.filter(i=>i.n).length,
      steps:typeof form.steps==="string"?form.steps.split("\n").filter(Boolean):form.steps,
      emoji:form.image?.type==='emoji'?form.image.emoji:form.emoji,
    });
    onClose();
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-header">
          <div className="modal-thumb"><RecipeThumb recipe={form}/></div>
          <div><h2 style={{fontSize:17}}>Edit Recipe</h2><div className="modal-meta">Changes update everywhere</div></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{marginBottom:18}}>
            <div className="form-label" style={{marginBottom:8}}>Recipe Image</div>
            <ImagePicker value={form.image} onChange={img=>setForm(f=>({...f,image:img}))}/>
          </div>
          <div className="form-grid">
            <div className="form-group full"><label className="form-label">Recipe Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Calories</label><input className="form-input" type="number" value={form.calories} onChange={e=>setForm(f=>({...f,calories:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Protein (g)</label><input className="form-input" type="number" value={form.protein} onChange={e=>setForm(f=>({...f,protein:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Carbs (g)</label><input className="form-input" type="number" value={form.carbs} onChange={e=>setForm(f=>({...f,carbs:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fat (g)</label><input className="form-input" type="number" value={form.fat} onChange={e=>setForm(f=>({...f,fat:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Prep Time (min)</label><input className="form-input" type="number" value={form.prepTime} onChange={e=>setForm(f=>({...f,prepTime:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Method</label><select className="form-select form-input" value={form.cookMethod} onChange={e=>setForm(f=>({...f,cookMethod:e.target.value}))}>{METHODS.filter(m=>m!=="All").map(m=><option key={m}>{m}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Origin</label><select className="form-select form-input" value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))}>{ORIGINS.filter(o=>o!=="All").map(o=><option key={o}>{o}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-select form-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Savory</option><option>Dessert</option></select></div>
          </div>
          <div className="form-group" style={{marginTop:14}}>
            <label className="form-label">Ingredients</label>
            {form.ingredients.map((ing,i)=>(
              <div key={i} className="ingredient-row">
                <input className="form-input" style={{flex:2}} placeholder="Ingredient" value={ing.n} onChange={e=>updateIng(i,"n",e.target.value)}/>
                <input className="form-input" style={{flex:1}} placeholder="Qty" value={ing.q} onChange={e=>updateIng(i,"q",e.target.value)}/>
                {form.ingredients.length>1&&<button className="btn-remove" onClick={()=>removeIng(i)}>✕</button>}
              </div>
            ))}
            <button className="btn-add-ingredient" onClick={addIng}>+ Add Ingredient</button>
          </div>
          <div className="form-group" style={{marginTop:14}}>
            <label className="form-label">Steps (one per line)</label>
            <textarea className="form-input form-textarea" value={form.steps} onChange={e=>setForm(f=>({...f,steps:e.target.value}))}/>
          </div>
          <div style={{display:"flex",gap:8,marginTop:18}}>
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
    <div className="recipe-card" onClick={()=>onView(recipe)}>
      <div className="card-thumb">
        <RecipeThumb recipe={recipe}/>
        <span className="origin-badge">{recipe.origin}</span>
        <span className="type-badge" style={{background:recipe.type==="Dessert"?"#9B59B6":undefined}}>{recipe.type}</span>
      </div>
      <div className="card-body">
        <div className="card-title">{recipe.name}</div>
        <div className="card-meta"><span>⏱ {recipe.prepTime}m</span><span>🔧 {recipe.cookMethod}</span></div>
        <div className="card-stats">
          <div className="stat-pill"><div className="val">{recipe.calories}</div><div className="lbl">kcal</div></div>
          <div className="stat-pill"><div className="val">{recipe.protein}g</div><div className="lbl">protein</div></div>
          <div className="stat-pill"><div className="val">{recipe.ingredientCount}</div><div className="lbl">ingr.</div></div>
        </div>
        <div className="card-actions" onClick={e=>e.stopPropagation()}>
          <button className="btn-sm btn-edit" onClick={()=>onEdit(recipe)}>✏️</button>
          <button className="btn-sm btn-outline" onClick={()=>onView(recipe)}>View</button>
          <button className="btn-sm btn-green" onClick={()=>onAddToPlanner(recipe)}>+ Plan</button>
        </div>
      </div>
    </div>
  );
}

function RecipeModal({ recipe, onClose, onAddToPlanner, onEdit }) {
  if(!recipe) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-header">
          <div className="modal-thumb"><RecipeThumb recipe={recipe}/></div>
          <div><h2>{recipe.name}</h2><div className="modal-meta">⏱ {recipe.prepTime}m · {recipe.cookMethod} · {recipe.origin}</div></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-stats">
            <div className="modal-stat"><div className="val">{recipe.calories}</div><div className="lbl">Cal</div></div>
            <div className="modal-stat"><div className="val">{recipe.protein}g</div><div className="lbl">Protein</div></div>
            <div className="modal-stat"><div className="val">{recipe.carbs}g</div><div className="lbl">Carbs</div></div>
            <div className="modal-stat"><div className="val">{recipe.fat}g</div><div className="lbl">Fat</div></div>
          </div>
          {recipe.tags?.map(t=><span key={t} className="badge badge-green" style={{marginRight:5}}>{t}</span>)}
          <div className="section-title">Ingredients</div>
          <ul className="ingredient-list">{recipe.ingredients.map((ing,i)=><li key={i}><span>{ing.n}</span><span style={{color:"var(--muted)",fontWeight:500}}>{ing.q}</span></li>)}</ul>
          <div className="section-title">Steps</div>
          <ol className="steps-list">{recipe.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>
          <div className="modal-btn-row">
            <button className="modal-edit-btn" onClick={()=>{onEdit(recipe);onClose();}}>✏️ Edit</button>
            <button className="modal-add-btn" onClick={()=>{onAddToPlanner(recipe);onClose();}}>📅 Add to Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PickRecipeModal({ recipes, onPick, onClose, date, meal }) {
  const [search, setSearch] = useState("");
  const filtered = recipes.filter(r=>r.name.toLowerCase().includes(search.toLowerCase()));
  const label = date?`${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}` : "";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-header" style={{padding:"14px 18px"}}>
          <div><h2 style={{fontSize:17}}>Pick a Recipe</h2><div className="modal-meta">{label} · {meal}</div></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{padding:"10px 16px",borderBottom:"1px solid var(--border)"}}>
          <input className="form-input" style={{width:"100%"}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{padding:14}}>
          <div className="pick-list">
            {filtered.map(r=>(
              <div key={r.id} className="pick-item" onClick={()=>{onPick(r);onClose();}}>
                <div className="pick-thumb"><RecipeThumb recipe={r} size={20}/></div>
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
  useEffect(()=>{const t=setTimeout(onDone,2500);return()=>clearTimeout(t);},[]);
  return <div className="toast">{message}</div>;
}

// ── VIEWS ─────────────────────────────────────────────────────────────────────
function DiscoverView({ recipes, onView, onAddToPlanner, onEdit }) {
  const [filters, setFilters] = useState({maxCal:600,minProtein:0,method:"All",origin:"All",type:"All",maxIng:15});
  const [search, setSearch] = useState("");
  const [displayed, setDisplayed] = useState(null);
  const filtered = useMemo(()=>recipes.filter(r=>
    r.calories<=filters.maxCal&&r.protein>=filters.minProtein&&
    (filters.method==="All"||r.cookMethod===filters.method)&&
    (filters.origin==="All"||r.origin===filters.origin)&&
    (filters.type==="All"||r.type===filters.type)&&
    r.ingredientCount<=filters.maxIng&&r.name.toLowerCase().includes(search.toLowerCase())
  ),[recipes,filters,search]);
  const shown = displayed||filtered;
  return (
    <div>
      <div className="page-header"><h1>Discover 🥦</h1><p>High-protein, low-calorie meals</p></div>
      <div className="search-row">
        <input className="search-input" placeholder="🔍 Search recipes..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="randomize-btn" onClick={()=>setDisplayed([...filtered].sort(()=>Math.random()-0.5).slice(0,6))}>🎲</button>
        {displayed&&<button className="btn-secondary" style={{borderRadius:100,padding:"9px 14px",fontSize:12}} onClick={()=>setDisplayed(null)}>All</button>}
      </div>
      <div className="filter-row">
        <select className="filter-select" value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
        <select className="filter-select" value={filters.method} onChange={e=>setFilters(f=>({...f,method:e.target.value}))}>{METHODS.map(m=><option key={m}>{m}</option>)}</select>
        <select className="filter-select" value={filters.origin} onChange={e=>setFilters(f=>({...f,origin:e.target.value}))}>{ORIGINS.map(o=><option key={o}>{o}</option>)}</select>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
        {[["Max cal",filters.maxCal,"maxCal",100,600,50],[" Min protein",filters.minProtein,"minProtein",0,50,5],["Max ingr.",filters.maxIng,"maxIng",3,15,1]].map(([lbl,val,key,min,max,step])=>(
          <div key={key} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500}}>
            <span style={{color:"var(--muted)",whiteSpace:"nowrap"}}>{lbl}:</span>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e=>setFilters(f=>({...f,[key]:+e.target.value}))} style={{accentColor:"var(--green)",width:70}}/>
            <span style={{color:"var(--green)",fontWeight:700,minWidth:24}}>{val}{key==="minProtein"?"g":""}</span>
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:"var(--muted)",marginBottom:14}}>{shown.length} recipe{shown.length!==1?"s":""}</div>
      {shown.length===0?(<div className="empty-state"><div className="empty-icon">🔍</div><h3>No matches</h3><p>Try adjusting filters</p></div>):(
        <div className="recipe-grid">{shown.map(r=><RecipeCard key={r.id} recipe={r} onView={onView} onAddToPlanner={onAddToPlanner} onEdit={onEdit}/>)}</div>
      )}
    </div>
  );
}

function PlannerView({ recipes, weeklyPlan, setWeeklyPlan, onShowShopping }) {
  const today = useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);
  const [weekStart, setWeekStart] = useState(()=>{const d=new Date();d.setHours(0,0,0,0);return d;});
  const [picking, setPicking] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const weekDays = useMemo(()=>getWeekDays(weekStart),[weekStart]);
  const weekLabel = useMemo(()=>{
    const s=weekDays[0],e=weekDays[6];
    if(s.getMonth()===e.getMonth()) return `${s.getDate()}–${e.getDate()} ${MONTH_NAMES[s.getMonth()]}`;
    return `${s.getDate()} ${MONTH_NAMES[s.getMonth()]} – ${e.getDate()} ${MONTH_NAMES[e.getMonth()]}`;
  },[weekDays]);
  const totalCals=useMemo(()=>weekDays.reduce((sum,d)=>sum+Object.values(weeklyPlan[dateKey(d)]||{}).reduce((s,r)=>s+(r?.calories||0),0),0),[weeklyPlan,weekDays]);
  const totalMeals=useMemo(()=>weekDays.reduce((sum,d)=>sum+Object.values(weeklyPlan[dateKey(d)]||{}).filter(Boolean).length,0),[weeklyPlan,weekDays]);

  return (
    <div>
      <div className="page-header"><h1>Meal Plan 📅</h1><p>Your week at a glance</p></div>
      <div className="weekly-summary">
        <div><div className="s-val">{totalMeals}</div><div className="s-lbl">Planned</div></div>
        <div className="divider"/>
        <div><div className="s-val">{totalCals}</div><div className="s-lbl">Total Cal</div></div>
        <div className="divider"/>
        <div><div className="s-val">{totalMeals>0?Math.round(totalCals/totalMeals):0}</div><div className="s-lbl">Avg/Meal</div></div>
        <div style={{marginLeft:"auto"}}>
          <button style={{background:"rgba(255,255,255,0.18)",border:"1.5px solid rgba(255,255,255,0.35)",color:"white",padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:600}} onClick={onShowShopping}>🛒 Shop</button>
        </div>
      </div>
      <div className="week-nav">
        <button className="week-nav-btn" onClick={()=>{const d=new Date(weekStart);d.setDate(d.getDate()-7);setWeekStart(d);}}>‹</button>
        <button className="week-nav-btn" onClick={()=>{const d=new Date(weekStart);d.setDate(d.getDate()+7);setWeekStart(d);}}>›</button>
        <span className="week-label">{weekLabel}</span>
        <button className="week-today-btn" onClick={()=>{const d=new Date();d.setHours(0,0,0,0);setWeekStart(d);}}>↩ Today</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <div className="planner-grid" style={{minWidth:560}}>
          <div/>
          {weekDays.map(d=>{
            const key=dateKey(d);
            const dayCal=MEALS.reduce((s,m)=>s+(weeklyPlan[key]?.[m]?.calories||0),0);
            return (
              <div key={key} className={`planner-day-header ${isToday(d)?"today":""}`}>
                <div className="day-name">{DAY_NAMES[d.getDay()]}</div>
                <div className="day-num">{d.getDate()}</div>
                <div className="day-month">{MONTH_NAMES[d.getMonth()]}</div>
                <div className="day-cal">{dayCal>0?`${dayCal}`:""}</div>
              </div>
            );
          })}
          {MEALS.map(meal=>(
            <>
              <div key={meal} className="planner-meal-label">{meal.slice(0,5)}</div>
              {weekDays.map(d=>{
                const key=dateKey(d);
                const recipe=weeklyPlan[key]?.[meal];
                return (
                  <div key={key} className={`planner-cell ${recipe?"filled":""} ${isToday(d)?"today-col":""}`}
                    onClick={()=>{if(!recipe){setPendingDate(d);setPendingMeal(meal);setPicking(true);}}}>
                    {recipe?(
                      <>
                        {recipe.image?.type==='photo'&&recipe.image?.photoUrl
                          ?<img src={recipe.image.photoUrl} className="cell-img" alt=""/>
                          :<div className="cell-emoji">{recipe.image?.emoji||recipe.emoji}</div>}
                        <div className="cell-name">{recipe.name}</div>
                        <div className="cell-cal">{recipe.calories}</div>
                        <button className="cell-remove" onClick={e=>{e.stopPropagation();setWeeklyPlan(p=>({...p,[key]:{...(p[key]||{}),[meal]:null}}));}}>✕</button>
                      </>
                    ):<div className="cell-add">+</div>}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      {picking&&<PickRecipeModal recipes={recipes} date={pendingDate} meal={pendingMeal}
        onPick={r=>setWeeklyPlan(p=>({...p,[dateKey(pendingDate)]:{...(p[dateKey(pendingDate)]||{}),[pendingMeal]:r}}))}
        onClose={()=>setPicking(false)}/>}
    </div>
  );
}

function ShoppingView({ weeklyPlan }) {
  const [checked, setChecked] = useState({});
  const allIngredients = useMemo(()=>{
    const map={};
    Object.values(weeklyPlan).forEach(day=>Object.values(day).forEach(r=>{
      if(!r) return;
      r.ingredients.forEach(ing=>{const key=ing.n.toLowerCase();if(!map[key]) map[key]={name:ing.n,qty:ing.q};});
    }));
    return Object.values(map);
  },[weeklyPlan]);
  const categories={
    Proteins:allIngredients.filter(i=>/chicken|turkey|salmon|cod|shrimp|egg|tofu|beef|tuna|yogurt|cheese/i.test(i.name)),
    "Veg & Fruit":allIngredients.filter(i=>/spinach|zucchini|cucumber|tomato|mushroom|pepper|cabbage|avocado|berries|onion|cauliflower|carrot|radish|lime|lemon|ginger|garlic/i.test(i.name)),
    Grains:allIngredients.filter(i=>/rice|quinoa|oat|tortilla|granola/i.test(i.name)),
    Pantry:allIngredients.filter(i=>!/chicken|turkey|salmon|cod|shrimp|egg|tofu|beef|tuna|yogurt|cheese|spinach|zucchini|cucumber|tomato|mushroom|pepper|cabbage|avocado|berries|onion|cauliflower|carrot|radish|lime|lemon|ginger|garlic|rice|quinoa|oat|tortilla|granola/i.test(i.name)),
  };
  if(allIngredients.length===0) return (
    <div><div className="page-header"><h1>Shopping 🛒</h1></div>
    <div className="empty-state"><div className="empty-icon">🛒</div><h3>No meals planned</h3><p>Plan meals first to generate your list</p></div></div>
  );
  return (
    <div>
      <div className="page-header"><h1>Shopping 🛒</h1><p>{allIngredients.length} ingredients needed</p></div>
      <div className="shopping-actions">
        <button className="btn-secondary" onClick={()=>setChecked({})}>Clear</button>
        <button className="btn-secondary" onClick={()=>navigator.clipboard?.writeText(Object.entries(categories).map(([c,items])=>`${c}:\n${items.map(i=>`- ${i.name} (${i.qty})`).join("\n")}`).join("\n\n"))}>📋 Copy</button>
        <button className="btn-primary" onClick={()=>setChecked(Object.fromEntries(allIngredients.map(i=>[i.name,true])))}>Check All</button>
      </div>
      {Object.entries(categories).map(([cat,items])=>items.length>0&&(
        <div key={cat} className="shopping-section"><h3>{cat}</h3>
          {items.map(item=>(
            <div key={item.name} className={`shopping-item ${checked[item.name]?"checked":""}`}>
              <input type="checkbox" checked={!!checked[item.name]} onChange={e=>setChecked(c=>({...c,[item.name]:e.target.checked}))}/>
              <span className="item-name">{item.name}</span><span className="item-qty">{item.qty}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CreateRecipeView({ onSave, toast }) {
  const empty={name:"",image:{type:'emoji',emoji:'🍽️',photoUrl:null},calories:"",protein:"",carbs:"",fat:"",cookMethod:"Baked",origin:"Western",type:"Savory",prepTime:"",steps:"",ingredients:[{n:"",q:""}]};
  const [form,setForm]=useState(empty);
  function addIng(){setForm(f=>({...f,ingredients:[...f.ingredients,{n:"",q:""}]}));}
  function removeIng(i){setForm(f=>({...f,ingredients:f.ingredients.filter((_,idx)=>idx!==i)}));}
  function updateIng(i,field,val){setForm(f=>({...f,ingredients:f.ingredients.map((ing,idx)=>idx===i?{...ing,[field]:val}:ing)}));}
  function handleSubmit(){
    if(!form.name||!form.calories||!form.protein){toast("Please fill required fields");return;}
    onSave({...form,id:Date.now(),emoji:form.image?.emoji||'🍽️',calories:+form.calories,protein:+form.protein,carbs:+form.carbs||0,fat:+form.fat||0,prepTime:+form.prepTime||0,ingredientCount:form.ingredients.filter(i=>i.n).length,steps:form.steps.split("\n").filter(Boolean),tags:["Custom"]});
    toast("✅ Recipe created!");setForm(empty);
  }
  return (
    <div>
      <div className="page-header"><h1>Create ✏️</h1><p>Add your own recipe</p></div>
      <div style={{background:"white",borderRadius:18,padding:20,border:"1px solid var(--border)"}}>
        <div style={{marginBottom:18}}>
          <div className="form-label" style={{marginBottom:8}}>Recipe Image</div>
          <ImagePicker value={form.image} onChange={img=>setForm(f=>({...f,image:img}))}/>
        </div>
        <div className="form-grid">
          <div className="form-group full"><label className="form-label">Name *</label><input className="form-input" placeholder="e.g. Spicy Tuna Bowl" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Calories *</label><input className="form-input" type="number" placeholder="350" value={form.calories} onChange={e=>setForm(f=>({...f,calories:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Protein (g) *</label><input className="form-input" type="number" placeholder="30" value={form.protein} onChange={e=>setForm(f=>({...f,protein:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Carbs (g)</label><input className="form-input" type="number" placeholder="20" value={form.carbs} onChange={e=>setForm(f=>({...f,carbs:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Fat (g)</label><input className="form-input" type="number" placeholder="10" value={form.fat} onChange={e=>setForm(f=>({...f,fat:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Prep Time (min)</label><input className="form-input" type="number" placeholder="20" value={form.prepTime} onChange={e=>setForm(f=>({...f,prepTime:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Method</label><select className="form-select form-input" value={form.cookMethod} onChange={e=>setForm(f=>({...f,cookMethod:e.target.value}))}>{METHODS.filter(m=>m!=="All").map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Origin</label><select className="form-select form-input" value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))}>{ORIGINS.filter(o=>o!=="All").map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Type</label><select className="form-select form-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Savory</option><option>Dessert</option></select></div>
        </div>
        <div className="form-group" style={{marginTop:14}}>
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
        <div className="form-group" style={{marginTop:14}}>
          <label className="form-label">Steps (one per line)</label>
          <textarea className="form-input form-textarea" placeholder={"Step 1\nStep 2\nStep 3"} value={form.steps} onChange={e=>setForm(f=>({...f,steps:e.target.value}))}/>
        </div>
        <button className="btn-submit" style={{width:"100%"}} onClick={handleSubmit}>Save Recipe 🥗</button>
      </div>
    </div>
  );
}

function ImportView({ onSave, toast }) {
  const [url,setUrl]=useState(""); const [desc,setDesc]=useState("");
  const [loading,setLoading]=useState(false); const [result,setResult]=useState(null); const [error,setError]=useState("");
  async function handleImport(){
    if(!url&&!desc){setError("Please describe the recipe.");return;}
    setLoading(true);setError("");setResult(null);
    try {
      const prompt=`Generate a healthy calorie-deficit recipe as JSON based on: ${url||desc}\n\nReturn ONLY valid JSON: {"name":"","emoji":"","calories":0,"protein":0,"carbs":0,"fat":0,"prepTime":0,"cookMethod":"Baked","origin":"Western","type":"Savory","ingredients":[{"n":"","q":""}],"steps":[""],"tags":[""]}`;
      const response=await fetch("/api/generate-recipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await response.json();
      const text=data.content?.[0]?.text||"";
      const recipe=JSON.parse(text.replace(/```json|```/g,"").trim());
      recipe.id=Date.now(); recipe.ingredientCount=recipe.ingredients?.length||0;
      recipe.image={type:'emoji',emoji:recipe.emoji||'🍽️',photoUrl:null};
      setResult(recipe);
    }catch(e){setError("Could not generate recipe. Try describing it differently.");}
    setLoading(false);
  }
  return (
    <div>
      <div className="page-header"><h1>Import 🎵</h1><p>AI-generate a recipe from TikTok</p></div>
      <div className="import-box">
        <div style={{marginBottom:14,padding:10,background:"var(--terra-light)",borderRadius:10,fontSize:12,color:"var(--terra)",fontWeight:500}}>⚠️ Describe the recipe you saw — TikTok URLs can't be fetched directly.</div>
        <div className="form-group" style={{marginBottom:10}}>
          <label className="form-label">TikTok URL (optional)</label>
          <input className="tiktok-input" placeholder="https://www.tiktok.com/..." value={url} onChange={e=>setUrl(e.target.value)}/>
        </div>
        <div className="form-group" style={{marginBottom:14}}>
          <label className="form-label">Describe the recipe *</label>
          <textarea className="form-input form-textarea" style={{fontSize:13}} placeholder="e.g. High-protein cottage cheese pasta with tomatoes and basil..." value={desc} onChange={e=>setDesc(e.target.value)}/>
        </div>
        {error&&<div style={{color:"var(--terra)",fontSize:12,marginBottom:10}}>{error}</div>}
        <button className="btn-import" style={{width:"100%"}} onClick={handleImport} disabled={loading}>
          {loading?<span className="loading-dots">Generating recipe</span>:"🤖 Generate Recipe with AI"}
        </button>
        {result&&(
          <div className="import-result">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:32}}>{result.emoji}</span>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"var(--green)"}}>{result.name}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>⏱ {result.prepTime}m · {result.cookMethod} · {result.origin}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {[["Cal",result.calories,""],["Prot",result.protein+"g",""],["Carbs",result.carbs+"g",""],["Fat",result.fat+"g",""]].map(([l,v])=>(
                <div key={l} style={{flex:1,background:"white",borderRadius:8,padding:"6px 2px",textAlign:"center"}}>
                  <div style={{fontWeight:700,color:"var(--green)",fontSize:13}}>{v}</div>
                  <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase"}}>{l}</div>
                </div>
              ))}
            </div>
            <button className="btn-submit" style={{width:"100%",marginTop:0}} onClick={()=>{onSave({...result,tags:[...(result.tags||[]),"Imported"]});toast("✅ Imported!");setResult(null);setUrl("");setDesc("");}}>Save to Recipes ➕</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MyRecipesView({ recipes, onView, onAddToPlanner, onEdit }) {
  const userRecipes=recipes.filter(r=>r.tags?.includes("Custom")||r.tags?.includes("Imported"));
  if(userRecipes.length===0) return (
    <div><div className="page-header"><h1>My Recipes 📖</h1></div>
    <div className="empty-state"><div className="empty-icon">📖</div><h3>No recipes yet</h3><p>Create or import one to get started</p></div></div>
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
  const [view,setView]=useState("discover");
  const [recipes,setRecipes]=useState(()=>{
  try {
    const saved = localStorage.getItem("recipes");
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  } catch { return INITIAL_RECIPES; }
});
const [weeklyPlan,setWeeklyPlan]=useState(()=>{
  try {
    const saved = localStorage.getItem("weeklyPlan");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
});
  const [selectedRecipe,setSelectedRecipe]=useState(null);
  const [editingRecipe,setEditingRecipe]=useState(null);
  const [toast,setToast]=useState("");

  useEffect(()=>{ try { localStorage.setItem("recipes", JSON.stringify(recipes)); } catch{} },[recipes]);
useEffect(()=>{ try { localStorage.setItem("weeklyPlan", JSON.stringify(weeklyPlan)); } catch{} },[weeklyPlan]);

function saveRecipe(r){setRecipes(prev=>[...prev,{...r,tags:[...(r.tags||[]),"Custom"]}]);}
  function updateRecipe(updated){
    setRecipes(r=>r.map(x=>x.id===updated.id?updated:x));
    setWeeklyPlan(plan=>{
      const p={...plan};
      Object.keys(p).forEach(key=>MEALS.forEach(meal=>{if(p[key]?.[meal]?.id===updated.id) p[key]={...p[key],[meal]:updated};}));
      return p;
    });
    setToast("✅ Recipe updated!");
  }

  const NAV=[
    {id:"discover",icon:"🥗",label:"Discover"},
    {id:"planner",icon:"📅",label:"Planner"},
    {id:"shopping",icon:"🛒",label:"Shop"},
    {id:"myrecipes",icon:"📖",label:"Mine"},
    {id:"create",icon:"✏️",label:"Create"},
    {id:"import",icon:"🎵",label:"Import"},
  ];

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app">

        {/* Desktop sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">🥦</div>
          {NAV.map(n=>(
            <button key={n.id} className={`nav-btn ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}>
              <span>{n.icon}</span><span className="label">{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="main">
          {view==="discover"&&<DiscoverView recipes={recipes} onView={setSelectedRecipe} onAddToPlanner={r=>{setView("planner");}} onEdit={setEditingRecipe}/>}
          {view==="planner"&&<PlannerView recipes={recipes} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} onShowShopping={()=>setView("shopping")}/>}
          {view==="shopping"&&<ShoppingView weeklyPlan={weeklyPlan}/>}
          {view==="myrecipes"&&<MyRecipesView recipes={recipes} onView={setSelectedRecipe} onAddToPlanner={r=>{setView("planner");}} onEdit={setEditingRecipe}/>}
          {view==="create"&&<CreateRecipeView onSave={saveRecipe} toast={setToast}/>}
          {view==="import"&&<ImportView onSave={r=>setRecipes(prev=>[...prev,r])} toast={setToast}/>}
        </main>

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {NAV.map(n=>(
              <button key={n.id} className={`nav-btn ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span className="label">{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {selectedRecipe&&<RecipeModal recipe={selectedRecipe} onClose={()=>setSelectedRecipe(null)} onAddToPlanner={r=>{setView("planner");setSelectedRecipe(null);}} onEdit={r=>{setEditingRecipe(r);setSelectedRecipe(null);}}/>}
        {editingRecipe&&<EditRecipeModal recipe={editingRecipe} onSave={updateRecipe} onClose={()=>setEditingRecipe(null)}/>}
        {toast&&<Toast message={toast} onDone={()=>setToast("")}/>}
      </div>
    </>
  );
}
