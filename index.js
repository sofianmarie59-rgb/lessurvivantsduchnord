const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const REWARD_CHANNEL_ID = '1439280162515718244';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const POINTS_FILE = 'points.json';
let points = {};
if (fs.existsSync(POINTS_FILE)) {
    points = JSON.parse(fs.readFileSync(POINTS_FILE));
}

function savePoints() {
    fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 4));
}

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.channel.id === REWARD_CHANNEL_ID &&
        message.content.includes('vient de voter pour le serveur')) {

        const match = message.content.match(/^"(.+)" vient de voter pour le serveur/);
        if (!match) return;

        const username = match[1];

        const guildUser = message.guild.members.cache.find(u => u.user.username === username);
        if (!guildUser) {
            message.channel.send(`Utilisateur ${username} introuvable.`);
            return;
        }

        const userId = guildUser.id;

        if (!points[userId]) points[userId] = 0;
        points[userId] += 5;

        savePoints();

        message.channel.send(`<@${userId}> a reçu 5 points ! Total: ${points[userId]} points 🎉`);
    }

    if (message.content === '!points') {
        const userId = message.author.id;
        const userPoints = points[userId] || 0;
        message.channel.send(`<@${userId}>, tu as ${userPoints} points.`);
    }
});

if (!process.env.TOKEN) {
    console.error("Erreur : TOKEN Discord manquant !");
    process.exit(1);
}

client.login(process.env.TOKEN);
