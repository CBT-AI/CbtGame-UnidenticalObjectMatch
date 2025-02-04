import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableObject } from './DraggableObject';
import { useGameStore } from '../store/gameStore';
import { subLOs, reinforcements, getRandomItem, instructions } from '../data/gameData';
import { Star, MoveDown, Hand, ArrowRight } from 'lucide-react';
import { GameItem, GameState } from '../types/game';
import { ThreeConfetti } from './ThreeConfetti';

const CORRECT_ANSWERS_TO_ADVANCE = 5;

export const GameBoard: React.FC = () => {
  const { gameState, setGameState } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  
  const [objects, setObjects] = useState<{ name: string; display: string }[]>([]);
  const [droppedObjects, setDroppedObjects] = useState<{ name: string; display: string }[]>([]);
  const [targetObject, setTargetObject] = useState<{ name: string; display: string } | null>(null);
  
  const [showAlert, setShowAlert] = useState(false);
  const [showHandGuide, setShowHandGuide] = useState(false);
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });
  const [targetToDropAnimation, setTargetToDropAnimation] = useState({ x: 0, y: 0 });
  const [windowDimensions, setWindowDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  
  const [correctAnswersInLevel, setCorrectAnswersInLevel] = useState(0);
  
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const targetObjectRef = useRef<HTMLDivElement>(null);
  
  const scoreUpdateRef = useRef(false);

  useEffect(() => {
    setupRound();
  }, [gameState.currentSubLO, gameState.currentVariation]);

  useEffect(() => {
    setCorrectAnswersInLevel(0);
  }, [gameState.currentSubLO]);

  const updateHandPosition = () => {
    if (!targetObjectRef.current || !dropZoneRef.current) return;

    const targetRect = targetObjectRef.current.getBoundingClientRect();
    const dropRect = dropZoneRef.current.getBoundingClientRect();

    const targetCenterX = targetRect.left + (targetRect.width / 2);
    const targetCenterY = targetRect.top + (targetRect.height / 2);
    const dropCenterX = dropRect.left + (dropRect.width / 2);
    const dropCenterY = dropRect.top + (dropRect.height / 2);

    const newHandPosition = {
      x: targetRect.width / 2,
      y: targetRect.height / 2
    };

    const newTargetToDropAnimation = {
      x: dropCenterX - targetCenterX,
      y: dropCenterY - targetCenterY
    };

    console.log('Hand Position Update:', {
      targetRect: {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height
      },
      dropRect: {
        left: dropRect.left,
        top: dropRect.top,
        width: dropRect.width,
        height: dropRect.height
      },
      centers: {
        target: { x: targetCenterX, y: targetCenterY },
        drop: { x: dropCenterX, y: dropCenterY }
      },
      handPosition: newHandPosition,
      animation: newTargetToDropAnimation
    });

    setHandPosition(newHandPosition);
    setTargetToDropAnimation(newTargetToDropAnimation);
  };

  useEffect(() => {
    if (showHandGuide) {
      console.log('Updating hand position due to showHandGuide or objects change');
      const updateTimer = setTimeout(updateHandPosition, 100);
      return () => clearTimeout(updateTimer);
    }
  }, [showHandGuide, objects, droppedObjects]);

  useEffect(() => {
    if (showHandGuide && droppedObjects.length > 0) {
      console.log('Updating hand position after successful drop');
      const updateTimer = setTimeout(updateHandPosition, 500);
      return () => clearTimeout(updateTimer);
    }
  }, [droppedObjects]);

  useEffect(() => {
    if (gameState.currentSubLO === 0) {
      console.log('Initializing hand guide for first-time players');
      const showTimer = setTimeout(() => {
        setShowHandGuide(true);
        updateHandPosition();
      }, 1000);

      return () => clearTimeout(showTimer);
    } else {
      setShowHandGuide(false);
    }
  }, [gameState.currentSubLO]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      if (showHandGuide) {
        console.log('Updating hand position due to window resize');
        updateHandPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showHandGuide]);

  useEffect(() => {
    console.log('Hand guide visibility changed:', showHandGuide);
  }, [showHandGuide]);

  const setupRound = () => {
    const subLO = subLOs[gameState.currentSubLO];
    const targetItem = getRandomItem(subLO.items);
    const otherItems = subLO.items
      .filter(item => item !== targetItem)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    const displayName = gameState.currentVariation === 1 ? targetItem.name : targetItem.similar;
    
    setObjects([
      { name: targetItem.name, display: displayName },
      ...otherItems.map(item => ({
        name: item.name,
        display: gameState.currentVariation === 1 ? item.name : item.similar
      }))
    ].sort(() => Math.random() - 0.5));

    setTargetObject({ name: targetItem.name, display: displayName });
    setCurrentInstruction(`${getRandomItem(instructions)} ${targetItem.name}`);
    setGameState({ 
      currentTarget: targetItem.name,
      currentVariation: gameState.currentVariation 
    });
    setDroppedObjects([]);
    scoreUpdateRef.current = false;
  };

  const handleDragEnd = (item: string) => {
    if (scoreUpdateRef.current) return;
    
    const draggedObject = objects.find(obj => obj.name === item);
    if (draggedObject && draggedObject.name === gameState.currentTarget) {
      setDroppedObjects(prev => [...prev, draggedObject]);
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    scoreUpdateRef.current = true;
    setShowConfetti(true);
    const newCorrectAnswers = correctAnswersInLevel + 1;
    setCorrectAnswersInLevel(newCorrectAnswers);
    
    setGameState((prevState: GameState) => {
      const newState: Partial<GameState> = {
        score: prevState.score + 1
      };

      if (newCorrectAnswers >= CORRECT_ANSWERS_TO_ADVANCE) {
        const nextLevel = Math.min(prevState.currentSubLO + 1, subLOs.length - 1);
        if (nextLevel !== prevState.currentSubLO) {
          newState.currentSubLO = nextLevel;
          newState.currentVariation = 1;
          newState.stars = prevState.stars + 1;
        } else {
          newState.currentVariation = 2;
        }
      }

      return newState;
    });
    
    if (newCorrectAnswers >= CORRECT_ANSWERS_TO_ADVANCE) {
      setCorrectAnswersInLevel(0);
    }
    
    setTimeout(() => {
      setShowConfetti(false);
      setupRound();
    }, 2000);
  };

  const handleIncorrectAnswer = () => {
    setShowAlert(true);
    setGameState({
      consecutiveNoResponse: gameState.consecutiveNoResponse + 1,
    });

    setTimeout(() => {
      setShowAlert(false);
    }, 1500);

    if (gameState.consecutiveNoResponse >= 2) {
      setGameState({ isGameOver: true });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    handleDragEnd(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <ThreeConfetti active={showConfetti} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
              Learning Game - Level {gameState.currentSubLO + 1}
            </h1>
            <div className="text-sm text-gray-600">
              Progress: {correctAnswersInLevel}/{CORRECT_ANSWERS_TO_ADVANCE} correct answers
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {[...Array(gameState.stars)].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <p className="text-3xl text-center mb-8 text-gray-700 font-bold tracking-wide">
            {currentInstruction}
          </p>

          <div className="flex flex-col items-center space-y-8">
            <div className="w-full max-w-4xl mx-auto relative">
              <div className="flex items-center justify-center gap-8">
                <div className="flex-shrink-0">
                  {targetObject && (
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                      <p className="text-center text-lg font-semibold mb-2 text-blue-700">Match with:</p>
                      <DraggableObject
                        item={targetObject.display}
                        onDragEnd={() => {}}
                        isTarget={true}
                      />
                    </div>
                  )}
                </div>

                <ArrowRight className="w-8 h-8 text-blue-400" />

                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`
                    flex-grow border-4 border-dashed rounded-xl p-8
                    flex items-center justify-center flex-wrap gap-4
                    min-h-[200px] bg-blue-50
                    ${droppedObjects.length > 0 ? 'border-blue-500' : 'border-gray-300'}
                    transition-colors duration-300
                  `}
                >
                  <AnimatePresence mode="wait">
                    {droppedObjects.length > 0 ? (
                      <motion.div
                        key="dropped"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-wrap gap-4 justify-center"
                      >
                        {droppedObjects.map((obj, index) => (
                          <DraggableObject
                            key={index}
                            item={obj.display}
                            onDragEnd={() => {}}
                            isTarget={false}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-gray-500"
                      >
                        <MoveDown className="w-12 h-12 mx-auto mb-2 animate-bounce" />
                        <p className="text-2xl font-bold">Drop here!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {showAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4"
                  >
                    <div className="bg-white rounded-lg shadow-lg px-6 py-3 border-2 border-red-200">
                      <p className="text-2xl font-bold text-red-500">
                        Oops! Try again! 🎯
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-3 gap-8 justify-items-center w-full relative">
              {objects.map((item, index) => (
                <div 
                  key={index} 
                  className="relative"
                  ref={item.name === gameState.currentTarget ? targetObjectRef : null}
                >
                  <DraggableObject
                    item={item.display}
                    onDragEnd={() => handleDragEnd(item.name)}
                    isTarget={item.name === gameState.currentTarget}
                    isPulsating={gameState.currentVariation === 2}
                  />
                  {showHandGuide && item.name === gameState.currentTarget && (
                    <motion.div 
                      className="absolute z-50"
                      style={{
                        top: handPosition.y - 24,
                        left: handPosition.x - 24,
                      }}
                      animate={{
                        x: [0, targetToDropAnimation.x, 0],
                        y: [0, targetToDropAnimation.y, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 0.5
                      }}
                    >
                      <Hand className="w-12 h-12 text-blue-500 fill-blue-100" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};