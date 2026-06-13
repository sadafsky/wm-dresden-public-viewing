import { render, screen, fireEvent } from '@testing-library/react'
import VenueCard from '../components/VenueCard'

const venue = {
  id: 'test-bar',
  name: 'Test Bar',
  type: 'bar',
  screens: 3,
  indoor: true,
  hours: '17:00 – 24:00',
  coordinates: [13.74, 51.05],
  address: 'Teststr. 1',
  photo: null,
  website: null,
  description: { de: 'Test', en: 'Test' },
}

test('renders venue name', () => {
  render(<VenueCard venue={venue} isSelected={false} onSelect={() => {}} lang="de" />)
  expect(screen.getByText('Test Bar')).toBeInTheDocument()
})

test('renders bar emoji for type bar', () => {
  render(<VenueCard venue={venue} isSelected={false} onSelect={() => {}} lang="de" />)
  expect(screen.getByText('🍺')).toBeInTheDocument()
})

test('calls onSelect when clicked', () => {
  const onSelect = vi.fn()
  render(<VenueCard venue={venue} isSelected={false} onSelect={onSelect} lang="de" />)
  fireEvent.click(screen.getByText('Test Bar'))
  expect(onSelect).toHaveBeenCalledTimes(1)
})
