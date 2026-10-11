## Smooth Animation & Motion Guidelines — React Native

### Objective
Implement smooth, modern, and natural animations throughout the entire React Native application. Animations must improve user experience, provide clear visual feedback, and make the interface feel responsive and polished without negatively impacting performance.

### 1. Animation Library
- Use **React Native Reanimated** as the primary animation library when compatible with the project's React Native version and architecture.
- Use React Native Gesture Handler for gesture-driven interactions when needed.
- Use native React Native Animated APIs for simple animations when appropriate.
- If the project already has an animation library, evaluate and reuse the existing setup before introducing additional dependencies.
- Follow the official documentation and installation requirements for the project's Expo or React Native CLI environment.
- Do not introduce unnecessary animation libraries or duplicate dependencies.

### 2. Global Animation Requirements
Apply animations consistently across the application, including:

- Screen transitions and navigation.
- Page and section entrance animations.
- Cards, lists, and grid items.
- Buttons, icons, and interactive elements.
- Modals, dialogs, bottom sheets, and dropdowns.
- Tabs, segmented controls, and navigation menus.
- Loading indicators, skeleton screens, and progress indicators.
- Expandable sections, accordions, and collapsible content.
- Form validation, success messages, error messages, and toast notifications.
- Empty states and dynamically added or removed content.
- Pull-to-refresh, swipe gestures, and drag interactions where appropriate.

### 3. Animation Style
Use subtle, elegant, and natural motion. Animations should feel fluid rather than exaggerated.

- Prefer spring-based motion for interactive elements that benefit from natural movement.
- Use easing-based transitions for fades, screen transitions, and simple state changes.
- Use opacity and transform animations such as translate, scale, and rotation when appropriate.
- Use layout transitions when components change position or size.
- Apply staggered entrance animations to lists only when they improve visual hierarchy.
- Use small scale changes for button press feedback.
- Add subtle feedback when selecting tabs, toggling switches, expanding cards, or opening menus.
- Ensure entering and exiting animations are consistent.
- Avoid excessive bouncing, spinning, flashing, or decorative motion that distracts from the content.

### 4. Performance Optimization
Performance is a mandatory requirement.

- Keep animations smooth and responsive, targeting 60 FPS or higher where supported by the device.
- Prefer UI-thread or native-driven animation execution where supported by the chosen API.
- Avoid triggering unnecessary React re-renders during animation frames.
- Use shared animated values rather than repeatedly updating React state for frame-by-frame changes.
- Prefer opacity and transform animations over expensive layout recalculations.
- Avoid animating large shadows, blur effects, or complex properties continuously.
- Optimize FlatList and other long lists to prevent animation-related scrolling issues.
- Clean up animation callbacks, listeners, and resources when components unmount.
- Avoid running multiple unnecessary animations simultaneously.
- Test animations on real Android and iOS devices, including lower-end devices.

### 5. Duration and Motion Consistency
Establish consistent animation timing throughout the application:

- Micro-interactions: approximately 100–200 ms.
- Standard UI transitions: approximately 180–300 ms.
- Modal and bottom-sheet transitions: approximately 220–350 ms.
- Complex entrance sequences: approximately 300–500 ms when justified.

These values are guidelines, not rigid rules. Use spring-based animations when natural physical motion is more appropriate than a fixed duration.

Create reusable animation presets or shared utilities where beneficial. Avoid defining inconsistent animation values independently across every component.

### 6. Interaction Feedback
Every interactive element must provide appropriate feedback.

- Buttons should respond immediately to presses.
- Selected tabs and navigation items should transition smoothly.
- Modals should enter and exit without abrupt visual changes.
- Expandable content should animate naturally.
- Loading and submission states should communicate progress clearly.
- Success and error feedback should be noticeable without being intrusive.
- Prevent conflicting animations during rapid repeated interactions.
- Preserve touch responsiveness while animations are running.

### 7. Navigation and Screen Transitions
- Use appropriate transitions for stack navigation, tab navigation, and modal presentation.
- Keep navigation animations consistent with the application's design.
- Avoid unnecessary entrance animations when returning to a previously visited screen.
- Prevent animation conflicts during navigation, gestures, and screen unmounting.
- Ensure navigation remains responsive even when screens contain complex UI components.

### 8. Accessibility
- Respect the operating system's reduced-motion preferences where supported.
- Reduce or disable nonessential animations when reduced motion is enabled.
- Never rely exclusively on animation to communicate important information.
- Ensure animations do not interfere with screen readers, keyboard navigation, or touch targets.

### 9. Implementation Rules
- Inspect the existing project structure and dependencies before implementing animations.
- Identify reusable UI components and apply shared animation patterns consistently.
- Create reusable animation hooks, presets, or wrapper components when they reduce duplication.
- Keep animation logic separate from business logic where practical.
- Preserve existing functionality, application state, API integrations, navigation, and data flows.
- Do not rewrite unrelated components merely to introduce animations.
- Avoid adding animations to every element when they do not provide meaningful UX value.
- Do not use arbitrary delays that make the application feel slower.
- Ensure animations work correctly with dynamic content, loading states, and conditional rendering.
- Follow the project's existing TypeScript, linting, formatting, and component conventions.

### 10. Quality Assurance
Before considering the implementation complete:

- Verify all major screens and reusable components.
- Check entrance, exit, press, selection, and layout-change animations.
- Test rapid interactions and repeated navigation.
- Check for flickering, layout jumps, clipping, and inconsistent timing.
- Confirm scrolling and touch interactions remain responsive.
- Test on Android and iOS where supported by the project.
- Verify that animations do not introduce memory leaks or unnecessary renders.
- Confirm that reduced-motion preferences are respected.

### Expected Result
Deliver a polished React Native application with consistent, fluid, and purposeful animations throughout the user interface. Motion should feel natural, lightweight, and professional, similar to a well-designed production mobile application.

**Priority:** Performance, responsiveness, accessibility, and usability must always take precedence over decorative animation. Do not sacrifice application stability or functionality for visual effects.