import {Quote} from "./types";

const functions = require("firebase-functions");
const admin = require('firebase-admin');
import axios, {AxiosResponse} from "axios";

admin.initializeApp(functions.config().firebase);

const instance = axios.create({
    baseURL: 'https://sop-quotes-api.herokuapp.com/',
    timeout: 15000,
    headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
    }
});

//send daily push notification with london timezone at 12:40pm
exports.sendDailyPushNotification = functions.pubsub.schedule('45 6 * * *')
    .timeZone('Africa/Abidjan')
    .onRun(async () => {
        try {
            const quote = await getRandomQuote();
            const topic = 'DAILY_RANDOM_QUOTE_TOPIC'

            if (quote) {
                const payload = {
                    data: {
                        quoteId: quote.id.toString(),
                    },
                    notification: {
                        title: 'Citation Kophecy 📙',
                        body: `${quote.body} \nEllen G. White -  📖 ${quote.livre}`,
                    },
                    android: {
                        notification: {
                            // title: 'check this awesome image - Wallinice',
                            visibility: 'public'
                        },
                        priority: "high",
                    },
                    // Add APNS (Apple) config
                    apns: {
                        payload: {
                            aps: {
                                contentAvailable: true,
                            },
                        },
                        headers: {
                            "apns-push-type": "background",
                            "apns-priority": "5", // Must be `5` when `contentAvailable` is set to true.
                            "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
                        },
                    },
                    // topic: "RANDOM_WALLPAPER",
                    topic,
                };

                return admin.messaging().send(payload);
            }
        } catch (e) {
            console.log(`Error occured: ${e}`)
        }

    });

async function getRandomQuote(): Promise<Quote | null> {
    try {
        const response: AxiosResponse<Quote> = await instance.get<Quote>('quotes/random/');
        return response.data;
    } catch (error) {
        console.log(`Error occured when requesting api: ${error}`);
        return null;
    }
}
