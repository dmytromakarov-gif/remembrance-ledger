(function(){
  var $=function(s,r){return(r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var root=document.documentElement;

  /* theme */
  var themeBtn=$('#theme');
  function setTheme(t){root.dataset.theme=t;themeBtn.setAttribute('aria-label','Switch to '+(t==='dark'?'light':'dark')+' theme');try{localStorage.setItem('rem-a-theme',t)}catch(e){}}
  setTheme(root.dataset.theme);
  themeBtn.addEventListener('click',function(){setTheme(root.dataset.theme==='dark'?'light':'dark')});

  /* menu + announce */
  var menu=$('#menu'),links=$('#nav-links');
  menu.addEventListener('click',function(){var o=links.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
  $$('a',links).forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');menu.setAttribute('aria-expanded',false)})});
  $('#announce-close').addEventListener('click',function(){$('#announce').hidden=true});

  /* hero tabs */
  var agents={
    claude:{name:'Claude Code',label:'Install the plugin',
      code:'claude plugin marketplace add dreamarkinc/remembrance-skills\nclaude plugin install remembrance@remembrance',
      next:'Restart Claude Code. Remembrance is ready when the new session opens.',real:true},
    cursor:{name:'Cursor',label:'Install for Cursor',
      code:'# Cursor install command: not shown in this concept.',
      next:'Placeholder. See the setup docs for current steps.'},
    codex:{name:'Codex',label:'Install for Codex',
      code:'# Codex install command: not shown in this concept.',
      next:'Placeholder. See the setup docs for current steps.'}
  };
  function session(a){return [
    ['you','Find a vetted MCP server for browser QA.'],
    ['agent','Checking Remembrance before improvising.'],
    ['reg','ask  “browser QA MCP server”'],
    ['reg','1 match: resource-scout, score 69'],
    ['agent','Using it. '+a+' decides what runs.'],
    ['you','Worked, but the setup step was unclear.'],
    ['reg','remember  breadcrumb queued for review']
  ]}
  var code=$('#inst-code'),log=$('#log'),panel=$('#panel');
  function render(id){var cp=$('#copy'),ok=(id==='claude');cp.disabled=!ok;cp.setAttribute('aria-disabled',!ok);cp.title=ok?'':'No command to copy yet: placeholder';
    var a=agents[id];
    $('#inst-label').textContent=a.label;
    code.textContent=a.code;
    $('#inst-next').textContent=a.next;
    $('#sess-agent').textContent=a.name+' session';
    panel.setAttribute('aria-labelledby','tab-'+id);
    log.innerHTML='';
    session(a.name).forEach(function(r,i){
      var li=document.createElement('li');li.className=r[0]==='you'?'you':r[0]==='reg'?'reg':'';
      li.style.animationDelay=(i*0.18)+'s';
      var b=document.createElement('b');b.textContent=r[0]==='reg'?'registry':r[0];
      var s=document.createElement('span');s.textContent=r[1];
      li.appendChild(b);li.appendChild(s);log.appendChild(li);
    });
    $('#copy').dataset.real=a.real?'1':'';
  }
  var tabs=$$('.tabs [role=tab]');
  function select(t){
    tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1});
    render(t.dataset.agent);
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){select(t)});
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowRight')n=tabs[(i+1)%tabs.length];
      if(e.key==='ArrowLeft')n=tabs[(i+tabs.length-1)%tabs.length];
      if(e.key==='Home')n=tabs[0];if(e.key==='End')n=tabs[tabs.length-1];
      if(n){e.preventDefault();n.focus();select(n)}
    });
  });
  render('claude');
  $('#copy').addEventListener('click',function(){
    var b=this,txt=code.textContent;
    function fail(){b.textContent='Copy failed: select the text';setTimeout(function(){b.textContent='Copy'},2400)}
    function done(){b.textContent='Copied';b.classList.add('done');setTimeout(function(){b.textContent='Copy';b.classList.remove('done')},1600)}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,fail);else fail();
  });

  /* marquee pause */
  var mt=$('#marq-toggle'),mq=$('#marq');
  mt.addEventListener('click',function(){var p=mq.classList.toggle('paused');mt.setAttribute('aria-pressed',p);mt.textContent=p?'Play':'Pause'});

  /* how it works */
  var views={
    loop:[
      {t:'Ask',d:'Your agent checks the registry before improvising another one-off workflow for a recurring task.',
       title:'ask',body:'<span class="m">// query before reinventing</span>\n<span class="a">ask</span>  "set up paid HTTP 402 endpoint"\n\n<span class="m">// result carries what you need to decide</span>\ninstall command · evidence count\nrisk · trust tier',cap:'Named services, frameworks, CI, deploys, payments, MCP servers.'},
      {t:'Reuse',d:'Results carry install commands, evidence counts, risk and trust tier. Enough to move fast, and to inspect when stakes are high.',
       title:'reuse',body:'<span class="a">resource-scout</span>   score 69 · v0.1.1\n12 verified runs · risk: medium\n\n<span class="m">// the registry suggests</span>\n<span class="m">// your agent decides what runs</span>',cap:'Illustrative values from a 2026-10-27 registry snapshot.'},
      {t:'Remember',d:'Feedback, failed attempts and better instructions become reviewed memory the next agent inherits.',
       title:'remember',body:'<span class="a">POST</span> /api/v1/agent/remembrances\n{ "skill": "…", "outcome": "worked",\n  "note": "setup step was unclear" }\n\n<span class="w">queued</span>  redact, verify, review, version',cap:'No silent rewrites. Every change is verified first.'}
    ],
    pipe:[
      {t:'Redact',d:'Secrets are stripped from public contributions first.',title:'redact',body:'note: "token sk-… failed on deploy"\n      ↓\nnote: "token <redacted> failed on deploy"',cap:'Runs before anything else sees the text.'},
      {t:'Verify',d:'An independent LLM verifier checks the feedback. Evidence is weighted by source.',title:'verify',body:'source   anonymous run → known contributor\n         → registered provider → enterprise team\n\nverifier <span class="a">independent of the agent</span>',cap:'Feedback becomes evidence. It never edits a skill directly.'},
      {t:'Guardrails',d:'Layered defenses against prompt injection, tested adversarially.',title:'guardrails',body:'<span class="m">// layered defense</span>\ncheck 1 …  <span class="a">pass</span>\ncheck 2 …  <span class="a">pass</span>\ncheck 3 …  <span class="w">held</span>',cap:'Check names above are illustrative, not the real list.'},
      {t:'Human review',d:'Risky or content-removing changes wait for a person.',title:'human review',body:'change   removes 14 lines of instructions\nstatus   <span class="w">waiting for a human</span>',cap:'Human decisions teach policy without moving the safety line.'},
      {t:'Version',d:'Updates ship as diffed, token-scored versions. Unsafe ones are quarantined or rolled back.',title:'version',body:'v0.1.1 → v0.1.2   diff · token score\nhistory kept · rollback available',cap:'Skills evolve, but they do not drift.'}
    ]
  };
  var steps=$('#steps'),cur='loop',idx=0;
  function showStep(i){
    idx=i;var s=views[cur][i];
    $$('button',steps).forEach(function(b,j){b.setAttribute('aria-current',j===i)});
    $('#hs-title').textContent=s.title;$('#hs-body').innerHTML=s.body;$('#hs-cap').textContent=s.cap;
  }
  function build(){
    steps.innerHTML='';
    views[cur].forEach(function(s,i){
      var li=document.createElement('li'),b=document.createElement('button');b.type='button';
      b.innerHTML='<span class="n">'+(i+1)+'</span><span class="t"></span><span class="d"></span>';
      $('.t',b).textContent=s.t;$('.d',b).textContent=s.d;
      b.addEventListener('click',function(){showStep(i)});
      li.appendChild(b);steps.appendChild(li);
    });
    showStep(0);
  }
  var vt=$$('.seg [role=tab]');
  vt.forEach(function(t,i){
    function pick(){vt.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1});cur=t.dataset.view;$('#how-stage').setAttribute('aria-labelledby',t.id);build()}
    t.addEventListener('click',pick);
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=vt[(i+1)%vt.length];n.focus();n.click()}});
  });
  build();
  $$('a[aria-disabled=true]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault()})});
})();
