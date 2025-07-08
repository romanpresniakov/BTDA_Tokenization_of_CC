import json
import os

# All demo registry entries
registry = [
    {
        "registryProjectId": "VCS-1001",
        "projectName": "Amazon Rainforest Offset 2025",
        "location": "Brazil",
        "amount": 100,
        "retiredBy": "GreenCo Ltd.",
        "retiredDate": "2024-01-05"
    },
    {
        "registryProjectId": "VCS-1002",
        "projectName": "Mangrove Restoration Program",
        "location": "Indonesia",
        "amount": 200,
        "retiredBy": "EcoAction",
        "retiredDate": "2024-03-12"
    },
    {
        "registryProjectId": "VCS-1003",
        "projectName": "Wind Energy India",
        "location": "India",
        "amount": 50,
        "retiredBy": "WindNow",
        "retiredDate": "2024-04-18"
    },
    {
        "registryProjectId": "VCS-1004",
        "projectName": "Soil Carbon Capture Africa",
        "location": "Kenya",
        "amount": 80,
        "retiredBy": "AgroFuture",
        "retiredDate": "2024-05-07"
    },
    {
        "registryProjectId": "VCS-1005",
        "projectName": "Direct Air Capture Demo",
        "location": "Iceland",
        "amount": 30,
        "retiredBy": "ClimeTech",
        "retiredDate": "2024-02-15"
    },
    {
        "registryProjectId": "VCS-1006",
        "projectName": "Sustainable Forestry USA",
        "location": "United States",
        "amount": 120,
        "retiredBy": "ForestGuard",
        "retiredDate": "2024-01-29"
    },
    {
        "registryProjectId": "VCS-1007",
        "projectName": "Solar Energy for Schools",
        "location": "South Africa",
        "amount": 60,
        "retiredBy": "SunEd",
        "retiredDate": "2024-06-20"
    },
    {
        "registryProjectId": "VCS-1008",
        "projectName": "Rice Methane Reduction",
        "location": "Vietnam",
        "amount": 90,
        "retiredBy": "MethaneFree",
        "retiredDate": "2024-02-10"
    },
    {
        "registryProjectId": "VCS-1009",
        "projectName": "Geothermal Power Indonesia",
        "location": "Indonesia",
        "amount": 75,
        "retiredBy": "GeoPower",
        "retiredDate": "2024-04-22"
    },
    {
        "registryProjectId": "VCS-1010",
        "projectName": "Peatland Conservation",
        "location": "Finland",
        "amount": 40,
        "retiredBy": "PeatGuardians",
        "retiredDate": "2024-07-01"
    },
    {
        "registryProjectId": "VCS-1011",
        "projectName": "Coral Reef Blue Carbon",
        "location": "Australia",
        "amount": 55,
        "retiredBy": "OceanicOrg",
        "retiredDate": "2024-08-03"
    },
    {
        "registryProjectId": "VCS-1012",
        "projectName": "Urban Tree Planting",
        "location": "Berlin, Germany",
        "amount": 110,
        "retiredBy": "BerlinTrees",
        "retiredDate": "2024-03-16"
    },
    {
        "registryProjectId": "VCS-1013",
        "projectName": "Grassland Restoration",
        "location": "Argentina",
        "amount": 35,
        "retiredBy": "PampaRestore",
        "retiredDate": "2024-04-09"
    },
    {
        "registryProjectId": "VCS-1014",
        "projectName": "Congo Basin REDD+",
        "location": "DR Congo",
        "amount": 95,
        "retiredBy": "RainforestTrust",
        "retiredDate": "2024-02-27"
    },
    {
        "registryProjectId": "VCS-1015",
        "projectName": "Desert Wind Farm",
        "location": "Morocco",
        "amount": 150,
        "retiredBy": "WindAfrika",
        "retiredDate": "2024-06-02"
    },
    {
        "registryProjectId": "VCS-1016",
        "projectName": "Cookstove Emissions Reduction",
        "location": "Ghana",
        "amount": 85,
        "retiredBy": "CleanCooking",
        "retiredDate": "2024-03-25"
    },
    {
        "registryProjectId": "VCS-1017",
        "projectName": "Bamboo Afforestation China",
        "location": "China",
        "amount": 220,
        "retiredBy": "BambooEco",
        "retiredDate": "2024-05-11"
    },
    {
        "registryProjectId": "VCS-1018",
        "projectName": "Solar Mini-Grids Nigeria",
        "location": "Nigeria",
        "amount": 105,
        "retiredBy": "SolarAfrica",
        "retiredDate": "2024-01-30"
    },
    {
        "registryProjectId": "VCS-1019",
        "projectName": "Hydro Small Scale Himalaya",
        "location": "Nepal",
        "amount": 60,
        "retiredBy": "MountainHydro",
        "retiredDate": "2024-06-18"
    },
    {
        "registryProjectId": "VCS-1020",
        "projectName": "Salt Marsh Blue Carbon",
        "location": "UK",
        "amount": 50,
        "retiredBy": "BlueGreenUK",
        "retiredDate": "2024-02-12"
    },
    {
        "registryProjectId": "VCS-1021",
        "projectName": "Sahara Solar Power Offset",
        "location": "Morocco",
        "amount": 130,
        "retiredBy": "SolarSahara",
        "retiredDate": "2024-06-28"
    },
    {
        "registryProjectId": "VCS-1022",
        "projectName": "Tundra Peat Recovery",
        "location": "Canada",
        "amount": 70,
        "retiredBy": "TundraGuard",
        "retiredDate": "2024-03-20"
    },
    {
        "registryProjectId": "VCS-1023",
        "projectName": "African Biogas Project",
        "location": "Ethiopia",
        "amount": 44,
        "retiredBy": "BioFuture",
        "retiredDate": "2024-05-19"
    },
    {
        "registryProjectId": "VCS-1024",
        "projectName": "Wetland Protection Baltic",
        "location": "Estonia",
        "amount": 22,
        "retiredBy": "BalticWet",
        "retiredDate": "2024-07-09"
    }
]

# Make a folder for output
output_dir = "metadata_json"
os.makedirs(output_dir, exist_ok=True)

# Main loop for all files
for entry in registry:
    metadata = {
        "name": entry["projectName"],
        "description": f"Verified retirement of {entry['amount']} tons CO₂, supporting {entry['projectName']}.",
        "location": entry["location"],
        # Placeholder! Update this after you upload the image for each project to IPFS:
        "image": "ipfs://<REPLACE_WITH_IMAGE_CID>/<FILENAME>.jpg",
        "retiredBy": entry["retiredBy"],
        "retiredDate": entry["retiredDate"]
    }
    # Write JSON to file named after registryProjectId
    with open(os.path.join(output_dir, f"{entry['registryProjectId']}.json"), "w") as f:
        json.dump(metadata, f, indent=2)

print(f"Done! All files are in the {output_dir}/ folder.")
