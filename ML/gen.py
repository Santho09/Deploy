import google.generativeai as genai

genai.configure(api_key="AIzaSyCWrdgnNJEIEyrWA1QBwFQqh2YBglXQipE")

models = genai.list_models()
for model in models:
    print(model.name, "-", model.supported_generation_methods)
