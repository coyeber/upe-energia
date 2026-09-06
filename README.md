# UPE Energia — Gemini V7 Premium

Dashboard acadêmico e institucional para análise de contas de energia da Universidade de Pernambuco (UPE).

## Principais recursos

- Identidade visual UPE em azul, branco e vermelho.
- Filtros de período: **Mês**, **Ano** e **Todos os anos**.
- Consolidação do histórico mensal encontrado dentro das próprias faturas.
- Indicadores de consumo, gasto, demanda, dias faturados, kWh/dia e custo efetivo por kWh.
- Comparação com mês anterior, média histórica e ano anterior quando houver base.
- Projeção anual simples e identificação de melhor/pior mês.
- Gráficos de consumo, gasto, consumo diário normalizado e custo por kWh.
- Separação rigorosa entre kWh e kW.
- Diagnóstico técnico/financeiro com Gemini.
- Simulador de meta de redução e economia potencial.
- Relatório executivo imprimível/salvável em PDF pelo navegador.
- Exportação do histórico em CSV e backup JSON.
- Tela de carregamento por etapas, animações e validação antes de salvar.
- PDF original permanece no navegador; apenas o texto extraído é enviado ao backend.

## Vercel

Em **Settings → Environment Variables**, configure:

```text
GEMINI_API_KEY = sua chave
GEMINI_MODEL   = modelo habilitado na sua conta
```

Depois faça um novo **Redeploy**.

Teste:

```text
https://SEU-PROJETO.vercel.app/api/health
```

O JSON deve indicar `apiKeyConfigured: true`.

## Desenvolvimento local

Crie `.env.local` na raiz:

```env
GEMINI_API_KEY=SUA_CHAVE
GEMINI_MODEL=gemini-2.5-flash
```

Depois:

```bash
npm install
npm install -g vercel
vercel dev
```

Abra a URL exibida pelo Vercel CLI, normalmente `http://localhost:3000`.

## Observações de cálculo

- Valores anuais de gasto usam apenas meses em que uma fatura com valor foi efetivamente salva.
- O histórico de consumo pode trazer meses extras existentes dentro de uma única fatura.
- Projeções são matemáticas e não consideram reajustes, sazonalidade futura ou mudanças tarifárias.
- O score de eficiência é heurístico e serve para priorização, não substituindo auditoria elétrica.
