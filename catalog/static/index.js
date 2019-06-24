// Store the csrfToken once retrieved 
var csrfToken = ''

// ======================
// requests to the server
// ======================
var requests = {
	getToken: function() {
		let token;
		$.ajax({
			url: `/csrf/`,
			method: "GET",
		}).then(function(response) {
			csrfToken = response.csrftoken;
			return token;
		});
	},
	getRecipe: function(id) {
		$.ajax({
			url: `/recipes/${id}`,
			method: "GET",
		}).then(function(response) {
			console.log("getRecipe response: ", response);
		});
	},
	getRecipes: function() {
		$.ajax({
			url: `/recipes`,
			method: "GET",
		}).then(function(response) {
			console.log("getRecipe response: ", response);

			response.forEach(recipe => buildRecipe(recipe));
		});
	},
	createRecipe: function(data) {
		$.ajax({
			url: `/recipes/`,
			method: "POST",
			data: data,
			headers: {'X-CSRFToken': csrfToken},
		}).then(function(response) {
			console.log("create Recipe response: ", response);
			buildRecipe(response);
		});
	},
	updateRecipe: function(data, recipe_id) {
		console.log("about to update ", recipe_id, data)
		$.ajax({
			url: `/recipes/${recipe_id}/`,
			method: "PUT",
			data: data,
			headers: {'X-CSRFToken': csrfToken},
		}).then(function(response) {
			console.log("updateRecipe response: ", response);
			buildRecipe(response);
		});
	},
	removeRecipe: function(id) {
		$.ajax({
			url: `/recipes/${id}/`,
			method: "DELETE",
			headers: {'X-CSRFToken': csrfToken},
		}).then(function(response) {
			$(`#recipeRow${id}`).remove();
		});
	},
	getIngredients: function() {
		$.ajax({
			url: `/ingredients/`,
			method: "GET",
		}).then(function(response) {
			response = JSON.parse(response);
			console.log("getIngredients PARSEDresponse: ", response);

			formatIngredients(response);
		});
	},
	createIngredient: function(data) {
		return $.ajax({
			url: `/ingredients/`,
			method: "POST",
			data: data,
			headers: {'X-CSRFToken': csrfToken},
		});
	},
	updateIngredient: function(data, ingredient_id) {
		var appendix = ingredient_id !== null ? (ingredient_id + '/') : ''
		return $.ajax({
			url: '/ingredients/' + appendix,
			method: "PUT",
			data: data,
			headers: {'X-CSRFToken': csrfToken},
		});
	},
	removeIngredient: function(data, ingredient_id) {
		$.ajax({
			url: `/ingredients/${ingredient_id}/`,
			method: "DELETE",
			data: data,
			headers: {'X-CSRFToken': csrfToken},
		}).then(function(response) {
			console.log("DELETE", response);
		});
	},
}


// ===================
// accessory functions
// ===================
function formatIngredients(list) {
	var ingredientList = list.map(ingt => {
		return {value: ingt.name, label: ingt.name, id: ingt.id};
	});
	return ingredientList;
}

function displayInvalidToast(text, id) {
	if ($(`#validation_toast${id}`).length > 0) {
		$(`#validation_toast_text${id}`).empty();
		$(`#validation_toast_text${id}`).append(text);
		$(`#validation_toast${id}`).toast('show');
		setTimeout(function() {
			$(`#validation_toast${id}`).toast('hide');
		}, 5000);
	}
}

function displayIntroToast() {
	$('#intro_toast_text').append("<span style='font-weight: 700;'>Edit the ingredient list!</span>", 
		"<span style='display: block; height: 14px'></span>",
		"<span style='display: block'>All edits will automatically</span>", 
		"<span style='display: block'>save to the database.</span>");
	setTimeout(function() {
		$('#intro_toast').toast('show');
	}, 1500);
	setTimeout(function() {
		$('#intro_toast').toast('hide');
	}, 8000);
}

// =================
// build each recipe
// =================
function buildRecipe(recipe) {
	console.log("building recipe", recipe);

	var row = `
		<div class='recipeRow' id='recipeRow${recipe.id}'>
		</div>`;
	var contents = `				
		<div id='recipeContents${recipe.id}' class="recipeContents row m-1 my-md-3">
			<div id='recipeName${recipe.id}' class='col-12 col-md-4 col-lg-3 p-1 mx-0 mt-2 text-center recipeContents'>
				${recipe.name}
			</div>
			<div class='col p-1 pt-2 mx-0'>
				<input id='recipeInput${recipe.id}' placeholder='add ingredient'></input>
			</div>
		</div>`

	// If the recipe row already exists on the DOM, 
	// remove its contents and append the new:
	if ($(`#recipeRow${recipe.id}`).length > 0) {
		console.log("row already exists.....")
		$(`#recipeContents${recipe.id}`).remove();
	}
	// Otherwise append the new recipe row to the recipe list:
	else {
		$('#recipeBox').append(row);
	}
	// Append new contents:
	$(`#recipeRow${recipe.id}`).append(contents);

	// Build the tokenizer:
	buildTokenizer(recipe);
}


// ================================
// build the tokenizer for a recipe
// ================================
function buildTokenizer(recipe) {
	// Initialize the newly created (or updated) input as a tokenfield:
	$(`#recipeInput${recipe.id}`).tokenfield();
	$(`#recipeInput${recipe.id}`).tokenfield('setTokens', formatIngredients(recipe.ingredients));

	// bootstrap-tokenizer wipes out attributes other than "value" or "label" on edit;
	// use this variable to store that primary key value:
	let lastEditedTokenId = null;


	// -----------------
	// token event hooks
	// -----------------
	$(`#recipeInput${recipe.id}`)
		.on('tokenfield:createtoken', function(e) {
			// If a token about the be created is already included on 
			// this recipe, do allow its creation:
			var existingTokens = $(this).tokenfield('getTokens');
			$.each(existingTokens, function(index, token) {
				if (token.value === e.attrs.value)
					e.preventDefault();
			});
		})
		.on('tokenfield:createdtoken', function(e) {
			console.log("created token, all tokens:", $(`#recipeInput${recipe.id}`).tokenfield('getTokens'))
			// The server will handle whether to CREATE a new ingredient or 
			// UPDATE an existing ingredient (and recipe association)
			requests.updateIngredient({ name: e.attrs.label, recipe: recipe.id }, lastEditedTokenId)
				.then(function(response) {
					e.attrs.id = response.id;
				});

			// Reset the last edited token so that if it's null, the server will know
			// via the request parameters whether the request was an edit of an existing 
			// ingredient or an attempt to create a new ingredient:
			lastEditedTokenId = null;
		})
		.on('tokenfield:edittoken', function(e) {
			console.log("edit token: ", e.attrs.id);
			lastEditedTokenId = e.attrs.id;
			shouldReloadIngredients = true;
		})
		.on('tokenfield:editedtoken', function(e) {
			console.log("editedtoken: ", e.attrs);
		})
		.on('tokenfield:removetoken', function(e) {
			requests.removeIngredient({recipe: recipe.id}, e.attrs.id);
		});

	buildModal(recipe);
}


// ===========================
// build a recipe's edit modal
// ===========================
function buildModal(recipe) {
	var modal = `
		<div class="modal fade" id="editRecipeModal${recipe.id}" tabindex="-1" role="dialog"  aria-hidden="true">
    </div>`;
  var modalContents = `
		<div class="modal-dialog modal-dialog-centered" role="document" id="modalContents${recipe.id}">
		<div class="modal-content">
      <div role="alert" aria-live="assertive" aria-atomic="true" id="validation_toast${recipe.id}" class="toast"
      data-autohide="false" style="position: absolute; top: 0; right: 0; margin: 12px 20px 0 0; border: none; box-shadow: none;">
        <div class="toast-body">
          <span id="validation_toast_text${recipe.id}" style="color: orange; margin-right: 12px;"></span>
        </div>
      </div>
		  <div class="modal-header">
		    <h5 class="modal-title" id="exampleModalCenterTitle">edit recipe</h5>
		    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
		      <span aria-hidden="true">&times;</span>
		    </button>
		  </div>
		  <div class="modal-body edit_modal_body">
		    <div class="input-group mb-3">
		      <input type="text" id="edit_recipe_input${recipe.id}" class="form-control" placeholder="new recipe name" aria-label="new recipe name" aria-describedby="button-addon2">
		    </div>
		  </div>
		  <div class="modal-footer">
		    <button type="button" class="btn btn-secondary close_modal" data-dismiss="modal" tabindex="0">cancel</button>
		    <button type="button" class="btn btn-dark" id="delete_recipe_button${recipe.id}" data-dismiss="modal" tabindex="0">delete recipe</button>
		    <button type="button" class="btn btn-info" id="update_recipe_button${recipe.id}" tabindex="0">save recipe</button>
		  </div>
		</div>
		</div>`

  // If the modal for this recipe id already exists on the DOM, remove it
	if ($(`#editRecipeModal${recipe.id}`).length > 0) {
		console.log(" modal existss....");
		$(`#modalContents${recipe.id}`).remove();
	}
	else {
		// Append new modal to the DOM
	  $('#modal_box').append(modal);
	}

  $(`#editRecipeModal${recipe.id}`).append(modalContents);

  var closeAndEmptyModal = function(id) {
  	// close the modal
		$(`#editRecipeModal${id}`).modal('hide');

		// empty modal input text
		$(`#edit_recipe_input${id}`).val('');
  }

	// ====================================
	// EDIT / DELETE recipe event listeners
	// ====================================
	$(`#recipeName${recipe.id}`).click(function() {
		$(`#edit_recipe_input${recipe.id}`).val(recipe.name);
		$(`#editRecipeModal${recipe.id}`).modal('show');
	});

	$(`#update_recipe_button${recipe.id}`).click(function() {
		var recipe_name = $(`#edit_recipe_input${recipe.id}`).val();
		// Only save changes if it's a valid name:
		if (recipe_name.length > 1) {
			requests.updateRecipe({ name: recipe_name }, recipe.id);
			closeAndEmptyModal(recipe.id);
		}
		else {
			displayInvalidToast("Must be a valid recipe name", recipe.id);
		}
	});		

	$(`#delete_recipe_button${recipe.id}`).click(function() {
		requests.removeRecipe(recipe.id);
		closeAndEmptyModal(recipe.id);
	});
}

// =============================
// CREATE recipe event listeners
// =============================
$('#save_new_recipe_button').click(function() {
	var recipe_name = $('#new_recipe_input').val();
	console.log("recipe name to be saved", recipe_name);
	if (recipe_name.length > 1) {
		requests.createRecipe({ name: recipe_name });

		// close the modal
		$('#addRecipeModal').modal('hide');

		// empty modal input text
		$('#new_recipe_input').val('');
	}
	else {
		displayInvalidToast("The recipe must have a valid name", "");
	}
});

$('#addRecipeButton').click(function() {
	console.log("add recipe button firing");
	$('#addRecipeModal').modal('show');
});


// Add some box shadow on scroll of the recipe content:
$('#recipeBox').scroll(function() {
	$('#add_recipe_button_row').css("box-shadow", "0px -12px 8px -3px rgba(0,0,0,0.07)")
  clearTimeout($.data(this, 'scrollTimer'));
  $.data(this, 'scrollTimer', setTimeout(function() {
		$('#add_recipe_button_row').css("box-shadow", "none");
  }, 500));
})

// +++++++++++++++++++++++++++

$(document).ready(function() {
	csrfToken = requests.getToken();
	requests.getRecipes();
	displayIntroToast();
});