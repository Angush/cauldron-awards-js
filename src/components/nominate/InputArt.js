import React, { useState } from 'react'
import { Form, InputGroup, Col } from 'react-bootstrap'
// import { Form, Button, InputGroup, Image } from 'react-bootstrap'
import LoadingIndicator from '../util/LoadingIndicator'
import LabelShrinkable from '../util/LabelShrinkable'
import PreviewCard from '../cards/PreviewCard'
import Submission from '../util/Submission'

const InputArt = () => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    url: '',
    nsfw: false
  })

  const handleSubmit = e => {
    e.preventDefault()
    console.log(formData)
  }

  const onLoad = () => {
    setError(false)
    setLoaded(true)
  }

  const onError = () => setError(true)

  return (
    <Form id='art-input' onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Row>
          <Col md='6'>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>Title</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                placeholder='Image title (can leave blank)'
                id='imgTitle'
                size='lg'
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </InputGroup>
          </Col>
          <Col md='6'>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>Artist</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                placeholder='Artist name'
                id='imgArtist'
                size='lg'
                onChange={e =>
                  setFormData({ ...formData, artist: e.target.value })
                }
              />
            </InputGroup>
            <LabelShrinkable valid={formData.artist ? true : false}>
              Artist required.
            </LabelShrinkable>
          </Col>
        </Form.Row>
      </Form.Group>

      <Form.Group>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>
              <svg
                className='bi bi-image'
                width='34px'
                height='34px'
                viewBox='0 0 20 20'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M16.002 4h-12a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1zm-12-1a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-12z'
                  clipRule='evenodd'
                ></path>
                <path d='M12.648 9.646a.5.5 0 01.577-.093l3.777 1.947V16h-14v-2l2.646-2.354a.5.5 0 01.63-.062l2.66 1.773 3.71-3.71z'></path>
                <path
                  fillRule='evenodd'
                  d='M6.502 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z'
                  clipRule='evenodd'
                ></path>
              </svg>
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            size='lg'
            placeholder='Image URL'
            id='imgLink'
            onChange={e => {
              setLoaded(false)
              setFormData({ ...formData, url: e.target.value })
            }}
          />
          {/* <InputGroup.Append>
            <Button variant='dark' onClick={() => {}}>
              Upload
            </Button>
          </InputGroup.Append> */}
        </InputGroup>
        <LabelShrinkable valid={!error && formData.url} error={error}>
          {error ? 'Valid image required.' : 'Image required.'}
        </LabelShrinkable>
      </Form.Group>

      <div className='shrink-me'></div>

      <Form.Group className='text-center'>
        <Form.Check
          custom
          type='switch'
          id='nomineeIsNSFW'
          label='This nominee contains explicit sexual content'
          onChange={e => setFormData({ ...formData, nsfw: e.target.checked })}
        />
      </Form.Group>

      <div id='preview' className='mx-auto'>
        {!loaded && !error && formData.url && (
          <LoadingIndicator timeout={100} id='image-load'>
            <h5 className='text-muted'>Loading image...</h5>
          </LoadingIndicator>
        )}
        {formData.url && (
          <PreviewCard
            type='art'
            onLoad={onLoad}
            onError={onError}
            formData={formData}
            hide={error || !loaded}
          />
        )}
        {(!formData.url || error) && (
          <span className='text-muted '>
            Enter {error ? 'a valid' : 'an'} image to submit.
          </span>
        )}
      </div>

      <Submission tall disabled={!loaded || !formData.artist} />
    </Form>
  )
}

export default InputArt
