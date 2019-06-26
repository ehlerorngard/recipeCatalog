<link href="https://fonts.googleapis.com/css?family=Poiret+One|Dawning+of+a+New+Day|Pacifico|Roboto:300,400,500|Montserrat:300i,400,700|Miss+Fajardose|Sacramento" rel="stylesheet"></link>

<span style="font-size: 3rem">a</span><span style="font-weight: 700; font-size: 5rem; line-height: 1.2"> recipe</span><span style="font-size: 4rem"> catalog</span>

## functionality
This single-page full-stack app displays recipes from a Postgres database in a jQuery UI.  Each recipe has a list of ingredients displayed as a list editable tokens along with an input for adding new tokens (bootstrap-tokenizer).  Both recipes and their associated ingredients may be read, created, updated, and deleted via the Python/Django server.  

### the project
This was something of a time drill.
The build start to finish took me a couple days (and change).

### build challenges
While most of the build was quite straightforward, there were a few detours elicited by the idiosyncracies of bootstrap-tokenizer, as well as by choices to put certain validation and logic in backend.  
