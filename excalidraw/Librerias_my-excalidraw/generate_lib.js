const fs = require('fs');

let counter = 0;
function get_id() {
  return `e${counter++}`;
}

function make_rect(x, y, width, height, strokeColor = '#e2e8f0', backgroundColor = 'transparent', fillStyle = 'solid') {
  return {
    id: get_id(),
    type: 'rectangle',
    x,
    y,
    width,
    height,
    strokeColor,
    backgroundColor,
    fillStyle,
    roughness: 0,
    seed: 1,
    version: 1,
    versionNonce: 1
  };
}

function make_ellipse(x, y, width, height, strokeColor = '#cbd5e1', backgroundColor = 'transparent') {
  return {
    id: get_id(),
    type: 'ellipse',
    x,
    y,
    width,
    height,
    strokeColor,
    backgroundColor,
    fillStyle: 'solid',
    roughness: 0,
    seed: 1,
    version: 1,
    versionNonce: 1
  };
}

function make_text(x, y, text, fontSize = 12, strokeColor = '#0f172a', fontFamily = 2) {
  const lines = text.split('\n');
  const max_len = Math.max(...lines.map(l => l.length));
  const width = Math.max(10, max_len * fontSize * 0.55);
  const height = lines.length * fontSize * 1.3;

  return {
    id: get_id(),
    type: 'text',
    x,
    y,
    width,
    height,
    strokeColor,
    seed: 1,
    version: 1,
    versionNonce: 1,
    text,
    fontSize,
    fontFamily,
    textAlign: 'left'
  };
}

function make_line(x, y, points, strokeColor = '#e2e8f0') {
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return {
    id: get_id(),
    type: 'line',
    x,
    y,
    width: w,
    height: h,
    strokeColor,
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    seed: 1,
    version: 1,
    versionNonce: 1,
    points
  };
}

// Colors
const C_BG_CARD = '#ffffff';
const C_BORDER_LIGHT = '#e2e8f0';
const C_BORDER_DARK = '#cbd5e1';
const C_PRIMARY = '#3b82f6';
const C_PRIMARY_BG = '#eff6ff';
const C_SUCCESS = '#10b981';
const C_SUCCESS_BG = '#ecfdf5';
const C_WARNING = '#f59e0b';
const C_WARNING_BG = '#fffbeb';
const C_ERROR = '#ef4444';
const C_ERROR_BG = '#fef2f2';
const C_TEXT_PRIMARY = '#0f172a';
const C_TEXT_SECONDARY = '#475569';
const C_TEXT_MUTED = '#64748b';

function build_library() {
  const library_items = [];

  // 1. Sidebar Expanded
  library_items.push({
    id: 'sidebar_expanded',
    name: 'Sidebar (Exp)',
    status: 'published',
    elements: [
      make_rect(0, 0, 160, 400, C_BORDER_LIGHT, C_BG_CARD),
      make_text(16, 16, 'SaaSify', 14, C_PRIMARY),
      make_rect(8, 48, 144, 24, 'transparent', C_PRIMARY_BG),
      make_text(16, 54, 'Home\nDash\nProj\nTasks\nSetup', 11, C_TEXT_SECONDARY),
      make_ellipse(16, 360, 24, 24, C_BORDER_DARK, '#e2e8f0'),
      make_text(48, 360, 'Alex R.', 10, C_TEXT_MUTED)
    ]
  });

  // 2. Sidebar Collapsed
  library_items.push({
    id: 'sidebar_collapsed',
    name: 'Sidebar (Col)',
    status: 'published',
    elements: [
      make_rect(0, 0, 52, 400, C_BORDER_LIGHT, C_BG_CARD),
      make_ellipse(10, 12, 32, 32, C_PRIMARY, C_PRIMARY_BG),
      make_text(21, 20, 'S', 12, C_PRIMARY),
      make_rect(8, 56, 36, 24, 'transparent', C_PRIMARY_BG),
      make_rect(16, 96, 20, 20, C_BORDER_DARK, 'transparent'),
      make_rect(16, 132, 20, 20, C_BORDER_DARK, 'transparent'),
      make_ellipse(10, 360, 32, 32, C_BORDER_DARK, '#e2e8f0')
    ]
  });

  // 3. Top Navbar
  library_items.push({
    id: 'top_navbar',
    name: 'Navbar',
    status: 'published',
    elements: [
      make_rect(0, 0, 480, 40, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 13, 'Workspace / Dash', 11, C_TEXT_PRIMARY),
      make_rect(300, 8, 120, 24, C_BORDER_LIGHT, '#f8fafc'),
      make_text(310, 14, 'Search', 9, C_TEXT_MUTED),
      make_ellipse(436, 8, 24, 24, C_BORDER_DARK, '#e2e8f0')
    ]
  });

  // 4. Breadcrumb
  library_items.push({
    id: 'breadcrumb',
    name: 'Breadcrumb',
    status: 'published',
    elements: [
      make_text(0, 0, 'Home / Dash / Billing', 11, C_TEXT_MUTED)
    ]
  });

  // 5. User Menu
  library_items.push({
    id: 'user_menu',
    name: 'User Menu',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 120, C_BORDER_LIGHT, C_BG_CARD),
      make_ellipse(10, 10, 24, 24, C_BORDER_DARK, '#e2e8f0'),
      make_text(40, 10, 'Alex R.\nProfile\nSettings\nSign Out', 10, C_TEXT_PRIMARY)
    ]
  });

  // 6. Revenue Card
  library_items.push({
    id: 'kpi_revenue',
    name: 'Rev Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 80, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Revenue\n$48.2k\n+12.4%', 11, C_TEXT_PRIMARY)
    ]
  });

  // 7. Active Users Card
  library_items.push({
    id: 'kpi_active_users',
    name: 'Active Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 80, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Active\n18.5k\n+8.1%', 11, C_TEXT_PRIMARY)
    ]
  });

  // 8. Growth Card
  library_items.push({
    id: 'kpi_growth',
    name: 'Growth Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 80, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'CAC\n$42.5\n-4.2%', 11, C_TEXT_PRIMARY)
    ]
  });

  // 9. Conversion Card
  library_items.push({
    id: 'kpi_conversion',
    name: 'Conv Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 80, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Conv\n3.48%\n-0.8%', 11, C_TEXT_PRIMARY)
    ]
  });

  // 10. Occupancy Card
  library_items.push({
    id: 'kpi_occupancy',
    name: 'Occupancy Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 80, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Load\n78.4%', 11, C_TEXT_PRIMARY),
      make_rect(12, 56, 126, 6, 'transparent', '#f1f5f9'),
      make_rect(12, 56, 98, 6, 'transparent', C_WARNING)
    ]
  });

  // 11. User Table
  library_items.push({
    id: 'table_users',
    name: 'User Table',
    status: 'published',
    elements: [
      make_rect(0, 0, 320, 110, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Users\nJane C.  Design  Active\nCody F.  Dev     Inactive\nEsther H. Mgr     Active', 10, C_TEXT_PRIMARY)
    ]
  });

  // 12. Orders Table
  library_items.push({
    id: 'table_orders',
    name: 'Orders Table',
    status: 'published',
    elements: [
      make_rect(0, 0, 320, 110, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Orders\nORD-01 Stripe  $1.4k Settled\nORD-02 Vercel  $4.8k Pending', 10, C_TEXT_PRIMARY)
    ]
  });

  // 13. Reservation Table
  library_items.push({
    id: 'table_reservations',
    name: 'Reserve Table',
    status: 'published',
    elements: [
      make_rect(0, 0, 320, 110, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Bookings\nRoom A Alex   9:00 Confirmed\nDesk 8 Cody  13:00 Pending', 10, C_TEXT_PRIMARY)
    ]
  });

  // 14. CRM Leads Table
  library_items.push({
    id: 'table_crm_leads',
    name: 'Leads Table',
    status: 'published',
    elements: [
      make_rect(0, 0, 320, 110, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Leads\nEsther Acme  $24k Proposal\nJenny  Piper  $8k Negotiation', 10, C_TEXT_PRIMARY)
    ]
  });

  // 15. Line Chart Container
  library_items.push({
    id: 'chart_line',
    name: 'Line Chart',
    status: 'published',
    elements: [
      make_rect(0, 0, 220, 130, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Revenue (Weekly)\nM    T    W    T    F', 10, C_TEXT_PRIMARY),
      make_line(20, 50, [[0, 50], [40, 20], [80, 60], [120, 10], [160, 30]], C_PRIMARY)
    ]
  });

  // 16. Bar Chart Container
  library_items.push({
    id: 'chart_bar',
    name: 'Bar Chart',
    status: 'published',
    elements: [
      make_rect(0, 0, 220, 130, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Traffic\nDir  Soc  Em   Src', 10, C_TEXT_PRIMARY),
      make_rect(16, 60, 12, 40, 'transparent', C_PRIMARY),
      make_rect(50, 40, 12, 60, 'transparent', C_PRIMARY),
      make_rect(84, 70, 12, 30, 'transparent', C_PRIMARY),
      make_rect(118, 50, 12, 50, 'transparent', C_PRIMARY)
    ]
  });

  // 17. Pie Chart Container
  library_items.push({
    id: 'chart_pie',
    name: 'Pie Chart',
    status: 'published',
    elements: [
      make_rect(0, 0, 220, 130, C_BORDER_LIGHT, C_BG_CARD),
      make_ellipse(16, 30, 70, 70, C_BORDER_LIGHT, '#f1f5f9'),
      make_text(100, 30, 'Mobile 65%\nDesk 25%\nTab 10%', 10, C_TEXT_SECONDARY)
    ]
  });

  // 18. Analytics Widget
  library_items.push({
    id: 'analytics_widget',
    name: 'Analytics',
    status: 'published',
    elements: [
      make_rect(0, 0, 240, 130, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Clicks: 48k | Conv: 2.8%', 10, C_TEXT_PRIMARY),
      make_line(16, 60, [[0, 30], [40, 10], [80, 40], [120, 10], [160, 30], [200, 5]], C_PRIMARY)
    ]
  });

  // 19. Lead Card
  library_items.push({
    id: 'crm_lead_card',
    name: 'Lead Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 140, 60, C_BORDER_LIGHT, C_BG_CARD),
      make_text(10, 10, 'Acme Deal\n$18.5k', 11, C_TEXT_PRIMARY)
    ]
  });

  // 20. Pipeline Column
  library_items.push({
    id: 'crm_pipeline_column',
    name: 'Pipeline',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 240, C_BORDER_LIGHT, '#f8fafc'),
      make_text(10, 10, 'Qualified (2)', 11, C_TEXT_PRIMARY),
      make_rect(8, 30, 134, 50, C_BORDER_LIGHT, C_BG_CARD),
      make_text(14, 35, 'Enterprise\n$45k | HW', 9, C_TEXT_PRIMARY),
      make_rect(8, 90, 134, 50, C_BORDER_LIGHT, C_BG_CARD),
      make_text(14, 95, 'Standard\n$12k | JD', 9, C_TEXT_PRIMARY)
    ]
  });

  // 21. Sales Funnel
  library_items.push({
    id: 'crm_sales_funnel',
    name: 'Sales Funnel',
    status: 'published',
    elements: [
      make_rect(0, 0, 160, 110, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Sales Funnel', 11, C_TEXT_PRIMARY),
      make_rect(12, 30, 136, 18, C_PRIMARY, C_PRIMARY_BG),
      make_rect(20, 52, 120, 18, C_WARNING, C_WARNING_BG),
      make_rect(28, 74, 104, 18, C_SUCCESS, C_SUCCESS_BG)
    ]
  });

  // 22. Kanban Column
  library_items.push({
    id: 'prod_kanban_column',
    name: 'Kanban',
    status: 'published',
    elements: [
      make_rect(0, 0, 150, 240, C_BORDER_LIGHT, '#f8fafc'),
      make_text(10, 10, 'In Progress', 11, C_TEXT_PRIMARY),
      make_rect(8, 30, 134, 50, C_BORDER_LIGHT, C_BG_CARD),
      make_text(14, 35, 'Stripe Sync\nDue Jul 28', 9, C_TEXT_PRIMARY),
      make_rect(8, 90, 134, 50, C_BORDER_LIGHT, C_BG_CARD),
      make_text(14, 95, 'Checkout UI\nDue Jul 30', 9, C_TEXT_PRIMARY)
    ]
  });

  // 23. Calendar Widget
  library_items.push({
    id: 'prod_calendar_widget',
    name: 'Calendar',
    status: 'published',
    elements: [
      make_rect(0, 0, 160, 130, C_BORDER_LIGHT, C_BG_CARD),
      make_text(10, 10, 'Schedule\nMo Tu [We] Th Fr', 10, C_TEXT_PRIMARY),
      make_rect(8, 68, 144, 36, C_PRIMARY, C_PRIMARY_BG),
      make_text(14, 73, 'Sync Meet\n10:00 AM', 9, C_PRIMARY)
    ]
  });

  // 24. Task Card
  library_items.push({
    id: 'prod_task_card',
    name: 'Task Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 140, 60, C_BORDER_LIGHT, C_BG_CARD),
      make_text(10, 10, 'Blog Post\nJul 28 | Alex R.', 11, C_TEXT_PRIMARY)
    ]
  });

  // 25. Activity Feed
  library_items.push({
    id: 'prod_activity_feed',
    name: 'Activity Feed',
    status: 'published',
    elements: [
      make_rect(0, 0, 180, 110, C_BORDER_LIGHT, C_BG_CARD),
      make_text(12, 10, 'Activity', 11, C_TEXT_PRIMARY),
      make_line(16, 30, [[0, 0], [0, 60]], C_BORDER_LIGHT),
      make_text(26, 30, 'Alex R. coded (10m)\nSarah C. tasked (1h)', 9, C_TEXT_PRIMARY)
    ]
  });

  // 26. Search Bar
  library_items.push({
    id: 'form_search_bar',
    name: 'Search Bar',
    status: 'published',
    elements: [
      make_rect(0, 0, 160, 24, C_BORDER_LIGHT, C_BG_CARD),
      make_text(8, 6, '🔍 Search...', 10, C_TEXT_MUTED)
    ]
  });

  // 27. Filter Dropdown
  library_items.push({
    id: 'form_filter_dropdown',
    name: 'Filter',
    status: 'published',
    elements: [
      make_rect(0, 0, 80, 24, C_BORDER_LIGHT, C_BG_CARD),
      make_text(8, 6, 'Filter ▾', 10, C_TEXT_SECONDARY)
    ]
  });

  // 28. Date Picker
  library_items.push({
    id: 'form_date_picker',
    name: 'Date Picker',
    status: 'published',
    elements: [
      make_rect(0, 0, 120, 24, C_BORDER_LIGHT, C_BG_CARD),
      make_text(8, 6, '📅 Jul 25', 9, C_TEXT_SECONDARY)
    ]
  });

  // 29. Multi Select
  library_items.push({
    id: 'form_multi_select',
    name: 'Multi Select',
    status: 'published',
    elements: [
      make_rect(0, 0, 180, 24, C_BORDER_LIGHT, C_BG_CARD),
      make_text(8, 6, 'Admin x  Dev x', 9, C_PRIMARY)
    ]
  });

  // 30. Modal Window
  library_items.push({
    id: 'form_modal_window',
    name: 'Modal',
    status: 'published',
    elements: [
      make_rect(0, 0, 240, 150, 'transparent', '#000000'),
      make_rect(20, 15, 200, 120, C_BORDER_LIGHT, C_BG_CARD),
      make_text(30, 25, 'Invite User\nEmail', 10, C_TEXT_PRIMARY),
      make_rect(30, 55, 180, 24, C_BORDER_LIGHT, '#ffffff'),
      make_text(36, 61, 'jane@work.com', 10, C_TEXT_MUTED),
      make_rect(80, 90, 50, 22, C_BORDER_LIGHT, '#ffffff'),
      make_text(90, 95, 'Cancel', 9, C_TEXT_SECONDARY),
      make_rect(140, 90, 60, 22, 'transparent', C_PRIMARY),
      make_text(150, 95, 'Send', 9, '#ffffff')
    ]
  });

  // 31. Notification Card
  library_items.push({
    id: 'notif_card',
    name: 'Notif Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 180, 50, C_BORDER_LIGHT, C_BG_CARD),
      make_text(10, 10, 'Alex: Looks good (5m)', 9, C_TEXT_PRIMARY)
    ]
  });

  // 32. Alert Banner
  library_items.push({
    id: 'notif_alert_banner',
    name: 'Alert Banner',
    status: 'published',
    elements: [
      make_rect(0, 0, 320, 24, C_WARNING, C_WARNING_BG),
      make_text(8, 6, '⚠️ Trial ending soon', 9, '#854d0e')
    ]
  });

  // 33. Success Message
  library_items.push({
    id: 'notif_success_message',
    name: 'Success Msg',
    status: 'published',
    elements: [
      make_rect(0, 0, 140, 24, C_SUCCESS, C_SUCCESS_BG),
      make_text(8, 6, '✓ Saved', 9, C_SUCCESS)
    ]
  });

  // 34. Error Message
  library_items.push({
    id: 'notif_error_message',
    name: 'Error Msg',
    status: 'published',
    elements: [
      make_rect(0, 0, 140, 24, C_ERROR, C_ERROR_BG),
      make_text(8, 6, '✕ Failed', 9, C_ERROR)
    ]
  });

  // 35. User Avatar Group
  library_items.push({
    id: 'team_avatar_group',
    name: 'Avatars',
    status: 'published',
    elements: [
      make_ellipse(0, 0, 16, 16, '#ffffff', '#e2e8f0'),
      make_ellipse(8, 0, 16, 16, '#ffffff', '#cbd5e1'),
      make_text(28, 2, '+3', 8, C_PRIMARY)
    ]
  });

  // 36. Team Card
  library_items.push({
    id: 'team_card',
    name: 'Team Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 160, 70, C_BORDER_LIGHT, C_BG_CARD),
      make_text(10, 10, 'Growth Team\nConversion & CAC\n(+5 members)', 9, C_TEXT_PRIMARY)
    ]
  });

  // 37. Member Profile Card
  library_items.push({
    id: 'team_member_profile_card',
    name: 'Profile Card',
    status: 'published',
    elements: [
      make_rect(0, 0, 130, 100, C_BORDER_LIGHT, C_BG_CARD),
      make_ellipse(50, 10, 30, 30, C_BORDER_DARK, '#e2e8f0'),
      make_text(10, 48, 'Jane Cooper\nLead Designer', 9, C_TEXT_PRIMARY)
    ]
  });

  return {
    type: 'excalidrawlib',
    version: 2,
    source: 'https://excalidraw.com',
    libraryItems: library_items
  };
}

const lib = build_library();
fs.writeFileSync('./dashboard.excalidrawlib', JSON.stringify(lib));
console.log('Successfully generated minified dashboard.excalidrawlib');
