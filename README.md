# Discord Link Timeout & NLP Bot

A Discord bot that automatically moderates link sharing and provides NLP capabilities using Google's Gemini API.

## Features

- Automatic link detection and user timeout
- Natural Language Processing with Google Gemini API
- Multi-language support (English and Bulgarian)
- Configurable timeout durations
- User and role exemptions
- Slash commands interface

## Setup

1. Clone the repository
```bash
git clone https://github.com/ennersmai/discord_bot.git
cd discord_bot
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and fill in your credentials:
- Discord Bot Token
- Google Gemini API Key
- Supabase credentials (if using)

4. Start the bot
```bash
npm start
```

## Environment Variables

Create a `.env` file with the following variables:
```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DEFAULT_LANGUAGE=en
TIMEOUT_DURATION=300
```

## Commands

- `/help` - Display available commands
- `/set_channel` - Set link monitoring channel
- `/set_timeout` - Configure timeout duration
- `/exempt_user` - Exempt user from link timeout
- `/exempt_role` - Exempt role from link timeout
- `/ask` - Ask a question using NLP

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- GitHub: [@ennersmai](https://github.com/ennersmai) 