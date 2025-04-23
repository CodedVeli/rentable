// List of major Canadian cities for autocomplete
export const canadianCities = [
  "Toronto",
  "Montreal",
  "Vancouver",
  "Calgary",
  "Edmonton",
  "Ottawa",
  "Winnipeg",
  "Quebec City",
  "Hamilton",
  "Kitchener",
  "London",
  "Victoria",
  "Halifax",
  "Oshawa",
  "Windsor",
  "Saskatoon",
  "Regina",
  "St. John's",
  "Barrie",
  "Kelowna",
  "Abbotsford",
  "Kingston",
  "Milton",
  "Mississauga",
  "Brampton",
  "Richmond Hill",
  "Markham",
  "Vaughan",
  "Oakville",
  "Burlington",
  "Sudbury",
  "Thunder Bay",
  "Sherbrooke",
  "Laval",
  "Gatineau",
  "Longueuil",
  "Burnaby",
  "Surrey",
  "Richmond",
  "Coquitlam",
  "Mississauga",
  "Scarborough",
  "North York",
  "Etobicoke",
  "Lethbridge",
  "Red Deer",
  "Niagara Falls",
  "St. Catharines",
  "Moncton",
  "Fredericton"
];

export function filterCities(searchTerm: string): string[] {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const lowerCaseTerm = searchTerm.toLowerCase();
  
  return canadianCities.filter(city => 
    city.toLowerCase().includes(lowerCaseTerm)
  ).sort((a, b) => {
    // Sort by whether the city starts with the search term
    if (a.toLowerCase().startsWith(lowerCaseTerm) && !b.toLowerCase().startsWith(lowerCaseTerm)) {
      return -1;
    }
    if (!a.toLowerCase().startsWith(lowerCaseTerm) && b.toLowerCase().startsWith(lowerCaseTerm)) {
      return 1;
    }
    // Then by alphabetical order
    return a.localeCompare(b);
  });
}