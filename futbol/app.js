import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/+esm";

const SUPABASE_URL="https://kjlocnicimhgjfhznvmn.supabase.co";
const SUPABASE_KEY="sb_publishable_5nRdHITW2R3cZaYW_lo1Bg_H1TRhsKo";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});

let state=null,serverAnchor=null,localAnchor=null,adminPin=sessionStorage.getItem("futbol_admin_pin")||"";
const $=id=>document.getElementById(id);
const modeName=m=>({fcfs:"1 · Primero en llegar",lottery:"2 · Ventana + sorteo",rotation:"3 · Rotación justa"}[m]||m);
const fmt=d=>new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Guayaquil"}).format(new Date(d));
const fmtTime=d=>new Intl.DateTimeFormat("es-EC",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"America/Guayaquil"}).format(new Date(d));

async function ensureSession(){
  const {data}=await supabase.auth.getSession();
  if(data.session) return true;
  const {error}=await supabase.auth.signInAnonymously();
  if(error){
    $("sessionNotice").textContent="No se pudo crear la sesión anónima. El administrador debe habilitar Anonymous Sign-Ins en Supabase Auth.";
    $("sessionNotice").classList.add("error");
    throw error;
  }
  return true;
}
async function api(action,payload={}){
  const {data,error}=await supabase.rpc("api_dispatch",{p_action:action,p_payload:payload});
  if(error) throw new Error(error.message);
  return data;
}
function syncClock(serverTime){serverAnchor=new Date(serverTime).getTime();localAnchor=Date.now();}
function nowServer(){return serverAnchor==null?Date.now():serverAnchor+(Date.now()-localAnchor);}
function tickClock(){
  const n=new Date(nowServer());
  $("serverClock").textContent=new Intl.DateTimeFormat("es-EC",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"America/Guayaquil"}).format(n);
  $("serverDate").textContent=new Intl.DateTimeFormat("es-EC",{weekday:"long",day:"numeric",month:"long",timeZone:"America/Guayaquil"}).format(n);
  if(state?.match) tickCountdown();
}
function tickCountdown(){
  const m=state.match,n=nowServer(),open=new Date(m.opens_at).getTime(),close=new Date(m.closes_at).getTime();
  let target,label;
  if(n<open){target=open;label="La inscripción abre en";}
  else if(n<close){target=close;label="La inscripción cierra en";}
  else{target=null;label="Inscripción cerrada";}
  $("countdownLabel").textContent=label;
  if(!target){$("countdown").textContent="CERRADA";return;}
  const s=Math.max(0,Math.floor((target-n)/1000)),mm=String(Math.floor(s/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");
  $("countdown").textContent=mm+":"+ss;
  $("joinBtn").disabled=!(n>=open&&n<close);
}
function setResult(id,msg,error=false){const e=$(id);e.textContent=msg;e.classList.remove("hidden","error");if(error)e.classList.add("error");}
function renderList(id,items,showPos=true){
  const el=$(id);el.innerHTML="";
  items.forEach((x,i)=>{const li=document.createElement("li");li.innerHTML=`${showPos?"<strong>"+(i+1)+".</strong> ":""}${escapeHtml(x.name)}<span class="stamp">${x.registered_at?"Servidor: "+fmtTime(x.registered_at):""}${x.promoted_at?" · Ascenso: "+fmtTime(x.promoted_at):""}</span>`;el.appendChild(li)});
  if(!items.length)el.innerHTML='<li class="hint">Sin jugadores todavía</li>';
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
async function loadState(){
  state=await api("state",{});
  syncClock(state.server_time);
  $("sessionNotice").classList.add("hidden");
  const sel=$("playerSelect"),old=sel.value;
  sel.innerHTML='<option value="">Selecciona tu nombre</option>';
  (state.players||[]).forEach(p=>{const o=document.createElement("option");o.value=p.id;o.textContent=p.name+(p.suspended_until?" · suspendido":"");sel.appendChild(o)});
  sel.value=old;
  if(!state.match){$("noMatch").classList.remove("hidden");$("matchArea").classList.add("hidden");return;}
  $("noMatch").classList.add("hidden");$("matchArea").classList.remove("hidden");
  const m=state.match,l=state.lists||{confirmed:[],waiting:[],pending:[]};
  $("groupTitle").textContent="Fútbol Sintética";
  $("modeBadge").textContent=modeName(m.mode);
  $("matchDate").textContent=fmt(m.play_at);
  $("windowInfo").textContent=`Inscripción: ${fmt(m.opens_at)} → ${fmt(m.closes_at)}`;
  $("confirmedCount").textContent=`${l.confirmed.length}/${m.capacity}`;
  $("titularBadge").textContent=l.confirmed.length;$("waitingBadge").textContent=l.waiting.length;
  renderList("confirmedList",l.confirmed);renderList("waitingList",l.waiting);
  if(l.pending?.length){$("pendingBox").classList.remove("hidden");renderList("pendingList",l.pending)}else $("pendingBox").classList.add("hidden");
  tickCountdown();
}
async function join(){
  try{
    if(!$("playerSelect").value)throw new Error("Selecciona tu nombre.");
    if(!$("playerPin").value)throw new Error("Ingresa tu PIN.");
    const r=await api("register",{match_id:state.match.id,player_id:$("playerSelect").value,pin:$("playerPin").value});
    const label=r.status==="confirmed"?"TITULAR":r.status==="waiting"?"LISTA DE ESPERA":"PENDIENTE DE ASIGNACIÓN";
    setResult("actionResult",`Inscripción confirmada: ${label}. Orden servidor #${r.queue_no}. Hora: ${fmtTime(r.registered_at||r.server_time)}`);
    await loadState();
  }catch(e){setResult("actionResult",e.message,true)}
}
async function cancel(){
  try{
    if(!$("playerSelect").value||!$("playerPin").value)throw new Error("Selecciona tu nombre e ingresa tu PIN.");
    const r=await api("cancel",{match_id:state.match.id,player_id:$("playerSelect").value,pin:$("playerPin").value});
    setResult("actionResult",`Cupo cancelado. Hora servidor: ${fmtTime(r.server_time)}`);
    await loadState();
  }catch(e){setResult("actionResult",e.message,true)}
}
async function loadHistory(){
  try{
    const h=await api("history",{limit:12}),box=$("historyList");box.innerHTML="";
    if(!h.length){box.innerHTML='<div class="empty"><p>Aún no hay partidos en el historial.</p></div>';return}
    h.forEach(m=>{const d=document.createElement("details");d.className="history-item";d.innerHTML=`<summary>${fmt(m.play_at)} · ${modeName(m.mode)}</summary><div class="hint" style="margin:10px 0">Cupos: ${m.capacity} · Estado: ${m.status}</div><ol>${(m.players||[]).map(p=>`<li>${escapeHtml(p.name)} — ${p.status}</li>`).join("")}</ol>`;box.appendChild(d)})
  }catch(e){$("historyList").innerHTML=`<div class="notice error">${escapeHtml(e.message)}</div>`}
}
async function adminStatus(){
  try{
    const r=await api("admin_status",{});
    $("adminSetup").classList.toggle("hidden",r.configured);
    $("adminLogin").classList.toggle("hidden",!r.configured||!!adminPin);
    if(r.configured&&adminPin) await loadAdmin();
  }catch(e){setResult("adminMessage",e.message,true)}
}
async function setupAdmin(){
  try{
    const pin=$("setupPin").value;if(pin.length<6)throw new Error("Usa al menos 6 caracteres.");
    await api("setup_admin",{new_pin:pin});adminPin=pin;sessionStorage.setItem("futbol_admin_pin",pin);await adminStatus();setResult("adminMessage","Administrador configurado correctamente.");
  }catch(e){setResult("adminMessage",e.message,true)}
}
async function adminLogin(){
  adminPin=$("adminPin").value;sessionStorage.setItem("futbol_admin_pin",adminPin);
  try{await loadAdmin();$("adminLogin").classList.add("hidden");}catch(e){adminPin="";sessionStorage.removeItem("futbol_admin_pin");setResult("adminMessage",e.message,true)}
}
async function loadAdmin(){
  const d=await api("admin_dashboard",{pin:adminPin});
  $("adminDashboard").classList.remove("hidden");
  const s=d.settings;
  $("cfgGroup").value=s.group_name;$("cfgMode").value=s.default_mode;$("cfgCapacity").value=s.default_capacity;$("cfgMinutes").value=s.default_registration_minutes;$("cfgNoShow").value=s.no_show_penalty_points;
  $("matchMode").value=s.default_mode;$("matchCapacity").value=s.default_capacity;$("matchMinutes").value=s.default_registration_minutes;
  renderAdminPlayers(d.players||[]);renderAdminMatches(d.matches||[]);
}
function renderAdminPlayers(players){
  $("playersAdminList").innerHTML=`<table><thead><tr><th>Jugador</th><th>Penalización</th><th>Rotación</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${players.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${p.penalty_points}</td><td>${p.rotation_credit}</td><td>${p.active?"Activo":"Inactivo"}</td><td><button class="mini secondary reset-pin" data-id="${p.id}">Nuevo PIN</button> <button class="mini secondary toggle-player" data-id="${p.id}" data-active="${!p.active}">${p.active?"Desactivar":"Activar"}</button> <button class="mini danger-soft penalize" data-id="${p.id}" data-name="${escapeHtml(p.name)}">Penalizar</button></td></tr>`).join("")}</tbody></table>`;
}
function renderAdminMatches(matches){
  $("matchesAdminList").innerHTML=`<table><thead><tr><th>Partido</th><th>Modo</th><th>Cupos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${matches.map(m=>`<tr><td>${fmt(m.play_at)}</td><td>${modeName(m.mode)}</td><td>${m.capacity}</td><td>${m.status}</td><td><button class="mini secondary complete-match" data-id="${m.id}">Completar</button> <button class="mini danger-soft cancel-match" data-id="${m.id}">Cancelar</button></td></tr>`).join("")}</tbody></table>`;
}
async function saveConfig(){
  try{await api("admin_update_settings",{pin:adminPin,group_name:$("cfgGroup").value,mode:$("cfgMode").value,capacity:+$("cfgCapacity").value,registration_minutes:+$("cfgMinutes").value,no_show_points:+$("cfgNoShow").value});setResult("adminMessage","Configuración guardada.");await loadAdmin();await loadState()}catch(e){setResult("adminMessage",e.message,true)}
}
async function createMatch(){
  try{
    const play=$("matchPlayAt").value,open=$("matchOpenAt").value;if(!play||!open)throw new Error("Completa fecha del partido y apertura.");
    await api("admin_create_match",{pin:adminPin,play_at:new Date(play).toISOString(),opens_at:new Date(open).toISOString(),mode:$("matchMode").value,capacity:+$("matchCapacity").value,registration_minutes:+$("matchMinutes").value});
    setResult("adminMessage","Partido creado.");await loadAdmin();await loadState();
  }catch(e){setResult("adminMessage",e.message,true)}
}
async function addPlayers(){
  try{
    const names=$("bulkNames").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!names.length)throw new Error("Ingresa al menos un nombre.");
    const r=await api("admin_bulk_add_players",{pin:adminPin,names});
    $("generatedPins").classList.remove("hidden");$("generatedPins").textContent=r.length?r.map(x=>`${x.name}: ${x.pin}`).join("\n"):"No se agregaron jugadores nuevos.";
    $("bulkNames").value="";await loadAdmin();await loadState();
  }catch(e){setResult("adminMessage",e.message,true)}
}
async function changeAdminPin(){
  try{const n=$("newAdminPin").value;if(n.length<6)throw new Error("El nuevo PIN debe tener al menos 6 caracteres.");await api("admin_change_pin",{pin:adminPin,new_pin:n});adminPin=n;sessionStorage.setItem("futbol_admin_pin",n);$("newAdminPin").value="";setResult("adminMessage","PIN administrador actualizado.")}catch(e){setResult("adminMessage",e.message,true)}
}
document.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;
  try{
    if(b.classList.contains("reset-pin")){const r=await api("admin_reset_player_pin",{pin:adminPin,player_id:b.dataset.id});setResult("adminMessage",`Nuevo PIN: ${r.pin}`)}
    if(b.classList.contains("toggle-player")){await api("admin_set_player_active",{pin:adminPin,player_id:b.dataset.id,active:b.dataset.active==="true"});await loadAdmin();await loadState()}
    if(b.classList.contains("penalize")){const pts=prompt("Puntos de penalización para "+b.dataset.name,"1");if(pts!==null){const note=prompt("Motivo","Inasistencia / incumplimiento")||"";await api("admin_penalize",{pin:adminPin,player_id:b.dataset.id,points:+pts,note,kind:"manual"});await loadAdmin()}}
    if(b.classList.contains("complete-match")){await api("admin_complete_match",{pin:adminPin,match_id:b.dataset.id});await loadAdmin();await loadState();await loadHistory()}
    if(b.classList.contains("cancel-match")){if(confirm("¿Cancelar este partido?")){await api("admin_cancel_match",{pin:adminPin,match_id:b.dataset.id});await loadAdmin();await loadState()}}
  }catch(err){setResult("adminMessage",err.message,true)}
});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab,.tab-panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active");if(b.dataset.tab==="historial")loadHistory();if(b.dataset.tab==="admin")adminStatus()}));
$("joinBtn").addEventListener("click",join);$("cancelBtn").addEventListener("click",cancel);$("refreshHistory").addEventListener("click",loadHistory);
$("setupAdminBtn").addEventListener("click",setupAdmin);$("adminLoginBtn").addEventListener("click",adminLogin);$("saveConfigBtn").addEventListener("click",saveConfig);
$("createMatchBtn").addEventListener("click",createMatch);$("addPlayersBtn").addEventListener("click",addPlayers);$("changeAdminPinBtn").addEventListener("click",changeAdminPin);

setInterval(tickClock,1000);setInterval(()=>loadState().catch(()=>{}),10000);
(async()=>{try{await ensureSession();await loadState()}catch(e){console.error(e)}})();
