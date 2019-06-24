import os
import psycopg2

DEBUG = True

STATIC_ROOT = '/static/'
STATIC_URL = '/static/'

ALLOWED_HOSTS = ['localhost']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DATABASE_NAME', ''),
        'USER': os.environ.get('DATABASE_USER', ''),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', ''),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

CORS_ORIGIN_WHITELIST = ['localhost']

CSRF_TRUSTED_ORIGINS = ['localhost']


