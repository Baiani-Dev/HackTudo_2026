# Aula Local

Protótipo front-end para o HACKTUDO 2026. O Aula Local adapta uma aula à infraestrutura real da escola, principalmente quando há poucos celulares, internet instável e necessidade de preservar a privacidade dos estudantes.

## Visão do produto

O Aula Local transforma celulares disponíveis em ferramentas pedagógicas temporárias. A proposta é permitir que a professora crie uma sessão, receba um plano adaptado e acompanhe somente o progresso pedagógico da turma.

## Problema

Muitas escolas não têm internet constante, aparelhos modernos ou um celular por estudante. Soluções educacionais que presumem contas individuais, sincronização permanente ou monitoramento detalhado deixam parte da turma de fora.

## Solução

O protótipo simula uma aula de Ciências do 8º ano sobre fotossíntese:

- 30 estudantes;
- 8 celulares;
- 25 minutos;
- sem internet;
- recomendação de 6 grupos de 5 estudantes;
- 1 celular por grupo;
- atividade 100% offline.

## Diferenciais

- Adaptação ao número real de aparelhos.
- Uso em grupo, sem exigir conta individual.
- Funcionamento offline após o primeiro acesso.
- Acompanhamento agregado do progresso.
- Reflexão de foco anônima e coletiva.
- Nenhuma coleta de aplicativos acessados, mensagens, localização, histórico ou capturas de tela.

## Quatro pilares

**FOCO · AUTONOMIA · PRIVACIDADE · ACESSO**

## Funcionalidades do protótipo

- Dashboard da professora.
- Formulário para criar sessão.
- Cálculo de recomendação de grupos.
- Plano adaptado com papéis por grupo.
- Sessão em andamento com progresso simulado.
- Experiência mobile do estudante.
- Envio mockado de hipótese e foto.
- Reflexão final do estudante.
- Resumo agregado da professora.
- Persistência em `localStorage`.
- PWA com service worker para uso offline depois do primeiro carregamento.
- Preparação para GitHub Pages com `HashRouter` e caminhos relativos.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- React Router com `HashRouter`
- Vite PWA
- localStorage

## Instalação

```bash
npm install
```

Se o `npm` global do Windows estiver quebrado, use um gerenciador funcional disponível na máquina, como `pnpm install`.

## Execução local

```bash
npm run dev
```

Depois abra o endereço exibido pelo Vite.

## Build

```bash
npm run build
```

Os arquivos finais são gerados em `dist`.

## Publicação no GitHub Pages

O projeto já inclui:

- `base: "./"` no Vite;
- `HashRouter`;
- build estático em `docs/`, pronto para GitHub Pages sem Actions;
- script `deploy` como alternativa com `gh-pages`.

Para publicar via GitHub Actions:

1. Envie os arquivos para a branch `main`.
2. Em Settings > Pages, selecione `Deploy from a branch`.
3. Escolha a branch `main`.
4. Escolha a pasta `/docs`.
5. Salve a configuracao.

Para publicar manualmente com `gh-pages`:

```bash
npm run deploy
```

Não foi feito push nem publicação automática.

## Limitações do MVP

- A comunicação entre dispositivos está simulada.
- O painel de grupos usa dados mockados salvos no navegador.
- O upload de foto é apenas uma prévia simulada.
- Não há backend, autenticação, banco de dados ou APIs externas.
- O service worker torna a interface disponível offline após o primeiro carregamento, mas não sincroniza aparelhos reais.

## Arquitetura futura

- Sincronização local entre aparelhos na mesma rede.
- Pacotes de atividades exportáveis para escolas.
- Painel de acessibilidade e leitura simplificada.
- Relatórios agregados por turma.
- Modo de professor com criação de kits próprios.
- Estratégia de sincronização sem coleta invasiva de dados pessoais.

## Créditos

- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Lucide React: https://lucide.dev
- React Router: https://reactrouter.com
- Vite PWA: https://vite-pwa-org.netlify.app
