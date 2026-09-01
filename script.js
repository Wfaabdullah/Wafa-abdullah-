document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projects-grid');
  const visual = type => `<div class="project-visual"><span class="mini-label">${type === 'chart' ? 'Featured analysis' : 'Project preview'}</span>${type === 'grid' ? '<div class="visual-grid"></div>' : '<div class="visual-bars"><i></i><i></i><i></i><i></i><i></i></div>'}</div>`;
  const renderProjects = filter => {
    const list = projects.filter(p => filter === 'all' || p.category.includes(filter));
    grid.innerHTML = list.map(p => `<article class="project ${p.featured ? 'featured' : ''}">${visual(p.visual)}<div class="project-body"><span class="project-category">${p.category.map(x => x.replaceAll('-',' ')).join(' · ')}</span><h3>${p.title}</h3><p>${p.description}</p><div class="project-tools">${p.tools.map(t => `<span>${t}</span>`).join('')}</div><div class="project-actions"><a href="#contact">View project <span>→</span></a>${p.featured ? '<a href="#contact">Add report link <span>↗</span></a>' : ''}</div></div></article>`).join('');
  };
  renderProjects('all');
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {document.querySelector('.filter.active').classList.remove('active');button.classList.add('active');renderProjects(button.dataset.filter)}));
  const toggle = document.querySelector('.menu-toggle'), nav = document.querySelector('nav');
  toggle.addEventListener('click', () => {const open = nav.classList.toggle('open');toggle.setAttribute('aria-expanded', open)});
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
  const header = document.querySelector('.site-header');
  const sections = [...document.querySelectorAll('main section[id]')];
  const setNav = () => {header.classList.toggle('scrolled', window.scrollY > 10);let id='home';sections.forEach(s => {if(window.scrollY >= s.offsetTop - 150) id=s.id});document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href') === '#'+id))};
  window.addEventListener('scroll',setNav,{passive:true});setNav();
  const observer = new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  const numberObserver = new IntersectionObserver(entries => entries.forEach(e => {if(!e.isIntersecting)return;const el=e.target,target=Number(el.dataset.count),duration=850,start=performance.now();const tick=now=>{const n=Math.min((now-start)/duration,1);el.textContent=Math.round(target*n);if(n<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);numberObserver.unobserve(el)}),{threshold:.4});document.querySelectorAll('[data-count]').forEach(el=>numberObserver.observe(el));
  document.getElementById('year').textContent = new Date().getFullYear();
});