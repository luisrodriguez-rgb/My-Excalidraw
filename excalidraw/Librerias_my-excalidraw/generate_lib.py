import json
import uuid

def get_id(prefix=""):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def make_rect(id, x, y, width, height, stroke_color="#e2e8f0", bg_color="transparent", stroke_width=1, roughness=0, fill_style="solid", group_ids=None):
    el = {
        "id": id,
        "type": "rectangle",
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "strokeColor": stroke_color,
        "backgroundColor": bg_color,
        "fillStyle": fill_style,
        "strokeWidth": stroke_width,
        "roughness": roughness,
        "seed": 1,
        "version": 1,
        "versionNonce": 1,
        "roundness": {"type": 3}
    }
    if group_ids:
        el["groupIds"] = group_ids
    return el

def make_ellipse(id, x, y, width, height, stroke_color="#cbd5e1", bg_color="transparent", stroke_width=1, roughness=0, group_ids=None):
    el = {
        "id": id,
        "type": "ellipse",
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "strokeColor": stroke_color,
        "backgroundColor": bg_color,
        "fillStyle": "solid",
        "strokeWidth": stroke_width,
        "roughness": roughness,
        "seed": 1,
        "version": 1,
        "versionNonce": 1
    }
    if group_ids:
        el["groupIds"] = group_ids
    return el

def make_text(id, x, y, text, size=12, color="#0f172a", font=2, align="left", valign="top", container_id=None, width=None, height=None, group_ids=None):
    if width is None:
        lines = text.split("\n")
        max_len = max(len(l) for l in lines) if lines else 0
        width = max(10, max_len * size * 0.55)
    if height is None:
        lines = text.split("\n")
        height = len(lines) * size * 1.3
        
    el = {
        "id": id,
        "type": "text",
        "x": float(x),
        "y": float(y),
        "width": float(width),
        "height": float(height),
        "strokeColor": color,
        "seed": 1,
        "version": 1,
        "versionNonce": 1,
        "text": text,
        "originalText": text,
        "fontSize": size,
        "fontFamily": font,
        "textAlign": align,
        "verticalAlign": valign
    }
    if container_id:
        el["containerId"] = container_id
    if group_ids:
        el["groupIds"] = group_ids
    return el

def make_line(id, x, y, points, stroke_color="#e2e8f0", stroke_width=1, stroke_style="solid", roughness=0, group_ids=None):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    w = max(xs) - min(xs) if xs else 0
    h = max(ys) - min(ys) if ys else 0
    el = {
        "id": id,
        "type": "line",
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "strokeColor": stroke_color,
        "strokeWidth": stroke_width,
        "strokeStyle": stroke_style,
        "roughness": roughness,
        "seed": 1,
        "version": 1,
        "versionNonce": 1,
        "points": points
    }
    if group_ids:
        el["groupIds"] = group_ids
    return el

def make_arrow(id, x, y, points, stroke_color="#cbd5e1", stroke_width=1.5, stroke_style="solid", roughness=0, start_arrowhead=None, end_arrowhead="arrow", group_ids=None):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    w = max(xs) - min(xs) if xs else 0
    h = max(ys) - min(ys) if ys else 0
    el = {
        "id": id,
        "type": "arrow",
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "strokeColor": stroke_color,
        "strokeWidth": stroke_width,
        "strokeStyle": stroke_style,
        "roughness": roughness,
        "seed": 1,
        "version": 1,
        "versionNonce": 1,
        "points": points,
        "startArrowhead": start_arrowhead,
        "endArrowhead": end_arrowhead
    }
    if group_ids:
        el["groupIds"] = group_ids
    return el

# Colors
C_BG_CARD = "#ffffff"
C_BORDER_LIGHT = "#e2e8f0"
C_BORDER_DARK = "#cbd5e1"
C_PRIMARY = "#3b82f6"
C_PRIMARY_BG = "#eff6ff"
C_SUCCESS = "#10b981"
C_SUCCESS_BG = "#ecfdf5"
C_WARNING = "#f59e0b"
C_WARNING_BG = "#fffbeb"
C_ERROR = "#ef4444"
C_ERROR_BG = "#fef2f2"
C_MUTED = "#94a3b8"
C_TEXT_PRIMARY = "#0f172a"
C_TEXT_SECONDARY = "#475569"
C_TEXT_MUTED = "#64748b"

def build_library():
    library_items = []
    
    # 1. Sidebar Expanded
    gid = ["g_s_exp"]
    el = [
        make_rect("s_exp_bg", 0, 0, 240, 600, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("s_exp_logo", 24, 28, "SaaSify", size=18, color=C_PRIMARY, group_ids=gid),
        make_rect("s_exp_act", 12, 80, 216, 36, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("s_exp_act_t", 28, 88, "Dashboard", size=14, color=C_PRIMARY, group_ids=gid),
        make_text("s_exp_m1", 28, 132, "Analytics", size=14, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("s_exp_m2", 28, 176, "Projects", size=14, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("s_exp_m3", 28, 220, "Tasks", size=14, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("s_exp_av", 20, 540, 36, 36, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("s_exp_name", 68, 540, "Alex Rivera", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("s_exp_mail", 68, 558, "alex@saasify.com", size=11, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "sidebar_expanded", "name": "Sidebar Expanded", "elements": el, "status": "published"})
    
    # 2. Sidebar Collapsed
    gid = ["g_s_col"]
    el = [
        make_rect("s_col_bg", 0, 0, 72, 600, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_ellipse("s_col_logo", 20, 24, 32, 32, C_PRIMARY, C_PRIMARY_BG, group_ids=gid),
        make_text("s_col_logo_t", 31, 31, "S", size=14, color=C_PRIMARY, group_ids=gid),
        make_rect("s_col_act", 16, 88, 40, 40, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_rect("s_col_i1", 26, 98, 20, 20, C_PRIMARY, group_ids=gid),
        make_rect("s_col_i2", 26, 148, 20, 20, C_BORDER_DARK, group_ids=gid),
        make_rect("s_col_i3", 26, 198, 20, 20, C_BORDER_DARK, group_ids=gid),
        make_ellipse("s_col_av", 18, 540, 36, 36, C_BORDER_DARK, "#e2e8f0", group_ids=gid)
    ]
    library_items.append({"id": "sidebar_collapsed", "name": "Sidebar Collapsed", "elements": el, "status": "published"})

    # 3. Top Navbar
    gid = ["g_t_nav"]
    el = [
        make_rect("t_nav_bg", 0, 0, 1000, 64, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("t_nav_bc", 24, 22, "Workspace  /  Analytics Overview", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_nav_src", 540, 14, 260, 36, C_BORDER_LIGHT, "#f8fafc", group_ids=gid),
        make_text("t_nav_src_t", 556, 23, "Search anything... (⌘K)", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_ellipse("t_nav_av", 912, 14, 36, 36, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("t_nav_av_t", 923, 23, "AR", size=12, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("t_nav_stat", 940, 42, 10, 10, "#ffffff", C_SUCCESS, group_ids=gid)
    ]
    library_items.append({"id": "top_navbar", "name": "Top Navbar", "elements": el, "status": "published"})

    # 5. User Menu Dropdown (placing 5 before 4 for consistency)
    gid = ["g_u_menu"]
    el = [
        make_rect("u_menu_bg", 0, 0, 220, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_ellipse("u_menu_av", 16, 16, 40, 40, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("u_menu_av_t", 27, 27, "AR", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("u_menu_name", 68, 16, "Alex Rivera", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("u_menu_mail", 68, 36, "alex@saasify.com", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_line("u_menu_div", 12, 70, [[0,0], [196,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_text("u_menu_act1", 16, 82, "View Profile", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("u_menu_act2", 16, 114, "Account Settings", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("u_menu_act3", 16, 146, "Team Workspace", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_line("u_menu_div2", 12, 178, [[0,0], [196,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_text("u_menu_logout", 16, 188, "Sign Out", size=13, color=C_ERROR, group_ids=gid)
    ]
    library_items.append({"id": "user_menu", "name": "User Menu", "elements": el, "status": "published"})

    # 4. Breadcrumb
    gid = ["g_bc"]
    el = [
        make_text("bc_h", 0, 0, "Home", size=13, color=C_TEXT_MUTED, group_ids=gid),
        make_text("bc_s1", 45, 1, "/", size=12, color=C_MUTED, group_ids=gid),
        make_text("bc_w", 60, 0, "Workspace", size=13, color=C_TEXT_MUTED, group_ids=gid),
        make_text("bc_s2", 140, 1, "/", size=12, color=C_MUTED, group_ids=gid),
        make_text("bc_b", 155, 0, "Billing & Plans", size=13, color=C_TEXT_PRIMARY, group_ids=gid)
    ]
    library_items.append({"id": "breadcrumb", "name": "Breadcrumb", "elements": el, "status": "published"})

    # 6. Revenue Card
    gid = ["g_kpi_rev"]
    el = [
        make_rect("kpi_rev_bg", 0, 0, 220, 120, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("kpi_rev_lbl", 16, 16, "Monthly Revenue (MRR)", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("kpi_rev_val", 16, 38, "$48,256.00", size=22, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("kpi_rev_bdg", 16, 82, 70, 22, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("kpi_rev_bdg_t", 22, 86, "▲ +12.4%", size=11, color=C_SUCCESS, group_ids=gid),
        make_text("kpi_rev_sub", 92, 86, "vs last Mo", size=11, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "kpi_revenue", "name": "Revenue Card", "elements": el, "status": "published"})

    # 7. Active Users Card
    gid = ["g_kpi_act"]
    el = [
        make_rect("kpi_act_bg", 0, 0, 220, 120, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("kpi_act_lbl", 16, 16, "Weekly Active Users", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("kpi_act_val", 16, 38, "18,490", size=22, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("kpi_act_bdg", 16, 82, 70, 22, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("kpi_act_bdg_t", 22, 86, "▲ +8.1%", size=11, color=C_SUCCESS, group_ids=gid),
        make_text("kpi_act_sub", 92, 86, "vs last Wk", size=11, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "kpi_active_users", "name": "Active Users Card", "elements": el, "status": "published"})

    # 8. Growth Card
    gid = ["g_kpi_gro"]
    el = [
        make_rect("kpi_gro_bg", 0, 0, 220, 120, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("kpi_gro_lbl", 16, 16, "Customer Acquisition Cost", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("kpi_gro_val", 16, 38, "$42.50", size=22, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("kpi_gro_bdg", 16, 82, 70, 22, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("kpi_gro_bdg_t", 22, 86, "▼ -4.2%", size=11, color=C_SUCCESS, group_ids=gid),
        make_text("kpi_gro_sub", 92, 86, "vs target", size=11, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "kpi_growth", "name": "Growth Card", "elements": el, "status": "published"})

    # 9. Conversion Card
    gid = ["g_kpi_con"]
    el = [
        make_rect("kpi_con_bg", 0, 0, 220, 120, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("kpi_con_lbl", 16, 16, "Checkout Conversion Rate", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("kpi_con_val", 16, 38, "3.48%", size=22, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("kpi_con_bdg", 16, 82, 70, 22, "transparent", C_ERROR_BG, group_ids=gid),
        make_text("kpi_con_bdg_t", 22, 86, "▼ -0.8%", size=11, color=C_ERROR, group_ids=gid),
        make_text("kpi_con_sub", 92, 86, "vs target 4.2%", size=11, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "kpi_conversion", "name": "Conversion Card", "elements": el, "status": "published"})

    # 10. Occupancy Card
    gid = ["g_kpi_occ"]
    el = [
        make_rect("kpi_occ_bg", 0, 0, 220, 120, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("kpi_occ_lbl", 16, 16, "Server Load Occupancy", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("kpi_occ_val", 16, 38, "78.4%", size=22, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("kpi_occ_pbg", 16, 86, 188, 8, "transparent", "#f1f5f9", group_ids=gid),
        make_rect("kpi_occ_pval", 16, 86, 147, 8, "transparent", C_WARNING, group_ids=gid)
    ]
    library_items.append({"id": "kpi_occupancy", "name": "Occupancy Card", "elements": el, "status": "published"})

    # 11. User Table
    gid = ["g_t_user"]
    el = [
        make_rect("t_user_bg", 0, 0, 480, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("t_user_tit", 16, 16, "Workgroup Users", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_user_h1", 16, 48, "User Name", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_user_h2", 180, 48, "Role", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_user_h3", 300, 48, "Status", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_user_h4", 390, 48, "Activity", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_line("t_user_div", 16, 68, [[0,0], [448,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Row 1
        make_ellipse("t_user_av1", 16, 80, 20, 20, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("t_user_av1_t", 21, 84, "JC", size=9, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_user_n1", 44, 84, "Jane Cooper", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_user_r1", 180, 84, "Product Designer", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("t_user_b1", 300, 80, 54, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_user_b1_t", 310, 84, "Active", size=10, color=C_SUCCESS, group_ids=gid),
        make_text("t_user_a1", 390, 84, "2m ago", size=13, color=C_TEXT_MUTED, group_ids=gid),
        # Row 2
        make_ellipse("t_user_av2", 16, 126, 20, 20, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("t_user_av2_t", 21, 130, "CF", size=9, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_user_n2", 44, 130, "Cody Fisher", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_user_r2", 180, 130, "Developer", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("t_user_b2", 300, 126, 54, 20, "transparent", "#f1f5f9", group_ids=gid),
        make_text("t_user_b2_t", 307, 130, "Inactive", size=10, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_user_a2", 390, 130, "3h ago", size=13, color=C_TEXT_MUTED, group_ids=gid),
        # Row 3
        make_ellipse("t_user_av3", 16, 172, 20, 20, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("t_user_av3_t", 21, 176, "EH", size=9, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_user_n3", 44, 176, "Esther Howard", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_user_r3", 180, 176, "Manager", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("t_user_b3", 300, 172, 54, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_user_b3_t", 310, 176, "Active", size=10, color=C_SUCCESS, group_ids=gid),
        make_text("t_user_a3", 390, 176, "Just now", size=13, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "table_users", "name": "User Table", "elements": el, "status": "published"})

    # 12. Orders Table
    gid = ["g_t_ord"]
    el = [
        make_rect("t_ord_bg", 0, 0, 480, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("t_ord_tit", 16, 16, "Recent Invoices & Orders", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_ord_h1", 16, 48, "Order ID", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_ord_h2", 110, 48, "Company", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_ord_h3", 260, 48, "Amount", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_ord_h4", 370, 48, "Status", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_line("t_ord_div", 16, 68, [[0,0], [448,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Row 1
        make_text("t_ord_id1", 16, 84, "#ORD-9021", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_ord_c1", 110, 84, "Stripe Inc", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_ord_a1", 260, 84, "$1,450.00", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_ord_b1", 370, 80, 64, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_ord_b1_t", 382, 84, "Settled", size=10, color=C_SUCCESS, group_ids=gid),
        # Row 2
        make_text("t_ord_id2", 16, 130, "#ORD-9020", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_ord_c2", 110, 130, "Supabase LTD", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_ord_a2", 260, 130, "$320.00", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_ord_b2", 370, 126, 64, 20, "transparent", C_WARNING_BG, group_ids=gid),
        make_text("t_ord_b2_t", 380, 130, "Pending", size=10, color=C_WARNING, group_ids=gid),
        # Row 3
        make_text("t_ord_id3", 16, 176, "#ORD-9019", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_ord_c3", 110, 176, "Vercel Corp", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_ord_a3", 260, 176, "$4,800.00", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_ord_b3", 370, 172, 64, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_ord_b3_t", 382, 176, "Settled", size=10, color=C_SUCCESS, group_ids=gid)
    ]
    library_items.append({"id": "table_orders", "name": "Orders Table", "elements": el, "status": "published"})

    # 13. Reservation Table
    gid = ["g_t_res"]
    el = [
        make_rect("t_res_bg", 0, 0, 480, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("t_res_tit", 16, 16, "Room & Desk Bookings", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_res_h1", 16, 48, "Resource", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_res_h2", 120, 48, "User Name", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_res_h3", 240, 48, "Time Frame", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_res_h4", 370, 48, "Status", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_line("t_res_div", 16, 68, [[0,0], [448,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Row 1
        make_text("t_res_r1", 16, 84, "Boardroom A", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_res_u1", 120, 84, "Alex Rivera", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_res_t1", 240, 84, "09:00 - 11:30", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("t_res_b1", 370, 80, 76, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_res_b1_t", 378, 84, "Confirmed", size=10, color=C_SUCCESS, group_ids=gid),
        # Row 2
        make_text("t_res_r2", 16, 130, "Hot Desk 08", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_res_u2", 120, 130, "Cody Fisher", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_res_t2", 240, 130, "13:00 - 17:00", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("t_res_b2", 370, 126, 76, 20, "transparent", C_WARNING_BG, group_ids=gid),
        make_text("t_res_b2_t", 385, 130, "Pending", size=10, color=C_WARNING, group_ids=gid),
        # Row 3
        make_text("t_res_r3", 16, 176, "Creative Lab", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_res_u3", 120, 176, "Emma Watson", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_res_t3", 240, 176, "10:30 - 14:00", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("t_res_b3", 370, 172, 76, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_res_b3_t", 378, 176, "Confirmed", size=10, color=C_SUCCESS, group_ids=gid)
    ]
    library_items.append({"id": "table_reservations", "name": "Reservation Table", "elements": el, "status": "published"})

    # 14. CRM Leads Table
    gid = ["g_t_crm"]
    el = [
        make_rect("t_crm_bg", 0, 0, 480, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("t_crm_tit", 16, 16, "Pipeline Leads Status", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_crm_h1", 16, 48, "Contact", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_crm_h2", 120, 48, "Company", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_crm_h3", 240, 48, "Deal Value", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("t_crm_h4", 350, 48, "Stage", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_line("t_crm_div", 16, 68, [[0,0], [448,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Row 1
        make_text("t_crm_c1", 16, 84, "Esther Howard", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_crm_cp1", 120, 84, "Acme Inc.", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_crm_v1", 240, 84, "$24,500.00", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_crm_b1", 350, 80, 96, 20, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("t_crm_b1_t", 373, 84, "Proposal", size=10, color=C_PRIMARY, group_ids=gid),
        # Row 2
        make_text("t_crm_c2", 16, 130, "Jenny Wilson", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_crm_cp2", 120, 130, "Pied Piper", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_crm_v2", 240, 130, "$8,900.00", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_crm_b2", 350, 126, 96, 20, "transparent", C_WARNING_BG, group_ids=gid),
        make_text("t_crm_b2_t", 364, 130, "Negotiation", size=10, color=C_WARNING, group_ids=gid),
        # Row 3
        make_text("t_crm_c3", 16, 176, "Kristin Watson", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_crm_cp3", 120, 176, "Goliaths Inc", size=13, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_crm_v3", 240, 176, "$12,000.00", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("t_crm_b3", 350, 172, 96, 20, "transparent", "#f1f5f9", group_ids=gid),
        make_text("t_crm_b3_t", 367, 176, "Contacted", size=10, color=C_TEXT_SECONDARY, group_ids=gid)
    ]
    library_items.append({"id": "table_crm_leads", "name": "CRM Leads Table", "elements": el, "status": "published"})

    # 15. Line Chart Container
    gid = ["g_ch_line"]
    el = [
        make_rect("ch_line_bg", 0, 0, 360, 240, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("ch_line_tit", 16, 16, "Weekly Revenue Trend", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_line("ch_line_y", 40, 50, [[0,0], [0,140]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_line("ch_line_x", 40, 190, [[0,0], [290,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_line("ch_line_g1", 40, 90, [[0,0], [290,0]], stroke_color=C_BORDER_LIGHT, stroke_style="dashed", group_ids=gid),
        make_line("ch_line_g2", 40, 140, [[0,0], [290,0]], stroke_color=C_BORDER_LIGHT, stroke_style="dashed", group_ids=gid),
        # Labels
        make_text("ch_line_ly1", 16, 82, "10", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_line_ly2", 16, 132, "5", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_line_lx1", 52, 198, "M", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_line_lx2", 102, 198, "T", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_line_lx3", 152, 198, "W", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_line_lx4", 202, 198, "T", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_line_lx5", 252, 198, "F", size=9, color=C_TEXT_MUTED, group_ids=gid),
        # Chart Line path
        make_line("ch_line_pt", 52, 70, [[0, 60], [50, 20], [100, 80], [150, 40], [200, 10]], stroke_color=C_PRIMARY, stroke_width=2, group_ids=gid),
        make_ellipse("ch_line_d1", 49, 127, 6, 6, C_PRIMARY, "#ffffff", group_ids=gid),
        make_ellipse("ch_line_d2", 99, 87, 6, 6, C_PRIMARY, "#ffffff", group_ids=gid),
        make_ellipse("ch_line_d3", 149, 147, 6, 6, C_PRIMARY, "#ffffff", group_ids=gid),
        make_ellipse("ch_line_d4", 199, 107, 6, 6, C_PRIMARY, "#ffffff", group_ids=gid),
        make_ellipse("ch_line_d5", 249, 77, 6, 6, C_PRIMARY, "#ffffff", group_ids=gid)
    ]
    library_items.append({"id": "chart_line", "name": "Line Chart Container", "elements": el, "status": "published"})

    # 16. Bar Chart Container
    gid = ["g_ch_bar"]
    el = [
        make_rect("ch_bar_bg", 0, 0, 360, 240, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("ch_bar_tit", 16, 16, "Weekly Traffic Channels", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_line("ch_bar_y", 40, 50, [[0,0], [0,140]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_line("ch_bar_x", 40, 190, [[0,0], [290,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_text("ch_bar_ly", 16, 80, "10k", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_text("ch_bar_ly2", 16, 130, "5k", size=9, color=C_TEXT_MUTED, group_ids=gid),
        # Bars
        make_rect("ch_bar_b1", 60, 110, 20, 80, "transparent", C_PRIMARY, group_ids=gid),
        make_text("ch_bar_lbl1", 56, 196, "Direct", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_rect("ch_bar_b2", 110, 80, 20, 110, "transparent", C_PRIMARY, group_ids=gid),
        make_text("ch_bar_lbl2", 106, 196, "Social", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_rect("ch_bar_b3", 160, 130, 20, 60, "transparent", C_PRIMARY, group_ids=gid),
        make_text("ch_bar_lbl3", 156, 196, "Email", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_rect("ch_bar_b4", 210, 90, 20, 100, "transparent", C_PRIMARY, group_ids=gid),
        make_text("ch_bar_lbl4", 206, 196, "Search", size=9, color=C_TEXT_MUTED, group_ids=gid),
        make_rect("ch_bar_b5", 260, 140, 20, 50, "transparent", C_PRIMARY, group_ids=gid),
        make_text("ch_bar_lbl5", 256, 196, "Paid", size=9, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "chart_bar", "name": "Bar Chart Container", "elements": el, "status": "published"})

    # 17. Pie Chart Container
    gid = ["g_ch_pie"]
    el = [
        make_rect("ch_pie_bg", 0, 0, 320, 240, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("ch_pie_tit", 16, 16, "Traffic Breakdown by Device", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_ellipse("ch_pie_circle", 40, 64, 120, 120, C_BORDER_LIGHT, "#f1f5f9", group_ids=gid),
        make_ellipse("ch_pie_circle_seg", 42, 64, 116, 116, C_PRIMARY, C_PRIMARY_BG, group_ids=gid),
        # Legends
        make_ellipse("ch_pie_l1_c", 184, 82, 8, 8, "transparent", C_PRIMARY, group_ids=gid),
        make_text("ch_pie_l1_t", 198, 79, "Mobile (65%)", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("ch_pie_l2_c", 184, 114, 8, 8, "transparent", C_SUCCESS, group_ids=gid),
        make_text("ch_pie_l2_t", 198, 111, "Desktop (25%)", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("ch_pie_l3_c", 184, 146, 8, 8, "transparent", C_WARNING, group_ids=gid),
        make_text("ch_pie_l3_t", 198, 143, "Tablet (10%)", size=11, color=C_TEXT_SECONDARY, group_ids=gid)
    ]
    library_items.append({"id": "chart_pie", "name": "Pie Chart Container", "elements": el, "status": "published"})

    # 18. Analytics Widget
    gid = ["g_an_wdg"]
    el = [
        make_rect("an_wdg_bg", 0, 0, 360, 280, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("an_wdg_tit", 16, 16, "Metric Performance Widget", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("an_wdg_dd", 230, 12, 114, 26, C_BORDER_LIGHT, "#f8fafc", group_ids=gid),
        make_text("an_wdg_dd_t", 242, 18, "Last 30 Days ▾", size=10, color=C_TEXT_SECONDARY, group_ids=gid),
        # Stats summary row
        make_text("an_wdg_lbl1", 16, 56, "Total Clicks", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("an_wdg_val1", 16, 70, "48.2k", size=16, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("an_wdg_lbl2", 120, 56, "Conversion", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("an_wdg_val2", 120, 70, "2.84%", size=16, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("an_wdg_lbl3", 220, 56, "Bounce Rate", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("an_wdg_val3", 220, 70, "41.6%", size=16, color=C_TEXT_PRIMARY, group_ids=gid),
        make_line("an_wdg_div", 16, 98, [[0,0], [328,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Small line chart inside widget
        make_line("an_wdg_ch_y", 36, 114, [[0,0], [0,110]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_line("an_wdg_ch_x", 36, 224, [[0,0], [290,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_line("an_wdg_ch_ln", 36, 134, [[0, 70], [40, 20], [80, 80], [120, 40], [160, 60], [200, 10], [240, 50], [290, 15]], stroke_color=C_PRIMARY, stroke_width=2, group_ids=gid)
    ]
    library_items.append({"id": "analytics_widget", "name": "Analytics Widget", "elements": el, "status": "published"})

    # 19. Lead Card
    gid = ["g_crm_lc"]
    el = [
        make_rect("crm_lc_bg", 0, 0, 200, 96, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_rect("crm_lc_tag", 12, 12, 40, 6, "transparent", C_SUCCESS, group_ids=gid),
        make_text("crm_lc_tit", 12, 26, "Acme Corp Deal", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("crm_lc_val", 12, 44, "$18,500.00", size=12, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("crm_lc_av", 12, 64, 20, 20, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("crm_lc_av_t", 17, 69, "JD", size=8, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("crm_lc_sub", 38, 68, "3 days idle", size=11, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "crm_lead_card", "name": "Lead Card", "elements": el, "status": "published"})

    # 20. Pipeline Column
    gid = ["g_crm_pc"]
    el = [
        make_rect("crm_pc_bg", 0, 0, 230, 420, C_BORDER_LIGHT, "#f8fafc", group_ids=gid),
        make_text("crm_pc_tit", 16, 16, "Qualified Stage", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("crm_pc_cnt", 130, 14, 24, 20, "transparent", "#e2e8f0", group_ids=gid),
        make_text("crm_pc_cnt_t", 139, 17, "2", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        # Card 1
        make_rect("crm_pc_c1_bg", 16, 52, 198, 90, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("crm_pc_c1_tit", 26, 62, "Enterprise Deal", size=12, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("crm_pc_c1_val", 26, 80, "$45,000.00", size=12, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("crm_pc_c1_av", 26, 108, 20, 20, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("crm_pc_c1_av_t", 31, 112, "HW", size=8, color=C_TEXT_SECONDARY, group_ids=gid),
        # Card 2
        make_rect("crm_pc_c2_bg", 16, 154, 198, 90, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("crm_pc_c2_tit", 26, 164, "Standard Signup", size=12, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("crm_pc_c2_val", 26, 182, "$12,000.00", size=12, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("crm_pc_c2_av", 26, 210, 20, 20, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("crm_pc_c2_av_t", 31, 214, "JD", size=8, color=C_TEXT_SECONDARY, group_ids=gid)
    ]
    library_items.append({"id": "crm_pipeline_column", "name": "Pipeline Column", "elements": el, "status": "published"})

    # 21. Sales Funnel
    gid = ["g_crm_sf"]
    el = [
        make_rect("crm_sf_bg", 0, 0, 280, 180, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("crm_sf_tit", 16, 16, "Conversion Sales Funnel", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("crm_sf_l1", 30, 48, 220, 32, C_PRIMARY, C_PRIMARY_BG, group_ids=gid),
        make_text("crm_sf_l1_t", 54, 56, "1. Lead Interest (100%)", size=11, color=C_PRIMARY, group_ids=gid),
        make_rect("crm_sf_l2", 50, 90, 180, 32, C_WARNING, C_WARNING_BG, group_ids=gid),
        make_text("crm_sf_l2_t", 68, 98, "2. Qualified Offer (50%)", size=11, color=C_WARNING, group_ids=gid),
        make_rect("crm_sf_l3", 70, 132, 140, 32, C_SUCCESS, C_SUCCESS_BG, group_ids=gid),
        make_text("crm_sf_l3_t", 88, 140, "3. Deal Closed (12%)", size=11, color=C_SUCCESS, group_ids=gid)
    ]
    library_items.append({"id": "crm_sales_funnel", "name": "Sales Funnel", "elements": el, "status": "published"})

    # 22. Kanban Column
    gid = ["g_prod_kb"]
    el = [
        make_rect("prod_kb_bg", 0, 0, 230, 420, C_BORDER_LIGHT, "#f8fafc", group_ids=gid),
        make_text("prod_kb_tit", 16, 16, "In Progress", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_rect("prod_kb_cnt", 110, 14, 24, 20, "transparent", "#e2e8f0", group_ids=gid),
        make_text("prod_kb_cnt_t", 119, 17, "2", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        # Task 1
        make_rect("prod_kb_t1_bg", 16, 52, 198, 96, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_rect("prod_kb_t1_tg", 26, 62, 54, 18, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("prod_kb_t1_tg_t", 32, 65, "Frontend", size=9, color=C_PRIMARY, group_ids=gid),
        make_text("prod_kb_t1_tit", 26, 86, "Integrate Stripe billing page", size=12, color=C_TEXT_PRIMARY, group_ids=gid),
        # Task 2
        make_rect("prod_kb_t2_bg", 16, 160, 198, 96, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_rect("prod_kb_t2_tg", 26, 170, 54, 18, "transparent", C_WARNING_BG, group_ids=gid),
        make_text("prod_kb_t2_tg_t", 34, 173, "Design", size=9, color=C_WARNING, group_ids=gid),
        make_text("prod_kb_t2_tit", 26, 194, "Redesign user checkout flow", size=12, color=C_TEXT_PRIMARY, group_ids=gid)
    ]
    library_items.append({"id": "prod_kanban_column", "name": "Kanban Column", "elements": el, "status": "published"})

    # 23. Calendar Widget
    gid = ["g_prod_cal"]
    el = [
        make_rect("prod_cal_bg", 0, 0, 260, 240, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("prod_cal_tit", 16, 16, "Weekly Schedule", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        # Calendar grid cells
        make_text("prod_cal_h1", 16, 44, "Mo", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_h2", 52, 44, "Tu", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_h3", 88, 44, "We", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_h4", 124, 44, "Th", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_h5", 160, 44, "Fr", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_h6", 196, 44, "Sa", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_h7", 232, 44, "Su", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_line("prod_cal_div", 16, 62, [[0,0], [228,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Day row (mock representation)
        make_text("prod_cal_d1", 16, 74, "13", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("prod_cal_d2", 52, 74, "14", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        # Active selection
        make_ellipse("prod_cal_d3_hl", 84, 70, 20, 20, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("prod_cal_d3", 88, 74, "15", size=11, color=C_PRIMARY, group_ids=gid),
        make_text("prod_cal_d4", 124, 74, "16", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("prod_cal_d5", 160, 74, "17", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("prod_cal_d6", 196, 74, "18", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_text("prod_cal_d7", 232, 74, "19", size=11, color=C_TEXT_MUTED, group_ids=gid),
        # Event item beneath
        make_rect("prod_cal_ev", 16, 110, 228, 48, C_PRIMARY, C_PRIMARY_BG, group_ids=gid),
        make_text("prod_cal_ev_t", 24, 118, "Billing Integration Sync", size=12, color=C_PRIMARY, group_ids=gid),
        make_text("prod_cal_ev_sub", 24, 136, "10:00 - 11:30 AM", size=10, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "prod_calendar_widget", "name": "Calendar Widget", "elements": el, "status": "published"})

    # 24. Task Card
    gid = ["g_prod_tc"]
    el = [
        make_rect("prod_tc_bg", 0, 0, 220, 110, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_rect("prod_tc_tag", 16, 16, 68, 20, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("prod_tc_tag_t", 22, 19, "Marketing", size=10, color=C_PRIMARY, group_ids=gid),
        make_text("prod_tc_tit", 16, 44, "Write blog post about release", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_line("prod_tc_div", 16, 78, [[0,0], [188,0]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        make_text("prod_tc_date", 16, 88, "Due Jul 28", size=11, color=C_TEXT_MUTED, group_ids=gid),
        make_ellipse("prod_tc_av", 180, 84, 24, 24, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("prod_tc_av_t", 186, 90, "JD", size=9, color=C_TEXT_SECONDARY, group_ids=gid)
    ]
    library_items.append({"id": "prod_task_card", "name": "Task Card", "elements": el, "status": "published"})

    # 25. Activity Feed
    gid = ["g_prod_af"]
    el = [
        make_rect("prod_af_bg", 0, 0, 280, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("prod_af_tit", 16, 16, "Workspace Activity Feed", size=14, color=C_TEXT_PRIMARY, group_ids=gid),
        make_line("prod_af_spine", 28, 56, [[0,0], [0,120]], stroke_color=C_BORDER_LIGHT, group_ids=gid),
        # Item 1
        make_ellipse("prod_af_d1", 24, 60, 8, 8, C_PRIMARY, "#ffffff", group_ids=gid),
        make_text("prod_af_n1", 40, 56, "Alex Rivera pushed code", size=12, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("prod_af_t1", 40, 72, "10 mins ago", size=10, color=C_TEXT_MUTED, group_ids=gid),
        # Item 2
        make_ellipse("prod_af_d2", 24, 116, 8, 8, C_PRIMARY, "#ffffff", group_ids=gid),
        make_text("prod_af_n2", 40, 112, "Sarah Connor created task", size=12, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("prod_af_t2", 40, 128, "1 hour ago", size=10, color=C_TEXT_MUTED, group_ids=gid),
        # Item 3
        make_ellipse("prod_af_d3", 24, 172, 8, 8, C_PRIMARY, "#ffffff", group_ids=gid),
        make_text("prod_af_n3", 40, 168, "System auto-deployed build", size=12, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("prod_af_t3", 40, 184, "3 hours ago", size=10, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "prod_activity_feed", "name": "Activity Feed", "elements": el, "status": "published"})

    # 26. Search Bar
    gid = ["g_f_src"]
    el = [
        make_rect("f_src_bg", 0, 0, 300, 38, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("f_src_ic", 12, 11, "🔍", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("f_src_t", 34, 11, "Type to search...", size=13, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "form_search_bar", "name": "Search Bar", "elements": el, "status": "published"})

    # 27. Filter Dropdown
    gid = ["g_f_filt"]
    el = [
        make_rect("f_filt_bg", 0, 0, 130, 38, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("f_filt_t", 16, 11, "Filter: Active ▾", size=12, color=C_TEXT_SECONDARY, group_ids=gid)
    ]
    library_items.append({"id": "form_filter_dropdown", "name": "Filter Dropdown", "elements": el, "status": "published"})

    # 28. Date Picker
    gid = ["g_f_dp"]
    el = [
        make_rect("f_dp_bg", 0, 0, 200, 38, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("f_dp_ic", 12, 11, "📅", size=12, color=C_TEXT_MUTED, group_ids=gid),
        make_text("f_dp_t", 34, 11, "Jul 25 - Aug 01, 2026", size=12, color=C_TEXT_SECONDARY, group_ids=gid)
    ]
    library_items.append({"id": "form_date_picker", "name": "Date Picker", "elements": el, "status": "published"})

    # 29. Multi Select
    gid = ["g_f_ms"]
    el = [
        make_rect("f_ms_bg", 0, 0, 300, 38, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_rect("f_ms_t1", 8, 6, 68, 26, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("f_ms_t1_t", 14, 11, "Admin x", size=11, color=C_PRIMARY, group_ids=gid),
        make_rect("f_ms_t2", 82, 6, 88, 26, "transparent", C_PRIMARY_BG, group_ids=gid),
        make_text("f_ms_t2_t", 88, 11, "Dev Team x", size=11, color=C_PRIMARY, group_ids=gid)
    ]
    library_items.append({"id": "form_multi_select", "name": "Multi Select", "elements": el, "status": "published"})

    # 30. Modal Window
    gid = ["g_f_mod"]
    el = [
        make_rect("f_mod_ol", 0, 0, 500, 340, "transparent", "#000000", opacity=20, group_ids=gid),
        make_rect("f_mod_bg", 80, 60, 340, 220, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("f_mod_tit", 104, 80, "Invite Team Member", size=15, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("f_mod_lbl", 104, 114, "Email address", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_rect("f_mod_inp", 104, 134, 292, 34, C_BORDER_LIGHT, "#ffffff", group_ids=gid),
        make_text("f_mod_inp_t", 114, 143, "jane.doe@work.com", size=13, color=C_TEXT_MUTED, group_ids=gid),
        # Cancel Button
        make_rect("f_mod_btn_c", 200, 220, 84, 34, C_BORDER_LIGHT, "#ffffff", group_ids=gid),
        make_text("f_mod_btn_ct", 220, 229, "Cancel", size=12, color=C_TEXT_SECONDARY, group_ids=gid),
        # Action Button
        make_rect("f_mod_btn_a", 294, 220, 102, 34, "transparent", C_PRIMARY, group_ids=gid),
        make_text("f_mod_btn_at", 314, 229, "Send Invite", size=12, color="#ffffff", group_ids=gid)
    ]
    library_items.append({"id": "form_modal_window", "name": "Modal Window", "elements": el, "status": "published"})

    # 31. Notification Card
    gid = ["g_n_card"]
    el = [
        make_rect("n_card_bg", 0, 0, 280, 76, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_ellipse("n_card_av", 16, 16, 30, 30, C_PRIMARY, C_PRIMARY_BG, group_ids=gid),
        make_text("n_card_av_t", 24, 22, "💬", size=11, color=C_PRIMARY, group_ids=gid),
        make_text("n_card_tit", 56, 16, "New Comment by Alex", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("n_card_txt", 56, 34, "\"Looks good! Let's deploy to staging...\"", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("n_card_time", 56, 50, "5 mins ago", size=10, color=C_TEXT_MUTED, group_ids=gid)
    ]
    library_items.append({"id": "notif_card", "name": "Notification Card", "elements": el, "status": "published"})

    # 32. Alert Banner
    gid = ["g_n_alr"]
    el = [
        make_rect("n_alr_bg", 0, 0, 560, 42, C_WARNING, C_WARNING_BG, group_ids=gid),
        make_text("n_alr_txt", 16, 13, "⚠️  Your trial period is ending in 3 days. Upgrade to active plan to continue features.", size=12, color="#854d0e", group_ids=gid)
    ]
    library_items.append({"id": "notif_alert_banner", "name": "Alert Banner", "elements": el, "status": "published"})

    # 33. Success Message
    gid = ["g_n_suc"]
    el = [
        make_rect("n_suc_bg", 0, 0, 240, 42, C_SUCCESS, C_SUCCESS_BG, group_ids=gid),
        make_text("n_suc_txt", 16, 13, "✓  Settings saved successfully.", size=12, color=C_SUCCESS, group_ids=gid)
    ]
    library_items.append({"id": "notif_success_message", "name": "Success Message", "elements": el, "status": "published"})

    # 34. Error Message
    gid = ["g_n_err"]
    el = [
        make_rect("n_err_bg", 0, 0, 240, 42, C_ERROR, C_ERROR_BG, group_ids=gid),
        make_text("n_err_txt", 16, 13, "✕  Failed to upload attachment.", size=12, color=C_ERROR, group_ids=gid)
    ]
    library_items.append({"id": "notif_error_message", "name": "Error Message", "elements": el, "status": "published"})

    # 35. User Avatar Group
    gid = ["g_t_avg"]
    el = [
        make_ellipse("t_avg_a1", 0, 0, 28, 28, "#ffffff", "#e2e8f0", group_ids=gid),
        make_text("t_avg_a1_t", 6, 7, "AR", size=10, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("t_avg_a2", 20, 0, 28, 28, "#ffffff", "#e2e8f0", group_ids=gid),
        make_text("t_avg_a2_t", 26, 7, "JD", size=10, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("t_avg_a3", 40, 0, 28, 28, "#ffffff", "#e2e8f0", group_ids=gid),
        make_text("t_avg_a3_t", 46, 7, "SC", size=10, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("t_avg_ac", 60, 0, 28, 28, "#ffffff", C_PRIMARY_BG, group_ids=gid),
        make_text("t_avg_ac_t", 67, 7, "+3", size=10, color=C_PRIMARY, group_ids=gid)
    ]
    library_items.append({"id": "team_avatar_group", "name": "User Avatar Group", "elements": el, "status": "published"})

    # 36. Team Card
    gid = ["g_t_card"]
    el = [
        make_rect("t_card_bg", 0, 0, 250, 140, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_text("t_card_tit", 16, 16, "Growth & Strategy Team", size=13, color=C_TEXT_PRIMARY, group_ids=gid),
        make_text("t_card_dsc", 16, 38, "Responsible for conversion rates and\nacquiring new active users.", size=11, color=C_TEXT_SECONDARY, group_ids=gid),
        # Avatars nested
        make_ellipse("t_card_a1", 16, 92, 26, 26, "#ffffff", "#e2e8f0", group_ids=gid),
        make_text("t_card_a1_t", 21, 98, "AR", size=9, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("t_card_a2", 34, 92, 26, 26, "#ffffff", "#e2e8f0", group_ids=gid),
        make_text("t_card_a2_t", 39, 98, "SC", size=9, color=C_TEXT_SECONDARY, group_ids=gid),
        make_ellipse("t_card_a3", 52, 92, 26, 26, "#ffffff", C_PRIMARY_BG, group_ids=gid),
        make_text("t_card_a3_t", 58, 98, "+5", size=9, color=C_PRIMARY, group_ids=gid)
    ]
    library_items.append({"id": "team_card", "name": "Team Card", "elements": el, "status": "published"})

    # 37. Member Profile Card
    gid = ["g_t_mem"]
    el = [
        make_rect("t_mem_bg", 0, 0, 220, 180, C_BORDER_LIGHT, C_BG_CARD, group_ids=gid),
        make_ellipse("t_mem_av", 86, 16, 48, 48, C_BORDER_DARK, "#e2e8f0", group_ids=gid),
        make_text("t_mem_av_t", 98, 28, "JD", size=16, color=C_TEXT_SECONDARY, group_ids=gid),
        make_text("t_mem_name", 30, 76, "Jane Cooper", size=13, color=C_TEXT_PRIMARY, align="center", width=160, group_ids=gid),
        make_text("t_mem_role", 30, 94, "Lead Product Designer", size=11, color=C_TEXT_MUTED, align="center", width=160, group_ids=gid),
        make_text("t_mem_mail", 30, 112, "jane.c@saasify.com", size=11, color=C_TEXT_SECONDARY, align="center", width=160, group_ids=gid),
        make_rect("t_mem_bdg", 80, 140, 60, 20, "transparent", C_SUCCESS_BG, group_ids=gid),
        make_text("t_mem_bdg_t", 92, 144, "Active", size=10, color=C_SUCCESS, group_ids=gid)
    ]
    library_items.append({"id": "team_member_profile_card", "name": "Member Profile Card", "elements": el, "status": "published"})

    excalidraw_lib = {
        "type": "excalidrawlib",
        "version": 2,
        "source": "https://excalidraw.com",
        "libraryItems": library_items
    }
    
    return excalidraw_lib

if __name__ == "__main__":
    lib = build_library()
    target_file = "./dashboard.excalidrawlib"
    with open(target_file, "w", encoding="utf-8") as f:
        # Save as single line to minimize size
        json.dump(lib, f, separators=(',', ':'))
    print(f"Successfully generated minified {target_file}")
