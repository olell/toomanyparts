"""
Too Many Parts default content for database
"""

from tomapa.models.content.units import create_units
from tomapa.models.content.properties import create_property_templates
from tomapa.models.content.category import create_categories


def create_content():
    create_units()
    create_property_templates()
    create_categories()
