import os 
import psycopg2

DEBUG = False

STATIC_ROOT = 'var/www/recipe-ingredient-catalog.herokuapp.com/static/'

ALLOWED_HOSTS = ['recipe-ingredient-catalog.herokuapp.com/']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
    }
}

# Connect to heroku's postgres database using a uri and psycopg2:
DATABASE_URL = os.environ.get('DATABASE_URL', '')

conn = psycopg2.connect(DATABASE_URL, sslmode='require')

# Use dj_database_url to decipher the DATABASE_URL into a format Django can read
import dj_database_url
DATABASES['default'] = dj_database_url.config(conn_max_age=600, ssl_require=True)

CORS_ORIGIN_WHITELIST = ['https://recipe-ingredient-catalog.herokuapp.com/']

CSRF_TRUSTED_ORIGINS = ['recipe-ingredient-catalog.herokuapp.com/']
