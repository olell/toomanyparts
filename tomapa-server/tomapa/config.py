import os

config_keys = [
    # Misc
    "SECRET_KEY",  # Flask Secret Key
    ## Database
    "DB_TYPE",  # Database type (one of sqlite, mysql, postgresql)
    # Keys for DB_TYPE mysql
    "DB_LOCATION",  # Database path
    # Keys for DB_TYPE mysql or postgresql
    "DB_HOST",
    "DB_PORT",
    "DB_DATABASE",
    "DB_USER",
    "DB_PASS",
]

for key in config_keys:
    exec(f"{key} = os.environ.get('{key}', None)")
