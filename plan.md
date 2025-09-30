# Piano Tiles Game - Technical Specification

## Overview
A Farcaster miniapp implementation of Piano Tiles, optimized for mobile gameplay with onchain rewards integration. The game features continuously rolling tiles that players must tap in sequence, with progressive difficulty and social sharing capabilities.

## Architecture Decisions

### 1. Viewport & Layout Strategy
- **Container**: Use existing `SafeAreaContainer` with viewport-relative units
- **Layout Distribution**: 
  - Header: 10% max viewport height (multiplier overlay)
  - Game Area: 80% viewport height (rolling tiles)
  - Footer: 10% max viewport height (lives + progress)
- **Responsive Strategy**: CSS Grid for tile columns, `calc(100vh - safe-area-insets)` for height
- **Farcaster Chrome**: ~100px top header accounted for via SafeAreaContainer margins

### 2. State Management Architecture
- **Library**: Zustand v5.0.8 (already installed)
- **Store Pattern**: Single centralized game store
- **State Structure**:
  ```typescript
  interface GameState {
    // Core game state
    gameStatus: 'idle' | 'playing' | 'paused' | 'gameOver'
    score: number
    lives: number
    progress: number // 0-100 percentage
    multiplier: number
    
    // Game mechanics
    gameSpeed: number
    activeTiles: Tile[]
    tileSequence: TilePattern[]
    
    // Actions
    startGame: () => void
    pauseGame: () => void
    resetGame: () => void
    updateScore: (points: number) => void
    decrementLives: () => void
    updateProgress: (percent: number) => void
  }
  ```

### 3. Rolling Mechanism & Performance
- **Animation Strategy**: CSS transforms (`translateY`) for 60fps performance
- **Object Pooling**: Maintain pool of 20-30 reusable tile components
- **Lifecycle Management**: IntersectionObserver for viewport entry/exit detection
- **Memory Optimization**: Tiles recycled when exiting bottom viewport
- **Movement Pattern**: Tiles move downward via requestAnimationFrame loop

### 4. Touch Interaction System
- **Event Strategy**: Single event delegation handler on game container
- **Precision Method**: Coordinate mapping to determine column + active tile
- **Touch Targets**: Minimum 44px height per Apple guidelines
- **Feedback**: Integrate existing Haptics component for tactile response
- **Tolerance**: 10px Y-axis margin for tap accuracy

## Component Architecture

### File Structure
```
components/
├── Game/
│   ├── PianoTilesGame.tsx       # Main game container & orchestration
│   ├── GameHeader.tsx           # Multiplier display (absolute positioned)
│   ├── TileGrid.tsx             # 4-column game area with touch handling
│   ├── Tile.tsx                 # Individual tile component (pooled)
│   ├── GameFooter.tsx           # Lives + progress display
│   ├── GameControls.tsx         # Start/pause/restart buttons
│   └── hooks/
│       ├── useGameState.ts      # Zustand store hook
│       ├── useTilePool.ts       # Object pooling management
│       ├── useGameLoop.ts       # Animation frame loop
│       └── useTouchHandler.ts   # Touch event coordination
```

### Component Responsibilities

#### PianoTilesGame (Main Container)
- Replace existing Demo component in app.tsx
- Orchestrate game lifecycle (start/pause/end)
- Provide game context to child components
- Handle overall layout and SafeAreaContainer integration

#### TileGrid (Game Area)
- CSS Grid: 4 equal columns, full game area height
- Single touch event handler with coordinate mapping
- Manage tile pool rendering and positioning
- IntersectionObserver setup for performance optimization

#### Tile (Atomic Component)
- Memoized component for performance
- CSS transform positioning (translateY)
- Visual states: active, tapped, missed
- Recycling-friendly (resetable properties)

#### GameHeader (Overlay)
- Position: absolute, top-0, left-0, z-index: 10
- Display: current multiplier
- Minimal UI footprint (single floating element)

#### GameFooter (Status Bar)
- Lives indicator (heart icons or numeric)
- Progress percentage (0-100%)
- Fixed height container with flex layout

## Performance Specifications

### Memory Management
- **DOM Node Limit**: Maximum 50 active elements
- **Tile Pool Size**: 20-30 tiles in constant rotation
- **Cleanup Strategy**: IntersectionObserver triggers immediate recycling

### Animation Performance
- **Target FPS**: 60fps via requestAnimationFrame
- **GPU Acceleration**: CSS transforms only (no layout thrashing)
- **Smooth Movement**: Linear interpolation for tile positions

### Touch Response
- **Touch Latency**: <50ms from touchstart to visual feedback
- **Event Optimization**: Single delegated handler, no event bubbling
- **Accuracy**: Column detection via coordinate division

## Game Mechanics

### Difficulty Progression
- **Initial Speed**: Slow tile descent (2-3 seconds viewport transit)
- **Speed Increase**: Every 10-20 successful taps
- **Lives System**: 3-5 lives, lose one per missed/wrong tap
- **Scoring**: Points per successful tap, multiplier bonuses

### Tile Generation
- **Pattern**: Pre-generated sequence for consistent gameplay
- **Spawning**: Tiles appear at top, one active tile per column at a time
- **Timing**: Rhythmic pattern matching (future audio sync point)

## Integration Points

### Farcaster Integration
- **User Context**: Leverage existing user data for personalization
- **Score Sharing**: Custom OG images via existing `/api/og` route
- **Social Features**: Leaderboards, achievements, challenges

### Future Expansion Areas
- **Audio System**: Background music + sound effects
- **Onchain Rewards**: Token distribution for high scores
- **Backend Services**: Score persistence, global leaderboards
- **Neynar API**: User verification, social graph features

## Development Phases

### Phase 1: Core UI Scaffold
1. Create basic component structure
2. Implement static layout (header/game/footer)
3. Setup Zustand store with initial state
4. Replace Demo component with PianoTilesGame

### Phase 2: Game Mechanics
1. Implement tile pool and recycling system
2. Add CSS transform-based movement
3. Create touch handling with coordinate mapping
4. Basic game loop (start/pause/restart)

### Phase 3: Polish & Performance
1. IntersectionObserver integration
2. Haptic feedback integration
3. Visual polish and animations
4. Performance testing and optimization

### Phase 4: Integration Features
1. Score sharing via Farcaster actions
2. User progress persistence
3. Custom OG image generation
4. Social features and leaderboards

## Technical Constraints

### Mobile Optimization
- **Viewport Support**: 320px - 430px width range
- **Touch Targets**: Minimum 44px tap areas
- **Performance**: 60fps on mid-range mobile devices
- **Battery**: Optimized for extended gameplay sessions

### Farcaster Miniapp Limitations
- **Container Size**: Restricted viewport within Farcaster app
- **Navigation**: No browser back/forward, contained experience
- **Performance**: Shared resources with host app

## Testing Strategy

### Performance Testing
- Chrome DevTools Performance profiling
- Memory usage monitoring (heap snapshots)
- Frame rate measurement during extended gameplay
- Touch latency testing across devices

### Gameplay Testing
- Touch accuracy across different screen sizes
- Game balance (difficulty progression)
- Edge cases (rapid tapping, multi-touch)
- Integration with existing Farcaster features

---

*This specification is subject to iteration as we learn and implement each component. Architecture decisions will be validated through prototyping and testing.*