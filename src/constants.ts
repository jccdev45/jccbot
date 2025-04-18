import type { CommandName } from "./types.js";

export const TIMED_COMMANDS: Array<{ command: CommandName; weight: number }> = [
  { command: "emote", weight: 0.7 },
  { command: "quote", weight: 0.5 },
  { command: "socials", weight: 0.1 },
];

export const SCOPES = ["user-read-currently-playing"];
export const SPOTIFY_REDIRECT_URI = "http://localhost:8888/callback";

// TRIVIA
export const INITIALPOINTS = 1000;

// SOCIALS
export const SITE = `https://jccdev.vercel.app`;
export const INSTA = `https://instagram.com/jccdev`;
export const TWITTER = `https://twitter.com/jccdev`;

// VARIOUS STRINGS
export const QUOTES = [
  `"And that's the bottom line, 'cause Stone Cold said so." StoneColdFuckYou`,
  `"BAH GAWD, HE IS BROKEN IN HALF!" GOODOLJR`,
  `"I am the best in the world, at what I do." CMPunk`,
  `"I'm not a bad guy. I'm not a good guy...I'm THE guy." POOCH`,
  `"I'm the Ayatollah of Rock 'n' Rolla!" ChrisJerichoHeadbang`,
  `"I'm the best there is, the best there was, and the best there ever will be." BretHart`,
  `"I'm the cream of the crop!" CreamOfTheCrop`,
  `"If you smell what The Rock is cooking!" shrock`,
  `"It's true, it's damn true!" KurtAngle`,
  `"Just when they think they got the answers, I change the questions..." JakeTheSnakeRobertsSmug`,
  `"Ooh yeah, dig it!" machoTasty`,
  `"Rest...in...peace." UndertakerLaugh`,
  `"Snap into a Slim Jim!" SlimJim`,
  `"The numbers don't lie, and they spell disaster for you at Sacrifice!" SteinerMath`,
  `"Welcome to the house of pain!" henryAAA`,
  `"Talk about your psalms, talk about John 3:16...Austin 3:16 says I just whipped your ass!" StoneColdCaughtTrolling2`,
  `"You're a boy in a man's world, and I'm a man who loves to play with boys!" Staring`,
  `🦶 SpiritEel`,
  `"Everybody's got a price for the Million Dollar Man!" MillionDollarManRich`,
  `"Say hello to the bad guy." KeyboardWarrior`,
  `"Know your role and shut your mouth!" wideSHUTUPBITCH`,
  `"Suck it!" SuckIt`,
  `"Yes! Yes! Yes!" YESYESYES`,
  `"Bonesaw is ready!" PLAYTIME`,
  `"Gimme a hell yeah!" CheersStoneCold`,
  `"You can't see me!" CenaCantSeeME`,
  `"I am the Game!" RAGE`,
  `"Just bring it!" RockHalt`,
  `"I'm the Heartbreak Kid!" SLORPBREAKKID`,
  `"Aww, have mercy!" DudeLove`,
  `"Have a nice day!" HaveANiceDay`,
  `"I lie, I cheat, I steal!" EddieShimmy2`,
  `"What?" StoneColdWHAT`,
  `"DAMN!" DAMN`,
  `"I'm better than you, and you know it!" MID`,
  `"Viva la raza!" EddieShimmy`,
  `"BANG BANG!" CactusJackArrive`,
];

export const STEINERMATH =
  "SteinerMath You know they say that all men are created equal, but you look at me and you look at Samoa Joe and you can see that statement is not true. See, normally if you go one on one with another wrestler, you got a 50/50 chance of winning. But I'm a genetic freak and I'm not normal! So you got a 25%, AT BEST, at beat me. Then you add Kurt Angle to the mix, your chances of winning drastic go down. See the 3 way at Sacrifice, you got a 33 1/3 chance of winning, but I, I got a 66 and 2/3 chance";

export const JABRONIS =
  "Goodnight FEETAMANIACS and jabronie marks without a life that don't know it a work when you work a work and work yourself into a shoot,marks";

// TIMERS
export const ANSWERTIMELIMIT = 60000; // 60 seconds
export const TRIVIA_COOLDOWN = 60000;
export const WARNINGTIME = 10000; // 10 seconds
export const MIN_INTERVAL = 15 * 60 * 1000; // 15 minutes
export const MAX_INTERVAL = 45 * 60 * 1000; // 45 minutes
