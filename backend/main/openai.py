from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.GPT_KEY)
