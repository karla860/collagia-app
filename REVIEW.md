# Review notes · Oct 19

Notes for Karla on the Oct 16 version, and what the Oct 19 version changes. Open both side by side:

- Oct 19: http://localhost:8765/?tour=1 (the tour walks through every change)
- Oct 16: http://localhost:8765/karla-oct15.html

## The main point

The brief isn't "lay out the same screen five ways". It's that Roo and Giorgi couldn't tell what a collection is, or what happens when you apply one. On the call they had to work out what "+1" meant themselves.

So the test for every screen is: after looking at it, do I know what this collection will do to my study? Moving the attribute selector from a sidebar to tabs to a top bar doesn't change that answer, so most of the options per flow end up as the same screen. Next time, one strong option per flow that answers that question beats five layouts.

## What's working, and stayed

- **The import preview marks.** − removed, ⇄ changed, + added, in black and grey only. That's exactly Giorgi's "too colourful" note fixed, and the Oct 19 apply preview builds on it
- **Impact summary first.** Counting removed, changed and added before the detail was right, and it's now the top of the preview
- **Roles explained** and **Requests & activity** in Share. Both kept in the Share dialog
- **Checkboxes only where you pick.** Keeping checkboxes for the create flow and not the review screen was a good call, Oct 19 goes further with it
- **The flow map.** Splitting by Figma flow made it easy to review against Giorgi's list of screens

## What didn't land

**Review a Collection**
- The rail is headed "Attributes" with a checkbox on every value, so it reads as a filter. Nothing says these are the tags this collection holds
- Products only show image, name and ID. The one thing missing is the tag each product gets, which is the whole point of the screen
- Tabs (option 3) is the same filter moved to the top. Small change, same problem
- Rail + preview (option 2) gives a big photo of one product. The feature is about attributes, not products, so the photo doesn't tell me anything new
- Use panel (option 4) frames reading a collection as step 1 of an import wizard. Opening a collection is mostly reading

**Data model**
- Each product carries one attribute and one value. In Collagia an attribute is a column and a value is a cell, so one shoe can be Franchise: Pegasus and Season: HO26 at the same time. A few screens only work because of this shortcut

**Import to a Study**
- The preview is good, but it's a separate page in an iframe, so it's hard to find and hard to walk the whole journey in one go
- None of the options say the big thing up front: applying replaces the study's version of each attribute. The real dry run on staging would have deleted 17 values
- Choosing a study doesn't show whether it shares any products with the collection. Christie's attributes on a shoes study match nothing

**Homepage cards**
- The cover is a screenshot of a board. A collection isn't a board, Roo asked for the cover to show what's inside

## What Oct 19 does instead

- **A working study board** on 320 real Nike shoes, close to the live app: matrices, tool keys, framing tool to make an attribute
- **"+" language everywhere.** Cards, the collection screen and the apply preview all show what gets added, as "+ Franchise: Phantom"
- **Colour per value.** Same colour on the rail, product chips and card dots, so a grid of 320 shoes reads at a glance
- **Collection rail is "Tags in this collection"**, a tree of attribute → values with counts and a share bar, one selection at a time
- **Four action buttons → one.** Apply to a study is the only big button, Share in the header, CSV and update moves behind ⋯
- **Preview leads with a sentence** that says add or replace, removals first
- **Settings page**, signed in as Roo

## For you to pick up next

1. Take the Oct 19 collection screen, apply preview and cards into Figma using the type styles and colours from the file
2. One option per flow in Figma, the rest archived
3. Design "Compare with a study": pick a study and each product shows what really changes there (+, ⇄, −)
4. Empty and edge states for the collection screen: no products match, products with no value, a value with one product

Open with Giorgi: does applying always replace same-named attributes, what does a version mean to a user, can Manage become Share.
