import React from 'react'
import { Card } from 'react-bootstrap'
import FicLinks from './FicLinks'

const FicCard = ({ fic, className, onClick, selected }) => {
  const classes = 'fic-card' + (className ? ' ' + className : '')
  const props = !onClick
    ? {}
    : {
        keyclickable: 'true',
        onClick: onClick,
        tabIndex: 0
      }

  return (
    <Card
      bg={selected ? 'primary' : 'dark'}
      text='white'
      className={classes}
      {...props}
    >
      <Card.Body>
        <Card.Title>
          {fic.nsfw && <span className='nsfw-indicator'>NSFW</span>} {fic.title || "Untitled"}
        </Card.Title>
        <Card.Subtitle>
          by <em>{fic.author || "Unknown"}</em>
        </Card.Subtitle>
        <FicLinks links={fic.links} />
      </Card.Body>
    </Card>
  )
}

export default FicCard
