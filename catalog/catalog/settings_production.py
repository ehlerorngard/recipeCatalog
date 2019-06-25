import os 
import psycopg2
import django_heroku

DEBUG = False


# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# STATIC_URL = '/static/'

# # Extra places for collectstatic to find static files.
# STATICFILES_DIRS = (
#     os.path.join(BASE_DIR, 'static'),

#     os.path.join(BASE_DIR, 'staticfiles'),
# )

# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# STATIC_TMP = os.path.join(BASE_DIR, 'static')

STATIC_URL = 'https://recipe-ingredient-catalog.herokuapp.com/static'

ALLOWED_HOSTS = ['recipe-ingredient-catalog.herokuapp.com']

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

CORS_ORIGIN_WHITELIST = ['https://ehlerorngard.com']

CSRF_TRUSTED_ORIGINS = ['ehlerorngard.com']

# Allow these headers on the request
CORS_ALLOW_HEADERS = [
    'accept',
    'access-control-request-headers',
    'access-control-request-method',
    'accept-encoding',
    'accept-language',
    'authorization',
    'connection',
    'content-type',
    'cookie',
    'dnt',
    'host',
    'origin',
    'referer',
    'server',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]