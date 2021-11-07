# Conway's Battle Royale

### 2021 HackUMass Submission
## Hosted on Firebase https://conwaybattleroyale.web.app/
## [Video demo](https://www.youtube.com/watch?v=btU_ISUt0EY)

## Description as a Tweet:
Spaceships! Gliders! Oscillators! Inspired by Conway's Game of Life, players are pitted against each other to generate the longest lasting cellular automata. The player with the most cells at the end wins!

## Inspiration:
We wanted to start out with a clone of the Reddit April Fools experiment, r/place. We then pivoted to Conway's Game of Life because it was more feasible to make and derive off of. Furthermore, we were able to implement a fun 1v1 game out of it.

## What it does:
Our project is a strategy game that allows users to input a certain amount of pixels onto a grid and then simulate those pixels as cells in Conway's Game of Life. Each player has a specific color for their cell. At the end of the simulation, the player with the most of their color on the grid wins the game. We also implemented a single player sandbox mode of Conway's game of life for a player to test out strategies or just experience the game in its original form!

## How we built it:
We used JavaScript and Firebase for the game logic and backend, HTML5 and Canvas API for frontend, rendering, and animation. We also used Firebase, specifically its Realtime Database and hosting capabilities, to enable multiplayer functionality.

## Technologies we used:
- HTML/CSS
- Javascript
- Firebase Realtime Database and Hosting

## Challenges we ran into:
We had to build the logic of the game from the ground up, since there is no model for a multiplayer version of the Game of Life.

## Accomplishments we're proud of:
Making Canvas API work, integrating Firebase, generating game PINs.

## What we've learned:
We improved our knowledge of how to use Canvas API and learned how to create new logic to better suit a multiplayer game.

## What's next:
1) Making it a true battle royale by allowing more than two players to play a game
2) Improving the aesthetics of the game
3) Creating a more sophisticated landing page
4) Enabling user auth, adding leaderboards

## Built with:
- Visual Studio Code
- GitHub

## Prizes we're going for:
- Best Software Hack
- Best Web Hack
- Best Beginner Software Hack
- Best Use of Google Cloud
- Best Domain Name from Domain.com
- Best Space App
