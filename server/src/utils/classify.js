// The dataset only has a name, ingredients and nutrients.
// This file GUESSES three extra fields from the name/ingredients using simple keyword rules:
//   dietType  (Vegetarian / Vegan / Eggetarian / Non-Veg)
//   category  (Breakfast / Main / Staple / Snack / Side / Soup / Dessert / Beverage)
//   zone      (North Indian / South Indian / East Indian / West Indian / Continental / Street Food / Desserts)
//   meal      (Breakfast / Lunch / Snack) - shown on the recipe card
// These are estimates - mention that in the report (see "Limitations").

const NON_VEG = /\b(chicken|mutton|lamb|fish|prawns?|shrimps?|crab|keema|meat|meatballs?|salami|bacon|ham|sausages?|beef|pork|tuna|salmon|lobster|squid|bones?|gelatine?)\b/;
const EGG = /\beggs?\b/; // \b means "whole word", so "eggplant" and "eggless" do not match
const DAIRY = /\b(milk|curd|dahi|yogh?urt|paneer|ghee|butter|buttermilk|cheese|cream|khoa|khoya|mawa|chenna|condensed|custard|honey|whey)\b/;

export function getDietType(name, ingredientsText) {
  const text = `${name} ${ingredientsText}`.toLowerCase();
  if (NON_VEG.test(text)) return 'Non-Veg';
  if (EGG.test(text)) return 'Eggetarian';
  if (DAIRY.test(text)) return 'Vegetarian';
  return 'Vegan';
}

const SAVOURY_WORDS = /(cheese|potato|fish|spinach|meat|mushroom|shepherd|cottage)/;

export function getCategory(name) {
  const n = name.toLowerCase();

  if (/\b(soup|stock|consomme)\b/.test(n)) return 'Soup';
  if (/\b(chutney|raita|salad|coleslaw)\b/.test(n)) return 'Side';
  if (/\b(tea|coffee|lassi|milkshake|lemonade|punch|cooler|cocoa|egg nog|lem-o-gin|infused water|aam panna|hot chocolate|jal jeera|gingo|mintade|canjee|squash|sharbat|juice|smoothie|thandai|drink|doodh|kanji|sorbet)\b/.test(n)) return 'Beverage';

  // Savoury pies/tarts/souffles are snacks, not desserts
  if (/\b(pie|tart|souffle|patties)\b/.test(n) && SAVOURY_WORDS.test(n)) return 'Snack';

  if (/\b(kheer|halwa|ice cream|kulfi|burfi|ladoos?|cake|cheesecake|gateau|flan|choux|rasgulla|rasmalai|rajbogh|rabri|shrikhand|kesari bath|putharekulu|malpua|chhena poda|couscous dessert|sunday|sundae|pudding|pie|tart|mousse|souffle|pastry|cookies?|biscuit|jamun|mal pua|custard|phirni|shahi tukre|chikki|brittle|gunjia|ghujia|murki|rousse|puffs|eclairs|snowballs?|loaf|finger|cream|swiss roll|meringue|trifle|triffle|ginger bread|melting moments)\b/.test(n)) return 'Dessert';

  if (/\b(porridge|flakes|cornflakes|murmura|cheela|chilla|puffed|idli|dosa|uttapam|poha|upma|pancake|omelette|omlet|chiwda)\b/.test(n) || /\b(boiled|fried|poached|scrambled|baked) egg\b/.test(n)) return 'Breakfast';

  if (/\b(pakora|pakoda|samosa|cutlet|kebab|sandwich|burger|pizza|toast|roll|vada|vadas|bonda|mathri|kachori|patties|cheese balls|tikka|shaslik|khakhra|chaat|chips|sev|papdi|handvo|namkeen|fritters|straws|horns|aigrettes|bhel|orly|mixture|dhokla|murukku|namak paras|muthias|deviled egg|scotch egg|vegeterian scotch egg)\b/.test(n)) return 'Snack';

  if (/\b(chapati|roti|thepla|paratha|parantha|poori|naan|bhatura|rice|pulao|biryani|biriyani|khichdi|khichri|khitchdi)\b/.test(n)) return 'Staple';

  // Sauces, pickles, jams, masalas etc. are not meals: the meal planner ignores them
  if (/\b(sauce|pickle|achaar|achar|aachar|jam|jelly|marmalade|murabba|preserves|icing|frosting|dip|filling|powder|baghar|tadka|ketchup|puree|mayonnaise|dressing|candy|blend|premix|mix|paste|infant food|shishu|sajina|glace)\b|garam masala|chat masala|kashmiri masala|pav bhaji masala/.test(n)) return 'Other';

  return 'Main'; // dals, curries, sabzis, pasta, fish, chicken...
}

const WESTERN = /\b(sandwich|pasta|pie|tart|souffle|mousse|pizza|burger|cake|pastry|cookies?|pudding|lasagne|spaghetti|penne|fettuccine|minestrone|cornflakes|oatmeal|pancake|omelette|omlet|club|coleslaw|waldroff|hawain|russian|spanish|french|chowmein|chinese|noodle|eclairs|puffs|toast|scotch|shepherd|custard|mayonnaise|macroni|talaumein|english|biscuit|meringue|trifle|triffle|loaf|swiss|stock|consomme|quinoa|salad)\b/;
const SOUTH = /\b(idli|dosa|sambar|uttapam|avial|thoran|rasam|pulihora|puliyodharai|chitranna|upma|appam|pongal|bisi|perugu|thayir|daddojanam|kerala|chettinad|andhra|mysore)\b/;
const STREET = /\b(chaat|bhel|pav|pakora|pakoda|samosa|kachori|vada|vadas|tikki|panipuri|golgappa|sev|papdi|bonda|kathi|bhurji)\b/;
const EAST = /\b(bengali|bengal|macher|machher|mishti|posto|shukto|litti|chokha|bihari|odia|assamese|jhol|sandesh|luchi|kosha|khichdi|khichri|khitchdi)\b/;
const WEST = /\b(dhokla|thepla|poha|misal|goan|gujarati|handvo|khandvi|khakhra|undhiyu|baati|bhakri|shrikhand|puran poli|sabudana|sheera|chilla|cheela)\b/;

// Region shown on the Recipes filter chips. Default is North Indian (the biggest group in the data).
export function getZone(name, category) {
  const n = name.toLowerCase();
  if (category === 'Dessert') return 'Desserts';
  if (SOUTH.test(n)) return 'South Indian';
  if (WESTERN.test(n)) return 'Continental';
  if (STREET.test(n)) return 'Street Food';
  if (EAST.test(n)) return 'East Indian';
  if (WEST.test(n)) return 'West Indian';
  return 'North Indian';
}

// The UI shows Breakfast / Lunch / Dinner / Snack on each recipe.
export function getMeal(category) {
  if (category === 'Breakfast') return 'Breakfast';
  if (['Snack', 'Side', 'Soup', 'Dessert', 'Beverage'].includes(category)) return 'Snack';
  return 'Lunch';
}

export function classifyRecipe(name, ingredientsText) {
  const category = getCategory(name);
  return {
    dietType: getDietType(name, ingredientsText),
    category,
    zone: getZone(name, category),
    meal: getMeal(category),
  };
}
