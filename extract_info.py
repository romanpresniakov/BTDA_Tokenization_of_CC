import pandas as pd

df = pd.read_csv("allprojects.csv")
df = df[["Name","Country/Area"]]
json_data = df.to_json(orient='records')
with open("projects.json","w") as f:
    f.write(json_data)

