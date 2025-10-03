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

- **Library**: React useState (local state management)
- **Store Pattern**: Component-level state with potential future migration
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
│   ├── GameScreen.tsx       # Main game container & orchestration
│   ├── GameHeader.tsx           # Multiplier display (absolute positioned)
│   ├── TileGrid.tsx             # 4-column game area with touch handling
│   ├── Tile.tsx                 # Individual tile component (pooled)
│   ├── GameFooter.tsx           # Lives + progress display
│   ├── GameControls.tsx         # Start/pause/restart buttons
│   └── hooks/
│       ├── useGameState.ts      # Local state management hook
│       ├── useTilePool.ts       # Object pooling management
│       ├── useGameLoop.ts       # Animation frame loop
│       └── useTouchHandler.ts   # Touch event coordination
```

### Component Responsibilities

#### GameScreen (Main Container)

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
3. Setup local React state with game state
4. Replace Demo component with GameScreen

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

## Implementation Progress Log

### Session 1: Foundation & Core Gameplay (Current)

#### ✅ Completed: Navigation & Route Structure

- **Game Route**: Created `/game` route with proper Farcaster frame metadata
- **Navigation**: Added "Play Piano Tiles 🎹" button from home page using Next.js router
- **Layout Integration**: Game page uses existing SafeAreaContainer pattern

#### ✅ Completed: Core Game Architecture

**Component Structure**:

```typescript
// Single-file implementation for rapid prototyping
components/Game/GameScreen.tsx
├── TileRow interface with status tracking
├── Local state management (pre-Zustand)
├── Animation loop with requestAnimationFrame
└── Touch/click event handling
```

**Key Technical Implementation**:

- **TileRow Interface**: `{ id, y, activeColumn, status: 'pending'|'tapped'|'missed' }`
- **Game State**: Lives (3), Score (0), Status ('playing') - local useState
- **Layout Strategy**: CSS Grid 4 columns, 10vh header + 80vh game + 10vh footer

#### ✅ Completed: Movement System

**Animation Architecture**:

- **Speed**: 200px/second (3.2s viewport transit time)
- **Spawn Logic**: Seamless rows with zero gaps (`y: topMostTile.y - 80`)
- **Cleanup**: Auto-remove tiles past 700px Y position
- **Frame Rate**: 60fps via requestAnimationFrame with deltaTime calculations

**Critical Bug Fixed**: Empty array handling in tile spawning reduce function

#### ✅ Completed: Touch Interaction

**Precision Touch System**:

- **Event Delegation**: Single handler on game container for performance
- **Cross-Platform**: Unified TouchEvent/MouseEvent handling
- **Coordinate Mapping**: Screen coords → game grid (column 0-3, Y position)
- **Hit Detection**: Precise black tile validation with Y bounds checking
- **Visual Feedback**: Pending (black) → Tapped (blue) → Missed (red)

**Game Logic**:

- **Successful Tap**: +10 score, tile turns blue
- **Missed Tap**: -1 life on white space tap
- **Game Over**: Lives reach 0, status updates to 'gameOver'

#### 🎯 Current Working State

**Fully Functional Game**:

- Continuous tile flow with seamless rows
- Precise touch detection on black tiles only
- Real-time score/lives tracking
- Visual feedback system
- Cross-platform compatibility (mobile + desktop)

### Next Session Priorities

#### 🔄 State Management Enhancement

**Local State Optimization** (Medium Priority):

- Add auto-miss detection for tiles that pass untapped
- Implement proper game state validation
- Optimize re-renders with useMemo/useCallback

#### 🎨 Visual Polish & UX

**Enhanced Feedback**:

- Haptic integration using existing `components/Home/Haptics.tsx`
- Tile animations (flash, shrink, disappear effects)
- Game over modal with restart functionality
- Score progression indicators

#### ⚡ Performance Optimization

**Object Pooling Implementation**:

- Limit DOM nodes to 20-30 tile pool
- Tile recycling system for memory efficiency
- IntersectionObserver for viewport management
- Frame rate monitoring and optimization

#### 🎵 Audio Integration (Future)

**Sound System Architecture**:

- Background music integration
- Tap sound effects
- Beat-synchronized tile spawning
- Audio asset management strategy

### Technical Debt & Refactoring Notes

#### Code Organization

- **Single File**: Current implementation in one component for rapid prototyping
- **Future Split**: Move to modular architecture per original specification
- **Custom Hooks**: Extract game logic into reusable hooks

#### Performance Monitoring

- **Current**: Basic requestAnimationFrame loop
- **Needed**: FPS monitoring, memory tracking, performance metrics

#### State Architecture

- **Current**: Local React state 
- **Future**: Potential state management library if complexity increases
- **Optimization**: Focus on performance with current approach

### Session 2: Current Status (Using Local React State)

#### 🎯 Current Technical State

**Fully Functional React State Game**:

- Continuous seamless tile flow with 200px/s speed
- Precise touch detection with coordinate mapping
- Real-time scoring system (3 lives, game over detection)
- Cross-platform compatibility (mobile touch + desktop click)
- Single-file implementation for rapid development

### Next Session Priorities

#### 🎨 **Visual Polish & UX Enhancement**

- Game over modal with restart functionality
- Haptic feedback integration (`components/Home/Haptics.tsx`)
- Tile animations (flash, shrink, disappear effects)
- Score progression and achievement indicators

#### 🎵 **Audio System Integration**

**Atomic Implementation Tasks (Sequential)**:

**Phase 1: Basic Audio Foundation**
1. Add single audio file to `public/audio/` (test with any .mp3/.wav)
2. Create basic AudioManager class with `playNote()` method
3. Test audio playback with temporary button click
4. Connect audio playback to tile tap (`handleSuccessfulTap`)

**Phase 2: Sequential Notes System**
5. Add 7 audio files (C4.mp3, D4.mp3, E4.mp3, F4.mp3, G4.mp3, A4.mp3, B4.mp3)
6. Create note sequence array `['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']`
7. Add `noteIndex` state to track current position in sequence
8. Update `handleSuccessfulTap` to play sequential notes (arpeggio pattern)
9. Test complete arpeggio sequence with tile taps

**Phase 3: Audio Polish (Future)**
- Loop sequence when reaching end
- Add volume control
- Multiple instrument support (piano, guitar, synth)
- Note preloading for performance optimization
- Beat-synchronized tile spawning to replace random pattern

#### 🔧 **Advanced Game Features**

- Progressive difficulty with speed increases
- Combo system and score multipliers
- Persistent high score storage
- Game pause/resume functionality

---

*Implementation log updated after each session. Next session: Focus on visual polish and audio integration.*
