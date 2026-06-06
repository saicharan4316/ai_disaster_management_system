export const indiaStatesAndDistricts = {
  "Telangana": [
    "Hyderabad",
    "Warangal",
    "Karimnagar",
    "Nizamabad",
    "Khammam",
    "Nalgonda",
    "Mahabubnagar",
    "Rangareddy",
    "Medak",
    "Adilabad",
    "Suryapet",
    "Siddipet"
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Vellore",
    "Erode",
    "Thanjavur",
    "Kancheepuram",
    "Dharmapuri"
  ],
  "Karnataka": [
    "Bengaluru",
    "Mysuru",
    "Hubballi-Dharwad",
    "Mangaluru",
    "Belagavi",
    "Davanagere",
    "Ballari",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Kalaburagi"
  ],
  "Delhi": [
    "New Delhi",
    "Central Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
    "North East Delhi",
    "North West Delhi",
    "South East Delhi",
    "South West Delhi"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Tirupati",
    "Kurnool",
    "Kakinada",
    "Rajahmundry",
    "Kadapa",
    "Anantapur",
    "Eluru"
  ],
  "Maharashtra": [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Amravati",
    "Kolhapur",
    "Navi Mumbai"
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Ghaziabad",
    "Agra",
    "Varanasi",
    "Meerut",
    "Prayagraj",
    "Bareilly",
    "Aligarh",
    "Noida"
  ],
  "Kerala": [
    "Trivandrum",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Alappuzha",
    "Kannur",
    "Kottayam",
    "Palakkad",
    "Malappuram"
  ]
};

export const statesList = Object.keys(indiaStatesAndDistricts);

export const languageMapping = {
  "Tamil Nadu": { code: "ta", label: "Tamil" },
  "Telangana": { code: "te", label: "Telugu" },
  "Karnataka": { code: "kn", label: "Kannada" },
  "Delhi": { code: "hi", label: "Hindi" },
  "Andhra Pradesh": { code: "te", label: "Telugu" },
  "Maharashtra": { code: "hi", label: "Hindi" }, // Fallback to Hindi for this demo
  "Uttar Pradesh": { code: "hi", label: "Hindi" },
  "Kerala": { code: "en", label: "English" } // Fallback
};

export const getLanguageForState = (stateName) => {
  return languageMapping[stateName] || { code: "en", label: "English" };
};
