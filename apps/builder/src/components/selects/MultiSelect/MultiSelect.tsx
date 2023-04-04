import { useColorMode } from '@chakra-ui/react'
import Select, { Props } from 'react-select'
import makeAnimated from 'react-select/animated'

const animatedComponents = makeAnimated()

type MultiSelectProps = Props

export default function MultiSelect(props: MultiSelectProps) {
  const { colorMode } = useColorMode()

  return (
    <Select
      {...props}
      closeMenuOnSelect={false}
      components={animatedComponents}
      isMulti
      styles={{
        option: (base, { isFocused }) => ({
          ...base,
          color: isFocused ? '#000' : '#fff',
        }),
      }}
      theme={
        colorMode === 'dark'
          ? (theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                neutral0: '#1F1F23',
                neutral10: '#add8e6',
                dangerLight: '#ade2e6',
                primary: '#add8e6',
                primary25: '#add8e6',
                primary50: '#add8e6',
                primary75: '#add8e6',
              },
            })
          : undefined
      }
    />
  )
}
