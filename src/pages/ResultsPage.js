import React, { useState, useEffect } from 'react'
import makeSafeForURL from '../functions/makeSafeForURL'
import LoadingIndicator from '../components/util/LoadingIndicator'
import ResultsTableOfContents from '../components/results/ResultsTableOfContents'
import ResultsEntries from '../components/results/ResultsEntries'
import ResultsHeader from '../components/results/ResultsHeader'
import ResultsSummary from '../components/results/ResultsSummary'
import jumpToID from '../functions/jumpToID'
import { Link } from '@reach/router'

const ResultsPage = ({ userData, years, year, '*': hash }) => {
  const [yearProper, setYearProper] = useState(year)
  const [jumpTarget, setJumpTarget] = useState(
    hash ? hash.toLowerCase().replace(/^[^\w-]*/, '') : null
  )
  const [userCategoryVotes, setUserCategoryVotes] = useState({})
  const [userVotes, setUserVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [toc, setTOC] = useState([])
  const [latest] = useState(
    typeof year === 'string' && year.toLowerCase().trim() === 'latest'
  )

  useEffect(() => {
    const controller = new AbortController()
    const normalized = latest ? years[0] : year
    setYearProper(normalized)

    if (!years.includes(normalized)) {
      setLoading(false)
      return
    }
    window
      .fetch(`https://cauldron.angu.sh/api/votes/${normalized}`, {
        credentials: 'include',
        signal: controller.signal
      })
      .then(response => {
        if (response.status === 404) return {}
        return response.json()
      })
      .then(resData => {
        // convert userVotes to a list of category IDs for easy checking
        let voteIDs = {}
        let replacementRegex = /c|_e\d+/g
        for (const key in resData) {
          let categoryID = key.replace(replacementRegex, '')
          if (voteIDs[categoryID] >= 1) voteIDs[categoryID] += 1
          else voteIDs[categoryID] = 1
        }
        setUserCategoryVotes(voteIDs)
        setUserVotes(resData)
      })
      .catch(console.error)

    import(/* webpackChunkName: "Results[request]" */ `../json/results/${normalized}.json`)
      .then(yearResults => {
        setData(yearResults.default)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })

    return () => controller.abort()
  }, [years, year, latest])

  useEffect(() => {
    if (!data) return
    let contents = []
    data.sections.forEach(s => {
      contents.push({
        text: `${s.sectionName} Categories`,
        anchor: `#${makeSafeForURL(s.sectionName)}`,
        children: s.categories.map(c => {
          return {
            text: c.title,
            anchor: `#${makeSafeForURL(c.title)}`
          }
        })
      })
    })
    setTOC(contents)
  }, [data])

  useEffect(() => {
    if (!jumpTarget) return
    let element = document.querySelector(`#${jumpTarget}`)
    if (!element) return
    let timeout = setTimeout(() => {
      console.log(`Scrolling now...`)
      jumpToID(jumpTarget, {
        offset: 100,
        smooth: false,
        onJump: () => setJumpTarget(null)
      })
    }, 500)
    return () => clearTimeout(timeout)
  })

  const SelectAnotherYear = (
    <div className='results-goback'>
      <Link to='/results'>View results for other years.</Link>
    </div>
  )

  if (loading)
    return (
      <>
        <LoadingIndicator className='fade-rise'>
          <h4>Just a moment!</h4>
          <h6 className='text-muted'>
            We're loading the {latest ? 'latest' : yearProper} results for you.
          </h6>
          {SelectAnotherYear}
        </LoadingIndicator>
      </>
    )

  if (!data)
    return (
      <div className='result-years fade-rise'>
        <h4>Year not found!</h4>
        <h4>
          <small className='text-muted'>
            I don't have any results for the year you were looking for. Sorry!
          </small>
        </h4>
        <Link to='/results'>View years with available results.</Link>
      </div>
    )

  const userVotedFor = id => userVotes[id] === 1

  const userCategoryVoteCount = (categories = []) => {
    let voteCount = 0
    categories.forEach(c => {
      let categoryVotes = userCategoryVotes[c.id]
      if (categoryVotes) voteCount += categoryVotes
    })
    return voteCount
  }

  return (
    <div className='results left-indent-container'>
      <ResultsTableOfContents toc={toc} />
      <div className='fade-rise'>
        <ResultsSummary
          year={yearProper}
          header={data.header}
          userVotes={Object.values(userVotes).length}
          userData={userData}
        >
          {SelectAnotherYear}
        </ResultsSummary>

        {data.sections.map(section => (
          <section key={section.sectionName}>
            <div
              id={makeSafeForURL(section.sectionName)}
              className='section-header'
              // tabIndex={-1}
            >
              <h2>{section.sectionName}</h2>
              <div className='section-summary'>
                <small className='text-muted'>
                  {section.categories.length} {section.categories.length === 1 ? 'category' : 'categories'}
                  <span className='slash-divider'> | </span>
                  {section.nominees} {section.nominees === 1 ? 'entry' : 'entries'}
                  <span className='slash-divider'> | </span>
                  {section.votes} {section.votes === 1 ? 'vote' : 'votes'}
                  <span className='slash-divider'> | </span>
                  {section.voters} {section.voters === 1 ? 'voter' : 'voters'}
                </small>
              </div>
            </div>
            {section.categories.map(category => {
              return (
                <div key={category.title} className='results-category'>
                  <ResultsHeader
                    year={yearProper}
                    category={category}
                    userVoteCount={userCategoryVoteCount([category])}
                  />
                  <ResultsEntries
                    category={category}
                    userVotedFor={userVotedFor}
                  />
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}

export default ResultsPage
