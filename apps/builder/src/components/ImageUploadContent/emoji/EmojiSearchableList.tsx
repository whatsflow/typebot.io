import emojis from './emojiList.json'
import emojiTagsData from 'emojilib'
import {
  Stack,
  SimpleGrid,
  GridItem,
  Button,
  Input as ClassicInput,
  Text,
} from '@chakra-ui/react'
import { useState, ChangeEvent, useEffect, useRef } from 'react'

const emojiTags = emojiTagsData as Record<string, string[]>

const people = emojis['Emoticons e Emoções'].concat(emojis['Pessoas e corpo'])
const nature = emojis['Animais e natureza']
const food = emojis['Comidas e bebidas']
const activities = emojis['Atividades']
const travel = emojis['Viagens e lugares']
const objects = emojis['Objetos']
const symbols = emojis['Simbolos']
const flags = emojis['Bandeiras']

export const EmojiSearchableList = ({
  onEmojiSelected,
}: {
  onEmojiSelected: (emoji: string) => void
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomElement = useRef<HTMLDivElement>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [filteredPeople, setFilteredPeople] = useState(people)
  const [filteredAnimals, setFilteredAnimals] = useState(nature)
  const [filteredFood, setFilteredFood] = useState(food)
  const [filteredTravel, setFilteredTravel] = useState(travel)
  const [filteredActivities, setFilteredActivities] = useState(activities)
  const [filteredObjects, setFilteredObjects] = useState(objects)
  const [filteredSymbols, setFilteredSymbols] = useState(symbols)
  const [filteredFlags, setFilteredFlags] = useState(flags)
  const [totalDisplayedCategories, setTotalDisplayedCategories] = useState(1)

  useEffect(() => {
    if (!bottomElement.current) return
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer.current,
    })
    if (bottomElement.current) observer.observe(bottomElement.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting) setTotalDisplayedCategories((c) => c + 1)
  }

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value
    if (searchValue.length <= 2 && isSearching) return resetEmojiList()
    setIsSearching(true)
    setTotalDisplayedCategories(8)
    const byTag = (emoji: string) =>
      emojiTags[emoji].find((tag) => tag.includes(searchValue))
    setFilteredPeople(people.filter(byTag))
    setFilteredAnimals(nature.filter(byTag))
    setFilteredFood(food.filter(byTag))
    setFilteredTravel(travel.filter(byTag))
    setFilteredActivities(activities.filter(byTag))
    setFilteredObjects(objects.filter(byTag))
    setFilteredSymbols(symbols.filter(byTag))
    setFilteredFlags(flags.filter(byTag))
  }

  const resetEmojiList = () => {
    setTotalDisplayedCategories(1)
    setIsSearching(false)
    setFilteredPeople(people)
    setFilteredAnimals(nature)
    setFilteredFood(food)
    setFilteredTravel(travel)
    setFilteredActivities(activities)
    setFilteredObjects(objects)
    setFilteredSymbols(symbols)
    setFilteredFlags(flags)
  }

  return (
    <Stack>
      <ClassicInput placeholder="Search..." onChange={handleSearchChange} />
      <Stack ref={scrollContainer} overflow="scroll" maxH="350px" spacing={4}>
        {filteredPeople.length > 0 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Pessoas
            </Text>
            <EmojiGrid emojis={filteredPeople} onEmojiClick={onEmojiSelected} />
          </Stack>
        )}
        {filteredAnimals.length > 0 && totalDisplayedCategories >= 2 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Animais e natureza
            </Text>
            <EmojiGrid
              emojis={filteredAnimals}
              onEmojiClick={onEmojiSelected}
            />
          </Stack>
        )}
        {filteredFood.length > 0 && totalDisplayedCategories >= 3 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Comidas e bebidas
            </Text>
            <EmojiGrid emojis={filteredFood} onEmojiClick={onEmojiSelected} />
          </Stack>
        )}
        {filteredTravel.length > 0 && totalDisplayedCategories >= 4 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Viagens e lugares
            </Text>
            <EmojiGrid emojis={filteredTravel} onEmojiClick={onEmojiSelected} />
          </Stack>
        )}
        {filteredActivities.length > 0 && totalDisplayedCategories >= 5 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Atividades
            </Text>
            <EmojiGrid
              emojis={filteredActivities}
              onEmojiClick={onEmojiSelected}
            />
          </Stack>
        )}
        {filteredObjects.length > 0 && totalDisplayedCategories >= 6 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Objetos
            </Text>
            <EmojiGrid
              emojis={filteredObjects}
              onEmojiClick={onEmojiSelected}
            />
          </Stack>
        )}
        {filteredSymbols.length > 0 && totalDisplayedCategories >= 7 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Simbolos
            </Text>
            <EmojiGrid
              emojis={filteredSymbols}
              onEmojiClick={onEmojiSelected}
            />
          </Stack>
        )}
        {filteredFlags.length > 0 && totalDisplayedCategories >= 8 && (
          <Stack>
            <Text fontSize="sm" pl="2">
              Bandeiras
            </Text>
            <EmojiGrid emojis={filteredFlags} onEmojiClick={onEmojiSelected} />
          </Stack>
        )}
        <div ref={bottomElement} />
      </Stack>
    </Stack>
  )
}

const EmojiGrid = ({
  emojis,
  onEmojiClick,
}: {
  emojis: string[]
  onEmojiClick: (emoji: string) => void
}) => {
  const handleClick = (emoji: string) => () => onEmojiClick(emoji)
  return (
    <SimpleGrid spacing={0} columns={7}>
      {emojis.map((emoji) => (
        <GridItem
          as={Button}
          onClick={handleClick(emoji)}
          variant="ghost"
          size="sm"
          fontSize="xl"
          key={emoji}
        >
          {emoji}
        </GridItem>
      ))}
    </SimpleGrid>
  )
}
