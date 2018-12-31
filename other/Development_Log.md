# Development Log

For internal development use only.

samson
## Bugs

---

## To Do

### MVP

- Get better backgrounds.
    - Pay attention to whether they need to be resized.
    - Make sure the backgrounds are compatible with the current code.

- Improve the Sidebar content
    - Rename things as needed.
    - Use CSS as needed.

- Consider turning all if-elseif-else statements in main.js file into switch statements to increase speed.

---

- Pure turn-by-turn fighting (done!)
    - Randomly generate one pokemon for both sides
        - Potentially scale to 6 when switch feature has been implemented

- Implement button-events (done!)
    - Tie the current js event listeners to their respective buttons
    - During encounters, make sure that the user can't spam buttons
        - Make sure buttons are disabled after a move has been selected
        - Make sure buttons are enabled once the move's code has finished executing

- Implement switch feature
    - Allows user to switch between pokemon
    - Figure out how switching works in terms of turn mechanics
        - Does the enemy get to attack?
        - Do you still get a move even after switching?

### UI

- Responsive design
    - See if we can enclose everything in a big container that can be set at three sizes
        - See project guidelines for exactly which three sizes (i.e. phone, tablet, computer)
        - Make everything enclosed scale by percentage
            - Rows and columns would need to be scaled by height