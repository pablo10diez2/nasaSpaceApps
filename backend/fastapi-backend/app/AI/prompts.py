import google.generativeai as genai

client = genai.Client(api_key="AIzaSyBEnFAkxKdIUstHhhN5Xn1dqM0bAB6Wc24")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="explica como se come una hamburguesa"
)
print(response.text)
