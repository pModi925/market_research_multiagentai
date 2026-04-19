# 🧠 AI Market Research Generator

> Transform any product idea into a comprehensive market research report — powered by a multi-agent AI pipeline.

<!-- 🔗 DEPLOYMENT URL — uncomment and replace after deploying -->
<!-- **🌐 Live Demo:** [https://your-deployed-url.onrender.com](https://your-deployed-url.onrender.com) -->

---

## ✨ What It Does

Enter a product or startup idea, and **5 specialized AI agents** collaborate to produce a full market research report covering:

| Agent | Role |
|-------|------|
| 📊 **Market Research Specialist** | Market size, growth trends, and technology adoption analysis |
| 🔍 **Competitive Intelligence Analyst** | Competitor mapping, SWOT analysis, and strategic gaps |
| 👥 **Customer Insights Researcher** | Customer personas, pain points, and acquisition channels |
| ⭐ **Product Strategy Advisor** | MVP features, differentiation, and product roadmap |
| 📋 **Business Analyst & Synthesizer** | Pricing strategy, revenue model, risk analysis, and go/no-go recommendation |

The agents run **sequentially** — each builds on the previous agent's output to create a deeply researched, coherent business report.

---

## 🖥️ Features

- **Modern Web UI** — Clean, responsive interface with dark/light mode toggle
- **Real-time Progress** — Watch each AI agent activate as the pipeline progresses
- **Report History** — Browse and revisit previously generated reports
- **Export Options** — Download reports as `.md` or `.pdf`, or copy to clipboard
- **Background Processing** — Reports generate asynchronously so the UI stays responsive

---

## 🚀 Getting Started

### Prerequisites

- **Python** >= 3.10, < 3.14
- **[uv](https://docs.astral.sh/uv/)** — Fast Python package manager
- API keys (see [Environment Variables](#-environment-variables))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pModi925/market_research_multiagentai.git
   cd market_research_multiagentai
   ```

2. **Install dependencies**
   ```bash
   pip install uv        # if you don't have uv yet
   uv sync               # installs all dependencies into .venv
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys (see below).

4. **Run the app**
   ```bash
   uv run python app.py
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following keys:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key (used by the AI agents) | ✅ |
| `SERPER_API_KEY` | [Serper.dev](https://serper.dev) API key for web search | ✅ |
| `MODEL` | LLM model name (e.g. `gpt-4o`, `gpt-4o-mini`) | ✅ |
| `GOOGLE_API_KEY` | Google AI API key (optional, if using Gemini models) | ❌ |

```env
MODEL=gpt-4o
SERPER_API_KEY=your_serper_key_here
OPENAI_API_KEY=your_openai_key_here
```

---

## 📁 Project Structure

```
market_research_crew/
├── app.py                          # Flask web server
├── pyproject.toml                  # Project config & dependencies
├── requirements.txt                # Pip-compatible dependencies
├── .env                            # API keys (not committed)
│
├── src/market_research_crew/
│   ├── crew.py                     # CrewAI agent & task definitions
│   ├── main.py                     # CLI entry point
│   └── config/
│       ├── agents.yaml             # Agent roles, goals, and backstories
│       └── tasks.yaml              # Task descriptions and expected outputs
│
├── templates/
│   └── index.html                  # Main web UI
├── static/
│   ├── css/style.css               # Styles (dark/light mode)
│   └── js/app.js                   # Frontend logic
│
├── report/                         # Generated reports saved here
│   └── history.json                # Report history metadata
└── knowledge/                      # Optional knowledge base files
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **AI Framework** | [CrewAI](https://crewai.com) — Multi-agent orchestration |
| **LLM** | OpenAI GPT models (configurable) |
| **Web Search** | [Serper.dev](https://serper.dev) API |
| **Backend** | Flask (Python) |
| **Frontend** | HTML, CSS, JavaScript |
| **Package Manager** | [uv](https://docs.astral.sh/uv/) |

---

## 📦 Deployment

This app is deployment-ready for platforms like **Render**, **Railway**, or **Heroku**.

<!-- ✅ After deploying, uncomment and update the line below -->
<!-- **🌐 Live URL:** [https://your-deployed-url.onrender.com](https://your-deployed-url.onrender.com) -->

### Deploy to Render

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the **Start Command**:
   ```bash
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 600
   ```
   > **Note:** The `--timeout 600` flag is important because CrewAI report generation can take several minutes per request.
5. Add your environment variables in the Render dashboard:
   - `OPENAI_API_KEY`
   - `SERPER_API_KEY`
   - `MODEL`
6. Deploy 🚀

> **Why gunicorn?** Flask is a WSGI application, so it requires a WSGI-compatible production server like [gunicorn](https://gunicorn.org/). Uvicorn is for ASGI frameworks (FastAPI, Starlette) and won't work with Flask.

---

## 📝 Usage

1. Open the app in your browser
2. Type or paste your **product/startup idea** in the text box
3. Click **"Generate Report"**
4. Watch the 5 AI agents process your idea in real-time (~3-8 minutes)
5. View, copy, or download the finished report

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ♥ using <a href="https://flask.palletsprojects.com/">Flask</a> & <a href="https://crewai.com">CrewAI</a>
</p>
