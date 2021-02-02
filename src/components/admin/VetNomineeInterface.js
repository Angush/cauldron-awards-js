import React, { useState, useEffect } from 'react'
import { updatedDiff, addedDiff, detailedDiff } from 'deep-object-diff'
import { Button } from 'react-bootstrap'
import ReactJson from 'react-json-view'
import validateURL from '../../functions/validateURL'
import ListOfOtherCategories from './ListOfOtherCategories'
import ListOfDuplicates from './ListOfDuplicates'
import StatusDropdown from './StatusDropdown'
import OtherCard from '../cards/OtherCard'
import FicCard from '../cards/FicCard'
import ArtCard from '../cards/ArtCard'

const VetNomineeInterface = ({ nominee, category, data, getNomineeData, updateNomineeData }) => {
  const [nomineeBeingEdited, setNomineeBeingEdited] = useState(nominee.id)
  const [containsNullValue, setContainsNullValue] = useState(false)
  const [nomineeEdits, setNomineeEdits] = useState(null)

  useEffect(() => {
    setNomineeBeingEdited(nominee.id)
  }, [nominee])

  useEffect(() => {
    if (!nominee?.id) return
    if (nominee.id !== nomineeBeingEdited || !nomineeBeingEdited) {
      setNomineeBeingEdited(nominee.id)
      setNomineeEdits(null)
    }
  }, [nominee, nomineeBeingEdited])

  useEffect(() => console.log(`containsNullValue has been set to`, containsNullValue), [containsNullValue])

  //* Utility functions
  const getApprovalStatus = number => {
    if (number === -1) return 'Rejected'
    if (number === 0) return 'Unvetted'
    if (number === 1) return 'Approved'
    if (number === 2) return 'Selected via typeahead'
    return 'Unvetted'
  }

  const getStatusValue = change => {
    if (change === "approve") return 1
    if (change === "reject") return -1
    if (change === "reset") return 0
  }

  const getDataOfNomineeToUpdate = id => {
    if (!id || id === nominee.id) return nominee
    return DUPLICATES.find(dupe => dupe.id === id)
  }

  //* Update data functions
  const updateStatus = ({ id, catId }, status) => {
    let nomineeToUpdate = getDataOfNomineeToUpdate(id)
    let newStatusValue = getStatusValue(status)
    nomineeToUpdate.statuses[catId] = newStatusValue
    nomineeToUpdate.statusChanges = [{ category: catId, status: newStatusValue }]
    updateNomineeData([nomineeToUpdate], 'status')
  }

  const updateMultipleStatuses = () => {
    // TODO: this.
  }

  const updateData = event => {
    let nomineeToUpdate = getDataOfNomineeToUpdate()
    let newData = { ...nomineeToUpdate, data: nomineeEdits || nomineeToUpdate.data }
    console.log(`Updating data for nominee ${newData.id}`, { editValues: newData, existingData: nomineeToUpdate })
    updateNomineeData([newData], 'data')
  }

  const updateDataIncludingDuplicates = event => {
    let nomineeToUpdate = getDataOfNomineeToUpdate()
    let newData = nomineeEdits || nomineeToUpdate.data
    const formatNomineeData = nom => ({ ...nom, data: newData })

    let nomineesBeingUpdated = [formatNomineeData(nomineeToUpdate)]
    DUPLICATES.forEach(dupe => {
      nomineesBeingUpdated.push(formatNomineeData(dupe))
    })

    let nomineeIdsUpdating = nomineesBeingUpdated.map(nom => nom.id)
    console.log(`Updating data for nominees: `, nomineeIdsUpdating)

    updateNomineeData(nomineesBeingUpdated, 'data')
  }

  //* Make an edit
  const makeEdit = (values, replace = false, diff = null) => {
    const newData = values.updated_src || values
    const originalData = nominee.data
    let newNomineeRaw = replace ? newData : (!nomineeEdits ? { ...originalData, ...newData } : { ...nomineeEdits, ...newData })
    const newNominee = newNomineeRaw
    if (!newNominee) return false

    const calculateTotalDifferenceCount = (total, val) => total + Object.values(val).length

    const originalDataDiff = detailedDiff(originalData, newNominee)
    const originalDataChanges = Object.values(originalDataDiff).reduce(calculateTotalDifferenceCount, 0)
    // console.log(`original data diff`, originalDataDiff) //! REMOVE
    if (originalDataChanges === 0) {
      console.log(`The data has been edited such that it is identical to the original data`, true)
      setNomineeEdits(null)
      return true
    }
    // console.log(`nomineeEdits:`, nomineeEdits)
    // console.log(`newNominee:`, newNominee)
    const previousEditDiff = detailedDiff(nomineeEdits, newNominee)
    const previousEditChanges = Object.values(previousEditDiff).reduce(calculateTotalDifferenceCount, 0)
    // console.log(`previous edit diff`, previousEditDiff) //! REMOVE
    if (previousEditChanges === 0) { 
      console.log(`An edit that made no actual changes was made`, true)
      return true
    }

    setNomineeEdits(newNominee)
  }

  const toggleBooleanValue = key => {
    let newData = { ...(nomineeEdits ? nomineeEdits : nominee?.data) }
    if (newData.hasOwnProperty(key) && newData[key] !== false) delete newData[key]
    else newData[key] = true
    // console.log(`Toggling boolean "${key}":`, newData)
    makeEdit(newData, true)
  }

  const addKeyToData = values => makeEdit({ ...values.existing_src }, true, addedDiff(values.existing_src, values.updated_src))


  //* Calculated values
  const approvalStatus = getApprovalStatus(nominee.statuses[category.id])
  const type = nominee.data.artist ? 'art' : nominee.data.links ? 'fic' : 'other'
  const CARD = type === 'other' ? (
    <OtherCard data={nomineeEdits || nominee.data} />
  ) : type === 'art' ? (
    <ArtCard formData={nomineeEdits || nominee.data} />
  ) : (
    <FicCard fic={nomineeEdits || nominee.data} />
  )
  const DUPLICATES = (nominee.duplicates || []).map(getNomineeData)
  const CATEGORIES = Object.keys(nominee.statuses || {})
    .filter(cat => {
      if (Number.isInteger(cat)) return cat !== category.id
      return parseInt(cat) !== category.id
    })
    .map(cat => data.categories[cat])


  return (
    <div className='nominee-vet-ui'>
      <div className='nominee-controls'>
        <div className='nominee-buttons'>
          <StatusDropdown
            status={nominee.statuses[category.id]}
            select={updateStatus}
            catId={category.id}
            id={nominee.id}
            size='lg'
            classes='primary-status-dropdown'
          />
        </div>
        <div className='nominee-header-text'>
          <h2>Viewing nominee <code>{nominee.id}</code> in <code>{category.name}</code></h2>
          <h3 className='text-muted'>
            Current approval status:{' '}
            <code
              className={approvalStatus === 'Rejected' ? 'status-rejected' :
              (approvalStatus === 'Approved' ? 'status-approved' : 'status-unvetted')}
            >
              {approvalStatus}
            </code>
          </h3>
        </div>
      </div>

      <div className='nominee-left-column'>
        <div>
          <div className='section-head'>
            <h3>Nominated by</h3>
          </div>
          {nominee.nominatedBy ? <p><code>{nominee.nominatedBy}</code></p> : <p>Unknown user.</p>}
        </div>

        <div>
          <div className='section-head'>
            <h3>Other categories</h3>
          </div>
          <ol className='nominee-categories'>
            {CATEGORIES.length > 0 && (
              <ListOfOtherCategories
                nominee={nominee}
                categories={CATEGORIES}
                updateStatus={updateStatus}
              />
            )}
            {CATEGORIES.length === 0 && (
              <p style={{ marginLeft: '8px' }}>This nominee was not entered into any other categories.</p>
            )}
          </ol>
        </div>

        <div className='nominee-card'>
          <div className='section-head'>
            <h3>Card view</h3>
            {nomineeEdits && <h3 className='unsaved-edits-alert'>Showing unsaved edits!</h3>}
          </div>
          {CARD}
        </div>
      </div>

      <div className='nominee-right-column'>
        <div className='nominee-duplicates'>
          <div className='section-head'>
            <h3>Duplicates</h3>
          </div>
          {DUPLICATES.length > 0 && (
            <>
              <p>Remember to manually check other nominees for non-identical duplicates.</p>
              <ListOfDuplicates
                validCategories={nominee.statuses}
                allCategories={data.categories}
                updateStatus={updateStatus}
                duplicates={DUPLICATES}
              />
            </>
          )}
          {DUPLICATES.length === 0 && <>
            <p>No identical duplicates were found to share categories with this nominee.</p>
            <p>You'll have to manually check other nominees for non-identical duplicates.</p>
          </>}
        </div>
      </div>

      <div className='nominee-json'>
        <div className='section-head'>
          <h3>Data tree</h3>
        </div>
        <div className='json-edit-buttons'>
          {category.type !== 'other' && (
            <Button onClick={() => toggleBooleanValue('nsfw')} variant='outline-dark'>
              Toggle <code>NSFW</code> flag
            </Button>
          )}
          {category.type === 'art' && (
            <Button onClick={() => toggleBooleanValue('spoiler')} variant='outline-dark'>
              Toggle <code>SPOILER</code> flag
            </Button>
          )}
        </div>
        <ReactJson
          src={nomineeEdits || nominee.data}
          displayDataTypes={false}
          enableClipboard={false}
          quotesOnKeys={false}
          onEdit={makeEdit}
          onAdd={addKeyToData}
          onDelete={values => makeEdit(values, true)}
          name={null}
        />
        {containsNullValue && (
          <div className='json-error-text'>
            Note: you cannot save your changes while you have a null value.
          </div>
        )}
        {!!nomineeEdits && (
          <div className='json-submit-buttons'>
            {!containsNullValue && (<>
              {DUPLICATES.length > 0 && (
                <Button onClick={updateDataIncludingDuplicates}>
                  Save changes for this & duplicates
                </Button>
              )}
              <Button onClick={updateData} variant={DUPLICATES.length > 0 ? 'dark' : 'primary'}>
                Save changes
              </Button>
            </>)}
            <Button onClick={() => setNomineeEdits(null)} variant='danger'>
              Discard changes
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// TODO:  Next up on the to-do list:
// *****  (a) All the nominee data editing functionality - [VetNomineeInterface]
// *****  (b) Plain text search in header/id/subheader - [ItemList]
// *****  (c) Add extra fields data (name/desc) to cards - [FicCard]
// TODO:  (d) VET ALL THE NOMINEES!  Then open voting to the public.
// *****  (e) Investigate performance a little. It hangs a bit whenever you (a) select a category, and (b) update a nominee's status or data. I think it's because it repopulates the CategoriesList and CategoryNomineesList arrays every time. Could we instead maybe just clone those arrays, update the specific categories/nominees that were changed, and then set the state variable to that copy, thus bypassing the need to recalculate every single nominee again? - [AdminVettingPage + components]
// !          ^ Could be big job; but it only affects me, so we can do this after (f) and (g) below.
// *****  (f) Add canonicalURL/authorURL to cards - [ArtCard]  (get glowspider's help to get the data)
// *****  (g) Rewrite lightbox functionality to be good - [VoteFlow/VotePage]
// ?      There was more to do than just these, but I don't remember it. lol rip.

//TODO:  2.  Also add buttons to mark the selected nominee as Approved/Unvetted/Rejected in ALL of its categories, as well as a button to mark all of the selected nominee's duplicates as Approved/Unvetted/Rejected with one click.


export default VetNomineeInterface