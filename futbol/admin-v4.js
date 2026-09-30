import{$,api,supabase,esc,fmt,modeName,result,loadState,refreshIdentity}from'./core.js';
import{loadTeams}from'./teams.js';
let d=null,pins=[];
const P=()=>sessionStorage.getItem('futbol_admin_pin')||'';
const statusLabel=s=>({scheduled:'🟢 Vigente',completed:'✅ Completado',cancelled:'⛔ Cancelado'}[s]||s);

export async function login(){
  const p=$('adminPin').value;
  try{sessionStorage.setItem('futbol_admin_pin',p);await loadAdmin();$('adminLogin').classList.add('hidden')}
  catch(e){sessionStorage.removeItem('futbol_admin_pin');result('adminMessage',e.message,true)}
}
export async function loadAdmin(){
  d=await api('admin_dashboard',{pin:P()});
  $('adminDashboard').classList.remove('hidden');
  const s=d.settings;
  for(const[k,v]of[['cfgGroup',s.group_name],['cfgMode',s.default_mode],['cfgCapacity',s.default_capacity],['cfgMinutes',s.default_registration_minutes],['cfgNoShow',s.no_show_penalty_points],['matchMode',s.default_mode],['matchCapacity',s.default_capacity],['matchMinutes',s.default_registration_minutes]])$(k).value=v;
  players();matches();
}
function players(){
  $('playersAdminList').innerHTML='<table><thead><tr><th>Jugador</th><th>Celulares</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>'+
  d.players.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.device_count||0}</td><td>${p.archived_at?'Archivado':p.active?'Activo':'Inactivo'}</td><td><button class="mini secondary reset-pin" data-id="${p.id}">Nuevo PIN</button> <button class="mini secondary revoke-device" data-id="${p.id}">Revocar celular</button> ${p.archived_at?'':`<button class="mini secondary toggle-player" data-id="${p.id}" data-active="${!p.active}">${p.active?'Desactivar':'Activar'}</button> <button class="mini danger-soft archive-player" data-id="${p.id}">Archivar</button> <button class="mini danger-soft delete-player" data-id="${p.id}">Eliminar</button>`}</td></tr>`).join('')+
  '</tbody></table>';
}
function matches(){
  const rows=d.matches.map(m=>{
    const actions=m.status==='scheduled'
      ? `<button class="mini secondary team-options" data-id="${m.id}" data-enabled="${!m.teams_enabled}">${m.teams_enabled?'Desactivar equipos':'Activar equipos'}</button> ${m.teams_enabled?`<button class="mini secondary team-proposals" data-id="${m.id}" data-enabled="${!m.team_proposals_enabled}">${m.team_proposals_enabled?'Cerrar propuestas':'Permitir propuestas'}</button>`:''} <button class="mini secondary complete-match" data-id="${m.id}">Completar</button> <button class="mini danger-soft cancel-match" data-id="${m.id}">Cancelar</button>`
      : `<button class="mini danger-soft delete-match" data-id="${m.id}">Eliminar si no tiene historial</button> ${m.status==='completed'?`<button class="mini secondary reopen-match" data-id="${m.id}">Reabrir si fue una prueba</button>`:''}`;
    return `<tr><td>${fmt(m.play_at)}</td><td>${modeName(m.mode)}</td><td>${m.capacity}</td><td>${m.teams_enabled?'Sí':'No'}</td><td><strong>${statusLabel(m.status)}</strong></td><td>${actions}</td></tr>`;
  }).join('');
  $('matchesAdminList').innerHTML='<table><thead><tr><th>Partido</th><th>Modo</th><th>Cupos</th><th>Equipos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
function show(x){pins=x;$('generatedPins').classList.remove('hidden');$('pinTools').classList.remove('hidden');$('generatedPins').textContent=x.map(v=>v.name+': '+v.pin).join('\n')}
export async function saveConfig(){try{await api('admin_update_settings',{pin:P(),group_name:$('cfgGroup').value,mode:$('cfgMode').value,capacity:+$('cfgCapacity').value,registration_minutes:+$('cfgMinutes').value,no_show_points:+$('cfgNoShow').value});result('adminMessage','Configuración guardada.');await loadAdmin()}catch(e){result('adminMessage',e.message,true)}}
export async function createMatch(){try{await api('admin_create_match',{pin:P(),play_at:new Date($('matchPlayAt').value).toISOString(),opens_at:new Date($('matchOpenAt').value).toISOString(),mode:$('matchMode').value,capacity:+$('matchCapacity').value,registration_minutes:+$('matchMinutes').value});await loadAdmin();await loadState();result('adminMessage','Partido creado.')}catch(e){result('adminMessage',e.message,true)}}
export async function addPlayers(){try{const names=$('bulkNames').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);show(await api('admin_bulk_add_players',{pin:P(),names}));$('bulkNames').value='';await loadAdmin();await loadState()}catch(e){result('adminMessage',e.message,true)}}
export async function regen(){if(!confirm('Se generarán PIN nuevos de 4 dígitos y se revocarán dispositivos recordados. ¿Continuar?'))return;try{show(await api('admin_regenerate_all_pins',{pin:P()}));await loadAdmin();await refreshIdentity();result('adminMessage','PIN migrados. Guarda la lista antes de cerrar.')}catch(e){result('adminMessage',e.message,true)}}
export function copyPins(){navigator.clipboard.writeText(pins.map(x=>x.name+': '+x.pin).join('\n'))}
export function downloadPins(){const csv='Nombre,PIN\n'+pins.map(x=>`"${String(x.name).replaceAll('"','""')}",${x.pin}`).join('\n'),u=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),a=document.createElement('a');a.href=u;a.download='pines-jugadores.csv';a.click();URL.revokeObjectURL(u)}
export async function changePin(){try{const n=$('newAdminPin').value;if(n.length<6)throw Error('Mínimo 6 caracteres.');await api('admin_change_pin',{pin:P(),new_pin:n});sessionStorage.setItem('futbol_admin_pin',n);result('adminMessage','PIN administrador actualizado.')}catch(e){result('adminMessage',e.message,true)}}

export async function handle(b){
  if(!P())return;
  try{
    if(b.classList.contains('reset-pin')){
      const r=await api('admin_reset_player_pin',{pin:P(),player_id:b.dataset.id,revoke_devices:true}),p=d.players.find(x=>x.id===b.dataset.id);show([{name:p.name,pin:r.pin}]);
    }else if(b.classList.contains('revoke-device'))await api('admin_revoke_devices',{pin:P(),player_id:b.dataset.id});
    else if(b.classList.contains('toggle-player'))await api('admin_set_player_active',{pin:P(),player_id:b.dataset.id,active:b.dataset.active==='true'});
    else if(b.classList.contains('archive-player')){if(!confirm('¿Archivar este jugador? Si tiene cupo vigente, se cancelará y ascenderá el siguiente de espera.'))return;await api('admin_archive_player',{pin:P(),player_id:b.dataset.id});}
    else if(b.classList.contains('delete-player')){if(!confirm('¿Eliminar definitivamente?'))return;await api('admin_delete_player',{pin:P(),player_id:b.dataset.id});}
    else if(b.classList.contains('team-options'))await api('admin_set_team_options',{pin:P(),match_id:b.dataset.id,enabled:b.dataset.enabled==='true',proposals_enabled:false});
    else if(b.classList.contains('team-proposals'))await api('admin_set_team_options',{pin:P(),match_id:b.dataset.id,enabled:true,proposals_enabled:b.dataset.enabled==='true'});
    else if(b.classList.contains('complete-match')){if(!confirm('¿Marcar este partido como completado? Esta acción cerrará el partido y actualizará el historial.'))return;await api('admin_complete_match',{pin:P(),match_id:b.dataset.id});}
    else if(b.classList.contains('cancel-match')){if(!confirm('¿Cancelar este partido?'))return;await api('admin_cancel_match',{pin:P(),match_id:b.dataset.id});}
    else if(b.classList.contains('delete-match')){if(!confirm('¿Eliminar definitivamente este partido? Solo será posible si no tiene historial.'))return;await api('admin_delete_match',{pin:P(),match_id:b.dataset.id});}
    else if(b.classList.contains('reopen-match')){if(!confirm('¿Reabrir este partido? Solo funcionará si todavía es futuro y fue cerrado por error.'))return;const {error}=await supabase.rpc('api_reopen_match_rpc',{p_pin:P(),p_match_id:b.dataset.id});if(error)throw new Error(error.message);}
    else return;
    await loadAdmin();await loadState();await loadTeams();
  }catch(e){result('adminMessage',e.message,true)}
}