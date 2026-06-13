import { render, screen, fireEvent } from '@testing-library/react'
import LanguageToggle from '../components/LanguageToggle'
import { LanguageProvider } from '../context/LanguageContext'

function Wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

test('shows DE by default', () => {
  render(<Wrapper><LanguageToggle /></Wrapper>)
  expect(screen.getByText('DE')).toBeInTheDocument()
})

test('shows EN after clicking', () => {
  render(<Wrapper><LanguageToggle /></Wrapper>)
  fireEvent.click(screen.getByText('DE'))
  expect(screen.getByText('EN')).toBeInTheDocument()
})
