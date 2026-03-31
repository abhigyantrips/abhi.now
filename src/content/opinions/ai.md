---
title: AI
description: How I use (or don't use) AI and LLM-based tools in my day-to-day life.
---

<div class="max-w-3/4 mt-6 mx-auto text-(--color-text-muted)">
  <span><i>"The real danger is not that computers will begin to think like men, but that men will begin to think like computers."</i></span><br>
  <p class="text-right mt-0!"><b>&ndash; <a class="text-(--color-text-muted)! hover:text-(--color-bg)!" href="https://www.goodreads.com/quotes/235559-the-real-danger-is-not-that-computers-will-begin-to">Sydney J. Harris</a></b></p>
</div>

I'm grateful to be a part of what [Hank Green](https://www.youtube.com/@hankschannel/videos) would call the "medium-young generation". My one hobby throughout high school was coding, and I got _just_ good enough before **The Great AI Wave** that I can understand code without using LLMs as a crutch.

There's so much to think about when mentioning Artificial Intelligence; the environmental impact, the hype chain, the simultaneous bloat and dip in the job market, the race for the bubbled "token economy" and the sweet, _sweet_ promise of mass surveillance at the end of it all...

It becomes hard for me to focus on the positives of rapidly-generated, semi-coherent text when every week there's someone telling me that software engineering (and most jobs) will be dead in six months. I like the idea that I can plainly explain a problem statement in words and quickly receive something close to an answer. But I'm not willing to trade off my humanity for it.

The omnipresence and variety of AI usage can make it difficult to know whether the people you're talking to (or even the content you're consuming) comes from an authentic human or a token vending machine. That's why I've created this page in the footsteps of [Derek Sivers](https://sive.rs/ai) and [many other people on the Internet](https://slashai.page), to disclose how I use LLM-based tools in my day-to-day life.

## Writing

I'll never write with AI.

I see writing as one of the most raw forms of expression. It's a ritual, a form of organized thinking that pushes out abstract ideas into a physical form that can be consumed and visualized by other people. I love that the words I put onto paper (physical or digital) with my train of thought might mean something completely different to another person.

I don't write with a word limit. A junior of mine in college once called my writing "idiosyncratic", and I've held that as a compliment ever since. I'm kinda proud of my writing being so rambly that even LLMs find it hard to reproduce the amount of free spirit (or rather, free _time_) I'm writing with.

I come from a family of "hobbyist" poets -- my dad and _nannoo_ saving their _kavitas_ and _dohe_ in old notebooks and pieces of paper. They have not pursued these interests professionally, but it prides me to have family members in the pursuit of expression, just because they can. I want to honour that practice and continue embodying my thoughts in ink and pixels.

## Learning

Probably not. I'd be anxious about the confidence with which an LLM would give me the wrong answers. I would also hate receiving answers to my questions without putting in much effort.

I wouldn't call myself a chaotic/unorganized thinker, but I love the cascade of rabbit-holes that come with trying to learn something new. It can be exhausting -- and you definitely need to develop a sense of when the intricacy goes too far -- but that's the kind of exploration that leads to knowing [why Astro with Cloudflare gives weird errors after changing the config. file](https://github.com/withastro/astro/issues/15524), or [how you can auto-mount partitions in Arch Linux](https://computingforgeeks.com/how-to-auto-mount-usb-and-external-storage-devices-with-rw-in-arch-linux/), or [why Flutter gives a "hero error" on having mutiple Floating Action Buttons](https://stackoverflow.com/questions/49964192/flutter-exception-when-having-2-floatingactionbutton). The trivial details can sometimes save a project from coming to an abrupt halt.

If I was learning through an LLM instead, I'd never come face-to-face with a lot of this information. It's a level of abstraction that I don't _want_ to interface with. This answer might change if models start utilizing search grounding more effectively, but I'd like to limit my usage even then.

To summarize, if I make a mistake or say something incorrect during a conversation, I'll blame random users on the Internet rather than AI hallucinations. And if I know the exact solution to a very random problem you're facing, I'd thank the same random users on the Internet.

## Specifications

This is where the conversational nature of AI tools shines for me.

When building software, I've gotten into a habit of fleshing out the requirements and frameworks to be used fairly decently. This spans to both tiny side projects and extensive public/private applications. I've gotten good at asking questions about edge cases, but I still definitely miss the mark on some important clarifications sometimes.

I work through this by laying out the requirements of a project into a document -- this can include database schema, webpages discussed with stakeholders, authentication flows and access control, etc. Once completed, I provide this to a model (like Claude Sonnet/Opus) and prompt something like, "Ask me all possible questions you have regarding this specification."

One important part here is steering the LLM with some information about the "user intent". A bit of context on _why_ something is being built, _whom_ it's meant for, and _how_ we would like to implement it. That saves a lot of time in the finalization of a spec, since it helps avoid a lot of thinking loops or semi-advertisements you might receive from LLMs because of framework/platform popularity.

## Programming

This one is weird.

I started coding because I genuinely love building things, and software seemed like the best way to make something that could reach a lot of people. I like how I basically _type out_ building blocks -- one on top of the other -- and suddenly have something very cool. That definition of "suddenly" has now changed drastically.

I can get away with balancing AI use on my personal projects, but what makes it weird is that I also code for a living. Corporate timelines have sped up under the notion that LLM-based tools are highly efficient and accurate and can exponentially multiply your productivity, instantly. With the investment into agentic IDEs and third-party services, AI usage can become more of an obligation than a choice. The project timelines expect you to use it.

At the same time, there is an understanding that code generation won't be this cheap for long. We are already seeing headlines like [GitHub removing premium models from its Student Plan](https://github.com/orgs/community/discussions/189268), and [Anthropic clamping down on subscription usage with third-party services like OpenCode](https://x.com/thdxr/status/2034730036759339100). I don't want to lose my edge by depending on these tools completely, but I also want to leverage the subsidized cost of code generation to create tools that are important to me.

I don't know. I just wanna build things and have fun.

## Scripting

This, is the one thing I use LLMs for more than anything else.

There can be a lot of one-time transformations or short-term automations, which I either have to work out manually, or figure out the abstract logic (and third-party libraries) to create a script that can handle it for me.

I definitely don't trust LLMs to complete the actions themselves without hallucinating, but if I can figure out the core of the required changes and prompt for a script that carries it out, that solves a majority of my work. Another great thing about this is that you usually don't need reasoning models for this, and the generation (for smaller tasks) can be carried out on-device as well.

Some good practices here from my end include asking for a "dry run" flag -- to test out the actual processing part without the final actions to be taken -- and ask for global variables for basic config. options I can tweak myself without re-prompting. This, paired with some pretext on which third-party libraries were used and how safe they are, makes the scripting process much faster for me.

## Communication

No.

I don't use AI to re-phrase what I want to say, or write out my thoughts for me. I also don't appreciate it when _you_ try to mask your intention behind an LLM spewing corpo-speak at me. I'm here to listen to _you_ -- not a liason that can use nothing but the same three writing structures.

## Social Media

My usage of social media is limited to Instagram (as a photo-gallery/time-capsule) and LinkedIn (as a log of my professional life). I can say for sure that all content I've posted so far on both platforms is written by me, through and through.

I think there were a couple times I tried to write a LinkedIn post through an LLM. The text was well-structured, split into paragraphs, and read like a story. But everything about it just seemed a little _wrong_. What felt worse was copying the content and pasting it into LinkedIn to just click "Post". I kept asking myself, "On whose behalf am I taking this action?".

There are a lot of people that would argue, "If you built the project yourself, and gave in that context as a prompt, then it's technically coming from you! You're the one directing the LLM!". I believe this is the sort of mindset that leads down the road of handing over your words, then your work, and then your thoughts to the machine. What starts with a, "Why don't I just ask it to write my article?" then turns into, "Why can't it just implement this feature for me?" which, lastly, leads to, "This product is my brainchild because I told Claude to build a SaaS that is profitable."

But all that aside, my social media pages are my place to tell my own story. Those stories deserve better than to be distilled down to bullet points, which AI elaborates on with no context of the actual events that occured. Those stories deserve to be told by the person who experienced them.

---

At the end of it all, to me: AI is a tool, not a mask. I can ask LLMs to take up the brunt of a tedious task and be happy with it. I can ask them to act as an external opinion to fill out the gaps of my project specs. But I absolutely hate it when they speak on my behalf. I hate it even more when someone uses AI to hide true words behind tokens and em dashes.

I want to speak to you, learn about you, understand your gaps so I can fill in with my own strengths, and I want to expect the same from you. I want to hear _your_ stories -- the challenges you faced, the "stupid questions" you asked, the hours/days/months you spent looking for answers, the compromises you made, and the rewards you received.

I want to learn your dog's name. I want to know where you came from, and what you think about this city. I want to know why you hold the spoon that way, or why you like the color blue. I want to know what kind of _chai_ you like, and want to be shocked when you say you don't like _chai_ at all.

I want to learn so much, that I hold an image of you in my head. One that I recall when I find something that reminds me of you. I want that level of depth about my knowledge of a person, while not doing it for everyone because I'm naturally an introvert and have a social limit.

But that's okay, I guess. Humans are paradoxical that way. :)
