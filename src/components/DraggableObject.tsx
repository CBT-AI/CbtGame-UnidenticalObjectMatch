import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Bug, Flower2, Fish, Bird, Leaf, Car, Dog, CircleDot, Trees as Tree, Shovel as Shoe, Cat as Hat, BookOpen, Cake, Shirt, Apple, Clock, Bike, Camera as Camel, Train, Grape, Armchair as Chair, Truck, GanttChart as Elephant, Baby } from 'lucide-react';

const iconMap: Record<string, React.ComponentType> = {
  House: Home,
  Butterfly: Bug,
  Flower: Flower2,
  Fish: Fish,
  Bird: Bird,
  Leaf: Leaf,
  Car: Car,
  Dog: Dog,
  Ball: CircleDot,
  Tree: Tree,
  Shoes: Shoe,
  Hat: Hat,
  Book: BookOpen,
  Cupcakes: Cake,
  Shirt: Shirt,
  Apple: Apple,
  Clock: Clock,
  Bike: Bike,
  Camel: Camel,
  Train: Train,
  Grapes: Grape,
  Chair: Chair,
  Truck: Truck,
  Elephant: Elephant,
  Doll: Baby
};

interface DraggableObjectProps {
  item: string;
  onDragEnd: (item: string) => void;
  isTarget?: boolean;
  isPulsating?: boolean;
}

export const DraggableObject: React.FC<DraggableObjectProps> = ({
  item,
  onDragEnd,
  isTarget,
  isPulsating,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const Icon = iconMap[item];

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(item);
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        cursor-grab active:cursor-grabbing
        p-4 rounded-lg shadow-lg bg-white
        ${isTarget ? 'border-4 border-blue-400 animate-[pulseBorder_2s_ease-in-out_infinite]' : ''}
        ${isPulsating ? 'animate-pulse' : ''}
        ${isDragging ? 'opacity-50 shadow-2xl ring-2 ring-blue-400' : ''}
        transition-all duration-200
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-24 h-24 flex items-center justify-center">
        {Icon && <Icon className="w-16 h-16 text-gray-700" strokeWidth={1.5} />}
      </div>
      <p className="text-center mt-2 font-medium text-gray-700">{item}</p>
    </motion.div>
  );
};