// Use this array for comparison to validate 
var ingredientNamesList = [];
var ingredientList = [];
var csrfToken = ''

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
			console.log("getRecipes response: ", response);

			response.forEach(recipe => buildRecipe(recipe));
		});
	},
	updateRecipe: function(data, recipe_id) {
		$.ajax({
			url: `/recipes/${recipe_id}`,
			method: "PUT",
			data: data,
			headers: {'X-CSRFToken': csrfToken},
		}).then(function(response) {
			console.log("updateRecipe response: ", response);
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

function formatIngredients(list) {
	var ingredientList = list.map(ingt => {
		return {value: ingt.name, label: ingt.name, id: ingt.id};
	});
	console.log("formatted ingredientList:", ingredientList);
	return ingredientList;
}

function buildRecipe(recipe) {
	// Create a new html row for the recipe:
	var row = `
		<div class='recipeRow row m-1 my-md-3'>
			<div class='col-12 col-md-4 col-lg-3 p-1 mx-0 mt-2 text-center'>${recipe.name}</div>
			<div class='col p-1 pt-2 mx-0'>
				<input id='recipe${recipe.id}'></input>
			</div>
		</div>`;

	// Append the new recipe row to the recipe list:
	$('#recipeBox').append(row);

	const listOfIngredients = 

	// Initialize the newly created input as a tokenfield:
	$(`#recipe${recipe.id}`).tokenfield();
	$(`#recipe${recipe.id}`).tokenfield('setTokens', formatIngredients(recipe.ingredients));

	let tokens = $(`#recipe${recipe.id}`).tokenfield('getTokens');
	console.log("and the tokens are ", tokens);

	let lastEditedTokenId = null;

	$(`#recipe${recipe.id}`)
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
			console.log("created token, all tokens:", $(`#recipe${recipe.id}`).tokenfield('getTokens'))
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
		})
}



$(document).ready(function() {
	console.log("index.js is connected");
	csrfToken = requests.getToken();
	requests.getRecipes();
	// requests.getRecipe(2);
});
