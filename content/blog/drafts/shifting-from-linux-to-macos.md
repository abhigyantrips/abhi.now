---
title: Shifting From Linux to macOS
description: Since I'm being semi-forced to use macOS for work, I'm going to rant about it here.
date: 2026-10-24
published: false
---

I got a call from IT yesterday that I had been dreading for weeks. "Your laptop is ready to be picked up," they told me. I slowly, begrudgingly made my way to the cubicle that had a huge stack of boxes -- white, with pristine black apples on them -- and was handed over my new MacBook with its MagSafe charger. With this, using macOS was now my inescapable fate.

I have heard Apple software being referred to as "a walled garden". Apple users have told me that -- once I get used to the software -- the experience is _great_. But I'm coming to this place from Arch Linux, literally the most malleable operating system _and_ its best[^1] distribution to exist.

I have spent years in an environment that was most logical to me and kept the OS out of the way. I have never had to think twice about how to move a window, where to look for it, or where my data is stored. But I have had to do _a lot_ of that in the last 24 hours. Even if this experience gets better in the future, and even if I'm wrong, I still want to put down all these frustrations somewhere.

So here we are. Let me tell you my likes, my dislikes, my tolerances, and my temporary fixes with my new MacBook.

## What I Like

1. **The Touchpad:** I remember when I started using a glass touchpad for the first time, and the smoothness felt revolutionary. I had a similar moment with the MacBook's trackpad. I love how easy it is to "click" on it, and how you can configure the heaviness of the click to be as much or as little as you want. I also like the "deep click", where each normal tap can be pressed harder to have a separate function.
2. **The Display:** They really don't mess around when they're talking about Retina or ProMotion or whatever the latest one is called. The colors _feel_ right. The sharpness is at a level where I never question the actual resolution of the display. It's great.
3. **The Dictionary:** It is through just messing around that I learned I can just "deep click" on a word _anywhere_ and the OS will try to open its definition from the dictionary. It is instant too. This is great because I oftentimes skip trying to understand a word while reading just because looking it up would be a pain. Having it just a click away makes me more likely to stop and learn.
4. **The Speakers:** Not something I will use that often on a work laptop, but wow. The sound stage created by mere laptop speakers is remarkable.
5. **The Gestures:** The touchpad gestures with multiple fingers make the experience feel kinda magical. Like how pinching up from the touchpad with three fingers and thumb opens the Applications Menu. Those interactions are quite well-tuned, and I appreciate it.

You might have noticed that most of these details relate to the hardware, not the software. Yeah...

## What I Dislike

Alright so, the top left of each window has three buttons, right? Forget that they are on the left instead of the right like every other operating system. Now, when I click on the red icon with an "X" on it, what would you expect to happen? The app would close, yes? THEN WHY DOES THE APPLICATION STILL STAY OPEN?

Even after I close an app, the top left area still says the app's name? And it still shows up in the list of apps when I do Alt+Tab? Scouring through some forums lets me know that this is intended behaviour and my laptop isn't hanging; I'm just supposed to press Cmd+Q from now on.

Oh by the way, I seem to have said Alt+Tab before. I'm sorry, but there's no Alt here. Who's Alt?

[image of the keys]

What in the mother of tarnation convinced these people that their buttons need to be _different_? The hell is the difference between Option, Command and Control? Also, there isn't a Delete key and they just call the Backspace key "Delete"? How do I delete text on the right side of my cursor? Some messing around shows me that it's now Fn+"Delete", that's good.

I'd seen tutorials and help articles that mentioned the Command key separately for Mac users when talking about shortcuts. But the placement of this key is _so_ munted. Every piece of muscle memory that has pressed Ctrl for all these actions now has to press "Alt" in my head.

I thought I would just fix this by making the Control key act as the Command key, but guess what? Some apps have taken it upon themselves as their sole responsibility to use Control for their shortcuts instead of Command. Which means I have to keep both keys around. There is no escape.

Oh nevermind, there's still an Escape key. Thank God.

[natural scrolling]

Alright, fine. I have finished up with the article, but there seems to be more content below. Let me scroll down... oh, it's scrolling up instead. I need to toggle natural scrolling. There, turned it on. Now let me use my mouse... wait, now _that's_ in the opposite direction? What?

Another quick search lets me know that the mouse and the touchpad cannot have separate natural scrolling configurations. I am left speechless and decide to ignore the stupidity.

Hmm, there seems to be a workaround. Someone has made a third-party utility I can install. Let me check if the source looks alright and download it. Ooh, the cutesy dialog of dragging the app icon into the Applications folder. There, all done. Now let me open it--

[internet dialog]

Oop, okay. Yeah no, I know what I'm doing. Just open the app.

Alright, gave it the accessibility permission because it won't work without it, and now my mouse is finally working as expected. I start installing all the apps I will need for work.

VSCode. "It's from the Internet, are you sure?" Yes, I am. Slack. "Whoa there, that's from the Internet. Be careful." Yes, I know. Firefox--

Guys, did Apple miss the memo? Have they not heard that every single app comes from the Internet? I thought they already knew! But someone has told me to install Homebrew, so I should hopefully not have to see that dialog again.
