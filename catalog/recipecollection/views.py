from django.shortcuts import render
from django.views import View
from django.core import serializers
from django.forms.models import model_to_dict
from django.http import HttpResponse, JsonResponse
from .models import Ingredient, Recipe   
from django.middleware.csrf import get_token

# Serve the static html:
def index(request):
	return render(request, 'index.html')

# Return a CSRF token:
def csrf(request):
	return JsonResponse({"csrftoken": get_token(request)})

# Convert ids to integers:
def toInt(val):
	try:
		num = int(val)
		return num
	except ValueError:
		return val

# In order to be able to directly access the request body,
# I need to decode it from the <WSGIobject>:
def parseReqBody(body):
	decoded_body = bytes.decode(body)
	print("decoded body", decoded_body)

	parsed_body = {}
	for x in decoded_body.split('&'):
		pair = x.split('=')
		key = pair[0]
		val = pair[1]
		parsed_body[key.replace("+", " ")] = toInt(val.replace("+", " "))

	return parsed_body

# model_to_dict parses the model one instance at a time;
# This method allows me to embed the entire related ingredient
# objects on each recipe (Django's ORM by default only returns the
# list of foreign keys for a Many-to-Many) for sending to the client
def parseRecipe(obj):
	recipe = model_to_dict(obj)
	recipe_ingredients = list(map(lambda x: model_to_dict(x), recipe['ingredients']))
	recipe['ingredients'] = recipe_ingredients
	return recipe

# The UI's bootstrap-tokenizer automatically saves special characters 
# (but only special characters) as UTF-8 hex, so in order for text that 
# includes special characters to display properly when loaded from the database, 
# the hexes need to be decoded either before going into into the database or after 
# being fetched from the database (I've chosen the former):
def deHex(string):
	decoded_string = ''
	string_list = list(string)
	match_index = 0
	print("stringlist",string_list)
	for i, val in enumerate(string_list, start=0):
		if val == '%' and i == match_index:
			hecks = string_list[i+1] + string_list[i+2]
			match_index = i+3
			if string_list[i+3] == '%':
				hecks += (string_list[i+4] + string_list[i+5])
				match_index = i+6
			print("hecks", hecks)
			decoded_string += bytes.fromhex(hecks).decode('utf-8')
		elif i == match_index:
			decoded_string += val
			match_index += 1
	print("deHex'd string", decoded_string)
	return decoded_string

# ===============
# INGREDIENT VIEW
# ===============
class IngredientView(View):
	def get(self, request, *args, **kwargs):
		ingredients = Ingredient.objects.all()
		response = serializers.serialize("json", ingredients)
		return HttpResponse(response)

	# Ingredients are only created if they do not already exist.
	def post(self, request, *args, **kwargs):
		body = parseReqBody(request.body)

		fresh_ingredient = Ingredient.objects.filter(name=deHex(body['name'])).first()
		receta = Recipe.objects.get(pk=body['recipe'])

		# Get data for existing ingredient:
		stale_ingredient = Ingredient.objects.get(pk=kwargs['id']) if kwargs else None
		old_name = model_to_dict(stale_ingredient)['name'] if stale_ingredient else None
		is_in_recipes = Recipe.objects.filter(ingredients__name=old_name).count() if old_name else 0

		# IF kwargs (i.e., if an "id" was included in the request)
		# AND the old name is not being used by any other recipes
		# AND the new name does not already exist
		if kwargs and is_in_recipes == 1 and not fresh_ingredient:
			stale_ingredient.name = deHex(body['name'])
			stale_ingredient.save()
			ing = stale_ingredient

		# Criteria for an update of the entry were not met; 
		# at the least a new association will need to be made,
		# and a new ingredient will be created if an ingredient 
		# by the name in question does not already exist.
		else:
			# If a previous association exists, remove it:
			if stale_ingredient:
				receta.ingredients.remove(stale_ingredient)

			# If the new ingredient doesn't yet exist, create a new ingredient:
			if not fresh_ingredient:
				fresh_ingredient = Ingredient(name=deHex(body['name']))
				fresh_ingredient.save()

			# Update the recipe to include the ingredient 
			# (whether it's a new ingredient or not): 
			receta.ingredients.add(fresh_ingredient)
			ing = fresh_ingredient

		updated_ingredient_list = parseRecipe(receta)['ingredients']
		print('updated ingredient list:', updated_ingredient_list)

		return JsonResponse({"id": model_to_dict(ing)['id']}, safe=False)

	# Ingredients are only created if they do not already exist
	# and thereby the same ingredient can be related to more than one recipe;
	# therefore, editing an ingredient name for a given primary key would alter that ingredient
	# as included on ALL recipes.  So instead, I have elected to create a new 
	# ingredient if that ingredient is included on any other recipes 
	# (as long as the new ingredient also does not yet exist).
	def put(self, request, *args, **kwargs):
		body = parseReqBody(request.body)

		fresh_ingredient = Ingredient.objects.filter(name=deHex(body['name'])).first()
		receta = Recipe.objects.get(pk=body['recipe'])

		# Get data for existing ingredient:
		stale_ingredient = Ingredient.objects.get(pk=kwargs['id']) if kwargs else None
		old_name = model_to_dict(stale_ingredient)['name'] if stale_ingredient else None
		is_in_recipes = Recipe.objects.filter(ingredients__name=old_name).count() if old_name else 0

		# IF kwargs (i.e., if an "id" was included in the request)
		# AND the old name is not being used by any other recipes
		# AND the new name does not already exist
		if kwargs and is_in_recipes == 1 and not fresh_ingredient:
			stale_ingredient.name = deHex(body['name'])
			stale_ingredient.save()
			ing = stale_ingredient

		# Criteria for an update of the entry were not met; 
		# at the least a new association will need to be made,
		# and a new ingredient will be created if an ingredient 
		# by the name in question does not already exist.
		else:
			# If a previous association exists, remove it:
			if stale_ingredient:
				receta.ingredients.remove(stale_ingredient)

			# If the new ingredient doesn't yet exist, create a new ingredient:
			if not fresh_ingredient:
				fresh_ingredient = Ingredient(name=deHex(body['name']))
				fresh_ingredient.save()

			# Update the recipe to include the ingredient 
			# (whether it's a new ingredient or not): 
			receta.ingredients.add(fresh_ingredient)
			ing = fresh_ingredient

		updated_ingredient_list = parseRecipe(receta)['ingredients']
		print('updated ingredient list:', updated_ingredient_list)

		return JsonResponse({"id": model_to_dict(ing)['id']}, safe=False)

	def delete(self, request, *args, **kwargs):
		# Because in the simple use case of this recipe app there is no 
		# utility to actually deleting an ingredient entry from the database, 
		# this "delete" actually just removes its relationship from the indicated recipe.
		body = parseReqBody(request.body)
		if kwargs:
			ing = Ingredient.objects.get(pk=kwargs['id'])
			ress = Recipe.objects.get(pk=body['recipe'])
			ress.ingredients.remove(ing)
		return JsonResponse(parseRecipe(ress))

# ===========
# RECIPE VIEW
# ===========
class RecipeView(View):
	def get(self, request, *args, **kwargs):
		# Fetch all
		if not kwargs:
			recipes = Recipe.objects.all()

			recipe_list = []
			for each in recipes:
				recipe_list.append(parseRecipe(each)) 

			print(recipe_list)
			return JsonResponse(recipe_list, safe=False)
		# Fetch one by id
		else:
			obj = Recipe.objects.get(pk=kwargs['id'])
			response = parseRecipe(obj)

			print(response)
			return JsonResponse(response, safe=False)


	def post(self, request, *args, **kwargs):
		body = parseReqBody(request.body)

		ress = Recipe(name=deHex(body['name']))
		ress.save()
		print("new recipe saved:", ress)

		return JsonResponse(parseRecipe(ress), safe=False)

	def put(self, request, *args, **kwargs):
		body = parseReqBody(request.body)

		print("PUT body", body)

		ressipee = Recipe.objects.get(pk=kwargs['id'])
		ressipee.name = body['name']
		ressipee.save()
		print("updated recipe saved:", ressipee)

		return JsonResponse(parseRecipe(ressipee), safe=False)


	def delete(self, request, *args, **kwargs):
		rec = Recipe.objects.get(pk=kwargs['id'])
		rec.ingredients.set([])
		rec.delete()
		return JsonResponse({'status': 204})        