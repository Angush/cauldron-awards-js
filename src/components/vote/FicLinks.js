import React from 'react'
import validateURL from '../../functions/validateURL'

//! move this elsewhere... somewhere
const TYPE = {
  sb: {
    img: '/images/sb.png',
    order: 1
  },
  sv: {
    img: '/images/sv.png',
    order: 2
  },
  qq: {
    img: '/images/qq.png',
    order: 3
  },
  ao3: {
    img: '/images/ao3.png',
    order: 4
  },
  ffn: {
    img: '/images/ffn.png',
    order: 5
  },
  misc: {
    element: (
      <svg
        className='misc-link-svg'
        width='112'
        height='112'
        viewBox='0 0 112 112'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0)'>
          <path d='M22 18.5H46C48.2091 18.5 50 20.2909 50 22.5V24.5C50 26.7091 48.2091 28.5 46 28.5H24.5C20.0817 28.5 16.5 32.0817 16.5 36.5V87.5C16.5 91.9183 20.0817 95.5 24.5 95.5H76C80.4183 95.5 84 91.9183 84 87.5V66C84 63.7909 85.7909 62 88 62H89.5C91.7091 62 93.5 63.7909 93.5 66V90C93.5 98.8366 86.3366 106 77.5 106H22C13.1634 106 6 98.8366 6 90V34.5C6 25.6634 13.1634 18.5 22 18.5Z' />
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M66.5 6H102C104.209 6 106 7.79086 106 10V45.5C106 47.7091 104.209 49.5 102 49.5H100.5C98.2909 49.5 96.5 47.7091 96.5 45.5V22.5L57.3284 61.6716C55.7663 63.2337 53.2337 63.2337 51.6716 61.6716L50.3284 60.3284C48.7663 58.7663 48.7663 56.2337 50.3284 54.6716L89.5 15.5H66.5C64.2909 15.5 62.5 13.7091 62.5 11.5V10C62.5 7.79086 64.2909 6 66.5 6Z'
          />
        </g>
        <defs>
          <clipPath id='clip0'>
            <rect width='112' height='112' />
          </clipPath>
        </defs>
      </svg>
    ),
    order: 6
  }
}

const getLinkType = link => {
  let match = TYPE.misc
  if (link.match(/questionablequesting.com/)) match = TYPE.qq
  else if (link.match(/spacebattles.com/)) match = TYPE.sb
  else if (link.match(/sufficientvelocity.com/)) match = TYPE.sv
  else if (link.match(/fanfiction.net/)) match = TYPE.ffn
  else if (link.match(/archiveofourown.org/)) match = TYPE.ao3
  return match
}

const FicLinks = ({ links }) => {
  //! move this sorting to the Submit stage (where shortening should also occur), and have database just store it as raw JSON
  const sorted = links
    .map(link => {
      return {
        ...getLinkType(link),
        url: link
      }
    })
    .sort((a, b) => a.order - b.order)
    .filter(link => validateURL(link.url))

  return (
    <div className='fic-links'>
      {sorted.map(link => {
        return (
          <a
            key={link.url}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
          >
            {link.element && link.element}
            {link.img && <img src={link.img} alt='Destination website icon.' />}
          </a>
        )
      })}
    </div>
  )
}

export default FicLinks