import React from 'react'
import { Card } from 'react-bootstrap'

const ArtCard = ({
  formData,
  onClick,
  onLoad,
  onError,
  className,
  selected
}) => {
  const classes = 'art-card' + (className ? ' ' + className : '')
  const props = !onClick
    ? {}
    : {
        keyclickable: 'true',
        onClick: onClick,
        tabIndex: 0
      }
  const dataName = (formData.artistPage ? (
    <>by <a href={formData.artistPage} target='_blank' rel='noopener'><em>{formData.artist || 'Unknown'}</em></a></>
  ) : (
    <>by <em>{formData.artist || 'Unknown'}</em></>
  ))
  const dataTitle = (formData.canonicalURL ? (
    <a href={formData.canonicalURL} target='_blank' rel='noopener'>{formData.title || 'Untitled'}</a>
  ) : (formData.title || 'Untitled'))

  return (
    <Card
      bg={selected ? 'primary' : 'dark'}
      text='white'
      className={classes}
      {...props}
    >
      <div className='card-img-parent'>
        <Card.Img
          onLoad={onLoad}
          onError={onError}
          src={formData.url}
          alt={formData.identifier}
          id={formData.key}
          className={(formData.nsfw || formData.spoiler) && 'nsfw-img'}
          // height={400 * (formData.height / formData.width)}
          // width={400}
          // loading='lazy'
        />
      </div>
      <Card.Body>
        {formData.nsfw && <span className='nsfw-indicator'>NSFW</span>}
        {formData.spoiler && <span className='nsfw-indicator spoiler-indicator'>SPOILER</span>}
        <Card.Title>{dataTitle}</Card.Title>
        <Card.Subtitle>
          {dataName}
        </Card.Subtitle>
      </Card.Body>
    </Card>
  )
}

export default ArtCard
