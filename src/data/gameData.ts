import { SubLO, Reinforcement } from '../types/game';

export const subLOs: SubLO[] = [
  {
    id: 1,
    name: 'Basic Objects',
    items: [
      { name: 'House', similar: 'House' },
      { name: 'Butterfly', similar: 'Bug' },
      { name: 'Flower', similar: 'Flower2' },
      { name: 'Fish', similar: 'Fish' },
      { name: 'Bird', similar: 'Bird' }
    ]
  },
  {
    id: 2,
    name: 'Nature & Play',
    items: [
      { name: 'Leaf', similar: 'Tree' },
      { name: 'Car', similar: 'Truck' },
      { name: 'Dog', similar: 'Cat' },
      { name: 'Ball', similar: 'CircleDot' },
      { name: 'Tree', similar: 'Leaf' }
    ]
  },
  {
    id: 3,
    name: 'Personal Items',
    items: [
      { name: 'Shoes', similar: 'Shoe' },
      { name: 'Hat', similar: 'Crown' },
      { name: 'Book', similar: 'BookOpen' },
      { name: 'Cupcakes', similar: 'Cake' },
      { name: 'Shirt', similar: 'Shirt' }
    ]
  },
  {
    id: 4,
    name: 'Mixed Objects',
    items: [
      { name: 'Apple', similar: 'Grape' },
      { name: 'Clock', similar: 'Timer' },
      { name: 'Bike', similar: 'Bicycle' },
      { name: 'Camel', similar: 'Horse' },
      { name: 'Train', similar: 'Truck' }
    ]
  },
  {
    id: 5,
    name: 'More Objects',
    items: [
      { name: 'Grapes', similar: 'Apple' },
      { name: 'Chair', similar: 'Armchair' },
      { name: 'Truck', similar: 'Car' },
      { name: 'Elephant', similar: 'GanttChart' },
      { name: 'Doll', similar: 'Baby' }
    ]
  }
];

export const reinforcements: Record<string, Reinforcement[]> = {
  set1: [
    { text: 'Well Done!', type: 'set1' },
    { text: 'Good Job!', type: 'set1' },
    { text: 'Amazing Work!', type: 'set1' },
    { text: 'Great!', type: 'set1' }
  ],
  set2: [
    { text: "That's right!", type: 'set2' },
    { text: 'Correct!', type: 'set2' }
  ]
};

export const instructions = [
  'Find',
  'Match the',
  'Put with'
];

export const exitMessages = [
  "Let's try again tomorrow!",
  "Let's try again later!",
  "Let's try again some other time!"
];

export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};