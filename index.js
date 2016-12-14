/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});


const botAPI = controller.spawn({
  token: token,
  retry: 'Infinity'
})

var schedule = require('node-schedule');

var message_options = [
        "What did you do last weekend?",
        "What are you excited about today?",
        "What did you have for breakfast?",
        "What is your favorite food?",
        "What TV Shows are you watching right now?",
        "Add Extreme to a random activity, what are the rules to your new sport?",
        "Any vacations coming up?",
        "What was the first time you ever used a computer?",
        "What do you want to do after you retire?",
        "Any plans this weekend?",
        "Who is your favorite entertainer?",
        "Do you have any pets?",
        "What is your favorite fad?",
        "Who is your oldest friend? How did you meet them?",
        "If you could have any animal as a pet, what would you have?",
        "What is the most useful thing you own?",
        "What is the largest group of people you've ever spoken in front of?",
        "What is your favorite subreddit?",
        "What is your Every Day Carry?",
        "Outside of work, how much time do you spend on the internet per day?",
        "What's your favorite SFW joke?"
	];

var j = schedule.scheduleJob('9 * * * * ', function () {
                            
        var random_index = Math.floor(Math.random() * message_options.length);
        var chosen_message = message_options[random_index]
        
        botAPI.startRTM((err, bot, payload) => {  
  bot.say({text: chosen_message, channel:'C033UHJ0S'})
})
        
});
      


