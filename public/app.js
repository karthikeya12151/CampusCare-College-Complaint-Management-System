const $ = s => document.querySelector(s);
const S = { token: localStorage.getItem("cc_token"), user: JSON.parse(localStorage.getItem("cc_user") || "null"), items: [], notifications: [] };
const api = async (url, opt = {}) => {
  const r = await fetch("/api" + url, { ...opt, headers: { "Content-Type": "application/json", ...(S.token ? { Authorization: "Bearer " + S.token } : {}), ...(opt.headers || {}) } });
  const d = await r.json().catch(() => ({})); if (!r.ok) throw Error(d.message || "Request failed"); return d;
};
function msg(t) { const x = $("#toast"); x.textContent = t; x.classList.add("show"); setTimeout(() => x.classList.remove("show"), 3200); }
function safe(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function date(v) { return new Date(v).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
function badge(s) { return `<span class="status ${s.toLowerCase().replace(" ","-")}">${safe(s)}</span>`; }
function priority(p) { return `<span class="priority ${p.toLowerCase()}">${safe(p)}</span>`; }
function stat(label, value, note, icon) { return `<article class="stat-card"><div class="stat-top"><span>${label}</span><b>${icon}</b></div><strong>${value}</strong><small>${note}</small></article>`; }
function session(d) { S.token=d.token; S.user=d.user; localStorage.setItem("cc_token",d.token); localStorage.setItem("cc_user",JSON.stringify(d.user)); boot(); }
function signout() { S.token=null; S.user=null; localStorage.removeItem("cc_token"); localStorage.removeItem("cc_user"); $("#app").classList.add("hide"); $("#auth").classList.remove("hide"); }
function boot() {
  if (!S.user) return;
  $("#auth").classList.add("hide"); $("#app").classList.remove("hide");
  $("#who").textContent=S.user.name; $("#welcome").textContent=S.user.name; $("#role").textContent=S.user.role; $("#avatar").textContent=S.user.name[0].toUpperCase();
  const links = S.user.role==="admin" ? [["dashboard","▦","Overview"],["manage","☷","Complaints"],["reports","▥","Reports"]] : [["dashboard","▦","Dashboard"],["new","＋","New complaint"],["mine","▤","My complaints"],["notifications","♧","Notifications"]];
  $("#nav").innerHTML=links.map(([id,ic,label])=>`<button class="nav-item" data-page="${id}"><span>${ic}</span>${label}</button>`).join("");
  $("#nav").onclick=e=>{const b=e.target.closest("[data-page]");if(b)page(b.dataset.page);};
  $("#notificationBtn").onclick=()=>page("notifications");
  page("dashboard"); refreshUnread();
}
async function refreshUnread() { if(!S.token)return; try {const d=await api("/notifications");$("#unread").textContent=d.unread;$("#unread").classList.toggle("hide",!d.unread);}catch{} }
function complaintTable(items, admin=false) {
  if(!items.length)return `<tr><td colspan="8"><div class="empty">No complaints found.</div></td></tr>`;
  return items.map(c=>`<tr><td><b class="code">${safe(c.complaintCode)}</b></td><td><b>${safe(c.title)}</b><small class="subline">${safe(c.category)}</small></td>${admin?`<td>${safe(c.student?.name||"Student")}</td>`:""}<td>${safe(c.location)}</td><td>${badge(c.status)}</td><td>${priority(c.priority)}</td><td>${new Date(c.createdAt).toLocaleDateString("en-IN")}</td><td><button class="link-btn" data-detail="${c._id}">Details</button>${admin?` <button class="link-btn" data-update="${c._id}">Update</button>`:""}</td></tr>`).join("");
}
function tableHtml(items,admin=false){return `<div class="table-wrap"><table><thead><tr><th>COMPLAINT ID</th><th>ISSUE</th>${admin?"<th>STUDENT</th>":""}<th>LOCATION</th><th>STATUS</th><th>PRIORITY</th><th>DATE</th><th>ACTIONS</th></tr></thead><tbody>${complaintTable(items,admin)}</tbody></table></div>`;}
async function page(p) {
  const titles={dashboard:"Dashboard",new:"Submit a complaint",mine:"My complaints",manage:"Complaint management",reports:"Reports & analytics",notifications:"Notifications",detail:"Complaint details"};
  $("#title").textContent=titles[p]||"Dashboard";$("#crumb").textContent=(titles[p]||"Dashboard").toUpperCase();
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===p));
  try {
    if(p==="dashboard") {
      if(S.user.role==="admin") {
        const [s,d]=await Promise.all([api("/admin/summary"),api("/admin/complaints")]);S.items=d.complaints;
        $("#content").innerHTML=`<div class="page-intro"><div><h2>Good day, ${safe(S.user.name.split(" ")[0])} 👋</h2><p>Here is the current campus complaint overview.</p></div><button class="btn primary" onclick="page('manage')">Manage complaints →</button></div><div class="stats-grid">${stat("Total complaints",s.total,"All recorded requests","▤")}${stat("Awaiting review",s.submitted,"New submissions","◷")}${stat("In progress",s.inProgress,"Being addressed","↗")}${stat("Resolved",s.resolved,"Completed requests","✓")}</div><div class="stats-grid secondary-stats">${stat("Registered students",s.students,"Student accounts","♙")}${stat("High priority",s.highPriority,"Open urgent complaints","!")}${stat("Resolution rate",s.resolutionRate+"%","Resolved / total","◎")}${stat("Rejected",s.rejected,"Closed as rejected","×")}</div><section class="panel"><div class="panel-head"><div><h3>Recent complaints</h3><p>Latest requests submitted by students</p></div><button class="link-btn" onclick="page('manage')">View all →</button></div>${tableHtml(S.items.slice(0,7),true)}</section>`;
      } else {
        const d=await api("/complaints/mine");S.items=d.complaints;const n=x=>S.items.filter(c=>c.status===x).length;
        $("#content").innerHTML=`<div class="page-intro"><div><h2>Welcome, ${safe(S.user.name.split(" ")[0])} 👋</h2><p>Report an issue and follow every update from your dashboard.</p></div><button class="btn primary" onclick="page('new')">＋ New complaint</button></div><div class="stats-grid">${stat("My complaints",S.items.length,"All submitted requests","▤")}${stat("Submitted",n("Submitted"),"Awaiting review","◷")}${stat("In progress",n("In Progress"),"Currently being handled","↗")}${stat("Resolved",n("Resolved"),"Successfully completed","✓")}</div><section class="panel"><div class="panel-head"><div><h3>Recent complaints</h3><p>Open a complaint to view its tracking timeline</p></div><button class="link-btn" onclick="page('mine')">View all →</button></div>${tableHtml(S.items.slice(0,6))}</section>`;
      }
    }
    if(p==="new") {
      $("#content").innerHTML=`<section class="panel form-panel"><div class="panel-head"><div><h3>Submit a new complaint</h3><p>Provide complete details so the concerned team can investigate.</p></div></div><form id="complaintForm" class="form-grid"><label>Complaint title<input name="title" maxlength="100" required placeholder="e.g. Projector not working"></label><label>Category<select name="category" required><option value="">Select category</option>${["Classroom","Laboratory","Hostel","Wi-Fi / Network","Library","Washroom","Other"].map(x=>`<option>${x}</option>`).join("")}</select></label><label class="wide">Location<input name="location" required maxlength="120" placeholder="Block, floor and room number"></label><label class="wide">Description<textarea name="description" required maxlength="2000" placeholder="Explain the issue, when it started and how it affects your work..."></textarea></label><div class="wide form-actions"><button type="button" class="btn secondary" onclick="page('dashboard')">Cancel</button><button class="btn primary">Submit complaint</button></div></form></section>`;
      $("#complaintForm").onsubmit=async e=>{e.preventDefault();try{const d=await api("/complaints",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});msg("Complaint submitted. ID: "+d.complaint.complaintCode);page("mine");}catch(x){msg(x.message);}};
    }
    if(p==="mine"||p==="manage") {
      const admin=p==="manage";const d=await api(admin?"/admin/complaints":"/complaints/mine");S.items=d.complaints;
      $("#content").innerHTML=`<div class="page-intro"><div><h2>${admin?"All campus complaints":"My complaints"}</h2><p>${admin?"Search, filter and manage student requests.":"Track the status and history of your submitted requests."}</p></div>${admin?"":'<button class="btn primary" onclick="page(&quot;new&quot;)">＋ New complaint</button>'}</div><section class="panel"><div class="filters"><input id="search" placeholder="Search complaint ID, title or location"><select id="statusFilter"><option value="">All statuses</option>${["Submitted","In Progress","Resolved","Rejected"].map(x=>`<option>${x}</option>`).join("")}</select><select id="priorityFilter"><option value="">All priorities</option>${["Low","Medium","High"].map(x=>`<option>${x}</option>`).join("")}</select></div><div id="complaintRows">${tableHtml(S.items,admin)}</div></section>`;
      const filter=()=>{const q=$("#search").value.toLowerCase(),st=$("#statusFilter").value,pr=$("#priorityFilter").value;const list=S.items.filter(c=>(!st||c.status===st)&&(!pr||c.priority===pr)&&[c.title,c.complaintCode,c.location,c.student?.name].join(" ").toLowerCase().includes(q));$("#complaintRows").innerHTML=tableHtml(list,admin);};
      ["search","statusFilter","priorityFilter"].forEach(id=>$("#"+id).addEventListener(id==="search"?"input":"change",filter));
      $("#complaintRows").onclick=e=>{const det=e.target.closest("[data-detail]"),upd=e.target.closest("[data-update]");if(det)showDetail(det.dataset.detail);if(upd)updateComplaint(upd.dataset.update);};
    }
    if(p==="reports") {
      const s=await api("/admin/summary");const max=Math.max(1,...s.byCategory.map(x=>x.count));
      $("#content").innerHTML=`<div class="page-intro"><div><h2>Complaint analytics</h2><p>Summary of complaint volume, categories and resolution performance.</p></div></div><div class="stats-grid">${stat("Total complaints",s.total,"All time","▤")}${stat("Resolution rate",s.resolutionRate+"%","Resolved / total","◎")}${stat("High priority",s.highPriority,"Open urgent requests","!")}${stat("Students",s.students,"Registered accounts","♙")}</div><div class="report-grid"><section class="panel"><div class="panel-head"><div><h3>Category breakdown</h3><p>Number of complaints by category</p></div></div>${s.byCategory.length?s.byCategory.map(x=>`<div class="bar-row"><div><span>${safe(x._id)}</span><b>${x.count}</b></div><div class="bar-track"><i style="width:${Math.round(x.count/max*100)}%"></i></div></div>`).join(""):'<div class="empty">No category data yet.</div>'}</section><section class="panel"><div class="panel-head"><div><h3>Monthly trend</h3><p>Complaint submissions by month</p></div></div>${s.monthly.length?s.monthly.map(x=>`<div class="month-row"><span>${safe(x._id)}</span><b>${x.count} complaints</b></div>`).join(""):'<div class="empty">No monthly data yet.</div>'}</section></div>`;
    }
    if(p==="notifications") {
      const d=await api("/notifications");S.notifications=d.notifications;$("#unread").textContent=d.unread;$("#unread").classList.toggle("hide",!d.unread);
      $("#content").innerHTML=`<div class="page-intro"><div><h2>Notifications</h2><p>Updates about the progress of your complaints.</p></div><button id="readAll" class="btn secondary">Mark all as read</button></div><section class="panel">${S.notifications.length?S.notifications.map(n=>`<article class="notification ${n.readAt?"read":""}"><div class="notification-dot"></div><div class="notification-body"><b>${safe(n.title)}</b><p>${safe(n.message)}</p><small>${date(n.createdAt)} · ${safe(n.complaint?.complaintCode||"Complaint")}</small></div>${n.readAt?"":`<button class="link-btn" data-read="${n._id}">Mark read</button>`}</article>`).join(""):'<div class="empty">No notifications yet. You will see updates here when an administrator changes a complaint.</div>'}</section>`;
      $("#readAll").onclick=async()=>{try{await api("/notifications/read-all",{method:"PATCH"});msg("Notifications marked as read.");page("notifications");}catch(e){msg(e.message);}};
      $("#content").onclick=async e=>{const b=e.target.closest("[data-read]");if(b){try{await api("/notifications/"+b.dataset.read+"/read",{method:"PATCH"});page("notifications");refreshUnread();}catch(x){msg(x.message);}}};
    }
  } catch(e) { msg(e.message); }
}
async function showDetail(id) {
  try {
    const d=await api("/complaints/"+id),c=d.complaint;
    $("#title").textContent="Complaint details";$("#crumb").textContent="TRACKING";
    const history=(c.updates||[]).slice().reverse();
    $("#content").innerHTML=`<button class="link-btn back-link" onclick="page('${S.user.role==="admin"?"manage":"mine"}')">← Back to complaints</button><div class="detail-grid"><section class="panel"><div class="detail-heading"><div><span class="eyebrow">COMPLAINT REFERENCE</span><h2>${safe(c.complaintCode)}</h2></div>${badge(c.status)}</div><h3>${safe(c.title)}</h3><p class="detail-description">${safe(c.description)}</p><div class="detail-meta"><div><small>Category</small><b>${safe(c.category)}</b></div><div><small>Location</small><b>${safe(c.location)}</b></div><div><small>Priority</small><b>${priority(c.priority)}</b></div><div><small>Submitted</small><b>${date(c.createdAt)}</b></div></div></section><section class="panel"><h3>Tracking timeline</h3><div class="timeline">${history.length?history.map(u=>`<div class="timeline-item"><span class="timeline-point"></span><b>${safe(u.status)}</b><p>${safe(u.note||"Status updated.")}</p><small>${date(u.updatedAt)}${u.updatedBy?.name?" · "+safe(u.updatedBy.name):""}</small></div>`).join(""):'<div class="empty">No updates recorded.</div>'}</div></section></div>`;
  } catch(e) { msg(e.message); }
}
function closeModal() { $("#modalRoot").innerHTML = ""; }
async function updateComplaint(id) {
  const c = S.items.find(x => x._id === id); if (!c) return;
  $("#modalRoot").innerHTML = `<div class="modal-backdrop" id="modalBackdrop"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="updateTitle"><div class="modal-head"><div><span class="eyebrow">ADMINISTRATOR ACTION</span><h2 id="updateTitle">Update complaint</h2><p>${safe(c.complaintCode)} · ${safe(c.title)}</p></div><button type="button" class="modal-close" id="closeModal" aria-label="Close">×</button></div><form id="updateForm"><label>Complaint status<select name="status" required>${["Submitted","In Progress","Resolved","Rejected"].map(x=>`<option ${c.status===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Priority<select name="priority" required>${["Low","Medium","High"].map(x=>`<option ${c.priority===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Update note<textarea name="note" maxlength="500" placeholder="Explain the action taken or next steps...">Your complaint has been reviewed by the administration.</textarea></label><div class="modal-actions"><button type="button" class="btn secondary" id="cancelModal">Cancel</button><button class="btn primary" id="saveUpdate">Save update</button></div></form></section></div>`;
  $("#closeModal").onclick = closeModal; $("#cancelModal").onclick = closeModal;
  $("#modalBackdrop").onclick = e => { if (e.target.id === "modalBackdrop") closeModal(); };
  $("#updateForm").onsubmit = async e => {
    e.preventDefault(); const submit = $("#saveUpdate"); submit.disabled = true; submit.textContent = "Saving...";
    try {
      await api("/admin/complaints/"+id,{method:"PATCH",body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});
      closeModal(); msg("Complaint updated. Student notification created."); await page("manage");
    } catch(err) { msg(err.message); submit.disabled = false; submit.textContent = "Save update"; }
  };
}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));$("#login").classList.toggle("hide",b.dataset.tab!=="login");$("#register").classList.toggle("hide",b.dataset.tab!=="register");});
$("#login").onsubmit=async e=>{e.preventDefault();try{session(await api("/auth/login",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.target)))}));}catch(x){msg(x.message);}};
$("#register").onsubmit=async e=>{e.preventDefault();try{session(await api("/auth/register",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.target)))}));}catch(x){msg(x.message);}};
$("#logout").onclick=signout;
if(S.token&&S.user)api("/auth/me").then(d=>{S.user=d.user;localStorage.setItem("cc_user",JSON.stringify(d.user));boot();}).catch(signout);
