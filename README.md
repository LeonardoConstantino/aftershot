# AFTERSHOT

<div align="center">

[![Deploy Aftershot to GitHub Pages](https://github.com/leonardoconstantino/aftershot/actions/workflows/deploy.yml/badge.svg)](https://github.com/leonardoconstantino/aftershot/actions/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<br />

**Jogo arcade minimalista 2D de precisão projetado prioritariamente para dispositivos móveis.**  
*Você não joga apenas para acertar o próximo alvo. Joga para atravessar tudo o que deixou para trás.*

<br />

### 🎯 [Jogar Aftershot Online (Demo em Produção)](https://leonardoconstantino.github.io/aftershot/)

<br />

<img src="./assets/hero.png" alt="Aftershot — Gameplay e Composição de Flechas" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />

</div>

---

## 📖 Sobre o Jogo

**Aftershot** é um jogo arcade minimalista de precisão balística e partidas infinitas. O diferencial mecânico é a permanência física: cada flecha que não atinge o alvo se finca no cenário e torna-se um obstáculo tangível para os seus próximos disparos.

Conforme a partida progride, o campo de tiro se transforma em uma escultura viva das suas decisões anteriores, exigindo leituras milimétricas e trajetórias calculadas para atravessar frestas estreitas.

---

## ✨ Principais Recursos

- 🏹 **Física do Passado Persistente**: Flechas que erram o alvo ou tocam as bordas viram colsores rígidos com espessura de haste.
- 🧱 **Obstáculos Dinâmicos em Progressão**: Conforme sua pontuação aumenta, pequenos pinos geométricos (estritamente menores que o alvo) surgem em sutil oscilação, elevando o desafio tático.
- 🎯 **Acertos de Alta Precisão ("PRECISO")**: Acertos no centro do alvo (*bullseye*) ativam micro-desaceleração cinematográfica (80ms), anel de luz âmbar e sobretom sonoro cristalino.
- 🎨 **Desenho Detalhado de Flechas**: Ponteira *broadhead* chanfrada em diamante navalha, haste cilíndrica com linhas de luz, amarrações de fio (*bindings*) e empenagem parabólica com estrias de penas.
- 🔊 **Síntese de Áudio Procedural & Coro de Memória**: 100% sintetizado via Web Audio API (sem dependência de arquivos de áudio externos). O ambiente acústico ganha densidade harmônica conforme mais flechas habitam o campo.
- 📳 **Resposta Tátil Háptica**: Micropulsos vibratórios em dispositivos móveis (`navigator.vibrate`) para disparos, impactos e colisões.
- 🖼️ **Pôster de Compartilhamento ("A Sua Assinatura")**: Gera uma peça gráfica estática em alta resolução (1080x1350) com a escultura exata da partida, frase filosófica curada e suporte à Web Share API, download em PNG e cópia de texto.
- 📱 **Mobile-First & Touch Ergonômico**: Área de toque otimizada para o polegar, prevenção total de zoom ou rolagem indesejada, e scrollbar customizada ultraminimalista.

---

## 🕹️ Como Jogar

1. **Mirar e Tensionar**: Toque em qualquer área da tela e arraste para trás. A linha tracejada em Âmbar Cinético (`#E9A23B`) indicará a trajetória prevista.
2. **Disparar**: Solte o toque para liberar a flecha imediatamente.
3. **Desviar do Passado**: Evite que sua nova flecha colida com as hastes de flechas anteriores ou com os pequenos pinos de obstáculo.
4. **Alcançar o Centro**: Acerte alvos consecutivos para multiplicar pontos e expandir sua escultura geométrica.

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
- `npm` ou gerenciador de pacotes equivalente

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/leonardoconstantino/aftershot.git
   cd aftershot
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:3000` (ou na porta informada no terminal).

4. **Gerar a build de produção:**
   ```bash
   npm run build
   ```
   Os arquivos otimizados serão gerados na pasta `./dist`.

5. **Testar a build localmente:**
   ```bash
   npm run preview
   ```

---

## 🔄 Deploy Contínuo no GitHub Pages

Este repositório possui uma pipeline automatizada via **GitHub Actions** em `.github/workflows/deploy.yml`.

A cada `git push` nas branches `main` ou `master`:
1. O workflow dispara automaticamente no ambiente Ubuntu.
2. O Node.js 20 instala as dependências e compila o Vite com a variável `GITHUB_ACTIONS: true` (configurando a base URL `/aftershot/`).
3. O artefato compilado (`dist/`) é publicado e fica disponível instantaneamente em:
   **https://leonardoconstantino.github.io/aftershot/**

---

## ⚙️ Configuração Inicial no GitHub

Para habilitar a publicação automática pela primeira vez:

1. Acesse o repositório no GitHub: `https://github.com/leonardoconstantino/aftershot`
2. Vá em **Settings** > **Pages** (no menu lateral esquerdo).
3. Na seção **Build and deployment** > **Source**, selecione:
   - **`GitHub Actions`** (em vez de *Deploy from a branch*).
4. Faça o push do seu código para a branch `main`:
   ```bash
   git add .
   git commit -m "feat: setup automatic github pages deployment"
   git push origin main
   ```
5. Acompanhe a execução na aba **Actions** do seu repositório.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.
