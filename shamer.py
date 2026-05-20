import random

SHAME_MESSAGES = {
    22: [
        "It's 10pm. You're not a night owl yet — just a suspicious evening pigeon. 🐦",
        "10pm check-in: your bed is starting to wonder if it did something wrong.",
        "Still working at 10pm? Your future self just sighed audibly.",
        "The responsible people closed their laptops an hour ago. Just thought you should know.",
        "10pm. Technically still dignified. For now. Enjoy it while it lasts.",
    ],
    23: [
        "11pm. Whatever this is, it will look the same tomorrow morning. I promise.",
        "Did you know 73% of 'quick tasks' started at 9pm are still going at 11pm? You're a statistic. 📊",
        "11pm check-in: are you okay? Blink twice if the laptop has you hostage.",
        "One hour to midnight. Is it worth it?\n\n(It's not worth it.)",
        "11pm. Your pillow has filed a missing persons report.",
    ],
    0: [
        "🚨 MIDNIGHT ALERT 🚨 You've officially entered the 'I'll regret this tomorrow' timezone.",
        "Cinderella went home at midnight. You are not Cinderella. You are significantly worse.",
        "Happy midnight! The earlier version of you (from 2 hours ago) would be devastated.",
        "It's midnight. Whatever decision you make right now — just... don't.",
        "You've crossed into midnight. There's no coming back from this, statistically speaking.",
    ],
    1: [
        "1am. Your future self just woke up, saw what you're doing, and went back to sleep in protest.",
        "Fun fact: no important decision has ever been made at 1am. Zero. In all of human history.",
        "1am. The raccoons outside are asleep. You are LOSING to raccoons.",
        "1am productivity is a myth invented by people who sell coffee. You've been deceived.",
        "It's 1am and your code quality is now running on vibes alone. Godspeed. 🫡",
    ],
    2: [
        "2AM. You absolute goblin. What is WRONG with you. Go to BED. 🛌",
        "At 2am, your bug-fixing is now a bug-generating service. Congratulations.",
        "2am? Your future self has stopped being disappointed and started building a case for emancipation.",
        "🦇 You have transcended night owl status. You are now a creature of the night. A cryptid.",
        "2am: the hour where 'just one more thing' becomes 'I have made a terrible mistake.'",
    ],
    3: [
        "3am. I'm legally required to ask: have you had water? Blinked? Remembered your own name?",
        "Fun fact: at 3am, 'just one more thing' takes approximately 4 more hours. It's science.",
        "It's 3am and I'm an app that tracks sleep deprivation. We're both making poor choices. We're the same.",
        "3am. Even I, a menu bar app, am tired on your behalf. Please. For both of us.",
        "At 3am, the gap between how good you think your work is and how good it actually is: infinite.",
    ],
    4: [
        "4am. At this point you're speedrunning tomorrow. Any% no sleep.",
        "It is 4 in the morning. I have run out of shame. I am simply watching. Concerned. Helpless.",
        "You have entered a realm beyond shame. Beyond judgment. Beyond circadian rhythm. You are eternal. You are exhausted.",
        "4am: the sun will be up in 2 hours. You could just... wait for it. Like a haunted person.",
        "4am. Your body has entered a hostage negotiation with your brain. I hope everyone makes it out okay.",
    ],
}


def get_shame_message(hour):
    """Return a random shame message for the given hour (0-23)."""
    if hour >= 22:
        key = hour  # 22 or 23
    elif hour in (0, 1, 2, 3):
        key = hour
    else:
        key = 4  # 4am and beyond, use the most extreme tier

    messages = SHAME_MESSAGES.get(key, SHAME_MESSAGES[4])
    return random.choice(messages)
