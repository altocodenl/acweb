A year of working in silence!
# Our year of silence

It's May 2021. We just achieved a working version of tagaway and we’re planning the pre-launch. Both co-founders uploaded over 30,000 photos and videos to their own accounts and spent a couple of days using the product. We started <a href="https://altocode.nl/pic/" target="_blank">tagaway</a> not just to build a product, but also <a href="https://altocode.nl/blog/facilitator" target="_blank">to create a product that we ourselves want to use.</a> And so by then, it was time to give the product a real test from its first users: ourselves.

After successfully passing the acid test of uploading our entire personal collection of pictures and videos to tagaway, a new test emerged:

<p style = "font-style: italic;">“Can we have a good experience using tagaway, while organizing our pictures and videos?”.</p> We didn’t.

It was the harsh truth. The system worked fine, despite being slower than we wanted. The main problem was that it was outright overwhelming to organize tens of thousands of pictures and videos. They were all staring at your face, and it didn’t matter if you could easily find any picture you wanted: it was all -still- a very big mess.

<p style = "font-style: italic;">“Would we use this if we were not the builders?” - “No, we would not.”</p> 

Silence. 

How do we feel when we use tagaway? 

<p style = "font-style: italic;">“Anxious and overwhelmed: all the photos and videos are in a never-ending gallery, can’t figure out when something ends and the next thing starts. I don’t know what I’m seeing. And it’s somewhat slow.”</p>

So, what now? 

<p style = "font-style: italic;">“We need to rethink the product. If we don’t use it, why would anybody else use it?”</p> 

Over the next couple of months we redesigned most of the interface. The key for reducing overwhelm was to break down the huge gallery of pictures (affectionately known as the infinite scroll of doom) into meaningful chunks. <p style = "font-style: italic;">“Tell me which month I’m seeing. Tell me where I am. If I have too many pics, don’t show me a month with 600 pics, it's going to drive me crazy. Maybe break it down in pieces of no more than 20 or 30. Maybe 50.”</p>

Easier said than done, but eventually we got it working.

We also made the thumbnails bigger, in order to show less things more prominently on the screen. We also vastly improved the navigation capabilities of the app, by adding a “DeLorean bar” (inspired by the Back to the Future’s DeLorean time machine, which has a set of controls that allows the time traveler to easily navigate through time). And we also developed a way to ensure that no matter how deep you scrolled, the page would still load as fast as before.

There also was a lot of work that had to happen in the background. We rewrote the frontend code using the new version of <a href="https://github.com/fpereiro/gotob" target="_blank"> gotoB</a>, our frontend framework.

We also refactored the backend tests, which were somewhat slow and quite monolithic. It took so much longer than we expected (about 5 months, rather than 5 weeks), but it allowed us to regain speed when developing new features, as well as ensuring a higher level of quality in our application.

The mobile uploaders for <a href="https://apps.apple.com/gb/app/ac-pic/id6443709273?uo=2" target="_blank">iOS</a> and <a href="https://play.google.com/store/apps/details?id=com.altocode.acpic&hl=en_US&gl=US" target="_blank">Android</a> proved to be a challenge. From early design to shipment, they took a solid 15 months. But now you can upload your phone’s and tablet’s contents to tagaway. As of today, the iOS app does not allow uploading in the background, but we’re working on it. If you have Android, then all is good, you can set it and forget it:  

And that brings us almost to today. We spent a great part of 2022 implementing all the changes we designed during 2021. A new version of tagaway saw the light of day. It’s not yet where we would like it to be, but we’re happier with it as users. We are still working on making the experience less overwhelming and more enjoyable based on our experience with the product. Some people have used it and gave us their invaluable feedback as well. 

One thing is certain: if we weren’t users of our own product, we wouldn’t have any idea of what to do. Building something for ourselves keeps us centered and moving in the right direction. The hardest part was facing ourselves often enough and asking tough questions; once we did, the answers were forthcoming. We now feel that tagaway is good enough (and reliable enough) for others, so we will slowly but surely open it up to our beta users. 

After working silently for so long, it’s good to be back, sharing both our ideas and our product with you.
