import React, { useEffect } from 'react'
import InputFic from './InputFic'

const InputMain = ({ select, deselect, selected }) => {
  useEffect(() => {
    document.getElementById('input-main').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, [])

  const INPUT_SELECTOR = {
    fic: <InputFic />,
    art: <div>Art input not implemented.</div>
  }

  const GoBack = () => (
    <a href='#back' className='goback' onClick={deselect}>
      <small>Go back</small>
    </a>
  )

  return (
    <div id='nomination-selection'>
      <h5 className='align-bottom'>
        <GoBack />
        <small className='text-muted'>Step 2</small>
      </h5>
      <h4 className='align-top'>
        {selected.type === 'text'
          ? 'Enter your nominee'
          : `Enter your ${selected.type} nominee`}
      </h4>
      {INPUT_SELECTOR[selected.type]}
    </div>
  )
}

export default InputMain
