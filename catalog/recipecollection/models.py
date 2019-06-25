from django.db import models

class Ingredient(models.Model):
	name = models.CharField(max_length=56, null=True, blank=True)

	def _str_(self):
		return self.name

class Recipe(models.Model):
	name = models.CharField(max_length=72, null=True, blank=True)
	ingredients = models.ManyToManyField(Ingredient)

	def _str_(self):
		return self.name