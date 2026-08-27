import VenuePage from './VenuePage'

interface ReceptionPageProps {
  /** True once this slot is the active visible sheet. */
  active: boolean
}

export default function ReceptionPage({ active }: ReceptionPageProps) {
  return (
    <VenuePage
      active={active}
      className="reception-page"
      ariaLabel="Ubicación de la recepción"
      ornament="assets/location/reception-ornament.svg"
      heading="RECEPCIÓN"
      venueName="Gran Ex Hacienda La Unión"
      time="4:00 p. m."
      venueImageWebp="assets/location/reception-venue.webp"
      venueImagePng="assets/location/reception-venue.png"
      mapImage="assets/location/map-reception-watermark-square.png"
      mapPinX="45.3%"
      mapPinY="49.6%"
      address={
        <>
          Km 18.5, carretera Valladolid
          <br />
          a Emiliano Zapata,
          <br />
          Aguascalientes, Ags. C.P.
          <br />
          20300
        </>
      }
      mapsUrl="https://maps.app.goo.gl/GcA8vAbk9RWPifax7"
    />
  )
}
