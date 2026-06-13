import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Disable Framer Motion animations in tests — prevents opacity/transform hiding elements
vi.mock('framer-motion', () => {
  const passthrough = ({ children, initial, animate, exit, transition,
    drag, dragConstraints, dragElastic, onDragEnd, style, ...rest }) =>
    React.createElement('div', { style, ...rest }, children)

  return {
    motion: {
      div: passthrough,
      button: ({ children, initial, animate, exit, transition,
        drag, dragConstraints, dragElastic, onDragEnd, style, onClick, ...rest }) =>
        React.createElement('button', { style, onClick, ...rest }, children),
      span: ({ children, initial, animate, exit, transition, style, ...rest }) =>
        React.createElement('span', { style, ...rest }, children),
    },
    AnimatePresence: ({ children }) => children,
    useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
    useTransform: () => 0,
  }
})
