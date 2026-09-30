import{$,api,esc,state,currentConfirmed,deviceIdentity,deviceToken,result}from'./core.js';
let ts=null,pairs=Array.from({length:7},()=>[]),draft=[],sel=null;
const ap=()=>sessionStorage.getItem('futbol_admin_pin')||'';

export async function loadTeams(){
  if(!state?.match)return;
  ts=await api('team_state',{match_id:state.match.id});
  $('teamsDisabled').classList.toggle('hidden',!!ts.enabled);
  $('teamsArea').classList.toggle('hidden',!ts.enabled);
  if(!ts.enabled)return;
  official();proposals();
  const confirmed=currentConfirmed();
  const isConfirmed=deviceIdentity&&confirmed.some(x=>x.player_id===deviceIdentity.player_id);
  const canBuild=confirmed.length===14&&(ap()||(ts.proposals_enabled&&isConfirmed));
  $('teamBuilder').classList.toggle('hidden',!canBuild);
  if(canBuild&&pairs.flat().length===0)renderPairs();
}

function official(){
  const o=ts.official;
  if(!o){$('officialTeams').classList.add('hidden');$('teamsReview').classList.add('hidden');return}
  $('officialTeams').classList.remove('hidden');
  const names=Object.fromEntries(currentConfirmed().map(x=>[x.player_id,x.name]));
  const team=t=>(o.assignments||[]).filter(x=>x.team===t).map(x=>`<div class="player-chip">${esc(names[x.player_id]||'Jugador')}</div>`).join('');
  $('officialTeams').innerHTML=`<div class="official-title"><h3>Equipos oficiales</h3><span class="badge">${o.status==='published'?'Publicados':'Revisar'}</span></div><div class="grid-lists"><div class="team-card team-a"><h3>Equipo A</h3>${team('A')}</div><div class="team-card team-b"><h3>Equipo B</h3>${team('B')}</div></div>`;
  if(o.status==='needs_review'){$('teamsReview').classList.remove('hidden');$('teamsReview').textContent='⚠️ Cambió la lista de titulares. Revisa los equipos.'}
  else $('teamsReview').classList.add('hidden');
}

function proposals(){
  const ps=ts?.proposals||[];
  $('proposalsBox').classList.toggle('hidden',!ap()||!ps.length);
  if(!ap())return;
  $('proposalsList').innerHTML=ps.map(p=>'<div class="proposal"><strong>'+esc(p.author)+'</strong><button class="mini primary publish-proposal" data-id="'+p.id+'">Publicar como oficial</button></div>').join('');
}

function chip(p){
  return`<span class="player-chip${sel===p.player_id?' selected':''}" draggable="true" data-player="${p.player_id}">${esc(p.name)}</span>`;
}

function renderPairs(){
  const confirmed=currentConfirmed(),used=new Set(pairs.flat());
  $('playerPool').innerHTML=confirmed.filter(p=>!used.has(p.player_id)).map(chip).join('');
  $('pairGrid').innerHTML=pairs.map((a,i)=>`<div class="pair-slot" data-pair="${i}"><strong>Pareja ${i+1}</strong><div class="pair-players">${a.map(id=>{const p=confirmed.find(x=>x.player_id===id);return p?chip(p):''}).join('')}</div></div>`).join('');
  wirePairs();
  $('distributeBtn').disabled=!pairs.every(a=>a.length===2);
}

function move(id,i){
  pairs=pairs.map(a=>a.filter(x=>x!==id));
  if(pairs[i].length<2)pairs[i].push(id);
  sel=null;draft=[];
  $('draftTeams').classList.add('hidden');
  $('teamActions').classList.add('hidden');
  renderPairs();
}

function wirePairs(){
  document.querySelectorAll('.player-chip[draggable=true]').forEach(e=>{
    e.ondragstart=x=>x.dataTransfer.setData('text/plain',e.dataset.player);
    e.onclick=()=>{sel=sel===e.dataset.player?null:e.dataset.player;renderPairs()}
  });
  document.querySelectorAll('.pair-slot').forEach(e=>{
    e.ondragover=x=>x.preventDefault();
    e.ondrop=x=>{x.preventDefault();move(x.dataTransfer.getData('text/plain'),+e.dataset.pair)};
    e.onclick=x=>{if(!x.target.closest('.player-chip')&&sel)move(sel,+e.dataset.pair)}
  });
}

export function resetPairs(){
  pairs=Array.from({length:7},()=>[]);
  draft=[];renderPairs();
  $('draftTeams').classList.add('hidden');
  $('teamActions').classList.add('hidden');
  result('teamMessage','Parejas reiniciadas.');
}

export function distributePairs(){
  if(!pairs.every(a=>a.length===2))return;
  draft=[];
  pairs.forEach((p,pairIndex)=>{
    const flip=Math.random()<.5;
    draft.push({player_id:p[flip?0:1],team:'A',pair:pairIndex});
    draft.push({player_id:p[flip?1:0],team:'B',pair:pairIndex});
  });
  renderDraft();
  result('teamMessage','Distribución creada. Toca cualquier jugador para invertir su pareja entre A y B.');
}

function renderDraft(){
  const names=Object.fromEntries(currentConfirmed().map(x=>[x.player_id,x.name]));
  const out=t=>draft.filter(x=>x.team===t).map(x=>`<button class="player-chip draft-chip" data-pair="${x.pair}" title="Invertir pareja ${x.pair+1}"><small>P${x.pair+1}</small> ${esc(names[x.player_id])}</button>`).join('');
  $('teamADraft').innerHTML=out('A');
  $('teamBDraft').innerHTML=out('B');
  $('draftTeams').classList.remove('hidden');
  $('teamActions').classList.remove('hidden');
  $('publishOfficialBtn').classList.toggle('hidden',!ap());
  const canProposal=ts.proposals_enabled&&deviceIdentity&&currentConfirmed().some(x=>x.player_id===deviceIdentity.player_id);
  $('submitProposalBtn').classList.toggle('hidden',!canProposal);
  document.querySelectorAll('.draft-chip').forEach(b=>b.onclick=()=>invertPair(+b.dataset.pair));
}

function invertPair(pairIndex){
  draft=draft.map(x=>x.pair===pairIndex?{...x,team:x.team==='A'?'B':'A'}:x);
  renderDraft();
  result('teamMessage',`Pareja ${pairIndex+1} invertida. Se mantiene un jugador de esa pareja en cada equipo.`);
}

export async function saveTeam(kind){
  try{
    const assignments=draft.map(({player_id,team})=>({player_id,team}));
    if(kind==='official'){
      await api('admin_save_team_plan',{pin:ap(),match_id:state.match.id,pairings:pairs,assignments,publish:true});
      result('teamMessage','Equipos oficiales publicados.');
    }else{
      await api('player_save_team_proposal',{device_token:deviceToken,match_id:state.match.id,pairings:pairs,assignments});
      result('teamMessage','Tu propuesta fue enviada.');
    }
    await loadTeams();
  }catch(e){result('teamMessage',e.message,true)}
}