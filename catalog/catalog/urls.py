from django.contrib import admin
from django.urls import path
from recipecollection import views

urlpatterns = [
    path('', views.index, name='index'),
    path('csrf/', views.csrf, name='csrf'),
    path('ingredients/', views.IngredientView.as_view(), name='ingredient'),
    path('ingredients/<int:id>/', views.IngredientView.as_view(), name='ingredient'),
    path('recipes/', views.RecipeView.as_view(), name='recipe'),
    path('recipes/<int:id>/', views.RecipeView.as_view(), name='recipe'),
]
