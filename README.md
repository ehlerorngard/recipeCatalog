<img width="480" alt="recipeCatalog" src="https://user-images.githubusercontent.com/34467850/60143916-5edcb080-9775-11e9-91d1-ba97d864d277.png">

## functionality
This single-page full-stack app displays recipes from a Postgres database in a jQuery UI.  Each recipe has a list of ingredients displayed as editable tokens along with an input for adding new tokens ([Tokenfield for Bootstrap](http://sliptree.github.io/bootstrap-tokenfield/#methods)).  <br/><br/>Both recipes and their associated ingredients may be Created, Retrieved, Updated, and Deleted via the Python/Django server.  

![recipecatalog1](https://user-images.githubusercontent.com/34467850/60204456-ba557f80-9803-11e9-80a2-1a30f1131e7a.gif)

<h3>Try out the app for yourself here: </h3>

[<h3>recipe catalog</h3>](https://www.ehlerorngard.com/apps/recipe-ingredient-catalog/index.html)<br/><br/>

## the build
This was something of a time drill.
The build from start to deployed took me in the neighborhood of three days.

### detours in the build
While most of the build was quite straightforward, there were a few detours elicited by the idiosyncrasies of bootstrap-tokenfield, as well as by personal choices, especially the choice to disallow creation of duplicate ingredients (which put quite a bit more validation and logic on the backend).

#### limitations of bootstrap-tokenfield
##### token attributes
Upon turning a token to an input in order to edit, the tokenizer shows the “value” attribute instead of the “label” (which it shows when it’s displayed as a token).  Because of this, the ingredient’s primary key could not be stored in one of those fields, so I added an “id” attribute to store that.  However, because the tokenizer effectively removes all attributes other than “value” and “label” when the token is edited, I had to first store the needed primary key value temporarily in another variable, then reset the “id” attribute after each edit (specifically with a primary key returned from the database, which could be either the same as before if that entry was updated or a new primary key because a new entry needed to be created in order to avoid altering the ingredients on other recipes). 

##### create vs. update
Existing tokens can be edited; but after an existing token is edited, it is the "createtoken" event hook that fires, exactly as for a newly created token.  So I needed to utilize the variable for temp storage of the ingredient's id in to determine whether a request was to be a POST or a PUT. 

#### design choices
In an attempt to more closely mimic what a similar production database of this sort would do, I decided against allowing the creation of duplicative ingredient names.  A new ingredient is only actually created when an ingredient by that name does not already exist in the database.  So on a PUT or POST request, more logic was required on the backend.  Further, so as not to produce the side effect of altering other recipes' ingredient lists, an ingredient may not be edited if it is included on any recipe other than the one in question.<br/>
If EITHER<br/>
* the desired new ingredient (name) already exists OR<br/>
* the old ingredient name is associated to other recipes (if request is an update)<br/>

simply make a new association (and shed the recipe's association to the old ingredient if this was an attempted UPDATE to an ingredient name).  
<br/>

If and only if all of the following are true<br/>
* the request is an attempted UPDATE<br/>
* the new ingredient name doesn't already exist<br/>
* the old ingredient name is not associated with any other recipes<br/>

may the ingredient's entry be truly updated.

### code excerpts

#### views.py
<img width="232" alt="ingredientView" src="https://user-images.githubusercontent.com/34467850/60207076-fbe92900-9809-11e9-91bd-4f26d3ec83f7.png">

<img width="805" alt="PUT2" src="https://user-images.githubusercontent.com/34467850/60207100-05729100-980a-11e9-8d0f-747d7505f392.png">

#### index.js
<img width="805" alt="tokens4" src="https://user-images.githubusercontent.com/34467850/60207882-cfcea780-980b-11e9-9a86-9c982784b8e0.png">

##### { requests }
<img width="760" alt="requests" src="https://user-images.githubusercontent.com/34467850/60207951-f68cde00-980b-11e9-8576-3c6582c34916.png">

## future development
Further development would include<br/>
* adding quantities for ingredients<br/>
* adding recipe instructions<br/>
* adding users who can have lists of saved (and created) recipes<br/>
* improving error handling<br/>


