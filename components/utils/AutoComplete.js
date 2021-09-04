import PlacesAutocomplete from "react-places-autocomplete"
import styles from '../../styles/autocomplete.module.css'

export default function AutoComplete({ address, setAddress }) {

    const handleChange = address => {
        setAddress(address)
    }

    const renderFunc = ({ getInputProps, getSuggestionItemProps, suggestions }) => (
        <div className={styles.autocomplete} style={{width: "400px"}}>
          <input {...getInputProps({placeholder: 'Input Event Address', style: {width: "400px"}})} />
          <div className={styles.items}>
            {suggestions.map(suggestion => {
                return(
                    <div {...getSuggestionItemProps(suggestion)} style={{fontSize: "70%"}}><span>{suggestion.description}</span></div>
                )
            })}
          </div>
        </div>
    )

    return(
        <PlacesAutocomplete value={address} onChange={handleChange}>
            {renderFunc}
        </PlacesAutocomplete>
    )
}