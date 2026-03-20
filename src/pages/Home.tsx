import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  DollarSign,
  Zap,
  BookOpen,
  HeadphonesIcon,
} from "lucide-react";

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:8px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(26px,3.5vw,38px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-h1 em{font-style:italic;color:var(--gold);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:var(--ink);}
.ld-sub{font-size:14px;color:var(--ink3);line-height:1.75;font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:22px 26px;}
.ld-hero{background:linear-gradient(135deg,var(--ink) 0%,#2C2820 100%);border-radius:14px;padding:36px 40px;position:relative;overflow:hidden;}
.ld-hero::after{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(184,146,42,0.18) 0%,transparent 70%);pointer-events:none;}
.ld-hero-tag{font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--gold);display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;}
.ld-hero-tag span{width:24px;height:1px;background:var(--gold);display:inline-block;}
.ld-hero-h{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,3.5vw,42px);font-weight:700;color:#fff;line-height:1.1;letter-spacing:-0.5px;margin-bottom:10px;}
.ld-hero-h em{font-style:italic;color:var(--gold2);}
.ld-hero-sub{font-size:14px;color:rgba(255,255,255,0.55);font-weight:300;line-height:1.7;}
.ld-action-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.ld-action-card{padding:22px 20px;background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 10px rgba(26,24,20,0.04);cursor:pointer;transition:all 0.22s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:12px;}
.ld-action-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));transform:scaleX(0);transform-origin:left;transition:transform 0.22s;}
.ld-action-card:hover::before{transform:scaleX(1);}
.ld-action-card:hover{box-shadow:0 6px 28px rgba(26,24,20,0.1);transform:translateY(-2px);}
.ld-action-ico{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
.ld-action-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink);}
.ld-action-desc{font-size:12px;color:var(--ink3);line-height:1.5;}
.ld-action-arrow{font-size:12px;color:var(--gold);display:flex;align-items:center;gap:4px;font-weight:500;margin-top:auto;}
.ld-int-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ld-int-card{padding:20px;border:1px solid var(--bdr);border-radius:10px;background:#fff;transition:box-shadow 0.2s;}
.ld-int-card:hover{box-shadow:0 4px 20px rgba(26,24,20,0.08);}
.ld-int-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;}
.ld-int-connected{background:#E8F5E9;color:#1E8449;}
.ld-int-pending{background:#FFF8E1;color:#B7770D;}
.ld-int-logo{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;}
.ld-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.ld-stat-mini{padding:16px 20px;background:#fff;border-radius:10px;border:1px solid var(--bdr);}
.ld-stat-mini-val{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--ink);}
.ld-stat-mini-lbl{font-size:11px;font-weight:500;letter-spacing:0.6px;text-transform:uppercase;color:var(--ink3);margin-top:4px;}
.ld-footer-btns{display:flex;gap:10px;flex-wrap:wrap;}
.ld-btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;background:transparent;color:var(--ink);border:1px solid var(--bdr);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
.ld-btn-ghost:hover{border-color:var(--gold);color:var(--gold);}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.ld-a3{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
.ld-a4{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.21s both;}
.ld-a5{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.28s both;}
@media(max-width:768px){
  .ld-action-grid{grid-template-columns:repeat(2,1fr);}
  .ld-int-grid{grid-template-columns:1fr;}
  .ld-stat-row{grid-template-columns:1fr 1fr;}
  .ld-hero{padding:28px 24px;}
}
@media(max-width:480px){
  .ld-action-grid{grid-template-columns:1fr 1fr;}
  .ld-stat-row{grid-template-columns:1fr;}
}
`;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Visão Geral",
      description: "Resumo operacional da empresa",
      icon: BarChart3,
      path: "/home",
      icoClass: "ld-action-ico",
      icoStyle: { background: "var(--gold-light)" },
      icoColor: "var(--gold)",
    },
    {
      title: "Vendas",
      description: "Gerencie vendas em marketplaces",
      icon: ShoppingCart,
      path: "/sales",
      icoStyle: { background: "#E8F5E9" },
      icoColor: "#27AE60",
    },
    {
      title: "Estoque",
      description: "Controle de inventário e produtos",
      icon: Package,
      path: "/inventory",
      icoStyle: { background: "#FFF3E0" },
      icoColor: "#E67E22",
    },
    {
      title: "Faturamento",
      description: "Gestão de faturas e cobranças",
      icon: Users,
      path: "/billing",
      icoStyle: { background: "#F3E5F5" },
      icoColor: "#8E44AD",
    },
  ];

  const statsPreview = [
    { label: "Vendas Hoje", value: "R$ 4.280", sub: "+12% vs ontem" },
    { label: "Pedidos Ativos", value: "28", sub: "3 aguardando envio" },
    { label: "Produtos em Estoque", value: "1.240", sub: "8 com estoque baixo" },
  ];

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

        {/* Hero de Boas-Vindas */}
        <div className="ld-hero ld-a1">
          <div className="ld-hero-tag">
            <span />
            Painel de Controle
          </div>
          <h1 className="ld-hero-h">
            Bem-vindo, <em>{user?.name?.split(" ")[0] || "usuário"}</em>
          </h1>
          <p className="ld-hero-sub">
            Sua operação centralizada — vendas, estoque, financeiro e integrações em um só lugar.
          </p>
        </div>

        {/* Mini Stats */}
        <div className="ld-stat-row ld-a2">
          {statsPreview.map((s) => (
            <div key={s.label} className="ld-stat-mini">
              <div className="ld-stat-mini-val">{s.value}</div>
              <div className="ld-stat-mini-lbl">{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--gold)", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Acesso Rápido */}
        <div className="ld-a3">
          <div style={{ marginBottom: 12 }}>
            <span className="ld-tag">Módulos</span>
            <h2 className="ld-h2">Acesso Rápido</h2>
          </div>
          <div className="ld-action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.title}
                  className="ld-action-card"
                  onClick={() => navigate(action.path)}
                >
                  <div className="ld-action-ico" style={action.icoStyle}>
                    <Icon size={20} color={action.icoColor} />
                  </div>
                  <div>
                    <div className="ld-action-title">{action.title}</div>
                    <div className="ld-action-desc">{action.description}</div>
                  </div>
                  <div className="ld-action-arrow">
                    Acessar <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrações de Vendas */}
        <div className="ld-a4">
          <div className="ld-card">
            <div className="ld-card-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span className="ld-tag">Marketplaces</span>
                  <h2 className="ld-h2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp size={18} color="var(--gold)" />
                    Integrações de Vendas Online
                  </h2>
                  <p className="ld-sub" style={{ marginTop: 4 }}>
                    Conecte suas lojas e gerencie todas as vendas em um só lugar
                  </p>
                </div>
              </div>

              <div className="ld-int-grid">
                {/* Mercado Livre */}
                <div className="ld-int-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="ld-int-logo" style={{ background: "#FFF9C4", color: "#B7770D" }}>ML</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Mercado Livre</div>
                        <div style={{ fontSize: 12, color: "var(--ink3)" }}>Marketplace líder</div>
                      </div>
                    </div>
                    <ExternalLink size={14} color="var(--ink3)" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--ink3)" }}>Status</span>
                      <span className="ld-int-badge ld-int-connected">● Conectado</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--ink3)" }}>Produtos ativos</span>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>24</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--ink3)" }}>Vendas hoje</span>
                      <span style={{ fontWeight: 600, color: "#27AE60" }}>R$ 1.250,00</span>
                    </div>
                  </div>
                  <button
                    className="ld-btn-ghost"
                    style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
                    onClick={() => navigate("/sales")}
                  >
                    Gerenciar Produtos
                  </button>
                </div>

                {/* Amazon */}
                <div className="ld-int-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="ld-int-logo" style={{ background: "#FFF3E0", color: "#E67E22" }}>AZ</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Amazon</div>
                        <div style={{ fontSize: 12, color: "var(--ink3)" }}>Marketplace global</div>
                      </div>
                    </div>
                    <ExternalLink size={14} color="var(--ink3)" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--ink3)" }}>Status</span>
                      <span className="ld-int-badge ld-int-pending">⚡ Pendente</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--ink3)" }}>Produtos ativos</span>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>0</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--ink3)" }}>Configuração</span>
                      <span style={{ fontWeight: 600, color: "#2980B9" }}>Necessária</span>
                    </div>
                  </div>
                  <button
                    className="ld-btn-ghost"
                    style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
                    onClick={() => navigate("/settings")}
                  >
                    Configurar Integração
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Ajuda */}
        <div className="ld-a5" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 12 }}>
            Precisa de ajuda? Consulte a documentação ou entre em contato com o suporte.
          </p>
          <div className="ld-footer-btns" style={{ justifyContent: "center" }}>
            <button className="ld-btn-ghost">
              <BookOpen size={14} />
              Documentação
            </button>
            <button className="ld-btn-ghost">
              <HeadphonesIcon size={14} />
              Suporte
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;
