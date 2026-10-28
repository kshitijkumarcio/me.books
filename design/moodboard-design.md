in here, we have a 8 cells x 8 cells block, for a book each, and 2 cell space in between each block.
<!--  -->

books in wishlist will only have a 6x6 cell block, with 1 cell gap between each. number of books in wishlist are 40-50 books
<!--  -->

books in currently reading section can range from 2 to 9 books,
<!--  -->

books read and owned are about 50 books, so this is all the content we will have on the page.
<!--  -->

now, each block is relative and contains absolute elements that are designed to sit in absolute position inside that block. each blocks design is different for these elements, their size shape and placement.
<!--  -->

this does not include the "Current Reading" section, which is a separate thing on its own, and the book blocks then are a separate navigation.
<!--  -->

we will have 3 navigation zones, adjacent to each other, 1- current reads, 2- wishlist, 3- books.
<!--  -->

each navigation zone has a defined position (x & y) in the canvas, so the chapters button can help us go to each zone when selected.
<!--  -->

books data will be stored in books-index.ts file for now, until i hook up convex and a custom dashboard to update this /book-shelf page. 
<!--  -->

i will have design in between the block gaps, as well, so we cannot just have space-cell in the tailwind, we need a div in between the blocks to separate them
<!--  -->

i want all this code to be dynamic, i should not have to write each block separately, so we will probably just map array and inside them block with its modular and dynamic characteristics, 
<!--  -->

