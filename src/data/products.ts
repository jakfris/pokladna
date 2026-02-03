import { Product } from "@/types/pos";

export const mainProducts: Product[] = [
  { id: "1", name: "Káva", price: 45, category: "Nápoje" },
  { id: "2", name: "Čaj", price: 35, category: "Nápoje" },
  { id: "3", name: "Limonáda", price: 40, category: "Nápoje" },
  { id: "4", name: "Croissant", price: 55, category: "Pečivo" },
  { id: "5", name: "Sendvič", price: 85, category: "Jídlo" },
  { id: "6", name: "Salát", price: 95, category: "Jídlo" },
  { id: "7", name: "Zákusek", price: 65, category: "Dezerty" },
  { id: "8", name: "Zmrzlina", price: 50, category: "Dezerty" },
  { id: "9", name: "Voda", price: 25, category: "Nápoje" },
  { id: "10", name: "Džus", price: 45, category: "Nápoje" },
];

export const additionalProducts: Product[] = [
  { id: "11", name: "Espresso", price: 40, category: "Nápoje" },
  { id: "12", name: "Cappuccino", price: 55, category: "Nápoje" },
  { id: "13", name: "Latte", price: 60, category: "Nápoje" },
  { id: "14", name: "Horká čokoláda", price: 50, category: "Nápoje" },
  { id: "15", name: "Smoothie", price: 75, category: "Nápoje" },
  { id: "16", name: "Bageta", price: 75, category: "Jídlo" },
  { id: "17", name: "Panini", price: 90, category: "Jídlo" },
  { id: "18", name: "Polévka", price: 65, category: "Jídlo" },
  { id: "19", name: "Tiramisu", price: 80, category: "Dezerty" },
  { id: "20", name: "Cheesecake", price: 85, category: "Dezerty" },
  { id: "21", name: "Brownie", price: 60, category: "Dezerty" },
  { id: "22", name: "Muffin", price: 45, category: "Pečivo" },
  { id: "23", name: "Rohlík", price: 8, category: "Pečivo" },
  { id: "24", name: "Koláč", price: 35, category: "Pečivo" },
];

export const allProducts = [...mainProducts, ...additionalProducts];
