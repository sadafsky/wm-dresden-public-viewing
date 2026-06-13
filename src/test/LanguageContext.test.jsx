import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../context/LanguageContext'

function TestComponent() {
  const { lang, toggleLang } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={toggleLang}>toggle</button>
    </div>
  )
}

test('defaults to "de"', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  expect(screen.getByTestId('lang')).toHaveTextContent('de')
})

test('toggles to "en" when clicked', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  fireEvent.click(screen.getByText('toggle'))
  expect(screen.getByTestId('lang')).toHaveTextContent('en')
})

test('toggles back to "de" on second click', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  fireEvent.click(screen.getByText('toggle'))
  fireEvent.click(screen.getByText('toggle'))
  expect(screen.getByTestId('lang')).toHaveTextContent('de')
})
