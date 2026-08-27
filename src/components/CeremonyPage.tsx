import VenuePage from './VenuePage'

interface CeremonyPageProps {
  /** True once this slot is the active visible sheet. */
  active: boolean
}

export default function CeremonyPage({ active }: CeremonyPageProps) {
  return (
    <VenuePage
      active={active}
      className="ceremony-page"
      ariaLabel="Ubicación de la ceremonia"
      ornament="assets/location/ceremony-cross.svg"
      heading="CEREMONIA RELIGIOSA"
      venueName="Templo del Sagrado Corazón de Jesús"
      time="1:00 p. m."
      venueImageWebp="assets/location/ceremony-venue.webp"
      venueImagePng="assets/location/ceremony-venue.png"
      mapImage="assets/location/map-ceremony-watermark-square.png"
      mapPinX="47.9%"
      mapPinY="47.4%"
      address={
        <>
          Residencial Los Fresnos,
          <br />
          Aguascalientes, Ags. C.P. 20328
        </>
      }
      mapsUrl="https://maps.app.goo.gl/Z8afitqbiNdpMKiR7"
    />
  )
}
