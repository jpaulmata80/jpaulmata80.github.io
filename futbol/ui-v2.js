export function prepareUI(){
  const head=document.querySelector('.match-head');
  if(head){
    const count=head.querySelector('.count-box');
    const left=head.firstElementChild;
    if(left){
      const mode=document.getElementById('modeBadge');
      if(mode)mode.remove();
      const date=document.getElementById('matchDate');
      const win=document.getElementById('windowInfo');
      if(date){
        const title=document.createElement('span');
        title.className='match-label';
        title.textContent='Fecha y hora del partido';
        date.parentNode.insertBefore(title,date);
      }
      if(win){
        win.style.whiteSpace='pre-line';
      }
    }
    if(count)count.classList.add('count-box-prominent');
  }

  const grid=document.querySelector('#matchArea .grid-lists');
  if(grid&&!document.getElementById('cancelledList')){
    grid.classList.add('grid-lists-3');
    const card=document.createElement('div');
    card.className='list-card';
    const title=document.createElement('div');
    title.className='list-title';
    const h=document.createElement('h3');
    h.textContent='Cancelaron cupo';
    const badge=document.createElement('span');
    badge.id='cancelledBadge';
    badge.textContent='0';
    title.append(h,badge);
    const list=document.createElement('ol');
    list.id='cancelledList';
    card.append(title,list);
    grid.appendChild(card);
  }

  const old=document.getElementById('matchMinutes');
  if(old){
    const label=old.closest('label');
    const input=document.createElement('input');
    input.id='matchDuration';
    input.type='text';
    input.inputMode='numeric';
    input.placeholder='01:30:00';
    input.autocomplete='off';
    old.replaceWith(input);
    if(label){
      for(const node of label.childNodes){
        if(node.nodeType===Node.TEXT_NODE){node.textContent='Duración de inscripción (HH:MM:SS)';break;}
      }
    }
  }
}