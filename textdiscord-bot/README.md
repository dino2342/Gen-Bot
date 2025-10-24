# Nori Script Discord Bot

Nori Script#4550 is a Discord bot for Roblox developers that generates and delivers obfuscated Pastefy-hosted loader scripts for the PVB system. The bot is built with [`discord.js` 14.14.1](https://discord.js.org/#/docs/discord.js/main/general/welcome) and is ready to run on [pella.app](https://pella.app/), a free Node.js hosting platform.

---

## Project Structure

```
textdiscord-bot/
├── .env                   # Environment variables (fill in before running)
├── README.md              # This guide
├── commands/
│   └── genPvb.js          # /gen pvb slash command implementation
├── config/
│   └── botConfig.json     # Discord intents configuration
├── core/
│   ├── main.js            # Bot bootstrap and dynamic loader
│   └── utils/
│       └── prometheus.js  # Local Prometheus-inspired obfuscator
├── handlers/
│   ├── interaction.js     # Slash command dispatcher
│   └── ready.js           # Ready event + slash command registration
└── package.json           # Dependencies and Node.js runtime version

package.json (root)        # Wrapper that installs the bot and proxies npm start
index.js                   # Allows `node .` to run the bot from the repo root
```

---

## Prerequisites

1. **Discord application** with a bot user created in the [Discord Developer Portal](https://discord.com/developers/applications).
2. **Discord bot token** with the `applications.commands` scope and permissions to send DMs.
3. (Optional) **Pastefy API key** if you prefer authenticated uploads. Anonymous uploads also work.
4. **Node.js 16.20.2 or newer** for local testing (pella.app already satisfies this requirement).

---

## Environment Variables

Copy `.env` (or rename it from the included template) and populate the following values:

| Variable | Description |
| --- | --- |
| `TOKEN` | Discord bot token. |
| `CLIENT_ID` | Application (client) ID from the Developer Portal. |
| `GUILD_ID` | *(Optional)* Guild ID for instant slash-command registration during testing. Leave blank for global-only deployment. |
| `DEPLOY` | Set to `true` on first run to register slash commands. Switch back to `false` once commands are registered globally. |
| `PASTEFY_API_KEY` | *(Optional)* Bearer token for Pastefy uploads. Leave blank for anonymous uploads. |

> **Tip:** Never commit secrets. The included `.env` contains placeholder values only.

---

## Local Setup & Testing

1. **Install dependencies** (only required locally – pella.app installs automatically):
   ```bash
   npm install
   ```

2. **Run the bot locally**:
   ```bash
   npm start
   ```

3. **Invite the bot** to your Discord server using an OAuth2 URL that includes the scopes `bot` and `applications.commands`.

4. **Test the slash command** in your server:
   ```
   /gen pvb usernames:UserOne,UserTwo webhook:https://discord.com/api/webhooks/... mps:750000 dps:900000
   ```

5. **Expected behaviour**:
   - The bot immediately defers, logs each pipeline step, obfuscates the script, uploads to Pastefy, and DMs you the raw link.
   - The channel receives: `PVB loader generated! Link sent to DMs. MPS: 750,000, DPS: 900,000`.
   - If DMs are blocked, the channel reply includes the Pastefy link.

6. **Example log sequence** (visible in your console or pella.app logs):
   ```
   [Startup] Loading environment variables
   [Startup] Loading commands from /workspace/textdiscord-bot/commands
   [Startup] Loaded command: gen
   [Startup] Logging into Discord
   [Ready] Logged in as Nori Script#4550
   [Ready] Registering global commands
   [Command] /gen pvb invoked by ExampleUser#0001 (1234567890)
   [Command] Deferred reply
   [Command] Sanitising usernames
   [Command] Building loader script
   [Command] Obfuscating script
   [Obfuscator] Starting obfuscation pipeline
   [Obfuscator] Variables renamed
   [Obfuscator] Numbers converted to hex
   [Obfuscator] Strings split
   [Obfuscator] Junk code inserted
   [Command] Uploading script to Pastefy
   [Command] Script uploaded to Pastefy at https://pastefy.app/abc123/raw
   [Command] Sending DM with loader link
   [Command] Interaction completed
   ```

---

## Deploying on pella.app

> The repository root now contains a small wrapper `package.json` that automatically installs and starts the bot located inside
> `textdiscord-bot/`. Deploying the whole repository (or extracting it directly on pella.app) will just work with `npm start`.

1. **Create a new project** on [pella.app](https://pella.app/) and upload the repository contents (you can zip the entire folder or
   clone directly).
2. **Configure environment variables** in the project dashboard:
   - `TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID` *(optional)*
   - `DEPLOY` → `true` on first boot to register commands, then `false` afterwards.
   - `PASTEFY_API_KEY` *(optional)*
3. **Set the start command** to:
   ```
   npm start
   ```
4. **Deploy**. pella.app automatically runs `npm install` using the locked versions from `package.json` and starts the bot.
5. **Monitor logs** within the pella.app dashboard to confirm successful login and command deployment.

> After commands propagate globally (up to 15 minutes), you can redeploy with `DEPLOY=false` to skip re-registering each boot.

---

## Troubleshooting

### Slash command does not appear
- Ensure `DEPLOY=true` and `CLIENT_ID` are set before the first launch.
- If you included `GUILD_ID`, commands should appear instantly in that guild. Without it, global propagation can take up to 15 minutes.
- Confirm the bot has the `applications.commands` scope when invited.

### "Application did not respond" error
- Check pella.app logs for crashes or missing permissions.
- Make sure the bot is online and that `TOKEN` is correct.
- Validate command inputs (especially the webhook URL). Invalid inputs are handled gracefully, but persistent failures can indicate malformed options.

### Pastefy upload failures
- Verify network access from your host to `https://pastefy.app/`.
- If anonymous uploads are rate-limited, generate an API token and set `PASTEFY_API_KEY`.
- Check logs for `[Command] Pastefy upload failed` details.

### No logs on pella.app
- Ensure you uploaded the entire project (including `core/main.js`).
- Confirm the start command is `npm start` and the working directory is the project root.
- Re-check environment variables – missing `TOKEN` or `CLIENT_ID` prevents startup.

### Command succeeds but no DM received
- Users may have DMs disabled. The bot automatically detects this and includes the Pastefy link in the channel reply instead.
- Verify that the bot shares a server with the user and that the user hasn’t blocked the bot.

---

## Safety & Compliance
- The generated loader script is intended for legitimate Roblox development workflows only.
- The obfuscator is inspired by Prometheus’ “Medium” preset and runs locally without external services.
- Avoid disclosing webhook URLs publicly; the bot only confirms success in-channel and reserves the raw Pastefy link for DMs when possible.

---

## License
This project is provided as-is for educational and development use by Roblox creators. Review Discord and Roblox platform guidelines to ensure compliance before deploying your bot.
