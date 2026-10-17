import { ArrowRight, BarChart3, Gauge, LockKeyhole, ReceiptText, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'

const features=[
  {icon:Zap,title:'Consumo inteligente',text:'Acompanhe o consumo mensal, médias, kWh/m², consumo por pessoa e evolução histórica.'},
  {icon:Gauge,title:'Demanda sob controle',text:'Compare Demanda máxima Ponta e Fora de Ponta com a demanda contratada e identifique ultrapassagens.'},
  {icon:ReceiptText,title:'TE e TUSD separados',text:'Visualize Tarifa de Energia e Tarifa de Uso do Sistema de Distribuição sem misturar Ponta e Fora de Ponta.'},
  {icon:BarChart3,title:'Gráficos interativos',text:'Abra análises específicas de Consumo, Demanda, TE e TUSD com históricos e médias anuais.'},
  {icon:TrendingUp,title:'Indicadores automáticos',text:'Transforme dados da conta em indicadores claros para apoiar decisões e acompanhamento energético.'},
  {icon:ShieldCheck,title:'Processamento seguro',text:'O PDF original permanece no navegador. O sistema trabalha com os dados necessários para a análise.'}
]

export default function LandingPage({onStart}){
  return <main className="landing-page">
    <div className="landing-grid"/>
    <div className="landing-glow landing-glow-red"/>
    <div className="landing-glow landing-glow-blue"/>

    <header className="landing-header">
      <div className="landing-brand">
        <img src="/upe-logo.png" alt="Universidade de Pernambuco"/>
        <div><strong>POLI Energia</strong><span>Gestão e análise de consumo elétrico</span></div>
      </div>
      <button className="landing-login-link" onClick={onStart}><LockKeyhole size={16}/> Acessar painel</button>
    </header>

    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="landing-kicker"><Sparkles size={15}/> DADOS ENERGÉTICOS TRANSFORMADOS EM DECISÃO</div>
        <h1>Entenda a conta de energia da POLI de forma simples, visual e detalhada.</h1>
        <p>O POLI Energia organiza consumo, demanda máxima, Ponta, Fora de Ponta, TE, TUSD, custos e histórico em um dashboard profissional, com gráficos interativos e leitura facilitada.</p>
        <div className="landing-actions">
          <button className="landing-primary" onClick={onStart}>Vamos calcular <ArrowRight size={19}/></button>
          <span><ShieldCheck size={15}/> Acesso protegido ao painel</span>
        </div>
        <div className="landing-mini-stats">
          <div><strong>8.860 m²</strong><span>Área construída analisada</span></div>
          <div><strong>2.392</strong><span>Pessoas • referência 2025</span></div>
          <div><strong>P / FP</strong><span>Postos tarifários separados</span></div>
        </div>
      </div>

      <div className="landing-visual">
        <div className="landing-orbit orbit-one"/>
        <div className="landing-orbit orbit-two"/>
        <div className="landing-energy-core"><Zap size={64} fill="currentColor"/></div>
        <div className="landing-data-card card-a"><span>Consumo médio</span><strong>kWh</strong><i/></div>
        <div className="landing-data-card card-b"><span>Demanda máxima</span><strong>kW</strong><i/></div>
        <div className="landing-data-card card-c"><span>TE + TUSD</span><strong>Separados</strong><i/></div>
      </div>
    </section>

    <section className="landing-section">
      <div className="landing-section-head">
        <span>O QUE O SISTEMA FAZ</span>
        <h2>Da fatura aos indicadores que realmente importam.</h2>
        <p>O objetivo é reduzir a complexidade da conta de energia e mostrar as informações em uma linguagem visual, organizada e comparável.</p>
      </div>
      <div className="landing-feature-grid">{features.map(({icon:Icon,title,text})=><article key={title} className="landing-feature-card"><div><Icon size={21}/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="landing-flow">
      <div className="landing-flow-copy">
        <span>FLUXO SIMPLES</span>
        <h2>Feito para abrir, entender e decidir.</h2>
        <p>O usuário não precisa conhecer detalhes técnicos do sistema para encontrar as informações essenciais da conta.</p>
      </div>
      <div className="landing-flow-steps">
        <div><b>01</b><strong>Envie a conta</strong><span>Selecione o PDF da fatura de energia.</span></div>
        <i/>
        <div><b>02</b><strong>O sistema organiza</strong><span>Consumo, demanda, TE, TUSD e demais indicadores são estruturados.</span></div>
        <i/>
        <div><b>03</b><strong>Analise os gráficos</strong><span>Consulte histórico, médias, Ponta, FP e custos em páginas específicas.</span></div>
      </div>
    </section>

    <section className="landing-cta">
      <div><span>PRONTO PARA COMEÇAR?</span><h2>Acesse o painel e transforme a próxima fatura em informação útil.</h2></div>
      <button onClick={onStart}>Vamos calcular <ArrowRight size={19}/></button>
    </section>

    <footer className="landing-footer"><span>POLI Energia • Escola Politécnica de Pernambuco</span><span>Rua Prof. Benedito Monteiro, 455 • A4 Livre Verde - Poder Público</span></footer>
  </main>
}
