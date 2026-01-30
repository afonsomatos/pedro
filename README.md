# Pedro - Telegram AI Debate Judge Bot

An AI-powered Telegram bot that judges debates in group chats, analyzing arguments, fact-checking claims, and identifying logical fallacies.

## Features

- **Message Tracking**: Automatically tracks recent messages in group chats
- **AI Analysis**: Uses Gemini 2.5 Pro to analyze debates
- **Fact Checking**: Flags questionable claims for verification
- **Fallacy Detection**: Identifies common logical fallacies
- **Multilingual**: Responds in the same language as the debate

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and introduction |
| `/help` | Show available commands |
| `/judge` | Analyze recent debate and provide verdict |
| `/judge @user` | Focus analysis on specific user's arguments |
| `/clear` | Clear message history for fresh debate |

## Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd pedro
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   - `TELEGRAM_BOT_TOKEN` - Get from [@BotFather](https://t.me/BotFather)
   - `OPENROUTER_API_KEY` - Get from [OpenRouter](https://openrouter.ai)

3. **Run the bot**
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

## Usage

1. Add the bot to your Telegram group
2. Have a debate with other members
3. Call `/judge` when you want Pedro's verdict
4. Use `/clear` to reset and start a new debate

## Tech Stack

- **Runtime**: Node.js with TypeScript (tsx)
- **Telegram**: grammY
- **AI**: Vercel AI SDK with OpenRouter (Gemini 2.5 Pro)

## License

MIT
