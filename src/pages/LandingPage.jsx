import {
  ArrowRight, BarChart3, Building2, Gauge, LockKeyhole, ReceiptText,
  ShieldCheck, UploadCloud, Zap
} from 'lucide-react'

const resources=[
  {
    icon:UploadCloud,
    title:'Leitura de faturas',
    text:'Envie a conta em PDF e transforme os dados da fatura em informações organizadas para análise.'
  },
  {
    icon:Gauge,
    title:'Demanda Ponta e Fora de Ponta',
    text:'Acompanhe demanda máxima, demanda contratada e possíveis ultrapassagens sem misturar os postos tarifários.'
  },
  {
    icon:ReceiptText,
    title:'TE e TUSD individualizados',
    text:'Visualize energia e distribuição separadamente, com quantidades, valores e tarifas de cada componente.'
  },
  {
    icon:BarChart3,
    title:'Indicadores e histórico',
    text:'Consulte consumo, custos, médias anuais e gráficos mensais em um painel pensado para leitura rápida.'
  }
]

export default function LandingPage({onStart}){
  return <main className="landing-pro">
    <header className="landing-pro-header">
      <div className="landing-pro-header-inner">
        <a className="landing-pro-brand" href="#inicio" aria-label="POLI Energia">
          <img src="/upe-logo.png" alt="Universidade de Pernambuco"/>
          <span className="landing-pro-brand-line"/>
          <div>
            <strong>POLI Energia</strong>
            <small>Escola Politécnica de Pernambuco</small>
          </div>
        </a>

        <nav className="landing-pro-nav" aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#recursos">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
        </nav>

        <button className="landing-pro-access" type="button" onClick={onStart}>
          <LockKeyhole size={16}/> Acessar painel
        </button>
      </div>
      <div className="landing-pro-rule"><span/></div>
    </header>

    <section id="inicio" className="landing-pro-hero">
      <div className="landing-pro-hero-inner">
        <div className="landing-pro-copy">
          <div className="landing-pro-eyebrow">
            <span className="landing-pro-eyebrow-dot"/>
            Gestão energética • POLI/UPE
          </div>

          <h1>
            Painel inteligente de
            <span> análise energética.</span>
          </h1>

          <p>
            Visualize consumo, demanda, custos tarifários, TE, TUSD e indicadores da POLI
            em um ambiente claro, moderno e preparado para apoiar decisões.
          </p>

          <div className="landing-pro-actions">
            <button className="landing-pro-primary" type="button" onClick={onStart}>
              Vamos calcular <ArrowRight size={18}/>
            </button>
            <a className="landing-pro-secondary" href="#recursos">Conhecer recursos</a>
          </div>

          <div className="landing-pro-trust">
            <span><ShieldCheck size={16}/> Acesso protegido</span>
            <span><Building2 size={16}/> 8.860 m² analisados</span>
            <span><Zap size={16}/> Ponta e FP separados</span>
          </div>
        </div>

        <div className="landing-pro-preview" aria-label="Prévia do painel POLI Energia">
          <div className="landing-pro-preview-bar">
            <div className="landing-pro-preview-brand">
              <div className="landing-pro-mini-bolt"><Zap size={15} fill="currentColor"/></div>
              <div><strong>POLI Energia</strong><small>Visão geral</small></div>
            </div>
            <span className="landing-pro-online"><i/> Análise online</span>
          </div>

          <div className="landing-pro-preview-body">
            <div className="landing-pro-preview-title">
              <div><small>RESUMO ENERGÉTICO</small><strong>Indicadores principais</strong></div>
              <span>2026</span>
            </div>

            <div className="landing-pro-kpis">
              <article>
                <span>Consumo médio mensal</span>
                <strong>32.364 <em>kWh</em></strong>
                <small>Histórico consolidado</small>
              </article>
              <article>
                <span>Demanda contratada</span>
                <strong>280 <em>kW</em></strong>
                <small>Limite da unidade</small>
              </article>
              <article>
                <span>Demanda máx. Ponta</span>
                <strong>267,2 <em>kW</em></strong>
                <small>17h30 às 20h30</small>
              </article>
            </div>

            <div className="landing-pro-chart-card">
              <div className="landing-pro-chart-head">
                <div><span>CONSUMO MENSAL</span><strong>Evolução do período</strong></div>
                <div className="landing-pro-chart-legend"><i/> kWh <b/> Média</div>
              </div>
              <div className="landing-pro-chart">
                <div className="landing-pro-y-labels"><span>40k</span><span>30k</span><span>20k</span><span>10k</span><span>0</span></div>
                <div className="landing-pro-chart-area">
                  <div className="landing-pro-gridline g1"/><div className="landing-pro-gridline g2"/><div className="landing-pro-gridline g3"/><div className="landing-pro-gridline g4"/>
                  <div className="landing-pro-bars">
                    {[62,74,56,83,68,76,91,79].map((h,i)=><span key={i} style={{height:`${h}%`}}/>)}
                  </div>
                  <div className="landing-pro-average"/>
                </div>
              </div>
              <div className="landing-pro-months"><span>JAN</span><span>FEV</span><span>MAR</span><span>ABR</span><span>MAI</span><span>JUN</span><span>JUL</span><span>AGO</span></div>
            </div>

            <div className="landing-pro-preview-footer">
              <div><span>TE</span><strong>Energia</strong></div>
              <div><span>TUSD</span><strong>Distribuição</strong></div>
              <div><span>P / FP</span><strong>Separados</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="recursos" className="landing-pro-section">
      <div className="landing-pro-section-head">
        <div>
          <span className="landing-pro-section-kicker">RECURSOS DO SISTEMA</span>
          <h2>Da fatura aos indicadores essenciais.</h2>
        </div>
        <p>
          O POLI Energia reduz a complexidade da conta e apresenta cada informação
          no contexto correto, com foco em leitura, comparação e acompanhamento.
        </p>
      </div>

      <div className="landing-pro-resources">
        {resources.map(({icon:Icon,title,text},index)=><article key={title}>
          <div className="landing-pro-resource-top">
            <div className="landing-pro-resource-icon"><Icon size={21}/></div>
            <span>0{index+1}</span>
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>)}
      </div>
    </section>

    <section id="como-funciona" className="landing-pro-process-wrap">
      <div className="landing-pro-process">
        <div className="landing-pro-process-intro">
          <span>COMO FUNCIONA</span>
          <h2>Três etapas. Uma leitura muito mais simples.</h2>
          <p>O fluxo foi pensado para que o usuário chegue ao indicador sem precisar navegar por processos técnicos.</p>
        </div>

        <div className="landing-pro-steps">
          <article>
            <b>01</b>
            <div><strong>Envie a fatura</strong><p>Selecione o PDF da conta de energia.</p></div>
          </article>
          <span className="landing-pro-step-line"/>
          <article>
            <b>02</b>
            <div><strong>Organize os dados</strong><p>O sistema estrutura consumo, demanda, TE, TUSD e cobranças.</p></div>
          </article>
          <span className="landing-pro-step-line"/>
          <article>
            <b>03</b>
            <div><strong>Analise o painel</strong><p>Compare históricos, médias, custos e indicadores energéticos.</p></div>
          </article>
        </div>
      </div>
    </section>

    <section className="landing-pro-cta-wrap">
      <div className="landing-pro-cta">
        <div>
          <span>POLI ENERGIA</span>
          <h2>Pronto para analisar a próxima fatura?</h2>
          <p>Entre no sistema e transforme os dados da conta em informação visual e organizada.</p>
        </div>
        <button type="button" onClick={onStart}>Vamos calcular <ArrowRight size={18}/></button>
      </div>
    </section>

    <footer className="landing-pro-footer">
      <div className="landing-pro-footer-inner">
        <div className="landing-pro-footer-brand">
          <img src="/upe-logo.png" alt="UPE"/>
          <div><strong>POLI Energia</strong><span>Escola Politécnica de Pernambuco</span></div>
        </div>
        <div className="landing-pro-footer-meta">
          <span>Rua Prof. Benedito Monteiro, 455</span>
          <span>A4 Livre Verde - Poder Público</span>
        </div>
      </div>
    </footer>
  </main>
}
