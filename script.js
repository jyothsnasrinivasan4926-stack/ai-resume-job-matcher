const SK="python,java,javascript,typescript,c++,sql,r,pandas,numpy,scikit-learn,tensorflow,pytorch,keras,nlp,machine learning,deep learning,computer vision,data analysis,data visualization,statistics,tableau,power bi,excel,docker,kubernetes,aws,azure,gcp,git,linux,ci/cd,rest apis,fastapi,flask,django,react,node.js,html,css,mongodb,postgresql,mysql,spark,hadoop,airflow,etl,mlops,llm,communication,agile,scrum,figma,selenium,testing".split(",");
const STOP=new Set("the a an and or of to in for with on at by is are be as we you your our will this that from it its have has had can not but if into more such other than who what which their them they strong good required experience years work team role looking join about including using ability".split(" "));
const JOBS=[
["Data Analyst","python sql excel tableau power bi data analysis data visualization statistics pandas communication"],
["Machine Learning Engineer","python sql scikit-learn tensorflow pytorch docker aws rest apis machine learning mlops git"],
["Data Scientist","python r sql statistics machine learning pandas numpy scikit-learn data visualization nlp"],
["Backend Developer","python java node.js rest apis postgresql mongodb docker git ci/cd flask django fastapi"],
["Frontend Developer","javascript typescript react html css git rest apis figma testing agile"],
["DevOps Engineer","docker kubernetes aws azure linux ci/cd git airflow terraform python"],
["Data Engineer","python sql spark hadoop airflow etl aws postgresql docker git"],
["NLP / LLM Engineer","python nlp llm pytorch deep learning machine learning rest apis fastapi docker git"]];
const SAMPLE_R=`Rahul Sharma
rahul.sharma@email.com | +91 98765 43210 | linkedin.com/in/rahul

SUMMARY
Data Analyst with 2 years of experience building dashboards and automating reports.

EXPERIENCE
- Built Tableau and Power BI dashboards used by 40+ stakeholders, cutting reporting time by 35%.
- Wrote SQL queries on PostgreSQL and automated weekly reports with Python and pandas.
- Developed a churn prediction model with scikit-learn (82% accuracy).

SKILLS
Python, SQL, pandas, Tableau, Power BI, Excel, Git, scikit-learn

EDUCATION
B.Tech in Computer Science

PROJECTS
Sales forecasting dashboard with statistics and data visualization.`;
const SAMPLE_J=`Machine Learning Engineer, 2+ years of experience.
Required: Python, SQL, scikit-learn, TensorFlow, Docker, AWS, REST APIs, Git.
Nice to have: NLP, MLOps. Bachelor's degree in Computer Science or related field. Strong communication.`;
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
function skills(t){t=t.toLowerCase();return SK.filter(s=>new RegExp("(?<![a-z0-9+#])"+s.replace(/[.+*?^${}()|[\]\\\/]/g,"\\$&")+"(?![a-z0-9+#])").test(t))}
function tf(t){const m={};(t.toLowerCase().match(/[a-z][a-z+#.\-]+/g)||[]).filter(w=>!STOP.has(w)).forEach(w=>m[w]=(m[w]||0)+1);return m}
function cos(a,b,idf){let d=0,na=0,nb=0;for(const k in a){const x=(1+Math.log(a[k]))*(idf[k]||1);na+=x*x;if(b[k])d+=x*(1+Math.log(b[k]))*(idf[k]||1)}
for(const k in b){const x=(1+Math.log(b[k]))*(idf[k]||1);nb+=x*x}return na&&nb?d/Math.sqrt(na*nb):0}
function mkIdf(docs){const n=docs.length,df={};docs.forEach(d=>{for(const k in d)df[k]=(df[k]||0)+1});const o={};for(const k in df)o[k]=Math.log((n+1)/(df[k]+.5))+1;return o}
function yrs(t){const m=[...t.toLowerCase().matchAll(/(\d+)\s*\+?\s*(?:years|yrs)/g)].map(x=>+x[1]);return m.length?Math.max(...m):0}
function mask(t){const L=t.split("\n");if(L[0]&&L[0].length<40&&!/[,:|@]/.test(L[0]))L[0]="[name]";
return L.join("\n").replace(/\S+@\S+/g,"[email]").replace(/\+?\d[\d\s\-()]{8,}\d/g,"[phone]").replace(/(https?:\/\/|www\.|linkedin\.com|github\.com)\S*/gi,"[link]")}
function pct(x){return Math.round(Math.max(0,Math.min(1,x))*100)}
function bar(l,v){return `<div class="r" style="justify-content:space-between"><span>${l}</span><b>${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div>`}
function run(){
let R=$("rs").value.trim(),J=$("jd").value.trim();
if(!R||!J){alert("Please paste both a resume and a job description.");return}
const raw=R;if($("bl").checked)R=mask(R);
const rt=tf(R),jt=tf(J),jobT=JOBS.map(j=>tf(j[1]+" "+j[0]));
const idf=mkIdf([rt,jt,...jobT]);
const sem=Math.min(1,cos(rt,jt,idf)/0.45);
const rs=skills(R),js=skills(J),mt=js.filter(s=>rs.includes(s)),ms=js.filter(s=>!rs.includes(s));
const so=js.length?mt.length/js.length:0;
const need=yrs(J),have=yrs(R);let ex=need?Math.min(1,have/need):1;
const dJ=/bachelor|b\.?tech|b\.?e\b|degree|master|m\.?tech/i.test(J),dR=/bachelor|b\.?tech|b\.?e\b|degree|master|m\.?tech|b\.?sc|m\.?sc|mba/i.test(R);
const ed=dJ?(dR?1:0):1;const exp=.7*ex+.3*ed;
const tot=pct(.5*sem+.35*so+.15*exp);
$("tot").textContent=tot+"%";
$("tot").style.color=tot>=70?"var(--ok)":tot>=45?"var(--wn)":"var(--bad)";
$("verd").textContent=tot>=70?"Strong match: apply with confidence":tot>=45?"Moderate match: close the skill gaps first":"Weak match: significant gaps for this role";
$("bk").innerHTML=bar("Text similarity (50%)",pct(sem))+bar("Skill overlap (35%)",pct(so))+bar("Experience & education (15%)",pct(exp));
$("mt").innerHTML=mt.map(s=>`<span class="t ok">${esc(s)}</span>`).join("")||"<span class='mu'>none detected</span>";
$("ms").innerHTML=ms.map(s=>`<span class="t no">${esc(s)}</span>`).join("")||"<span class='mu'>none, all required skills found</span>";
$("ex").textContent=`Experience: job asks ${need||"n/a"} yrs, resume shows ${have||"n/a"} yrs. Education: ${dJ?(dR?"requirement met":"degree not found"):"not required"}.`;
const secs=["summary|objective|profile","experience|employment|work history","education","skills","projects"];
const ck=[];secs.forEach(s=>ck.push([new RegExp("^\\s*("+s+")",'im').test(raw),"Section: "+s.split("|")[0]]));
ck.push([/\S+@\S+/.test(raw),"Contact email present"]);
ck.push([/\d+\s*%|\$\s*\d|\b\d{2,}\+?\s*(users|stakeholders|clients|customers)/i.test(raw),"Quantified achievements (numbers, %)"]);
ck.push([/^\s*[-•*]/m.test(raw),"Bullet points used"]);
const wc=raw.split(/\s+/).length;ck.push([wc>=150&&wc<=900,"Length reasonable ("+wc+" words)"]);
ck.push([ms.length<=js.length/2||!js.length,"Covers most job keywords"]);
$("ats").innerHTML=ck.map(c=>`<div class="row"><span>${c[1]}</span><b style="color:var(--${c[0]?"ok":"bad"})">${c[0]?"Pass":"Fix"}</b></div>`).join("");
const sg=[];
if(ms.length)sg.push(`Add real evidence for <b>${ms.slice(0,4).map(esc).join(", ")}</b>: a project, certification or bullet that uses it. Only list skills you actually have.`);
if(ms.length)sg.push("Mirror the job's exact wording (e.g. use the same tool names) so ATS keyword filters match.");
if(need&&have<need)sg.push(`The role wants ${need}+ years; highlight internships, freelance work or projects to show equivalent depth.`);
if(!ck[6][0])sg.push("Quantify results: use numbers such as % improvements, users served or time saved.");
ck.slice(0,5).filter(c=>!c[0]).forEach(c=>sg.push("Add a clear heading: "+c[1].replace("Section: ","")));
if(!sg.length)sg.push("Resume is well aligned. Tailor the summary line to this specific company.");
$("sg").innerHTML=sg.map(s=>`<div class="row"><span>${s}</span></div>`).join("");
const rec=JOBS.map((j,i)=>{const s=skills(j[1]),m=s.filter(x=>rs.includes(x));
const sc=pct(.5*Math.min(1,cos(rt,jobT[i],idf)/0.45)+.5*(m.length/s.length));
return{n:j[0],sc,miss:s.filter(x=>!rs.includes(x))}}).sort((a,b)=>b.sc-a.sc);
$("jobs").innerHTML=rec.map((r,i)=>`<div class="row"><div><b>${i+1}. ${r.n}</b><div class="mu">Gaps: ${r.miss.slice(0,4).join(", ")||"none"}</div></div><b>${r.sc}%</b></div>`).join("");
$("out").classList.remove("hide");$("out").scrollIntoView({behavior:"smooth"});
}
$("go").onclick=run;
$("smp").onclick=()=>{$("rs").value=SAMPLE_R;$("jd").value=SAMPLE_J;run()};
