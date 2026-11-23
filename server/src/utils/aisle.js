// Guesses which supermarket aisle an ingredient belongs to, so the shopping list
// can be grouped (Produce, Dairy, Spices...). Simple keyword rules; checked in this order.
const RULES = [
  ['Pantry', /\b(oil|salt|sugar|jaggery|vinegar|tamarind|water|honey|sauce|ketchup|essence|baking|soda|eno|fruit salt|almonds?|cashews?|peanuts?|walnuts?|raisins?|dates?)\b/],
  ['Spices', /\b(powder|masala|turmeric|cumin|jeera|mustard seeds?|cardamom|cloves?|cinnamon|pepper|saffron|asafoetida|hing|ajwain|fenugreek seeds?|bay leaf|kashmiri|seeds?|dry chilli|red chilli)\b/],
  ['Protein', /\b(eggs?|chicken|mutton|lamb|fish|prawns?|shrimps?|crab|meat|keema|tofu|soya|soy|bacon|ham|sausages?|tuna|salmon)\b/],
  ['Dairy', /\b(milk|curd|dahi|yogh?urt|paneer|ghee|butter|buttermilk|cream|cheese|khoa|khoya|mawa|chenna)\b/],
  ['Grains & Pulses', /\b(dal|daal|rice|atta|flour|wheat|maida|besan|gram|rajma|chickpeas?|chana|moong|urad|toor|masoor|oats?|quinoa|poha|semolina|rava|suji|bread|pav|noodles?|pasta|macaroni|millet|ragi|jowar|bajra|sprouts?|lentils?|beans?|peas dried|batter|vermicelli)\b/],
  ['Produce', /\b(onions?|tomato(es)?|potato(es)?|spinach|palak|carrots?|cauliflower|peas|capsicum|cucumber|okra|bhindi|brinjal|eggplant|chill?i|ginger|garlic|lemon|lime|curry leaves|coriander|mint|cabbage|gourd|pumpkin|beetroot|radish|mushrooms?|leaves|lettuce|coconut|banana|apple|mango|orange|pineapple|papaya|fruit|vegetables?|drumstick|corn|tinda|turnip|methi)\b/],
];

export function guessAisle(name) {
  const n = String(name).toLowerCase();
  for (const [aisle, rx] of RULES) if (rx.test(n)) return aisle;
  return 'Pantry';
}
