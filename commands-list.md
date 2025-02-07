# JCC Bot Commands

Here's a list of all available commands for JCC Bot:

## General Commands

```txt
$commands
```

Shows this list of commands.

```txt
$emote
```

Displays a random emote from the channel.

```txt
$quote
```

Shares a random quote from a wrestler.

```txt
$steinermath
```

Provides a helpful math lesson.

```txt
$goodnight
```

Sends a goodnight message to the jabroni marks.

## Points System

```txt
$claim
```

Claim your initial points. Can only be used once per user.

```txt
$points
```

Check your current point balance.

```txt
$gamble <amount | percentage | all>
```

Gamble your points. Use a number for a specific amount, or add '%' for a percentage of your total points. Use 'all' to gamble all your points.
Example: $gamble 100 or $gamble 50% or $gamble all

```txt
$give username <amount | percentage | all>
```

Give points to another user. Specify the recipient's username and the amount to give.
Example: $give UserName 100 or $give UserName 50%

## Trivia

```txt
$trivia
```

Starts a new trivia question. There's a cooldown between questions.

```txt
$a number
```

Answer the current trivia question. Use the number corresponding to your chosen answer.
Example: $a 2

## Mod-Only Commands

```txt
$setpoints <username> <amount>
```

Set a user's points to a specific amount. Can only be used by the channel owner.
Example: $setpoints UserName 1000

```txt
$updateemotes
```

Updates the list of channel emotes. Can only be used by moderators or the channel owner
