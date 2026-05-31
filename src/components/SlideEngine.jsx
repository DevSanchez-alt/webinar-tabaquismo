import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SlideEngine = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const containerRef = useRef(null);

  // Touch state
  const touchStartRef = useRef({ x: 0, y: 0 });
  const mouseStartRef = useRef({ x: 0, y: 0 });
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleResize = () => {
      const BASE_WIDTH = 1920;
      const BASE_HEIGHT = 1080;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      
      const scaleX = portrait ? (window.innerHeight / BASE_WIDTH) : (window.innerWidth / BASE_WIDTH);
      const scaleY = portrait ? (window.innerWidth / BASE_HEIGHT) : (window.innerHeight / BASE_HEIGHT);
      setScale(Math.min(scaleX, scaleY));
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => prev === slides.length - 1 ? 0 : prev + 1);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const onTouchStart = (e) => {
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    
    // In portrait, presentation is rotated 90deg.
    // Visual X (slide horizontal) = Physical Y
    // Visual Y (slide vertical) = Physical X
    const slideDeltaX = isPortrait ? deltaY : deltaX;
    const slideDeltaY = isPortrait ? -deltaX : deltaY;

    // If swipe is mostly vertical, it's a scroll. Ignore slide change.
    if (Math.abs(slideDeltaY) > Math.abs(slideDeltaX)) {
      return;
    }

    if (Math.abs(slideDeltaX) > minSwipeDistance) {
      if (slideDeltaX < 0) {
        setCurrentSlide(p => p === slides.length - 1 ? 0 : p + 1); // Swipe left (visually)
      } else {
        setCurrentSlide(p => p === 0 ? slides.length - 1 : p - 1); // Swipe right (visually)
      }
    }
  };

  const onMouseDown = (e) => {
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (e) => {
    // If it was a drag (like scrolling), don't change slide
    const deltaX = Math.abs(e.clientX - mouseStartRef.current.x);
    const deltaY = Math.abs(e.clientY - mouseStartRef.current.y);
    if (deltaX > 10 || deltaY > 10) return;

    if (e.target.closest('a') || e.target.closest('button')) return;

    const clickPos = isPortrait ? e.clientY : e.clientX;
    const boundary = isPortrait ? window.innerHeight / 2 : window.innerWidth / 2;
    
    if (clickPos > boundary) {
      setCurrentSlide(p => p === slides.length - 1 ? 0 : p + 1);
    } else {
      setCurrentSlide(p => p === 0 ? slides.length - 1 : p - 1);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, scale: 0.96, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.04, y: -20 }
  };

  const FallbackSlide = () => <div className="text-4xl text-slate-400">Diapositiva en Construcción</div>;
  const CurrentSlideComponent = slides[currentSlide] || FallbackSlide;

  return (
    <div 
      className="fixed inset-0 overflow-hidden bg-slate-900 select-none flex items-center justify-center"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Explicitly Sized Layout Wrapper */}
      <div 
        style={{
          width: isPortrait ? `${1080 * scale}px` : `${1920 * scale}px`,
          height: isPortrait ? `${1920 * scale}px` : `${1080 * scale}px`,
          position: 'relative'
        }}
      >
        <div 
          ref={containerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: isPortrait ? `${1080 * scale}px` : 0,
            width: '1920px',
            height: '1080px',
            transform: `scale(${scale}) ${isPortrait ? 'rotate(90deg)' : ''}`,
            transformOrigin: 'top left',
            flexShrink: 0
          }}
          className="bg-slate-50 shadow-2xl overflow-hidden flex flex-col"
        >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-rose-50/30 pointer-events-none"></div>
        
        {/* Decorative Orbs for Glassmorphism Background */}
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none"></motion.div>
        <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-purple-400/20 blur-[150px] pointer-events-none"></motion.div>

        <div className="w-full h-full flex flex-col relative z-10">
          {/* Top Banner Global */}
          <div className="w-full h-[90px] bg-white/40 backdrop-blur-2xl border-b border-white/60 flex items-center px-16 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex-shrink-0">
            <h1 className="text-slate-800 text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)'}}>
              <span className="text-blue-700">Iniciativa Global de Salud</span> <span className="font-light opacity-30 mx-4">|</span> Día Mundial Sin Tabaco 2026
            </h1>
            <div className="ml-auto text-slate-500 font-medium text-xl tracking-wide">
              «Desenmascaremos su atractivo»
            </div>
          </div>
          
          {/* Main Slide Content Area */}
          <div className="flex-1 w-full relative pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full absolute top-0 left-0 p-8 md:p-16 pb-32 overflow-y-auto overflow-x-hidden pointer-events-auto scroll-smooth"
              >
                <CurrentSlideComponent />
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer Progress */}
          <div className="absolute bottom-8 left-16 right-16 flex justify-between items-center z-50 pointer-events-none">
            <span className="text-slate-400 font-medium text-xl tracking-wide">Directrices de la Organización Mundial de la Salud</span>
            <span className="text-slate-500 font-bold bg-white/70 backdrop-blur-xl px-8 py-3 rounded-full text-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/50">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
