import type { CommandName } from "./commands";

export const TIMED_COMMANDS: Array<{ command: CommandName; weight: number }> = [
  { command: "emote", weight: 0.5 },
  { command: "quote", weight: 0.5 },
];
export const MIN_INTERVAL = 15 * 60 * 1000; // 15 minutes
export const MAX_INTERVAL = 45 * 60 * 1000; // 45 minutes

export const QUOTES = [
  `"And that's the bottom line, 'cause Stone Cold said so" StoneColdFuckYou`,
  `"Austin 3:16 says I just whipped your ass" CheersStoneCold`,
  `"Bah gawd, he is broken in half" GOODOLJR`,
  `"Everybody's got a price" MillionDollarManRich`,
  `"I am the best in the world at what I do" CMPunk`,
  `"I'm not a bad guy. I'm not a good guy. I'm THE guy" POOCH`,
  `"I'm the Ayatollah of Rock 'n' Rolla" ChrisJerichoHeadbang`,
  `"I'm the best there is, the best there was, and the best there ever will be" BretHart`,
  `"I'm the cream of the crop" CreamOfTheCrop`,
  `"If you smell what The Rock is cooking" shrock`,
  `"It's true, it's damn true" KurtAngle`,
  `"Just when they think they got the answers, I change the questions" JakeTheSnakeRobertsSmug`,
  `"Oh yeah" machoTasty`,
  `"Rest in peace" UndertakerLaugh`,
  `"Snap into a Slim Jim" SlimJim`,
  `"The numbers don't lie, and they spell disaster for you at Sacrifice" SteinerMath`,
  `"Welcome to the house of pain" henryAAA`,
  `"You sit there and you thump your Bible, and you say your prayers, and it didn't get you anywhere" StoneColdCaughtTrolling2`,
  `"You're a boy in a man's world, and I'm a man who loves to play with boys" Staring`,
  `🦶 SpiritEel`,
];

export const STEINERMATH =
  "SteinerMath You know they say that all men are created equal, but you look at me and you look at Samoa Joe and you can see that statement is not true. See, normally if you go one on one with another wrestler, you got a 50/50 chance of winning. But I'm a genetic freak and I'm not normal! So you got a 25%, AT BEST, at beat me. Then you add Kurt Angle to the mix, your chances of winning drastic go down. See the 3 way at Sacrifice, you got a 33 1/3 chance of winning, but I, I got a 66 and 2/3 chance";

export const JABRONIS =
  "Goodnight FEETAMANIACS and jabronie marks without a life that don't know it a work when you work a work and work yourself into a shoot,marks";
