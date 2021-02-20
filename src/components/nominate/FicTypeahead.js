import React, { useEffect, useState } from 'react'
import { InputGroup } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import InputClear from '../util/InputClear'

const FicTypeahead = ({ input, setInput, disabled, reset }) => {
  const [searchterm, setSearchterm] = useState('')
  const [typeahead, setTypeahead] = useState(null)
  const [fics, setFics] = useState(null)

  useEffect(() => {
    if (reset === true && typeahead) {
      setSearchterm('')
      typeahead.getInstance().clear()
    }
  }, [reset, typeahead])

  import(/* webpackChunkName: "TypeaheadOptions" */ '../../json/typeahead-options/2020-fic-options.json').then(options => {
    setFics(options.default)
  })

  return (
    <InputGroup id='typeahead-container'>
      <Typeahead
        onInputChange={text => setSearchterm(text)}
        ref={ref => setTypeahead(ref)}
        onChange={selected => {
          setInput(selected[0])
          let text = typeahead.getInstance().getInput()
          setSearchterm(text.value)
        }}
        options={fics || []}
        selected={input && [input]}
        value={input}
        paginate={true}
        maxResults={15}
        placeholder={
          fics ? 'Search for a fic...' : 'Fetching fics... Just a moment!'
        }
        labelKey={fic => `${fic.title} by ${fic.author}`}
        disabled={disabled || !fics}
        id='typeahead'
        bsSize='lg'
      />
      {(searchterm || input) && (
        <InputClear
          onClick={() => {
            typeahead.getInstance().clear()
            setInput(null)
            setSearchterm('')
          }}
          hidden={disabled}
        />
      )}
    </InputGroup>
  )
}

export default FicTypeahead
