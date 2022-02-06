# Homepage
A landing page for your web browser with weather, news and todo list conveniently there!

## The vision
Imagine firing up your web browser and you're greeted with up to date wearther, news, and list of todos. That what I wanted to build.

## Technology stack
This project was built using NodeJS and ExpressJS. Views using EJS Templating. Sessions with Express-Session.

## The Journey
Build a homepage with weather, news, and todo list? Easy, right? Well yes, but actually no.
3 main components. Fetch data from API's. Store and access todos in DB. Idea works.

What seemed like a simple idea soon grew in complexity.
Fetching data from 2 seperate API's required a way to control how often they were consumed. Thus a user login system was implemented.
To make sure users are authenticated, express-session was a good fit.
To implement the limits to how often API's are called I needed to build a checking system and set parameters for how frequently news and then weather should be fetched. Needed to store those data fetches to make it work so implemented a crude cache which ended up just being storing in DB.

Now to display all this good data! After lots of tinkering and exploring, discovered EJS Templating. Implemented views system to handle this in order to more easily pass fetched data to EJS Templates. Filled out the rending design with CSS and voila, data made prettier.

Refactored routes using express router. Refactored fetching news and weather to middleware.

Still a work in progress. List of todos to get to MVP:
- Add testing: Unit, Integration, End to end
- Finish implementing todos
- Finish css styling
- various validations, refactoring
- Publish MVP version

Additional features in future:
- user Profile with app setting (photo, update details)
- options for weather (alerts, units, multiple locations)
- options for news (categories, sources, topics)
