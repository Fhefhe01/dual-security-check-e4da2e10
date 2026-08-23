Clean up the "Join the Cat Cult" community section in `src/routes/index.tsx`.

1. Remove the "Telegram Stickers" button from the community section (it duplicates the "Add Telegram Sticker Pack" button in the Meme Gallery).
2. Keep three buttons: "X (Twitter)", "Telegram Group", and "🎮 Play Kopicat Clicker".
3. Replace the current `flex flex-wrap justify-center` container with a responsive grid so the buttons sit evenly:
   - Mobile: single column, full-width buttons stacked cleanly.
   - Tablet/desktop: three equal columns in one row.
4. Add clearer visual separation between the social-button row and the contract-address block in the footer, using increased bottom padding on the community section and/or a subtle bottom border/divider so the section no longer feels cramped against the CA block.