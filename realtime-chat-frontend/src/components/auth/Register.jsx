import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../utils/api";

function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf; let W, H;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize();
    const COLORS = ["#00F5FF","#FFE600","#4D79FF","#39FF14"];
    const pts = Array.from({length:60},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.5+0.3,
      vx:(Math.random()-0.5)*0.3, vy:-(Math.random()*0.5+0.12),
      c:COLORS[Math.floor(Math.random()*COLORS.length)],
      a:Math.random()*0.5+0.1,
    }));
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.y<-4){p.y=H+4;p.x=Math.random()*W;}
        if(p.x<-4||p.x>W+4)p.vx*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.c+Math.floor(p.a*255).toString(16).padStart(2,"0");
        ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:0.4}}/>;
}

const strength = (p) => {
  if (!p) return { s:0, label:"", col:"" };
  let s=0;
  if(p.length>=8) s++; if(/[A-Z]/.test(p)) s++; if(/[0-9]/.test(p)) s++; if(/[^A-Za-z0-9]/.test(p)) s++;
  const m=[{label:"Weak",col:"#ef4444"},{label:"Fair",col:"#f97316"},{label:"Good",col:"#eab308"},{label:"Strong",col:"#22c55e"},{label:"Very strong",col:"#00F5FF"}];
  return {s,...m[s]};
};

function Input({label,icon,type="text",value,onChange,placeholder,right}) {
  const [f,setF]=useState(false);
  return (
    <div>
      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,marginBottom:8,color:f?"#00F5FF":"rgba(255,255,255,0.5)",transition:"color .2s"}}>
        {icon} {label}
      </label>
      <div style={{position:"relative"}}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)} autoComplete="off"
          style={{
            width:"100%", padding:right?"14px 48px 14px 16px":"14px 16px",
            borderRadius:14, background:f?"rgba(0,245,255,0.04)":"rgba(255,255,255,0.04)",
            border:`1px solid ${f?"rgba(0,245,255,0.5)":"rgba(255,255,255,0.08)"}`,
            boxShadow:f?"0 0 0 3px rgba(0,245,255,0.1)":"none",
            color:"#E8EAF0", fontSize:14, fontFamily:"Poppins,sans-serif",
            outline:"none", transition:"all .2s",
          }} />
        {right&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)"}}>{right}</div>}
      </div>
    </div>
  );
}

const EyeIcon=({open})=>(
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open?(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>):(<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const str = strength(password);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate("/login", { state: { message: "Account created! Sign in to continue. 🎉" } });
    } catch (error) {
      setErr(error.response?.data?.msg || "Registration failed.");
    }
    setLoading(false);
  };

  const checks=[
    {ok:password.length>=8,    label:"8+ characters"},
    {ok:/[A-Z]/.test(password),label:"Uppercase"},
    {ok:/[0-9]/.test(password),label:"Number"},
    {ok:/[^A-Za-z0-9]/.test(password),label:"Symbol"},
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"#070B14",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"1.5rem", position:"relative", overflow:"auto",
    }}>
      <Particles/>
      {/* blobs */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        {[
          {w:300,h:300,l:"-6%",t:"-6%", bg:"rgba(255,230,0,0.06)", d:"0s"},
          {w:200,h:200,l:"46%",t:"18%", bg:"rgba(0,245,255,0.05)", d:"-7s"},
          {w:150,h:150,l:"82%",t:"8%",  bg:"rgba(77,121,255,0.07)",d:"-3s"},
          {w:240,h:240,l:"2%", b:"-5%", bg:"rgba(255,230,0,0.05)", d:"-11s"},
        ].map((b,i)=>(
          <div key={i} style={{position:"absolute",borderRadius:"50%",mixBlendMode:"screen",
            filter:"blur(32px)",width:b.w,height:b.h,left:b.l,top:b.t,bottom:b.b,
            background:b.bg,animation:`float 20s ease-in-out infinite`,animationDelay:b.d}}/>
        ))}
      </div>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,245,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.025) 1px,transparent 1px)",
        backgroundSize:"48px 48px",opacity:0.3}}/>

      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:440}}>
        <div style={{
          position:"absolute",inset:-16,borderRadius:40,pointerEvents:"none",
          background:"radial-gradient(ellipse,rgba(255,230,0,0.08) 0%,transparent 70%)",filter:"blur(20px)",
        }}/>

        <div style={{
          position:"relative",
          background:"linear-gradient(145deg,rgba(13,21,38,0.95),rgba(7,11,20,0.98))",
          border:"1px solid rgba(255,230,0,0.15)", borderRadius:28,
          boxShadow:"0 0 0 1px rgba(255,255,255,0.04),0 32px 80px rgba(0,0,0,0.75)",
          backdropFilter:"blur(28px)", overflow:"hidden",
          animation:"scale-in 0.3s ease both",
        }}>
          <div style={{height:3,background:"linear-gradient(90deg,transparent,#FFE600 30%,#00F5FF 70%,transparent)"}}/>

          <div style={{padding:"2.25rem 2.25rem 2rem"}}>
            <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
              <div style={{
                display:"inline-flex",alignItems:"center",justifyContent:"center",
                width:64,height:64,borderRadius:18,marginBottom:14,fontSize:28,
                background:"linear-gradient(135deg,#b45309,#0891b2)",
                boxShadow:"0 0 32px rgba(255,230,0,0.3),0 0 80px rgba(255,230,0,0.08)",
              }}>✨</div>
              <h1 style={{
                fontSize:27,fontWeight:900,letterSpacing:"-0.4px",marginBottom:5,
                background:"linear-gradient(90deg,#FFE600,#00F5FF,#FFE600)",
                backgroundSize:"250% 100%",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
                animation:"shimmer 4s linear infinite",
              }}>Create account</h1>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>
                Join <span style={{color:"#FFE600"}}>JourneyChat</span> today
              </p>
            </div>

            {err&&<div style={{fontSize:13,padding:"12px 16px",borderRadius:12,marginBottom:14,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171"}}>⚠️ {err}</div>}

            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
              <Input label="Full name"      icon="👤" value={name}     onChange={e=>setName(e.target.value)}     placeholder="John Doe"/>
              <Input label="Email address"  icon="✉️" type="email" value={email}    onChange={e=>setEmail(e.target.value)}    placeholder="you@example.com"/>
              <div>
                <Input label="Password" icon="🔒"
                  type={showPass?"text":"password"} value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  right={
                    <button type="button" onClick={()=>setShowPass(s=>!s)}
                      style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",lineHeight:1,padding:4}}>
                      <EyeIcon open={showPass}/>
                    </button>
                  }
                />
                {/* Strength bars */}
                {password&&(
                  <div style={{marginTop:8}}>
                    <div style={{display:"flex",gap:4,marginBottom:4}}>
                      {[1,2,3,4].map(i=>(
                        <div key={i} style={{flex:1,height:3,borderRadius:99,transition:"all .3s",
                          background:i<=str.s?str.col:"rgba(255,255,255,0.07)"}}/>
                      ))}
                    </div>
                    <p style={{fontSize:10,fontWeight:700,color:str.col}}>{str.label}</p>
                  </div>
                )}
                {/* Requirements */}
                {password&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:8}}>
                    {checks.map(({ok,label})=>(
                      <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:10.5,color:ok?"#39FF14":"rgba(255,255,255,0.35)"}}>
                        <span style={{opacity:ok?1:0.3}}>{ok?"✓":"○"}</span>{label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} style={{
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                width:"100%",padding:"15px",borderRadius:14,fontWeight:700,fontSize:14,
                fontFamily:"Poppins,sans-serif",
                background:loading?"#1a3a5c":"linear-gradient(135deg,#FFE600,#f59e0b)",
                color:loading?"rgba(255,255,255,0.4)":"#0D0C08",
                boxShadow:loading?"none":"0 0 20px rgba(255,230,0,0.35),0 4px 20px rgba(0,0,0,0.4)",
                border:"none",cursor:loading?"not-allowed":"pointer",transition:"all .2s",marginTop:4,
              }}>
                {loading?(<>
                  <svg style={{animation:"spin 1s linear infinite",width:16,height:16}} fill="none" viewBox="0 0 24 24">
                    <circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Creating…
                </>):"Create Account →"}
              </button>
            </form>

            <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0 14px"}}>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>or</span>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
            </div>
            <p style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.4)"}}>
              Have an account?{" "}
              <Link to="/login" style={{color:"#FFE600",fontWeight:700,textDecoration:"none",textShadow:"0 0 8px rgba(255,230,0,0.4)"}}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
        <p style={{textAlign:"center",fontSize:11,marginTop:12,color:"rgba(255,255,255,0.18)"}}>
          🔒 Your data is private and encrypted
        </p>
      </div>
    </div>
  );
}